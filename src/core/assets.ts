import { Assets, Texture } from 'pixi.js'
import { loadPerlinImage } from '../lib/utils/perlinNoise'

const GROUND_BLOCK_TEXTURE = '/game/ground/basic_block.png'
const WATER_BLOCK_TEXTURE = '/game/ground/basic_water.png'
const PERLIN_GROUND_MAP = '/game/perlin_world_01.png'
const CHARACTER_BOB = '/game/character/bob.png'

export const ASSETS: Record<string, Texture> = {}
export const PERLIN: Record<string, HTMLImageElement> = {}

export const loadAllinitialAssets = async () => {
	// Block assets
	ASSETS.GROUND_BLOCK_TEXTURE = await Assets.load(GROUND_BLOCK_TEXTURE)
	ASSETS.WATER_BLOCK_TEXTURE = await Assets.load(WATER_BLOCK_TEXTURE)

	// Character assets
	ASSETS.CHARACTER_BOB = await Assets.load(CHARACTER_BOB)

	// Perlin noise assets
	PERLIN.PERLIN_GROUND_MAP = await loadPerlinImage(PERLIN_GROUND_MAP)
}
