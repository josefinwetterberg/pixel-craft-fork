import { Container } from 'pixi.js'
import { TILE_HEIGHT, TILE_WIDTH_HALF } from '../../core/tiles'

export const loadPerlinImage = async (path: string): Promise<HTMLImageElement> => {
	const image = new Image()
	image.src = path
	return new Promise((resolve, reject) => {
		image.onload = () => resolve(image)
		image.onerror = () => reject(new Error(`Failed to load image from ${path}`))
	})
}

const getPositionFromPerlinMap = (container: Container) => {
	const dimension = window.innerWidth

	const height = Math.ceil(dimension / TILE_HEIGHT)
	const width = Math.ceil(dimension / TILE_WIDTH_HALF)

	return {
		x: Math.abs(Math.ceil(container.x / TILE_HEIGHT)),
		y: Math.abs(Math.ceil(container.y / TILE_WIDTH_HALF)),
		width,
		height
	}
}

const canvas = document.getElementById('perlin') as HTMLCanvasElement
// const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })

export const getPerlinNoiseWithinViewport = (image: HTMLImageElement, container: Container) => {
	if (!ctx) return

	canvas.width = image.width
	canvas.height = image.height

	ctx.drawImage(image, 0, 0)

	const { x, y, width, height } = getPositionFromPerlinMap(container)
	const imageData = ctx.getImageData(x, y, width, height)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	canvas.width = 300
	canvas.height = 300
	ctx.putImageData(imageData, 0, 0)
	const pixels = imageData.data

	const values = []

	for (let y = 0; y < height; y++) {
		const row = []
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4 // We multiply by for since pixel is stored as R, G, B, A
			const r = pixels[i]
			const g = pixels[i + 1]
			const b = pixels[i + 2]

			const gray = (r + g + b) / 3 // Average the three colors to gray scale
			const value = gray / 255 // Normalize from 0-255 to 0-1

			row.push(value)
		}
		values.push(row)
	}

	return { map: values, width, height }
}

export const hasPerlinPosTile = (container: Container, x: number, y: number) => {
	for (const tile of container.children) {
		const globalTilePos = tile.getGlobalPosition()
		const areaPadding = 20

		const isWithInXAxis = x >= globalTilePos.x - areaPadding && x <= globalTilePos.x + areaPadding
		const isWithInYAxis = y >= globalTilePos.y - areaPadding && y <= globalTilePos.y + areaPadding

		if (isWithInXAxis && isWithInYAxis) {
			return true
		}
	}

	return false
}
