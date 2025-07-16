import { Texture, TextureSource } from 'pixi.js'
import { ASSETS } from './assets'

// We check the suroding perlin values to get the correct water tile
// 1 = ground, 0 = ignore and -1 = water
// The order of each pattern matters of you put one with a simulare patter where on tille diifs between i.e ignore and ground the wrong tile will be picked
const waterPatterns: Record<string, number[][]> = {
	water: [
		[-1, -1, -1],
		[-1, -1, -1],
		[-1, -1, -1]
	],
	'water-full': [
		[0, 1, 0],
		[1, -1, 1],
		[0, 1, 0]
	],
	'water-single-top': [
		[0, -1, -1],
		[1, -1, -1],
		[0, -1, -1]
	],
	'water-single-left': [
		[-1, -1, -1],
		[-1, -1, -1],
		[0, 1, 0]
	],
	'water-single-bottom': [
		[-1, -1, 0],
		[-1, -1, 1],
		[-1, -1, 0]
	],
	'water-single-right': [
		[0, 1, 0],
		[-1, -1, -1],
		[-1, -1, -1]
	],
	'water-dubble-bottom-top': [
		[0, 1, 0],
		[-1, -1, -1],
		[0, 1, 0]
	],
	'water-dubble-right-left': [
		[0, -1, 0],
		[1, -1, 1],
		[0, -1, 0]
	],
	'water-corner-top': [
		[0, 1, 0],
		[1, -1, -1],
		[0, -1, 0]
	],
	'water-corner-left': [
		[0, -1, 0],
		[1, -1, -1],
		[0, 1, 0]
	],
	'water-corner-bottom': [
		[0, -1, 0],
		[-1, -1, 1],
		[0, 1, 0]
	],
	'water-corner-right': [
		[0, 1, 0],
		[-1, -1, 1],
		[0, -1, 0]
	],
	'water-three-side-top': [
		[0, 1, 0],
		[1, -1, 1],
		[0, -1, 0]
	],
	'water-three-side-left': [
		[0, 1, 0],
		[1, -1, -1],
		[0, 1, 0]
	],
	'water-three-side-bottom': [
		[0, -1, 0],
		[1, -1, 1],
		[0, 1, 0]
	],
	'water-three-side-right': [
		[0, 1, 0],
		[-1, -1, 1],
		[0, 1, 0]
	],
	'water-edge-full': [
		[1, -1, 1],
		[-1, -1, -1],
		[1, -1, 1]
	],
	'water-edge-two-top-left': [
		[1, -1, 0],
		[-1, -1, -1],
		[1, -1, 0]
	],
	'water-edge-two-left-bottom': [
		[0, -1, 0],
		[-1, -1, -1],
		[1, -1, 1]
	],
	'water-edge-two-bottom-right': [
		[0, -1, 1],
		[-1, -1, -1],
		[0, -1, 1]
	],
	'water-edge-two-right-top': [
		[1, -1, 1],
		[-1, -1, -1],
		[0, -1, 0]
	],
	'water-edge-one-top': [
		[1, -1, 0],
		[-1, -1, -1],
		[0, -1, 0]
	],
	'water-edge-one-left': [
		[0, -1, 0],
		[-1, -1, -1],
		[1, -1, 0]
	],
	'water-edge-one-bottom': [
		[0, -1, 0],
		[-1, -1, -1],
		[0, -1, 1]
	],
	'water-edge-one-right': [
		[0, -1, 1],
		[-1, -1, -1],
		[0, -1, 0]
	]
}

export const PERLIN_GROUND_WATER_THRESHOLD = 0.15

export const matchesPattern = (perlin: number[][], pattern: number[][]): boolean => {
	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			const rule = pattern[y][x]
			const value = perlin[y][x]

			if (rule === 0) continue

			if (rule === 1 && value >= PERLIN_GROUND_WATER_THRESHOLD) return false // must be ground
			if (rule === -1 && value < PERLIN_GROUND_WATER_THRESHOLD) return false // must be water
		}
	}
	return true
}

export const getWaterTextureFromPerlin = (perlin: number[][]): Texture<TextureSource<any>> => {
	let water = ASSETS.BLOCKS?.animations['water'][0] as Texture<TextureSource<any>>

	for (const [key, value] of Object.entries(waterPatterns)) {
		if (matchesPattern(perlin, value) && ASSETS.BLOCKS) {
			water = ASSETS.BLOCKS?.animations[key][0]
			break
		}
	}

	return water
}
