import { Container, FederatedPointerEvent } from 'pixi.js'
import { Viewport } from '../types'
import { GRASS_TEXTURE_TILE_COUNT, isGroundWithInBorder } from './groundTiles'
import { TILE_HEIGHT_HALF, TILE_WIDTH_HALF } from './tiles'

export const MOMENTUM_FACTOR = 0.95 // Controls how quickly the movement slows down (0-1)
export const VELOCITY_THRESHOLD = 0.01 // When to stop the movement completely

export const viewport: Viewport = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	isMoveable: false,
	pointerEvents: [],
	border: { x1: 0, y1: 0, x2: 0, y2: 0 }
}

export const cloneGroundPosToViewport = (ground: Container) => {
	viewport.x = ground.x
	viewport.y = ground.y
}

const isPinchZoomPointers = () => {
	return viewport.pointerEvents.every((event) => event.pointerType === 'touch')
}

const isPointerValidForMove = (ev: FederatedPointerEvent) => {
	// If there is multiple touch event we should not allow camera to move, only if there is one pointer event
	return viewport.pointerEvents.length > 1 ? !isPinchZoomPointers() : ev.button === 0
}

export const handlePointerDown = (ev: FederatedPointerEvent) => {
	const { clientX, clientY, pointerId, pointerType } = ev
	// passing the selected properties from ev to prevent unwanted updates of the event
	viewport.pointerEvents.push({ clientX, clientY, pointerId, pointerType })
	if (!isPointerValidForMove(ev)) {
		// isMoveable is set to true from first pointer event but if there is a second pointer event
		// for i.e pinch zoom isMoveable should be set to false
		viewport.isMoveable = false
		viewport.dx = viewport.dy = 0 // stop camera movement when pinching
		return
	}

	viewport.isMoveable = true

	viewport.x = ev.clientX
	viewport.y = ev.clientY
}

export const handlePointerUp = (ev: PointerEvent) => {
	viewport.pointerEvents = viewport.pointerEvents.filter(
		(event) => event.pointerId !== ev.pointerId
	)
	viewport.isMoveable = false
}

export const setCameraBorder = (ground: Container) => {
	const { width, height } = ground
	const { x, y } = ground.getGlobalPosition()

	const quarterWidth = width / 4
	const quarterHeight = height / 4

	const paddingX = TILE_WIDTH_HALF * GRASS_TEXTURE_TILE_COUNT
	const paddingY = TILE_HEIGHT_HALF * GRASS_TEXTURE_TILE_COUNT

	viewport.border = {
		x1: x + quarterWidth + paddingX,
		y1: y + quarterHeight + paddingY,
		x2: x + quarterWidth * 3 - paddingX,
		y2: y + quarterHeight * 3 - paddingY
	}
}

const addCameraXDirection = (x1: boolean, x2: boolean, dx: number) => {
	return (x1 && dx > 0) || (x2 && dx < 0) ? dx : 0
}

const addCameraYDirection = (y1: boolean, y2: boolean, dy: number) => {
	return (y1 && dy > 0) || (y2 && dy < 0) ? dy : 0
}

export const handlePointerMove = (
	ev: FederatedPointerEvent,
	world: Container,
	ground: Container
) => {
	if (!viewport.isMoveable) return

	const { clientX, clientY } = ev

	viewport.dx = clientX - viewport.x
	viewport.dy = clientY - viewport.y

	const { x1, y1, x2, y2 } = isGroundWithInBorder(ground)
	world.x += addCameraXDirection(x1, x2, viewport.dx)
	world.y += addCameraYDirection(y1, y2, viewport.dy)

	viewport.x = clientX
	viewport.y = clientY
}

export const hasCameraMovement = () => viewport.dx !== 0 && viewport.dy !== 0

const isAboveThreshold = () => {
	return Math.abs(viewport.dx) > VELOCITY_THRESHOLD || Math.abs(viewport.dy) > VELOCITY_THRESHOLD
}

export const updateCameraMomentum = (world: Container, ground: Container) => {
	if (!hasCameraMovement()) return

	// To avoid dampning on very small numbers, we check if is above the threshold
	if (isAboveThreshold()) {
		const { x1, y1, x2, y2 } = isGroundWithInBorder(ground)
		world.x += addCameraXDirection(x1, x2, viewport.dx)
		world.y += addCameraYDirection(y1, y2, viewport.dy)

		// Reduce direction diff
		viewport.dx *= MOMENTUM_FACTOR
		viewport.dy *= MOMENTUM_FACTOR
	} else {
		viewport.dx = viewport.dy = 0
	}
}
