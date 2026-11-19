import { describe, expect, it, vi } from 'vitest'
import { FrameReader } from './frame.js'

function fakeChrome() {
	return {
		runtime: { id: 'ext-id', sendMessage: vi.fn().mockResolvedValue(undefined), getContexts: vi.fn().mockResolvedValue([]) },
		declarativeNetRequest: { updateSessionRules: vi.fn().mockResolvedValue() },
		offscreen: { createDocument: vi.fn().mockResolvedValue(), closeDocument: vi.fn().mockResolvedValue() },
	}
}

const URL_SKILLS = 'https://www.linkedin.com/in/ana/details/skills/'
const PATH_SKILLS = '/in/ana/details/skills/'

describe('FrameReader', () => {
	it('strips the framing headers only for sub frames started by the extension and opens the offscreen document', async () => {
		const chrome = fakeChrome()

		await new FrameReader(chrome).prepare()

		const [{ addRules }] = chrome.declarativeNetRequest.updateSessionRules.mock.calls[0]
		expect(addRules[0].condition).toMatchObject({ resourceTypes: ['sub_frame'], initiatorDomains: ['ext-id'] })
		expect(addRules[0].action.responseHeaders.map((header) => header.header)).toEqual(['x-frame-options', 'content-security-policy'])
		expect(chrome.offscreen.createDocument).toHaveBeenCalledWith(expect.objectContaining({ reasons: ['IFRAME_SCRIPTING'] }))
	})

	it('does not create a second offscreen document', async () => {
		const chrome = fakeChrome()
		chrome.runtime.getContexts.mockResolvedValue([{}])

		await new FrameReader(chrome).prepare()

		expect(chrome.offscreen.createDocument).not.toHaveBeenCalled()
	})

	it('resolves with the extraction the framed page reports', async () => {
		const chrome = fakeChrome()
		const reader = new FrameReader(chrome)

		const reading = reader.read(URL_SKILLS)
		await Promise.resolve()
		reader.handleMessage({ type: 'frame-started', path: PATH_SKILLS }, {})
		reader.handleMessage({ type: 'frame-read', path: PATH_SKILLS, reading: { rendered: true, result: { page: 'details:skills' } } }, {})

		await expect(reading).resolves.toEqual({ page: 'details:skills' })
		expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ target: 'offscreen', type: 'open', url: URL_SKILLS })
		expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ target: 'offscreen', type: 'close' })
	})

	it('ignores messages from real tabs and from other pages', async () => {
		const reader = new FrameReader(fakeChrome())

		const reading = reader.read(URL_SKILLS)
		await Promise.resolve()
		reader.handleMessage({ type: 'frame-read', path: PATH_SKILLS, reading: { rendered: true, result: { page: 'tab' } } }, { tab: { id: 1 } })
		reader.handleMessage({ type: 'frame-read', path: '/in/ana/details/other/', reading: { rendered: true, result: { page: 'other' } } }, {})
		reader.handleMessage({ type: 'frame-read', path: PATH_SKILLS, reading: { rendered: true, result: { page: 'ok' } } }, {})

		await expect(reading).resolves.toEqual({ page: 'ok' })
	})

	it('reports a page that did not render', async () => {
		const reader = new FrameReader(fakeChrome())

		const reading = reader.read(URL_SKILLS)
		await Promise.resolve()
		reader.handleMessage({ type: 'frame-read', path: PATH_SKILLS, reading: { rendered: false, result: null } }, {})

		await expect(reading).rejects.toMatchObject({ code: 'not-rendered' })
	})

	it('fails fast with frame-blocked when the page never starts in the frame', async () => {
		vi.useFakeTimers()
		const reader = new FrameReader(fakeChrome())

		const reading = reader.read(URL_SKILLS)
		const assertion = expect(reading).rejects.toMatchObject({ code: 'frame-blocked' })
		await vi.advanceTimersByTimeAsync(12500)

		await assertion
		vi.useRealTimers()
	})
})
