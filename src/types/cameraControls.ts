export type ViewportPointerEvent = {
	pointerId: number
	pointerType: string
	clientX: number
	clientY: number
}

export type Viewport = {
	x: number
	y: number
	dx: number
	dy: number
	initScaleDistance: number
	isMoveable: boolean
	pointerEvents: ViewportPointerEvent[]
}
