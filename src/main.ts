import { Application, Container } from 'pixi.js'
import {
	centerContainerPositionToWindow,
	drawGroundTiles,
	handleCameraWheelZoom,
	handlePointerMove,
	handlePointerDown,
	handlePointerUp,
	TILE_COUNT,
	updateCameraMomentum,
	handleCameraPinchZoom
} from './core'
import { hasWindowResized } from './lib/utils'

const init = async () => {
	const app = new Application()
	await app.init({ resizeTo: window, backgroundColor: '#141414' })
	document.body.appendChild(app.canvas)
	// @ts-ignore
	globalThis.__PIXI_APP__ = app

	const gameWorld = new Container({ isRenderGroup: true, eventMode: 'static' })
	gameWorld.on('pointerdown', (ev) => handlePointerDown(ev))
	// event on window since a "pointerup" event can trigger if the pointer is out of the initial "pointerdown" container
	window.addEventListener('pointerup', (ev) => handlePointerUp(ev))
	gameWorld.on('pointermove', (ev) => handlePointerMove(ev, gameWorld))
	gameWorld.on('touchmove', (ev) => handleCameraPinchZoom(ev, gameWorld))
	gameWorld.on('wheel', (ev) => handleCameraWheelZoom(ev, gameWorld))

	app.stage.addChild(gameWorld)

	const ground = new Container({ children: await drawGroundTiles(TILE_COUNT, TILE_COUNT) })
	centerContainerPositionToWindow(ground)
	gameWorld.addChild(ground)

	app.ticker.add(() => {
		if (hasWindowResized()) {
			centerContainerPositionToWindow(ground)
		}

		// Only runs when there is a direction diff > 0
		updateCameraMomentum(gameWorld)
	})
}

window.addEventListener('DOMContentLoaded', init)
