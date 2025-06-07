import { Container } from 'pixi.js'
import { Chunks, TileCallback } from '../types/tiles'

export const TILE_WIDTH = 128
export const TILE_WIDTH_HALF = TILE_WIDTH / 2
export const TILE_HEIGHT = 64
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2

export const CHUNK_SIZE = 64
export const CHUNK_WIDTH = CHUNK_SIZE * TILE_WIDTH
export const CHUNK_HEIGHT = CHUNK_SIZE * TILE_HEIGHT

export const loopTiles = <T>(width: number, height: number, callback: TileCallback<T>): T[] => {
	const results: T[] = []

	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			results.push(callback(row, col))
		}
	}

	return results
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

export const getChunkKey = (row: number, col: number) => {
	const chunkX = Math.floor(col / CHUNK_SIZE)
	const chunkY = Math.floor(row / CHUNK_SIZE)

	return `${chunkX}_${chunkY}`
}

export const screenToIsoPos = (x: number, y: number) => {
	const xPos = Math.floor((x / TILE_WIDTH_HALF + y / TILE_HEIGHT_HALF) / 2)
	const yPos = Math.floor((y / TILE_HEIGHT_HALF - x / TILE_WIDTH_HALF) / 2)

	return { x: xPos, y: yPos }
}

export const getVisibleChunks = (world: Container, chunks: Chunks) => {
	const keys: string[] = []
	const selectedChunks: Chunks = new Map()

	const worldX = -world.x
	const worldY = -world.y

	const { x, y } = screenToIsoPos(worldX, worldY)

	const col = Math.floor(x / CHUNK_SIZE)
	const row = Math.floor(y / CHUNK_SIZE)

	for (let chunkY = row - 1; chunkY <= row + 1; chunkY++) {
		for (let chunkX = col - 1; chunkX <= col + 1; chunkX++) {
			const key = `${chunkX}_${chunkY}`
			const chunk = chunks.get(key)

			if (chunk) {
				selectedChunks.set(key, chunk)
				keys.push(key)
			}
		}
	}

	return { keys, chunks: selectedChunks }
}

export const updateVisibleChunks = (world: Container, ground: Container, chunks: Chunks) => {
	const visibleChunks = getVisibleChunks(world, chunks)

	const childrenToRemove = ground.children.filter((chunk) => !visibleChunks.chunks.has(chunk.label))
	ground.removeChild(...childrenToRemove)

	const currentGroundChunks = new Set(ground.children.map((chunk) => chunk.label))
	for (const key of visibleChunks.keys) {
		if (!currentGroundChunks.has(key)) {
			const chunk = visibleChunks.chunks.get(key)
			if (chunk) {
				ground.addChild(chunk)
			}
		}
	}
}
