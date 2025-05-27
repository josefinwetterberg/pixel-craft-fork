import { Container, Sprite } from 'pixi.js'
import {
	getGlobalPositionFromNoneStagedTile,
	getIsometricTilePositions,
	isContainerWithInView,
	loopTiles,
	TILE_HEIGHT,
	TILE_HEIGHT_HALF,
	TILE_WIDTH,
	TILE_WIDTH_HALF
} from './tiles'
import { getPerlinNoiseWithinViewport, hasPerlinPosTile } from '../lib/utils/perlinNoise'
import { ASSETS, PERLIN } from './assets'

export const PERLIN_GROUND_WATER_THRESHOLD = 0.3
export const WATER_LEVEL = TILE_HEIGHT - 15 // TODO: Replace 15 with an animated value to reprecent water level changing

// On inital draw there is no ground there fore ground is optional
export const drawGroundTiles = (world: Container, ground?: Container): Sprite[] => {
	const perlin = getPerlinNoiseWithinViewport(PERLIN.PERLIN_GROUND_MAP, world)

	const width = perlin?.width || 0
	const height = perlin?.height || 0

	// We want all the tiles on the positive side of the parent containers axis,
	// so it geat easier to visualies what should happen when moving the parent container.
	// This is only nessasary for x axis since all tiles on y is draw on y+ alredy
	const maxXOffset = -(width - 1) * TILE_WIDTH_HALF

	const tiles = loopTiles(width, height, (row, col) => {
		const { xPosTile, yPosTile } = getIsometricTilePositions(
			row,
			col,
			TILE_WIDTH_HALF,
			TILE_HEIGHT_HALF
		)

		const isTileWater = perlin?.map && perlin?.map[row][col] < PERLIN_GROUND_WATER_THRESHOLD
		const spriteTileHegight = isTileWater ? TILE_HEIGHT : TILE_HEIGHT * 2 // 2x height since it is a block with dirt below the grass
		const x = xPosTile - maxXOffset
		const y = isTileWater ? yPosTile + WATER_LEVEL : yPosTile

		const texture = isTileWater ? ASSETS.WATER_BLOCK_TEXTURE : ASSETS.GROUND_BLOCK_TEXTURE
		const sprite = Sprite.from(texture)
		sprite.width = TILE_WIDTH
		sprite.height = spriteTileHegight
		sprite.x = x
		sprite.y = y

		return sprite
	})

	return tiles.filter((tile) => {
		if (ground) {
			const globalPos = getGlobalPositionFromNoneStagedTile(ground, tile.x, tile.y)
			const isInView = isContainerWithInView(globalPos.x, globalPos.y, tile.width, tile.height)
			const hasRenderedTile = hasPerlinPosTile(ground, globalPos.x, globalPos.y)

			if (!isInView || (isInView && hasRenderedTile)) {
				return false
			}
		}

		return tile
	})
}

// export const setGroundRenderableForInView = (containers: Container[]) => {
// 	// TODO: Select a larger area of tiles to check not all containers
// 	// And for faster movement get a larger area to the direction the camera is moving
// 	const EXTRA_TILES = 5
// 	const paddingX = TILE_WIDTH * GRASS_TEXTURE_TILE_COUNT * EXTRA_TILES
// 	const paddingY = TILE_HEIGHT * GRASS_TEXTURE_TILE_COUNT * EXTRA_TILES
// 	const boundaries = {
// 		top: -paddingY,
// 		right: window.innerWidth + paddingX,
// 		bottom: window.innerHeight + paddingY,
// 		left: -paddingX
// 	}

// 	for (const container of containers) {
// 		container.renderable = isContainerWithInView(container, boundaries)
// 	}
// }

export const isGroundWithInBorder = (ground: Container) => {
	return {
		y2: true,
		y1: true,
		x2: true,
		x1: true
	}

	// const { x, y } = ground.getGlobalPosition()
	// const { border } = viewport

	// const halfWindowHeight = window.innerHeight / 2
	// const halfWindowWidth = window.innerWidth / 2
	// const halfGroundHeight = ground.height / 2
	// const halfGroundWidth = ground.width / 2

	// const xScale = x + halfGroundWidth
	// const yScale = y + halfGroundHeight

	// return {
	// 	y2: yScale - halfWindowHeight > border.y1, // Bottom
	// 	y1: yScale + halfWindowHeight < border.y2, // Top
	// 	x2: xScale - halfWindowWidth > border.x1, // Right
	// 	x1: xScale + halfWindowWidth < border.x2 // Left
	// }
}
