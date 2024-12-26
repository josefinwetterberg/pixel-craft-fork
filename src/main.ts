import { Application, Assets, Container } from 'pixi.js'
import { centerContainerPositionToWindow, drawGroundTiles, TILE_COUNT } from './core'
import { hasWindowResized } from './lib/utils'

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
