import { Assets, Texture } from 'pixi.js'

const GROUND_BLOCK_TEXTURE = '/game/ground/basic_block.png'
const WATER_BLOCK_TEXTURE = '/game/ground/basic_water.png'
const CHARACTER_BOB = '/game/character/bob.png'

export const ASSETS: Record<string, Texture> = {}
export const PERLIN: Record<string, HTMLImageElement> = {}

export const loadAllinitialAssets = async () => {
	// Block assets
	ASSETS.GROUND_BLOCK_TEXTURE = await Assets.load(GROUND_BLOCK_TEXTURE)
	ASSETS.WATER_BLOCK_TEXTURE = await Assets.load(WATER_BLOCK_TEXTURE)

	// Character assets
	ASSETS.CHARACTER_BOB = await Assets.load(CHARACTER_BOB)
}
