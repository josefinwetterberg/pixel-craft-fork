import { Container } from 'pixi.js'
import { PerlinNoise } from '../../types'

export const loadPerlinImage = async (path: string): Promise<HTMLImageElement> => {
	const image = new Image()
	image.src = path
	return new Promise((resolve, reject) => {
		image.onload = () => resolve(image)
		image.onerror = () => reject(new Error(`Failed to load image from ${path}`))
	})
}

export const getPerlinNoise = (image: HTMLImageElement): PerlinNoise | undefined => {
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')
	if (!ctx) return

	const { width, height } = image

	canvas.width = width
	canvas.height = height

	ctx.drawImage(image, 0, 0)

	const imageData = ctx.getImageData(0, 0, width, height)
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
		const areaPadding = 2

		const isWithInXAxis = x >= globalTilePos.x - areaPadding && x <= globalTilePos.x + areaPadding
		const isWithInYAxis = y >= globalTilePos.y - areaPadding && y <= globalTilePos.y + areaPadding

		if (isWithInXAxis && isWithInYAxis) {
			return true
		}
	}

	return false
}
