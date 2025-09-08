import { Application, Container, Culler, Rectangle } from 'pixi.js'
import {
	chunkCreationList,
	createChunk,
	setInitalTiles,
	setNewChunksToRender,
	setRenderDistance,
	updateVisibleChunks
} from './core/tiles'
import { loadAllinitialAssets } from './core/assets'
import {
	createPlayer,
	isPlayerMoving,
	isPlayerStopping,
	movePlayerPosition,
	putPlayerInChunk,
	registerPlayerMovement,
	removePlayerMovement,
	setPlayerAnimation
} from './core/player'
import { handleWindowResize } from './lib/utils/window'

let view = new Rectangle(0, 0, window.innerWidth, window.innerHeight)

const init = async () => {
	const app = new Application()
	await app.init({
		resizeTo: window,
		antialias: false,
		background: '#4a80ff'
	})
	document.body.appendChild(app.canvas)
	// @ts-ignore
	globalThis.__PIXI_APP__ = app

	setRenderDistance()
	await loadAllinitialAssets()

	const world = new Container({
		isRenderGroup: true,
		eventMode: 'static',
		label: 'world'
	})

	app.stage.addChild(world)

	const surface = new Container({ label: 'surface' })

	const ground = new Container({ label: 'ground' })
	setInitalTiles(world, ground, surface)
	world.addChild(ground, surface)

	const player = createPlayer(world)
	putPlayerInChunk(player)
	window.addEventListener('keydown', (ev) => registerPlayerMovement(ev.key))
	window.addEventListener('keyup', (ev) => removePlayerMovement(ev.key))

	function addInformation() {
		const informationDiv = document.createElement('div')
		informationDiv.textContent =
			"To move around use the keys 'W', 'A', 'S', 'D'. Have fun exploring!"
		informationDiv.style.position = 'absolute'
		informationDiv.style.top = '10px'
		informationDiv.style.left = '10px'
		informationDiv.style.backgroundColor = 'white'
		informationDiv.style.padding = '10px 30px 10px 10px'
		informationDiv.style.borderRadius = '5px'
		informationDiv.style.fontFamily = 'Arial, sans-serif'
		informationDiv.style.zIndex = '1000'
		informationDiv.style.maxWidth = '370px'

		const closeButton = document.createElement('span')
		closeButton.textContent = 'x'
		closeButton.style.position = 'absolute'
		closeButton.style.top = '5px'
		closeButton.style.right = '10px'
		closeButton.style.cursor = 'pointer'
		closeButton.style.fontWeight = 'bold'
		closeButton.style.fontSize = '18px'
		closeButton.style.color = '#333'

		closeButton.addEventListener('click', () => {
			informationDiv.remove()
		})

		informationDiv.appendChild(closeButton)

		document.body.appendChild(informationDiv)
	}

	addInformation()

	app.ticker.add((ticker) => {
		if (isPlayerMoving()) {
			movePlayerPosition(player, world, ticker)
			setNewChunksToRender(world)

			if (chunkCreationList.length > 0) {
				createChunk(chunkCreationList[0])
			}

			updateVisibleChunks(world, ground, surface)
		} else if (isPlayerStopping()) {
			setPlayerAnimation(player, null, 0)
		}

		Culler.shared.cull(world, view)
	})

	window.addEventListener('resize', () => {
		handleWindowResize(world, ground, surface)

		view = new Rectangle(0, 0, window.innerWidth, window.innerHeight)
	})
}

window.addEventListener('DOMContentLoaded', init)
