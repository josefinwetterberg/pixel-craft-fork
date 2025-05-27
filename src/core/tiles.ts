import { Container, ObservablePoint } from 'pixi.js'
import { Boundaries, TileCallback } from '../types'
import { hasCameraMovement, viewport } from './cameraControls'

export const TILE_WIDTH = 128
export const TILE_WIDTH_HALF = TILE_WIDTH / 2
export const TILE_HEIGHT = 64
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2

const prevRenderablePosition = { x: 0, y: 0 }
let prevScale = 1

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

export const setInitalPrevRenderPos = (ground: Container) => {
	prevRenderablePosition.x = ground.x
	prevRenderablePosition.y = ground.y
}

export const shouldRecalculateRenderable = (x: number, y: number, scale: ObservablePoint) => {
	if (!hasCameraMovement() && scale.x === prevScale) return false

	const movedWidthDiff = Math.abs(x - prevRenderablePosition.x)
	const movedHeightDiff = Math.abs(y - prevRenderablePosition.y)
	const { innerHeight, innerWidth } = window

	if (movedWidthDiff >= innerWidth / 2 || movedHeightDiff >= innerHeight / 2) {
		prevRenderablePosition.x = x
		prevRenderablePosition.y = y
		return true
	} else if (scale.x !== prevScale) {
		prevScale = scale.x
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
