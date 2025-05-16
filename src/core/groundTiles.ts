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
import { viewport } from './cameraControls'
import { getPerlinNoiseWithinViewport, loadPerlinImage } from '../lib/utils/perlinNoise'

export const GRASS_TEXTURE_TILE_COUNT = 1
export const GROUND_BLOCK_TEXTURE = '/game/ground/basic_block.png'
export const PERLIN_GROUND_MAP = '/game/perlin_world_02.png'
export const PERLIN_GROUND_WATER_THRESHOLD = 0.3

export const drawGroundTiles = async () => {
	const grassTexture = await Assets.load(GROUND_BLOCK_TEXTURE)

	const image = await loadPerlinImage(PERLIN_GROUND_MAP)
	const perlinMap = await getPerlinNoiseWithinViewport(image)

	const width = image.width
	const height = image.height

	// We want all the tiles on the positive side of the parent containers axis,
	// so it geat easier to visualies what should happen when moving the parent container.
	// This is only nessasary for x axis since all tiles on y is draw on y+ alredy
	const maxXOffset = -(width - 1) * (TILE_WIDTH_HALF * GRASS_TEXTURE_TILE_COUNT)

	return loopTiles(width, height, (row, col) => {
		if (perlinMap && perlinMap[row][col] < PERLIN_GROUND_WATER_THRESHOLD) {
			return null
		}

		const { xPosTile, yPosTile } = getIsometricTilePositions(
			row,
			col,
			TILE_WIDTH_HALF * GRASS_TEXTURE_TILE_COUNT,
			TILE_HEIGHT_HALF * GRASS_TEXTURE_TILE_COUNT
		)

		const sprite = Sprite.from(grassTexture)
		sprite.renderable = false // Deafult, will change in the tick function if it is with in view
		sprite.width = TILE_WIDTH * GRASS_TEXTURE_TILE_COUNT
		sprite.height = TILE_HEIGHT * 2 * GRASS_TEXTURE_TILE_COUNT // 2x height since it is a block with dirt below the grass
		sprite.x = xPosTile - maxXOffset
		sprite.y = yPosTile

		return sprite
	})
}

export const setGroundRenderableForInView = (containers: Container[]) => {
	// TODO: Select a larger area of tiles to check not all containers
	// And for faster movement get a larger area to the direction the camera is moving
	const EXTRA_TILES = 5
	const paddingX = TILE_WIDTH * GRASS_TEXTURE_TILE_COUNT * EXTRA_TILES
	const paddingY = TILE_HEIGHT * GRASS_TEXTURE_TILE_COUNT * EXTRA_TILES
	const boundaries = {
		top: -paddingY,
		right: window.innerWidth + paddingX,
		bottom: window.innerHeight + paddingY,
		left: -paddingX
	}

	for (const container of containers) {
		container.renderable = isContainerWithInView(container, boundaries)
	}
}

export const isGroundWithInBorder = (ground: Container, scale: number) => {
	return {
		x1: true,
		x2: true,
		y1: true,
		y2: true
	}

	const { x, y } = ground.getGlobalPosition()
	const { border } = viewport

	const halfWindowHeight = window.innerHeight / 2
	const halfWindowWidth = window.innerWidth / 2
	const halfGroundHeight = ground.height / 2
	const halfGroundWidth = ground.width / 2

	const xScale = x / scale + halfGroundWidth
	const yScale = y / scale + halfGroundHeight

	return {
		y2: yScale - halfWindowHeight > border.y1, // Bottom
		y1: yScale + halfWindowHeight < border.y2, // Top
		x2: xScale - halfWindowWidth > border.x1, // Right
		x1: xScale + halfWindowWidth < border.x2 // Left
	}
}
