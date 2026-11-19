import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const source = readFileSync(resolve(__dirname, 'page-reader.js'), 'utf8')

function load(pathname, extractResults) {
	const root = { location: { pathname }, atsExtract: vi.fn() }
	extractResults.forEach((result) => root.atsExtract.mockReturnValueOnce(result))
	new Function('globalThis', source)(root)
	return root
}

async function finish(promise) {
	await vi.runAllTimersAsync()
	return promise
}

beforeEach(() => {
	vi.useFakeTimers()
	Element.prototype.scrollTo = () => {}
})
afterEach(() => {
	vi.useRealTimers()
	document.body.innerHTML = ''
})

const FILLED = { profile: { profileUrl: 'u', skills: ['Java'] } }
const EMPTY = { profile: { profileUrl: 'u', skills: [] } }
const LONG_TEXT = 'Competências Todos Conhecimento do setor Ferramentas e tecnologias Competências interpessoais Outras'

describe('page reader', () => {
	it('reports a page that never rendered', async () => {
		document.body.innerHTML = '<main>curto</main>'
		const root = load('/in/ana/', [])

		const reading = await finish(root.atsPage.read())

		expect(reading).toEqual({ rendered: false, result: null })
	})

	it('extracts again when a details page was read before its list loaded', async () => {
		document.body.innerHTML = `<main>${LONG_TEXT}</main>`
		const root = load('/in/ana/details/skills/', [EMPTY, FILLED])

		const reading = await finish(root.atsPage.read())

		expect(reading.result).toEqual(FILLED)
		expect(root.atsExtract).toHaveBeenCalledTimes(2)
	})

	it('does not keep retrying on a page that is really empty', async () => {
		document.body.innerHTML = `<main>Publicações Nenhuma novidade por enquanto. Quando você adicionar novas publicações, elas serão exibidas aqui.</main>`
		const root = load('/in/ana/details/publications/', [EMPTY])

		const reading = await finish(root.atsPage.read())

		expect(reading.result).toEqual(EMPTY)
		expect(root.atsExtract).toHaveBeenCalledTimes(1)
	})

	it('extracts the main page once', async () => {
		document.body.innerHTML = `<main>${LONG_TEXT}</main>`
		const root = load('/in/ana/', [EMPTY])

		await finish(root.atsPage.read())

		expect(root.atsExtract).toHaveBeenCalledTimes(1)
	})
})
