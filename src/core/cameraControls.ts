import { Container, FederatedPointerEvent } from 'pixi.js'

const viewport = {
	position: {
		x: 0,
		y: 0
	},
	scale: 1,
	isMoveable: false
}

export const setViewportMoveable = (moveable: boolean, ev?: FederatedPointerEvent) => {
	viewport.isMoveable = moveable

	if (ev) {
		viewport.position.x = ev.clientX
		viewport.position.y = ev.clientY
	}
}

// Move world container on x & y pos to simulate camera movement
export const handleMovement = (ev: FederatedPointerEvent, world: Container) => {
	if (!viewport.isMoveable) return

	const { clientX, clientY } = ev

	// Calculate the diff between the prev and current position
	const dx = clientX - viewport.position.x
	const dy = clientY - viewport.position.y

	world.x += dx
	world.y += dy

	viewport.position.x = clientX
	viewport.position.y = clientY
}
