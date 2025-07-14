import { Container, Sprite, Ticker } from 'pixi.js'
import { ASSETS } from './assets'
import {
	getIsometricTilePositions,
	screenToIsoPos,
	TILE_HEIGHT_HALF,
	TILE_WIDTH_HALF
} from './tiles'

export const PLAYER_WIDTH = 32
export const PLAYER_HEIGHT = 64
export const PLAYER_SPEED = 8

const allowedKeys = ['w', 'a', 's', 'd']
const playerMovementKeys = new Set<string>([])

const getVerticleDirection = (verticle: string) => {
	return verticle === 'w' ? 'up' : 'down'
}

const getHorizontalDirection = (horizontal: string) => {
	return horizontal === 'a' ? 'left' : 'right'
}

const getPlayerAnimationKey = (keys: Set<string>) => {
	// We only want to use the first and second key that is active if a users has three keys active we ignore it
	if (keys.size > 2 || keys.size === 0) return

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
		if (vertical) return `still-${vertical}-center`
		if (horizontal) return `still-${horizontal}-${horizontal}`
	}

	// In the format of the spritesheet naming the verticle direction always comes first
	if (vertical && horizontal) {
		return `still-${vertical}-${horizontal}`
	}
}

const centerPlayerToCenterTile = () => {
	const xPos = window.innerWidth / 2
	const yPos = window.innerHeight / 2
	const { x, y } = screenToIsoPos(xPos, yPos)

	const { yPosTile, xPosTile } = getIsometricTilePositions(y, x, TILE_WIDTH_HALF, TILE_HEIGHT_HALF)

	return {
		x: xPosTile - PLAYER_WIDTH / 2,
		y: yPosTile + PLAYER_HEIGHT / 2
	}
}

export const createPlayer = () => {
	const { x, y } = centerPlayerToCenterTile()
	const texture = ASSETS.PLAYER.animations['still-down-center'][0]

	const player = Sprite.from(texture)
	player.anchor.set(0, 1) // Left Bottom
	player.label = 'player'
	player.x = x
	player.y = y
	player.width = PLAYER_WIDTH
	player.height = PLAYER_HEIGHT

	return player
}

export const registerPlayerMovement = (ev: KeyboardEvent, player: Sprite) => {
	const { key } = ev

	if (allowedKeys.includes(key) && !playerMovementKeys.has(key)) {
		playerMovementKeys.add(key)
		const animationKey = getPlayerAnimationKey(playerMovementKeys)
		if (animationKey) {
			player.texture = ASSETS.PLAYER.animations[animationKey][0]
		}
	}
}

export const removePlayerMovement = (ev: KeyboardEvent, player: Sprite) => {
	const { key } = ev

	if (allowedKeys.includes(key) && playerMovementKeys.has(key)) {
		playerMovementKeys.delete(key)
		const animationKey = getPlayerAnimationKey(playerMovementKeys)
		if (animationKey) {
			player.texture = ASSETS.PLAYER.animations[animationKey][0]
		}
	}
}

export const isPlayerMoving = () => {
	return playerMovementKeys.size !== 0
}

export const movePlayerPosition = (player: Sprite, world: Container, ticker: Ticker) => {
	// We invert the momvent on the player to keep in in the center

	const distance = ticker.deltaTime * PLAYER_SPEED

	if (playerMovementKeys.has('w')) {
		world.y += distance
		player.y -= distance
	}

	if (playerMovementKeys.has('a')) {
		world.x += distance * 2
		player.x -= distance * 2
	}

	if (playerMovementKeys.has('s')) {
		world.y -= distance
		player.y += distance
	}

	if (playerMovementKeys.has('d')) {
		world.x -= distance * 2
		player.x += distance * 2
	}
}
