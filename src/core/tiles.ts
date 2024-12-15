import { Graphics } from 'pixi.js'

export const TILE_WIDTH = 128
export const TILE_WIDTH_HALF = TILE_WIDTH / 2
export const TILE_HEIGHT = 64
export const TILE_HEIGHT_HALF = TILE_HEIGHT / 2
export const TILE_COUNT = 128

export const drawTiles = (width: number, height: number) => {
	const tiles: Graphics[] = []

	for (let row = 0 - height / 2; row < height / 2; row++) {
		for (let col = 0 - width / 2; col < width / 2; col++) {
			tiles.push(drawTile(row, col))
		}
	}

	return tiles
}

const drawTile = (row: number, col: number) => {
	const xPosTile = (col - row) * TILE_WIDTH_HALF
	const yPosTile = (col + row) * TILE_HEIGHT_HALF

	const tile = new Graphics()

	tile.moveTo(xPosTile + TILE_WIDTH_HALF, yPosTile) // Top point
	tile.lineTo(xPosTile + TILE_WIDTH, yPosTile + TILE_HEIGHT_HALF) // Right point
	tile.lineTo(xPosTile + TILE_WIDTH_HALF, yPosTile + TILE_HEIGHT) // Bottom point
	tile.lineTo(xPosTile, yPosTile + TILE_HEIGHT_HALF) // Left point
	tile.lineTo(xPosTile + TILE_WIDTH_HALF, yPosTile) // Back to top

	tile.stroke('red')

	return tile
}
