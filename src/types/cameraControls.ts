export type ViewportPointerEvent = {
	pointerId: number
	pointerType: string
	clientX: number
	clientY: number
}

export type Border = {
	x1: number
	y1: number
	x2: number
	y2: number
}

export type Viewport = {
	x: number
	y: number
	dx: number
	dy: number
	initScaleDistance: number
	isMoveable: boolean
	pointerEvents: ViewportPointerEvent[]
	border: Border
}
