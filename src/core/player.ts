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
export const PLAYER_SPEED = 4

const allowedKeys = ['w', 'a', 's', 'd']
const playerMovementKeys = new Set<string>()

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

	const player = Sprite.from(ASSETS.CHARACTER_BOB)
	player.anchor.set(0, 1) // Left Bottom
	player.label = 'player'
	player.x = x
	player.y = y
	player.width = PLAYER_WIDTH
	player.height = PLAYER_HEIGHT

	return player
}

export const registerPlayerMovement = (ev: KeyboardEvent) => {
	const { key } = ev

	if (allowedKeys.includes(key) && !playerMovementKeys.has(key)) {
		playerMovementKeys.add(key)
	}
}

export const removePlayerMovement = (ev: KeyboardEvent) => {
	const { key } = ev

	if (allowedKeys.includes(key) && playerMovementKeys.has(key)) {
		playerMovementKeys.delete(key)
	}
}

export const isPlayerMoving = () => {
	return playerMovementKeys.size !== 0
}

export const movePlayerPosition = (player: Container, world: Container, ticker: Ticker) => {
	if (!isPlayerMoving()) return

	// We invert the momvent on the player to keep in in the center
	// We multiple distnace with 2 on x axis since the tiles are 2x width then height

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
