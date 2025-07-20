import { Container } from 'pixi.js'

export type TileCallback<T> = (row: number, col: number, ...args: any[]) => T

type ChunkKeys = 'ground' | 'vegetation'
export type Chunk = Partial<Record<ChunkKeys, Container>>
export type Chunks = Map<string, Chunk>
