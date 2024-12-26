const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}

// To run in the canvas ticker funciton on every frame if the window has resized
export const hasWindowResized = () => {
	const { innerHeight, innerWidth } = window

	if (innerWidth !== sizes.width || innerHeight !== sizes.height) {
		sizes.width = innerWidth
		sizes.height = innerHeight
		return true
	}

	return false
}
