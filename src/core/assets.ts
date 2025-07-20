import { Assets, Spritesheet } from 'pixi.js'

export type AssetsKeys = 'BLOCKS' | 'PLAYER' | 'VEGETATION'
export const ASSETS: Partial<Record<AssetsKeys, Spritesheet>> = {}

export const loadAllinitialAssets = async () => {
	ASSETS.BLOCKS = await Assets.load('/game/blocks.json')
	ASSETS.VEGETATION = await Assets.load('/game/vegetation.json')
	ASSETS.PLAYER = await Assets.load('/game/character/player.json')
}
