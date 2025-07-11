import { Assets, Texture } from 'pixi.js'

export const ASSETS: Record<string, Texture> = {}
export const PERLIN: Record<string, HTMLImageElement> = {}

export const loadAllinitialAssets = async () => {
	// Block assets
	ASSETS.GRASS_BLOCK = await Assets.load('/game/ground/basic_block.png')
	ASSETS.DIRT_BLOCK = await Assets.load('/game/ground/basic_dirt_block.png')
	ASSETS.WATER_BLOCK_TEXTURE = await Assets.load('/game/ground/water.png')
	ASSETS.SAND_BLOCK = await Assets.load('/game/ground/sand_block.png')

	// Player assets
	ASSETS.PLAYER = await Assets.load('/game/character/player.png')
}
