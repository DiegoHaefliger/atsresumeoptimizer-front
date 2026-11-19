(function (root) {
	const RENDER_WAIT_MS = 10000
	const RENDER_POLL_MS = 500
	const MIN_RENDERED_CHARS = 80
	const SCROLL_STEPS = 40
	const SCROLL_PATIENCE = 3
	const SCROLL_WAIT_MS = 600

	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

	async function waitForRender() {
		for (let waited = 0; waited <= RENDER_WAIT_MS; waited += RENDER_POLL_MS) {
			const main = document.querySelector('main')
			if (main && main.innerText.trim().length >= MIN_RENDERED_CHARS) {
				return true
			}
			await wait(RENDER_POLL_MS)
		}
		return false
	}

	async function scrollToEnd() {
		const scrollers = [document.scrollingElement, document.querySelector('main')].filter(Boolean)
		const size = () => scrollers.reduce((total, element) => total + element.scrollHeight, 0)
		let last = -1
		let unchanged = 0
		for (let step = 0; step < SCROLL_STEPS && unchanged < SCROLL_PATIENCE; step++) {
			scrollers.forEach((element) => element.scrollTo(0, element.scrollHeight))
			await wait(SCROLL_WAIT_MS)
			unchanged = size() === last ? unchanged + 1 : 0
			last = size()
		}
		scrollers.forEach((element) => element.scrollTo(0, 0))
	}

	async function read() {
		if (!(await waitForRender())) {
			return { rendered: false, result: null }
		}
		await scrollToEnd()
		return { rendered: true, result: root.atsExtract(document, root.location) }
	}

	root.atsPage = { read }
})(globalThis)
