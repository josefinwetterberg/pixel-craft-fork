export type TileCallback<T> = (row: number, col: number, ...args: any[]) => T

export type Boundaries = {
	top: number
	right: number
	bottom: number
	left: number
}
