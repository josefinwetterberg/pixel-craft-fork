import { Assets, Texture } from "pixi.js"
import { loadPerlinImage } from "../lib/utils/perlinNoise"

export const GROUND_BLOCK_TEXTURE = '/game/ground/basic_block.png'
export const WATER_BLOCK_TEXTURE = '/game/ground/basic_water.png'
export const PERLIN_GROUND_MAP = '/game/perlin_world_01.png'

export const ASSETS: Record<string, Texture> = {}
export const PERLIN: Record<string, HTMLImageElement> = {}

export const loadAllinitialAssets = async () => {
    ASSETS.GROUND_BLOCK_TEXTURE = await Assets.load(GROUND_BLOCK_TEXTURE)
    ASSETS.WATER_BLOCK_TEXTURE = await Assets.load(WATER_BLOCK_TEXTURE)

    PERLIN.PERLIN_GROUND_MAP = await loadPerlinImage(PERLIN_GROUND_MAP)

}