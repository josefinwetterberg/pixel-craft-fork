import { Container, FederatedPointerEvent } from 'pixi.js'

export const MOMENTUM_FACTOR = 0.87 // Controls how quickly the movement slows down (0-1)
export const VELOCITY_THRESHOLD = 0.01 // When to stop the movement completely

export const viewport = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	scale: 1,
	isMoveable: false
}

export const setViewportMoveable = (moveable: boolean, ev?: FederatedPointerEvent) => {
	viewport.isMoveable = moveable

	if (ev) {
		viewport.x = ev.clientX
		viewport.y = ev.clientY
	}
}

export const handleMovement = (ev: FederatedPointerEvent, world: Container) => {
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
