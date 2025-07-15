import { Assets, Spritesheet } from 'pixi.js'

export type AssetsKeys = 'BLOCKS' | 'PLAYER'
export const ASSETS: Record<AssetsKeys, Spritesheet | null> = { BLOCKS: null, PLAYER: null }

export const loadAllinitialAssets = async () => {
	ASSETS.BLOCKS = await Assets.load('/game/blocks.json')
	ASSETS.PLAYER = await Assets.load('/game/character/player.json')
}
