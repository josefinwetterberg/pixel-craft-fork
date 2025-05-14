import { Container, FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js'
import { Viewport, ViewportPointerEvent } from '../types'
import { GRASS_TEXTURE_TILE_COUNT, isGroundWithInBorder } from './groundTiles'
import { TILE_HEIGHT_HALF, TILE_WIDTH_HALF } from './tiles'

export const MOMENTUM_FACTOR = 0.95 // Controls how quickly the movement slows down (0-1)
export const VELOCITY_THRESHOLD = 0.01 // When to stop the movement completely
export const CAMERA_ZOOM_LEVELS = {
	sm: { min: 0.75, max: 0.75 },
	md: { min: 0.75, max: 0.75 },
	lg: { min: 0.75, max: 0.75 }
}
// TODO - add ticker delta to have the same speed for different fps
export const CAMERA_ZOOM_WHEEL_SPEED = 0.001
export const CAMERA_ZOOM_PINCH_SPEED = 0.0025

export const viewport: Viewport = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	initScaleDistance: 0,
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
	viewport.initScaleDistance = 0
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

	const { x1, y1, x2, y2 } = isGroundWithInBorder(ground, world.scale.x)
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
		const { x1, y1, x2, y2 } = isGroundWithInBorder(ground, world.scale.x)
		world.x += addCameraXDirection(x1, x2, viewport.dx)
		world.y += addCameraYDirection(y1, y2, viewport.dy)

		// Reduce direction diff
		viewport.dx *= MOMENTUM_FACTOR
		viewport.dy *= MOMENTUM_FACTOR
	} else {
		viewport.dx = viewport.dy = 0
	}
}

const getZoomLevelByWindowSize = () => {
	const { lg, md, sm } = CAMERA_ZOOM_LEVELS
	return window.innerWidth <= 800 ? sm : window.innerWidth <= 1600 ? md : lg
}

const getNewZoomScale = (oldScale: number, zoomDelta: number) => {
	const { min, max } = getZoomLevelByWindowSize()
	return Math.min(Math.max(oldScale + zoomDelta, min), max)
}

// TODO: Check if the transformation is with in the viewport boders
export const getZoomTransformatinoCompensation = (
	pointX: number,
	pointY: number,
	newScale: number,
	oldScale: number
) => {
	// To keep the zoomed in point under the cursor/pinch center point we have to calculate how much
	// the world have to move to compensate for the new scale.
	// When zooming in = negative delta which moves the world left and up to compensate for scaling
	// When zooming out = positive delta which moves the world right and down to compensate for scaling
	// When new and old scale is the same i.e when min/max zoom level is the scale value the delta is 0 and does not change the transformation of the world position
	const deltaX = pointX * (1 - newScale / oldScale)
	const deltaY = pointY * (1 - newScale / oldScale)
	return { deltaX, deltaY }
}

export const handleCameraWheelZoom = (ev: FederatedWheelEvent, world: Container) => {
	const zoomDelta = -ev.deltaY * CAMERA_ZOOM_WHEEL_SPEED
	const oldScale = world.scale.x
	const newScale = getNewZoomScale(oldScale, zoomDelta)

	// Can't use ev position directly beacuse the world position does not allways sit on (0, 0)
	const mouseX = ev.clientX - world.x
	const mouseY = ev.clientY - world.y

	const { deltaX, deltaY } = getZoomTransformatinoCompensation(mouseX, mouseY, newScale, oldScale)

	world.scale.set(newScale)
	world.x += deltaX
	world.y += deltaY
}

const getPinchDistance = (pointers: ViewportPointerEvent[]) => {
	const [pointerA, pointerB] = pointers
	const dx = pointerA.clientX - pointerB.clientX
	const dy = pointerA.clientY - pointerB.clientY
	return Math.sqrt(dx * dx + dy * dy)
}

const updatePointerEventPosition = (ev: FederatedPointerEvent) => {
	const { clientX, clientY, pointerId, pointerType } = ev

	return viewport.pointerEvents.map((event) => {
		const updatedEv = { clientX, clientY, pointerId, pointerType }
		return event.pointerId === ev.pointerId ? updatedEv : event
	})
}

const getPinchCenterPoint = (pointers: ViewportPointerEvent[]) => {
	const [pointerA, pointerB] = pointers
	const centerX = (pointerA.clientX + pointerB.clientX) / 2
	const centerY = (pointerA.clientY + pointerB.clientY) / 2
	return { x: centerX, y: centerY }
}

export const handleCameraPinchZoom = (ev: FederatedPointerEvent, world: Container) => {
	if (viewport.pointerEvents.length < 2 && isPinchZoomPointers()) {
		return
	}

	// If there is no inital scale distance the continuation of a zoom does not work
	if (viewport.initScaleDistance === 0) {
		viewport.initScaleDistance = getPinchDistance(viewport.pointerEvents)
		return
	}

	const zoomLevel = getZoomLevelByWindowSize()

	// scale.y is the same as scale.x, that is why we can only check one
	if (world.scale.x > zoomLevel.max || world.scale.x < zoomLevel.min) {
		return
	}

	viewport.pointerEvents = updatePointerEventPosition(ev)

	const currentDistance = getPinchDistance(viewport.pointerEvents)
	const zoomDelta = (currentDistance - viewport.initScaleDistance) * CAMERA_ZOOM_PINCH_SPEED
	const oldScale = world.scale.x
	const newScale = getNewZoomScale(oldScale, zoomDelta)

	viewport.initScaleDistance = currentDistance

	const centerPoint = getPinchCenterPoint(viewport.pointerEvents)

	// Can't use center point position directly beacuse the world position does not allways sit on (0, 0)
	const pointX = centerPoint.x - world.x
	const pointY = centerPoint.y - world.y

	const { deltaX, deltaY } = getZoomTransformatinoCompensation(pointX, pointY, newScale, oldScale)

	world.scale.set(newScale)
	world.x += deltaX
	world.y += deltaY
}
