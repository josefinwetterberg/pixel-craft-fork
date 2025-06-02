export type ViewportPointerEvent = {
	pointerId: number
	pointerType: string
	clientX: number
	clientY: number
}

export type Border = {
	x: number
	y: number
	width: number
	height: number
}

export type Viewport = {
	clientX: number
	clientY: number
	dx: number
	dy: number
	isMoveable: boolean
	pointerEvents: ViewportPointerEvent[]
	border: Border
	renderBorder: Border
	world: {
		width: number
		height: number
	}
}
