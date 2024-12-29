import { Assets, Sprite } from 'pixi.js'
import { getIsometricTilePositions, loopTiles, TILE_HEIGHT, TILE_WIDTH } from './tiles'

export const drawGroundTiles = async (width: number, height: number) => {
	const grassTexture = await Assets.load('/game/ground/grass.png')

	return loopTiles(width, height, (row, col) => {
		const { xPosTile, yPosTile } = getIsometricTilePositions(row, col)

		const sprite = Sprite.from(grassTexture)
		sprite.width = TILE_WIDTH
		sprite.height = TILE_HEIGHT
		sprite.x = xPosTile
		sprite.y = yPosTile

		return sprite
	})
}
