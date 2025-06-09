import { Container } from 'pixi.js'

let prevWindowWidth = window.innerWidth
let prevWindowHeight = window.innerHeight

export const handleWindowResize = (world: Container) => {
	const widthDiff = window.innerWidth - prevWindowWidth
	const heightDiff = window.innerHeight - prevWindowHeight

	world.x += widthDiff / 2
	world.y += heightDiff / 2

	prevWindowWidth = window.innerWidth
	prevWindowHeight = window.innerHeight
}
