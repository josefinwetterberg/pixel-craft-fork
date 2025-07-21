import { Container, ContainerChild, Sprite, Ticker } from 'pixi.js'
import { ASSETS } from './assets'
import {
	getChunk,
	getChunkByGlobalPosition,
	getIsoCollisionSides,
	getIsometricTilePositions,
	isoPosToWorldPos,
	TILE_HEIGHT_HALF,
	TILE_WIDTH_HALF
} from './tiles'
import { Chunk } from '../types/tiles'
import { getVegetationFromGround } from './vegetation'

export const PLAYER_WIDTH = 32
export const PLAYER_HEIGHT = 64
export const PLAYER_SPEED = 3
const PLAYER_FRAME_LENGTH = 3

const allowedKeys = ['w', 'a', 's', 'd']
const playerMovementKeys = new Set<string>([])

let animationTimer = 0
let currentFrame = 0
let animationKey = 'down-center'
const animationSpeed = 0.1

const getVerticleDirection = (verticle: string) => {
	return verticle === 'w' ? 'up' : 'down'
}

const getHorizontalDirection = (horizontal: string) => {
	return horizontal === 'a' ? 'left' : 'right'
}

const getPlayerAnimationKey = (keys: Set<string>) => {
	// We only want to use the first and second key that is active if a users has three keys active we ignore it
	if (keys.size > 2 || keys.size === 0) return animationKey

	const verticalKeys = ['w', 's']
	const horizontalKeys = ['a', 'd']

	let vertical = ''
	let horizontal = ''

	for (const key of keys) {
		if (verticalKeys.includes(key)) {
			vertical = getVerticleDirection(key)
		} else if (horizontalKeys.includes(key)) {
			horizontal = getHorizontalDirection(key)
		}
	}

	// Handle 1 key
	if (keys.size === 1) {
		if (vertical) return `${vertical}-center`
		if (horizontal) return `${horizontal}-${horizontal}`
	}

	// In the format of the spritesheet naming the verticle direction always comes first
	if (vertical && horizontal) {
		return `${vertical}-${horizontal}`
	}

	return animationKey
}

const centerPlayerToCenterTile = () => {
	const xPos = window.innerWidth / 2
	const yPos = window.innerHeight / 2
	const { x, y } = isoPosToWorldPos(xPos, yPos)

	const { yPosTile, xPosTile } = getIsometricTilePositions(y, x, TILE_WIDTH_HALF, TILE_HEIGHT_HALF)

	return {
		x: xPosTile - PLAYER_WIDTH / 2,
		y: yPosTile + PLAYER_HEIGHT / 2
	}
}

export const createPlayer = () => {
	const { x, y } = centerPlayerToCenterTile()

	const player = new Sprite()
	player.anchor.set(0, 1) // Left Bottom
	player.label = 'player'
	player.x = x
	player.y = y
	player.width = PLAYER_WIDTH
	player.height = PLAYER_HEIGHT

	if (ASSETS.PLAYER) {
		player.texture = ASSETS.PLAYER.animations[animationKey][currentFrame]
	}

	return player
}

export const registerPlayerMovement = (key: string, player: Sprite) => {
	if (allowedKeys.includes(key) && !playerMovementKeys.has(key)) {
		playerMovementKeys.add(key)
		animationKey = getPlayerAnimationKey(playerMovementKeys)
		if (ASSETS.PLAYER) {
			player.texture = ASSETS.PLAYER.animations[animationKey][0]
			currentFrame = 0
		}
	}
}

export const removePlayerMovement = (key: string, player: Sprite) => {
	if (allowedKeys.includes(key) && playerMovementKeys.has(key)) {
		playerMovementKeys.delete(key)
		animationKey = getPlayerAnimationKey(playerMovementKeys)
		if (ASSETS.PLAYER) {
			player.texture = ASSETS.PLAYER.animations[animationKey][0]
			currentFrame = 0
		}
	}
}

export const isPlayerMoving = () => {
	return playerMovementKeys.size !== 0
}

const handlePlayeranimation = (player: Sprite) => {
	if (animationTimer >= animationSpeed && playerMovementKeys.size > 0) {
		animationTimer = 0
		currentFrame = (currentFrame + 1) % PLAYER_FRAME_LENGTH
		if (ASSETS.PLAYER) {
			player.texture = ASSETS.PLAYER.animations[animationKey][currentFrame]
		}
	}
}

const getAllActivePlayerTiles = (chunk: Chunk, player: Sprite) => {
	const ground = chunk.ground?.children ?? []
	const tiles: ContainerChild[] = []

	// We only want to check if the bottom of the player is in a tile since there is where the feet are
	for (const tile of ground) {
		const cx = tile.x + TILE_WIDTH_HALF
		const cy = tile.y + TILE_HEIGHT_HALF

		// The anchor is set to bottom left of the player there for we dont have to add ane width or height
		const dx = Math.abs(player.x - cx) / TILE_WIDTH_HALF
		const dy = Math.abs(player.y - cy) / TILE_HEIGHT_HALF

		const isInIsometricTile = dx + dy <= 1

		if (isInIsometricTile) {
			tiles.push(tile)
		}
	}

	return tiles
}

const handlePlayerBounds = (player: Sprite) => {
	let allowedDirection = [...allowedKeys]
	const { row, col } = getChunkByGlobalPosition(player.x, player.y)

	const currentChunk = getChunk(row, col)
	if (!currentChunk) return allowedDirection

	// Check player bounds on the ground tiles which has trees on the surface
	const currentTiles = getAllActivePlayerTiles(currentChunk, player)

	for (const tile of currentTiles) {
		if (getVegetationFromGround(currentChunk, tile.label)) {
			const collidedSides = getIsoCollisionSides(tile, player)

			if (collidedSides['top-left']) {
				allowedDirection = ['w', 'a']
				break
			}
			if (collidedSides['top-right']) {
				allowedDirection = ['w', 'd']
				break
			}
			if (collidedSides['bottom-left']) {
				allowedDirection = ['s', 'a']
				break
			}
			if (collidedSides['bottom-right']) {
				allowedDirection = ['s', 'd']
				break
			}
			if (collidedSides['top']) {
				allowedDirection = ['w', 'a', 'd']
				break
			}
			if (collidedSides['bottom']) {
				allowedDirection = ['s', 'a', 'd']
				break
			}
		}
	}

	return allowedDirection
}

export const movePlayerPosition = (player: Sprite, world: Container, ticker: Ticker) => {
	// We invert the momvent on the player to keep in in the center

	const allowedDirection = handlePlayerBounds(player)
	const distance = ticker.deltaTime * PLAYER_SPEED

	if (playerMovementKeys.has('w') && allowedDirection.includes('w')) {
		world.y += distance
		player.y -= distance
	}

	if (playerMovementKeys.has('a') && allowedDirection.includes('a')) {
		world.x += distance * 2
		player.x -= distance * 2
	}

	if (playerMovementKeys.has('s') && allowedDirection.includes('s')) {
		world.y -= distance
		player.y += distance
	}

	if (playerMovementKeys.has('d') && allowedDirection.includes('d')) {
		world.x -= distance * 2
		player.x += distance * 2
	}

	animationTimer += ticker.deltaTime / 60
	handlePlayeranimation(player)
}
