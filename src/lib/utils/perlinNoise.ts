// @ts-ignore
import { Noise } from 'noisejs'
import { CHUNK_SIZE } from '../../core/tiles'

const seed = 47208
const zoomFactor = 200

export const getPerlinNoise = (col: number, row: number) => {
	const noise = new Noise(seed)

	const chunkX = col * CHUNK_SIZE
	const chunkY = row * CHUNK_SIZE

	const width = CHUNK_SIZE
	const height = CHUNK_SIZE

	const values: number[][] = []

	for (let y = 0; y < height; y++) {
		const row = []
		for (let x = 0; x < width; x++) {
			const worldX = chunkX + x
			const worldY = chunkY + y

			const value = noise.perlin2(worldX / zoomFactor, worldY / zoomFactor)
			row.push(value)
		}
		values.push(row)
	}

	return values
}
