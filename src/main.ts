import { Application, Container, Culler, Rectangle } from 'pixi.js'
import { updateVisibleChunks } from './core/tiles'
import { loadAllinitialAssets } from './core/assets'
import {
	createPlayer,
	isPlayerMoving,
	movePlayerPosition,
	registerPlayerMovement,
	removePlayerMovement
} from './core/player'

const init = async () => {
	const app = new Application()
	await app.init({
		resizeTo: window,
		antialias: false
	})
	document.body.appendChild(app.canvas)
	// @ts-ignore
	globalThis.__PIXI_APP__ = app
	app.ticker.maxFPS = 60

	const view = new Rectangle(0, 0, window.innerWidth, window.innerHeight)

	await loadAllinitialAssets()

	const world = new Container({
		isRenderGroup: true,
		eventMode: 'static',
		label: 'world'
	})

	app.stage.addChild(world)

	const ground = new Container({ label: 'ground' })
	updateVisibleChunks(world, ground)
	world.addChild(ground)

	const player = createPlayer()
	world.addChild(player)
	window.addEventListener('keydown', registerPlayerMovement)
	window.addEventListener('keyup', removePlayerMovement)

	app.ticker.add((ticker) => {
		movePlayerPosition(player, world, ticker)

		if (isPlayerMoving()) {
			updateVisibleChunks(world, ground)
		}

		Culler.shared.cull(world, view)
	})
}

window.addEventListener('DOMContentLoaded', init)
