import { Container, FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js'
import { Viewport, ViewportPointerEvent } from '../types'

export const MOMENTUM_FACTOR = 0.95 // Controls how quickly the movement slows down (0-1)
export const VELOCITY_THRESHOLD = 0.01 // When to stop the movement completely
export const MAX_CAMERA_ZOOM_LEVEL = 1.25
export const MIN_CAMERA_ZOOM_LEVEL = 0.75
export const CAMERA_ZOOM_SPEED = 0.001

export const viewport: Viewport = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	initScaleDistance: 0,
	isMoveable: false,
	pointerEvents: []
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

export const handlePointerMove = (ev: FederatedPointerEvent, world: Container) => {
	if (!viewport.isMoveable) return

	const { clientX, clientY } = ev

	viewport.dx = clientX - viewport.x
	viewport.dy = clientY - viewport.y

	world.x += viewport.dx
	world.y += viewport.dy

	viewport.x = clientX
	viewport.y = clientY
}

const hasMovement = () => viewport.dx !== 0 && viewport.dy !== 0

const isAboveThreshold = () => {
	return Math.abs(viewport.dx) > VELOCITY_THRESHOLD || Math.abs(viewport.dy) > VELOCITY_THRESHOLD
}

export const updateCameraMomentum = (world: Container) => {
	if (!hasMovement()) return

	// To avoid dampning on very small numbers, we check if is above the threshold
	if (isAboveThreshold()) {
		world.x += viewport.dx
		world.y += viewport.dy

		// Reduce direction diff
		viewport.dx *= MOMENTUM_FACTOR
		viewport.dy *= MOMENTUM_FACTOR
	} else {
		viewport.dx = viewport.dy = 0
	}
}

export const handleCameraWheelZoom = (ev: FederatedWheelEvent, world: Container) => {
	const zoomDelta = -ev.deltaY * CAMERA_ZOOM_SPEED
	const newScale = Math.min(
		Math.max(world.scale.x + zoomDelta, MIN_CAMERA_ZOOM_LEVEL),
		MAX_CAMERA_ZOOM_LEVEL
	)

	world.scale.set(newScale)
}

const getPinchDistance = (pointers: ViewportPointerEvent[]) => {
	const [pointerA, pointerB] = pointers
	const dx = pointerA.clientX - pointerB.clientX
	const dy = pointerA.clientY - pointerB.clientY
	return Math.sqrt(dx * dx + dy * dy)
}

/**
 * TODO:
 * Relative zoom min/max values depending on the screen size
 * Targeted zoom position
 */

export const handleCameraPinchZoom = (ev: FederatedPointerEvent, world: Container) => {
	if (viewport.pointerEvents.length < 2 && isPinchZoomPointers()) {
		return
	}

	// If there is no inital scale distance the continuation of a zoom does not work
	if (viewport.initScaleDistance === 0) {
		viewport.initScaleDistance = getPinchDistance(viewport.pointerEvents)
		return
	}

	// scale.y is the same as scale.x, that is why we can only check one
	if (world.scale.x > MAX_CAMERA_ZOOM_LEVEL || world.scale.x < MIN_CAMERA_ZOOM_LEVEL) {
		return
	}

	const { clientX, clientY, pointerId, pointerType } = ev
	viewport.pointerEvents = viewport.pointerEvents.map((event) => {
		const updatedEv = { clientX, clientY, pointerId, pointerType }
		return event.pointerId === ev.pointerId ? updatedEv : event
	})

	const currentDistance = getPinchDistance(viewport.pointerEvents)
	const zoomDelta = (currentDistance - viewport.initScaleDistance) * CAMERA_ZOOM_SPEED
	const newScale = Math.min(
		Math.max(world.scale.x + zoomDelta, MIN_CAMERA_ZOOM_LEVEL),
		MAX_CAMERA_ZOOM_LEVEL
	)

	viewport.initScaleDistance = currentDistance

	world.scale.set(newScale)
}
