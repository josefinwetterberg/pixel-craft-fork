import { Container, Sprite } from 'pixi.js'
import { Chunks, TileCallback } from '../types/tiles'
import { getCellFromKey } from '../lib/utils/chunks'
import { getPerlinAroundCell, getPerlinNoise } from '../lib/utils/perlinNoise'
import { ASSETS } from './assets'
import { getWaterTextureFromPerlin, PERLIN_GROUND_WATER_THRESHOLD } from './water'

export const TILE_WIDTH = 128
export const TILE_WIDTH_HALF = TILE_WIDTH / 2
export const TILE_HEIGHT = 64
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2

export const CHUNK_SIZE = 64
export const CHUNK_WIDTH = CHUNK_SIZE * TILE_WIDTH
export const CHUNK_HEIGHT = CHUNK_SIZE * TILE_HEIGHT

const chunks: Chunks = new Map()

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

			const x = xPosTile - TILE_WIDTH_HALF
			const y = yPosTile

			const sprite = new Sprite({
				width: TILE_WIDTH,
				height: TILE_HEIGHT * 2, // Dubble the height since we have walls on some block but this does not effect the position only the texture
				x: x,
				y: y
			})

			if (ASSETS.BLOCKS) {
				sprite.texture = ASSETS.BLOCKS.animations['grass'][0]

				const isTileWater = perlin[row][col] >= PERLIN_GROUND_WATER_THRESHOLD
				if (isTileWater) {
					const perlinArea = getPerlinAroundCell(xPosTile, yPosTile)
					const water = getWaterTextureFromPerlin(perlinArea)

					sprite.texture = water
				}
			}

			if (!chunks.has(key)) {
				chunks.set(
					key,
					new Container({ label: key, zIndex: currentRow + currentCol, cullable: true })
				)
			}

			chunks.get(key)?.addChild(sprite)
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

	for (let chunkY = row - 1; chunkY <= row + 1; chunkY++) {
		for (let chunkX = col - 1; chunkX <= col + 1; chunkX++) {
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

export const updateVisibleChunks = (world: Container, ground: Container) => {
	const keys = getVisibleChunkKeys(world)

	const newChunkKeys = keys.filter((key) => !chunks.has(key))
	createTiles(newChunkKeys)

	const visibleChunks = getVisibleChunks(keys)

	const childrenToRemove = ground.children.filter((chunk) => !visibleChunks.has(chunk.label))
	ground.removeChild(...childrenToRemove)

	const currentGroundChunks = new Set(ground.children.map((chunk) => chunk.label))
	for (const key of keys) {
		if (!currentGroundChunks.has(key)) {
			const chunk = visibleChunks.get(key)
			if (chunk) {
				ground.addChild(chunk)
			}
		}
	}
}
