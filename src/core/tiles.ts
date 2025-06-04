import { Container } from 'pixi.js'
import { Boundaries, Chunks, TileCallback } from '../types/tiles'
import { viewport } from './cameraControls'

export const TILE_WIDTH = 128
export const TILE_WIDTH_HALF = TILE_WIDTH / 2
export const TILE_HEIGHT = 64
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2

export const CHUNK_SIZE = 64
export const CHUNK_WIDTH = CHUNK_SIZE * TILE_WIDTH
export const CHUNK_HEIGHT = CHUNK_SIZE * TILE_HEIGHT

const prevRenderablePosition = { x: 0, y: 0 }

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

export const centerContainerPositionToWindow = (container: Container) => {
	const centerWindowX = window.innerWidth / 2
	const centerWindowY = window.innerHeight / 2

	const centerContainerX = container.width / 2
	const centerContainerY = container.height / 2

	container.x = centerWindowX - centerContainerX
	container.y = centerWindowY - centerContainerY
}

export const isContainerWithInView = (x: number, y: number, width: number, height: number) => {
	const { renderBorder } = viewport
	const boundaries: Boundaries = {
		top: renderBorder.y,
		right: renderBorder.x + renderBorder.width,
		bottom: renderBorder.y + renderBorder.height,
		left: renderBorder.x
	}

	return (
		y < boundaries.bottom &&
		y + height > boundaries.top &&
		x < boundaries.right &&
		x + width > boundaries.left
	)
}

export const setInitalPrevRenderPos = (container: Container) => {
	prevRenderablePosition.x = container.x
	prevRenderablePosition.y = container.y
}

export const hasMovedToNewChunk = (x: number, y: number) => {
	const movedWidthDiff = Math.abs(x - prevRenderablePosition.x)
	const movedHeightDiff = Math.abs(y - prevRenderablePosition.y)

	if (movedWidthDiff >= CHUNK_WIDTH / 2) {
		prevRenderablePosition.x = x
		return true
	} else if (movedHeightDiff >= (CHUNK_SIZE * TILE_HEIGHT_HALF) / 2) {
		prevRenderablePosition.y = y
		return true
	}

	return false
}

export const removeTilesOutOfView = (container: Container) => {
	for (let i = container.children.length - 1; i >= 0; i--) {
		const tile = container.children[i]
		const { width, height } = tile
		const { x, y } = tile.getGlobalPosition()

		if (!isContainerWithInView(x, y, width, height)) {
			tile.removeFromParent()
		}
	}
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

export const getVisibleChunks = (world: Container, chunks: Chunks) => {
	const keys: string[] = []
	const selectedChunks: Chunks = new Map()

	const worldX = -world.x
	const worldY = -world.y

	// Isometric position projection
	const x = Math.floor((worldX / TILE_WIDTH_HALF + worldY / TILE_HEIGHT_HALF) / 2)
	const y = Math.floor((worldY / TILE_HEIGHT_HALF - worldX / TILE_WIDTH_HALF) / 2)

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
