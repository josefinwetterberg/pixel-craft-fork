import { Container } from 'pixi.js'
import { Viewport } from '../types/cameraControls'

export const viewport: Viewport = {
	clientX: 0,
	clientY: 0,
	dx: 0,
	dy: 0,
	isMoveable: false,
	pointerEvents: [],
	border: { x: 0, y: 0, width: 0, height: 0 }
}

// const isPinchZoomPointers = () => {
// 	return viewport.pointerEvents.every((event) => event.pointerType === 'touch')
// }
//
// const isPointerValidForMove = (ev: FederatedPointerEvent) => {
// 	// If there is multiple touch event we should not allow camera to move, only if there is one pointer event
// 	return viewport.pointerEvents.length > 1 ? !isPinchZoomPointers() : ev.button === 0
// }

// export const handlePointerDown = (ev: FederatedPointerEvent) => {
// 	const { clientX, clientY, pointerId, pointerType } = ev
// 	// passing the selected properties from ev to prevent unwanted updates of the event
// 	viewport.pointerEvents.push({ clientX, clientY, pointerId, pointerType })
// 	if (!isPointerValidForMove(ev)) {
// 		// isMoveable is set to true from first pointer event but if there is a second pointer event
// 		// for i.e pinch zoom isMoveable should be set to false
// 		viewport.isMoveable = false
// 		viewport.dx = viewport.dy = 0 // stop camera movement when pinching
// 		return
// 	}
//
// 	viewport.isMoveable = true
//
// 	viewport.clientX = ev.clientX
// 	viewport.clientY = ev.clientY
// }

// export const handlePointerUp = (ev: PointerEvent) => {
// 	viewport.pointerEvents = viewport.pointerEvents.filter(
// 		(event) => event.pointerId !== ev.pointerId
// 	)
// 	viewport.isMoveable = false
// }

export const setCameraBorder = (ground: Container) => {
	const { width, height } = ground
	const { x, y } = ground.getGlobalPosition()

	viewport.border = { x, y, width, height }
}

const addCameraXDirection = (x1: boolean, x2: boolean, dx: number) => {
	return (x1 && dx > 0) || (x2 && dx < 0) ? dx : 0
}

const addCameraYDirection = (y1: boolean, y2: boolean, dy: number) => {
	return (y1 && dy > 0) || (y2 && dy < 0) ? dy : 0
}

// export const handlePointerMove = (
// 	ev: FederatedPointerEvent,
// 	ground: Container,
// 	world: Container
// ) => {
// 	if (!viewport.isMoveable) return
//
// 	const { clientX, clientY } = ev
//
// 	viewport.dx = clientX - viewport.clientX
// 	viewport.dy = clientY - viewport.clientY
//
// 	const { x1, y1, x2, y2 } = isGroundWithInBorder(ground)
//
// 	world.x += addCameraXDirection(x1, x2, viewport.dx)
// 	world.y += addCameraYDirection(y1, y2, viewport.dy)
//
// 	viewport.clientX = clientX
// 	viewport.clientY = clientY
// }
