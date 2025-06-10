import { Assets, Texture } from 'pixi.js'

const GRASS_BLOCK = '/game/ground/basic_block.png'
const DIRT_BLOCK = '/game/ground/basic_dirt_block.png'
const WATER_BLOCK_TEXTURE = '/game/ground/water.png'
const SAND_BLOCK = '/game/ground/sand_block.png'

const CHARACTER_BOB = '/game/character/bob.png'

export const ASSETS: Record<string, Texture> = {}
export const PERLIN: Record<string, HTMLImageElement> = {}

export const loadAllinitialAssets = async () => {
	// Block assets
	ASSETS.GRASS_BLOCK = await Assets.load(GRASS_BLOCK)
	ASSETS.DIRT_BLOCK = await Assets.load(DIRT_BLOCK)
	ASSETS.WATER_BLOCK_TEXTURE = await Assets.load(WATER_BLOCK_TEXTURE)
	ASSETS.SAND_BLOCK = await Assets.load(SAND_BLOCK)

	// Character assets
	ASSETS.CHARACTER_BOB = await Assets.load(CHARACTER_BOB)
}
