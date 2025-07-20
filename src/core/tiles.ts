import { Container } from 'pixi.js'
import { Chunks, TileCallback } from '../types/tiles'
import { getCellFromKey } from '../lib/utils/chunks'
import { getPerlinNoise } from '../lib/utils/perlinNoise'
import { createGroundSprite } from './ground'
import { createVegetationSprite } from './vegetation'

export const TILE_WIDTH = 128
export const TILE_WIDTH_HALF = TILE_WIDTH / 2
export const TILE_HEIGHT = 64
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2

export const CHUNK_SIZE = 16
export const CHUNK_WIDTH = CHUNK_SIZE * TILE_WIDTH
export const CHUNK_HEIGHT = CHUNK_SIZE * TILE_HEIGHT
export const RENDER_DISTANCE = 4
const MAX_STORED_CHUNKS = RENDER_DISTANCE * RENDER_DISTANCE * 16

let chunks: Chunks = new Map()
export let chunkCreationList: string[] = []
let currentChunk = ''

export const loopTiles = <T>(width: number, height: number, callback: TileCallback<T>): T[] => {
	const results: T[] = []

	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			results.push(callback(row, col))
		}
	}

	return results
}

export const createTiles = (keys: string[]) => {
	for (const key of keys) {
		const cellValue = getCellFromKey(key)
		const perlin = getPerlinNoise(cellValue.col, cellValue.row)

		loopTiles(CHUNK_SIZE, CHUNK_SIZE, (row, col) => {
			const currentRow = cellValue.row * CHUNK_SIZE + row
			const currentCol = cellValue.col * CHUNK_SIZE + col

			const { xPosTile, yPosTile } = getIsometricTilePositions(
				currentRow,
				currentCol,
				TILE_WIDTH_HALF,
				TILE_HEIGHT_HALF
			)

			const groundSprite = createGroundSprite({ xPosTile, yPosTile, perlin, row, col })

			if (!chunks.has(key)) {
				chunks.set(key, {
					ground: new Container({ label: key, zIndex: currentRow + currentCol, cullable: true }),
					vegetation: new Container({ label: key, zIndex: currentRow + currentCol, cullable: true })
				})
			}

			if (groundSprite) {
				chunks.get(key)?.ground?.addChild(groundSprite)

				const vegetationSprite = createVegetationSprite({ xPosTile, yPosTile, perlin, row, col })
				if (vegetationSprite) {
					chunks.get(key)?.vegetation?.addChild(vegetationSprite)
				}
			}
		})
	}
}

export const getIsometricTilePositions = (
	row: number,
	col: number,
	width: number,
	height: number
) => {
	const xPosTile = (col - row) * width
	const yPosTile = (col + row) * height

	return { xPosTile, yPosTile }
}

export const getGlobalPositionFromNoneStagedTile = (parent: Container, x: number, y: number) => {
	const globalParent = parent.getGlobalPosition()

	return {
		x: x + globalParent.x,
		y: y + globalParent.y
	}
}

export const isoPosToWorldPos = (x: number, y: number) => {
	const xPos = Math.floor((x / TILE_WIDTH_HALF + y / TILE_HEIGHT_HALF) / 2)
	const yPos = Math.floor((y / TILE_HEIGHT_HALF - x / TILE_WIDTH_HALF) / 2)

	return { x: xPos, y: yPos }
}

export const getVisibleChunkKeys = (world: Container) => {
	const keys: string[] = []

	const worldX = -world.x
	const worldY = -world.y

	const { x, y } = isoPosToWorldPos(worldX, worldY)

	const col = Math.floor(x / CHUNK_SIZE)
	const row = Math.floor(y / CHUNK_SIZE)

	for (let chunkY = row - RENDER_DISTANCE; chunkY <= row + RENDER_DISTANCE; chunkY++) {
		for (let chunkX = col - RENDER_DISTANCE; chunkX <= col + RENDER_DISTANCE; chunkX++) {
			keys.push(`${chunkX}_${chunkY}`)
		}
	}

	return keys
}

export const getVisibleChunks = (keys: string[]) => {
	const selectedChunks: Chunks = new Map()

	for (const key of keys) {
		const chunk = chunks.get(key)

		if (chunk) {
			selectedChunks.set(key, chunk)
		}
	}

	return selectedChunks
}

export const setInitalTiles = (world: Container, ground: Container, surface: Container) => {
	const keys = getVisibleChunkKeys(world)

	const newChunkKeys = keys.filter((key) => !chunks.has(key))
	createTiles(newChunkKeys)

	for (const [_, chunk] of chunks) {
		if (chunk.ground) ground.addChild(chunk.ground)
		if (chunk.vegetation) surface.addChild(chunk.vegetation)
	}
}

export const setNewChunksToRender = (world: Container) => {
	const keys = getVisibleChunkKeys(world)
	chunkCreationList = keys.filter((key) => !chunks.has(key) && !chunkCreationList.includes(key))
}

export const createChunk = (key: string) => {
	if (currentChunk) return
	currentChunk = key
	createTiles([key])

	chunkCreationList = chunkCreationList.filter((chunk) => chunk !== key)
	setTimeout(() => (currentChunk = ''), 100) // Spacing chunk creation to not block player movment for an extended period of time
}

export const updateVisibleChunks = (world: Container, ground: Container, surface: Container) => {
	const keys = getVisibleChunkKeys(world)

	const visibleChunks = getVisibleChunks(keys)

	// To prevent the memory of chunks getting to large we clear the tiles that are not in view
	if (chunks.size >= MAX_STORED_CHUNKS) {
		chunks = visibleChunks
	}

	const groundChunksToRemove = ground.children.filter((chunk) => !visibleChunks.has(chunk.label))
	ground.removeChild(...groundChunksToRemove)

	const surfaceChunksToRemove = ground.children.filter((chunk) => !visibleChunks.has(chunk.label))
	surface.removeChild(...surfaceChunksToRemove)

	const currentGroundChunks = new Set(ground.children.map((chunk) => chunk.label))
	for (const key of keys) {
		if (!currentGroundChunks.has(key)) {
			const chunk = visibleChunks.get(key)
			if (chunk?.ground) {
				ground.addChild(chunk.ground)
			}

			if (chunk?.vegetation) {
				surface.addChild(chunk.vegetation)
			}
		}
	}
}
