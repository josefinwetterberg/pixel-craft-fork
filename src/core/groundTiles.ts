import { Container, Sprite } from 'pixi.js'
import {
	getChunkKey,
	getIsometricTilePositions,
	loopTiles,
	TILE_HEIGHT,
	TILE_HEIGHT_HALF,
	TILE_WIDTH,
	TILE_WIDTH_HALF
} from './tiles'
import { ASSETS } from './assets'
import { Chunks } from '../types/tiles'
import { PerlinNoise } from '../types'

export const PERLIN_GROUND_WATER_THRESHOLD = 0.3
export const WATER_LEVEL = TILE_HEIGHT - 15 // TODO: Replace 15 with an animated value to reprecent water level changing

export const drawGroundTiles = (perlin: PerlinNoise | undefined) => {
	const width = perlin?.width || 0
	const height = perlin?.height || 0

	const chunks: Chunks = new Map<string, Container>()

	loopTiles(width, height, (row, col) => {
		const { xPosTile, yPosTile } = getIsometricTilePositions(
			row,
			col,
			TILE_WIDTH_HALF,
			TILE_HEIGHT_HALF
		)

		const isTileWater = perlin?.map && perlin?.map[row][col] < PERLIN_GROUND_WATER_THRESHOLD
		const spriteTileHegight = isTileWater ? TILE_HEIGHT : TILE_HEIGHT * 2 // 2x height since it is a block with dirt below the grass
		const x = xPosTile - TILE_WIDTH_HALF
		const y = isTileWater ? yPosTile + WATER_LEVEL : yPosTile

		const texture = isTileWater ? ASSETS.WATER_BLOCK_TEXTURE : ASSETS.GROUND_BLOCK_TEXTURE
		const sprite = Sprite.from(texture)
		sprite.width = TILE_WIDTH
		sprite.height = spriteTileHegight
		sprite.x = x
		sprite.y = y

		const key = getChunkKey(row, col)
		if (!chunks.has(key)) {
			chunks.set(key, new Container({ label: key, zIndex: row + col, cullable: true }))
		}

		chunks.get(key)?.addChild(sprite)
	})

	return chunks
}
