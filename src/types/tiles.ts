import { Container } from 'pixi.js'

export type TileCallback<T> = (row: number, col: number, ...args: any[]) => T

export type Boundaries = {
	top: number
	right: number
	bottom: number
	left: number
}

export type Chunks = Map<string, Container>
