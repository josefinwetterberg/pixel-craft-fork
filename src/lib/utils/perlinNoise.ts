// @ts-ignore
import { Noise } from 'noisejs'
import { CHUNK_SIZE } from '../../core/tiles'

const seed = 47208

export const getPerlinNoise = (col: number, row: number) => {
	const noise = new Noise(seed)
	const chunkX = col * CHUNK_SIZE
	const chunkY = row * CHUNK_SIZE
	const values: number[][] = []

	for (let y = 0; y < CHUNK_SIZE; y++) {
		const row = []
		for (let x = 0; x < CHUNK_SIZE; x++) {
			const worldX = chunkX + x
			const worldY = chunkY + y

			// Domain warping for realistic coastlines
			const scale = 80
			let frequency = 0.005
			const warpX = noise.perlin2(worldX * frequency, worldY * frequency) * scale
			const warpY = noise.perlin2((worldX + 1000) * frequency, worldY * frequency) * scale

			// Multi-octave fractal noise
			let value = 0
			let amplitude = 1
			frequency = 0.025

			for (let octave = 0; octave < 6; octave++) {
				const sampleX = (worldX + warpX) * frequency
				const sampleY = (worldY + warpY) * frequency
				value += noise.perlin2(sampleX, sampleY) * amplitude
				amplitude *= 0.5
				frequency *= 2
			}

			row.push(value)
		}
		values.push(row)
	}

	return values
}
