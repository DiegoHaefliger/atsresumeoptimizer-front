import { describe, expect, it, vi } from 'vitest'
import { createDevTools } from './dev.js'

function fakeChrome(installType) {
	const store = {}
	return {
		store,
		management: { getSelf: vi.fn().mockResolvedValue({ installType }) },
		storage: {
			local: {
				get: vi.fn(async (key) => (typeof key === 'string' ? { [key]: store[key] } : { ...store })),
				set: vi.fn(async (values) => Object.assign(store, values)),
				remove: vi.fn(async (key) => delete store[key]),
			},
		},
		runtime: { reload: vi.fn() },
	}
}

describe('dev tools', () => {
	it('refuses everything on a store install', async () => {
		const chrome = fakeChrome('normal')
		const dev = createDevTools(chrome)

		await dev.log({ event: 'x' })

		expect(await dev.handle({ action: 'reload' })).toEqual({ error: 'not-a-development-install' })
		expect(chrome.runtime.reload).not.toHaveBeenCalled()
		expect(chrome.storage.local.set).not.toHaveBeenCalled()
	})

	it('logs, sets options and reads them back on an unpacked install', async () => {
		const chrome = fakeChrome('development')
		const dev = createDevTools(chrome)

		await dev.log({ event: 'capture-start' })
		await dev.handle({ action: 'set', payload: { hiddenFrames: true } })
		const stored = await dev.handle({ action: 'get', payload: null })

		expect(stored.value.hiddenFrames).toBe(true)
		expect(stored.value.debugLog[0]).toMatchObject({ event: 'capture-start' })
	})

	it('reloads the extension only on an unpacked install', async () => {
		vi.useFakeTimers()
		const chrome = fakeChrome('development')

		await createDevTools(chrome).handle({ action: 'reload' })
		await vi.advanceTimersByTimeAsync(200)

		expect(chrome.runtime.reload).toHaveBeenCalledTimes(1)
		vi.useRealTimers()
	})
})
