import { Application, Container } from 'pixi.js'
import { drawTiles, TILE_COUNT, TILE_WIDTH, TILE_WIDTH_HALF } from './core'

const init = async () => {
	const app = new Application()
	await app.init({ resizeTo: window, backgroundColor: '#141414' })
	document.body.appendChild(app.canvas)

	const gameWorld = new Container({ isRenderGroup: true })
	// const hud = new Container({ isRenderGroup: true })
	app.stage.addChild(gameWorld)

	/**
	 * Ground
	 */
	const ground = new Container()
	const tiles = drawTiles(TILE_COUNT, TILE_COUNT)
	ground.addChild(...tiles)
	gameWorld.addChild(ground)
	ground.x = -TILE_WIDTH_HALF + window.innerWidth / 2
	ground.y = window.innerHeight / 2

	console.log({ gw: ground.width, w: TILE_WIDTH * TILE_COUNT, x: ground.x, y: ground.y })
}

window.addEventListener('DOMContentLoaded', init)
