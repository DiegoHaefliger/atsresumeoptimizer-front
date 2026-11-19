(function (root) {
	const POLL_MS = 500
	const RENDER_WAIT_MS = 10000
	const MIN_RENDERED_CHARS = 80
	const STABLE_POLLS = 4
	const STABLE_WAIT_MS = 10000
	const SCROLL_STEPS = 40
	const SCROLL_PATIENCE = 3
	const SCROLL_WAIT_MS = 600
	const EMPTY_RETRIES = 3
	const EMPTY_RETRY_MS = 2500
	const EMPTY_SECTION = /nenhuma novidade por enquanto|nothing to see for now|nada que ver por ahora/i
	const IGNORED_FIELDS = ['profileUrl', 'customUrl']

	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

	function mainText() {
		const main = document.querySelector('main')
		return main ? (main.innerText ?? main.textContent ?? '').trim() : ''
	}

	async function waitForRender() {
		for (let waited = 0; waited <= RENDER_WAIT_MS; waited += POLL_MS) {
			if (mainText().length >= MIN_RENDERED_CHARS) {
				return true
			}
			await wait(POLL_MS)
		}
		return false
	}

	async function waitForStable() {
		let last = -1
		let same = 0
		for (let waited = 0; waited <= STABLE_WAIT_MS && same < STABLE_POLLS; waited += POLL_MS) {
			const length = mainText().length
			same = length === last ? same + 1 : 0
			last = length
			await wait(POLL_MS)
		}
	}

	async function scrollToEnd() {
		const scrollers = [document.scrollingElement, document.querySelector('main')].filter(Boolean)
		const size = () => scrollers.reduce((total, element) => total + element.scrollHeight, 0) + mainText().length
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

	function hasContent(result) {
		return Object.entries(result.profile).some(([key, value]) => !IGNORED_FIELDS.includes(key) && (Array.isArray(value) ? value.length > 0 : Boolean(value)))
	}

	async function extractWhenFilled() {
		const isDetailPage = /\/details\//.test(root.location.pathname)
		let result = root.atsExtract(document, root.location)
		for (let retry = 0; retry < EMPTY_RETRIES && isDetailPage && !hasContent(result) && !EMPTY_SECTION.test(mainText()); retry++) {
			await wait(EMPTY_RETRY_MS)
			await scrollToEnd()
			result = root.atsExtract(document, root.location)
		}
		return result
	}

	async function read() {
		if (!(await waitForRender())) {
			return { rendered: false, result: null }
		}
		await waitForStable()
		await scrollToEnd()
		await waitForStable()
		return { rendered: true, result: await extractWhenFilled() }
	}

	root.atsPage = { read }
})(globalThis)
