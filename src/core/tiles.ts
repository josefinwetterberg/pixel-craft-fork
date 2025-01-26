import { Container, ObservablePoint } from 'pixi.js'
import { Boundaries, TileCallback } from '../types'
import { hasCameraMovement } from './cameraControls'

export const TILE_WIDTH = 128
export const TILE_WIDTH_HALF = TILE_WIDTH / 2
export const TILE_HEIGHT = 64
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2
export const TILE_COUNT = 32

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

export const isContainerWithInView = (container: Container, boundaries: Boundaries) => {
	const { width, height } = container
	const { x, y } = container.getGlobalPosition()

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

// This is a generic in view check for containers
// Make a copy of the functino if unique boundaries are required
export const setContainersRenderableForInView = (containers: Container[]) => {
	const { innerHeight, innerWidth } = window
	const boundaries = {
		top: -innerHeight,
		right: window.innerWidth * 2,
		bottom: window.innerHeight * 2,
		left: -innerWidth
	}

	for (const container of containers) {
		container.renderable = isContainerWithInView(container, boundaries)
	}
}
