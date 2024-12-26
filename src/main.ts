import { Application, Assets, Container } from 'pixi.js'
import {
	centerContainerPositionToWindow,
	drawGroundTiles,
	handleMovement,
	setViewportMoveable,
	TILE_COUNT
} from './core'
import { hasWindowResized } from './lib/utils'

const init = async () => {
	const app = new Application()
	await app.init({ resizeTo: window, backgroundColor: '#141414' })
	document.body.appendChild(app.canvas)

	const gameWorld = new Container({ isRenderGroup: true, eventMode: 'static' })
	gameWorld.on('pointerdown', (ev) => setViewportMoveable(true, ev))
	// event on window since a "pointerup" event can trigger if the pointer is out of the initial "pointerdown" container
	window.addEventListener('pointerup', () => setViewportMoveable(false))
	gameWorld.on('pointermove', (ev) => handleMovement(ev, gameWorld))

	// const hud = new Container({ isRenderGroup: true })
	app.stage.addChild(gameWorld)

	/**
	 * Ground
	 */
	const grassTexture = await Assets.load('/game/ground/grass.png')
	const ground = new Container()
	ground.addChild(...drawGroundTiles(TILE_COUNT, TILE_COUNT, grassTexture))
	gameWorld.addChild(ground)
	centerContainerPositionToWindow(ground)

	app.ticker.add(() => {
		if (hasWindowResized()) {
			centerContainerPositionToWindow(ground)
		}
	})
}

window.addEventListener('DOMContentLoaded', init)
