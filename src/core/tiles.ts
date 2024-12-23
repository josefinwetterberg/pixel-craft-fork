import { Sprite, Texture } from 'pixi.js'
import { TileCallback } from '../types'

export const TILE_WIDTH = 128
export const TILE_WIDTH_HALF = TILE_WIDTH / 2
export const TILE_HEIGHT = 64
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2
export const TILE_COUNT = 16

export const loopTiles = <T>(width: number, height: number, callback: TileCallback<T>): T[] => {
	const results: T[] = []

	for (let row = 0 - height / 2; row < height / 2; row++) {
		for (let col = 0 - width / 2; col < width / 2; col++) {
			results.push(callback(row, col))
		}
	}

	return results
}

const getIsometricTilePositions = (row: number, col: number) => {
	const xPosTile = (col - row) * TILE_WIDTH_HALF
	const yPosTile = (col + row) * TILE_HEIGHT_HALF

	return { xPosTile, yPosTile }
}

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
