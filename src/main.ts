import { Application, Container } from 'pixi.js'
import {
	centerContainerPositionToWindow,
	drawGroundTiles,
	handlePointerMove,
	handlePointerDown,
	handlePointerUp,
	TILE_COUNT,
	updateCameraMomentum,
	shouldRecalculateRenderable,
	cloneGroundPosToViewport,
	setInitalPrevRenderPos,
	setGroundRenderableForInView,
	setCameraBorder
} from './core'
import { hasWindowResized } from './lib/utils'

const init = async () => {
	const app = new Application()
	await app.init({
		resizeTo: window,
		backgroundColor: '#141414',
		antialias: false
	})
	document.body.appendChild(app.canvas)
	// @ts-ignore
	globalThis.__PIXI_APP__ = app

	const gameWorld = new Container({ isRenderGroup: true, eventMode: 'static' })
	gameWorld.on('pointerdown', (ev) => handlePointerDown(ev))
	// event on window since a "pointerup" event can trigger if the pointer is out of the initial "pointerdown" container
	window.addEventListener('pointerup', (ev) => handlePointerUp(ev))
	gameWorld.on('pointermove', (ev) => handlePointerMove(ev, gameWorld, ground))

	app.stage.addChild(gameWorld)

	const ground = new Container({ children: await drawGroundTiles(TILE_COUNT, TILE_COUNT) })
	centerContainerPositionToWindow(ground)
	cloneGroundPosToViewport(ground)
	setInitalPrevRenderPos(ground)
	gameWorld.addChild(ground)

	setGroundRenderableForInView(ground.children)
	setCameraBorder(ground)

	app.ticker.add(() => {
		if (hasWindowResized()) {
			centerContainerPositionToWindow(ground)
			cloneGroundPosToViewport(ground)
		}

		if (shouldRecalculateRenderable(gameWorld.x, gameWorld.y, gameWorld.scale)) {
			setGroundRenderableForInView(ground.children)
		}

		// Only runs when there is a direction diff > 0
		updateCameraMomentum(gameWorld, ground)
	})
}

window.addEventListener('DOMContentLoaded', init)
