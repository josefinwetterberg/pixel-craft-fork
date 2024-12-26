import { Sprite, Texture } from 'pixi.js'
import { getIsometricTilePositions, loopTiles, TILE_HEIGHT, TILE_WIDTH } from './tiles'

export const drawGroundTiles = (width: number, height: number, texture: Texture) => {
	return loopTiles(width, height, (row, col) => {
		const { xPosTile, yPosTile } = getIsometricTilePositions(row, col)

		const sprite = Sprite.from(texture)
		sprite.width = TILE_WIDTH
		sprite.height = TILE_HEIGHT
		sprite.x = xPosTile
		sprite.y = yPosTile

		return sprite
	})
}
