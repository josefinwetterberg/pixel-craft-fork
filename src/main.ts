import { Application, Container, Graphics } from 'pixi.js'
import { hasWindowResized } from './lib/utils'
import {
	handlePointerDown,
	handlePointerMove,
	handlePointerUp,
	hasCameraMovement,
	setCameraBorder,
	updateCameraMomentum,
	viewport
} from './core/cameraControls'
import { drawGroundTiles } from './core/groundTiles'
import {
	centerContainerPositionToWindow,
	removeTilesOutOfView,
	setInitalPrevRenderPos
} from './core/tiles'
import { loadAllinitialAssets } from './core/assets'

const init = async () => {
	const app = new Application()
	await app.init({
		resizeTo: window,
		antialias: false
	})
	document.body.appendChild(app.canvas)
	// @ts-ignore
	globalThis.__PIXI_APP__ = app

	await loadAllinitialAssets()

	const world = new Container({
		isRenderGroup: true,
		eventMode: 'static',
		label: 'world'
	})
	world.on('pointerdown', (ev) => handlePointerDown(ev))
	window.addEventListener('pointerup', (ev) => handlePointerUp(ev))
	world.on('pointermove', (ev) => handlePointerMove(ev, ground, world))

	app.stage.addChild(world)

	let ground = new Container({
		children: drawGroundTiles(world),
		label: 'ground'
	})
	centerContainerPositionToWindow(ground)
	setInitalPrevRenderPos(ground)
	removeTilesOutOfView(ground)

	world.addChild(ground)

	const worldBord = new Graphics()
		.rect(
			viewport.renderBorder.x,
			viewport.renderBorder.y,
			viewport.renderBorder.width,
			viewport.renderBorder.height
		)
		.stroke(0x00ff00)
	app.stage.addChild(worldBord)

	setCameraBorder(ground)

	app.ticker.add(() => {
		if (hasWindowResized()) {
			centerContainerPositionToWindow(ground)
		}

		if (hasCameraMovement()) {
			removeTilesOutOfView(ground)

			const newGroundTiles = drawGroundTiles(world, ground)
			if (newGroundTiles.length > 0) {
				ground.addChild(...newGroundTiles)
			}
		}

		// Only runs when there is a direction diff > 0
		updateCameraMomentum(world, ground)
	})
}

window.addEventListener('DOMContentLoaded', init)
