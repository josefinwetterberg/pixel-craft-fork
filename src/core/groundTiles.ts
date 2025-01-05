import { Assets, Container, Sprite } from 'pixi.js'
import {
	getIsometricTilePositions,
	isContainerWithInView,
	loopTiles,
	TILE_HEIGHT,
	TILE_HEIGHT_HALF,
	TILE_WIDTH,
	TILE_WIDTH_HALF
} from './tiles'

export const GRASS_TEXTURE_TILE_COUNT = 3 // Ground texture contains 9 grass tiles so is is 3x bigger

export const drawGroundTiles = async (width: number, height: number) => {
	const grassTexture = await Assets.load('/game/ground/grass.png')

	return loopTiles(width, height, (row, col) => {
		const { xPosTile, yPosTile } = getIsometricTilePositions(
			row,
			col,
			TILE_WIDTH_HALF * GRASS_TEXTURE_TILE_COUNT,
			TILE_HEIGHT_HALF * GRASS_TEXTURE_TILE_COUNT
		)

		const sprite = Sprite.from(grassTexture)
		sprite.renderable = false // Deafult, will change in the tick function if it is with in view
		sprite.width = TILE_WIDTH * GRASS_TEXTURE_TILE_COUNT
		sprite.height = TILE_HEIGHT * GRASS_TEXTURE_TILE_COUNT
		sprite.x = xPosTile
		sprite.y = yPosTile

		return sprite
	})
}

export const setGroundRenderableForInView = (containers: Container[]) => {
	const paddingX = TILE_WIDTH * GRASS_TEXTURE_TILE_COUNT * 5
	const paddingY = TILE_HEIGHT * GRASS_TEXTURE_TILE_COUNT * 5
	const boundaries = {
		top: -paddingY,
		right: window.innerWidth + paddingX,
		bottom: window.innerHeight + paddingY,
		left: -paddingX
	}

	for (const container of containers) {
		console.log('first')
		container.renderable = isContainerWithInView(container, boundaries)
	}
}
