import { CHUNK_SIZE } from '../../core/tiles'

export const getChunkKey = (row: number, col: number) => {
	const chunkX = Math.floor(col / CHUNK_SIZE)
	const chunkY = Math.floor(row / CHUNK_SIZE)

	return `${chunkX}_${chunkY}`
}

export const getCellFromKey = (key: string) => {
	const [col, row] = key.split('_')
	return { col: parseInt(col), row: parseInt(row) }
}
