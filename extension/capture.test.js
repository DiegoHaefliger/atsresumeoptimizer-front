import { describe, expect, it, vi } from 'vitest'
import { CaptureError, captureProfile, pagesToRead, profileBase, readPage } from './capture.js'

const noPause = () => Promise.resolve()

describe('profileBase', () => {
	it('normalizes any linkedin profile url to the www base with a trailing slash', () => {
		expect(profileBase('https://pt.linkedin.com/in/ana-souza/details/skills/?x=1')).toBe('https://www.linkedin.com/in/ana-souza/')
		expect(profileBase('https://www.linkedin.com/in/ana-souza')).toBe('https://www.linkedin.com/in/ana-souza/')
	})

	it('rejects anything that is not a member profile', () => {
		expect(profileBase('https://www.linkedin.com/feed/')).toBeNull()
		expect(profileBase('https://evil.example/in/ana/')).toBeNull()
		expect(profileBase(null)).toBeNull()
	})
})

describe('pagesToRead', () => {
	it('starts with the profile and then every details page', () => {
		const pages = pagesToRead('https://www.linkedin.com/in/ana/')

		expect(pages[0]).toBe('https://www.linkedin.com/in/ana/')
		expect(pages).toContain('https://www.linkedin.com/in/ana/details/skills/')
		expect(pages).toContain('https://www.linkedin.com/in/ana/details/experience/')
	})
})

describe('captureProfile', () => {
	const profileUrl = 'https://www.linkedin.com/in/ana/'

	it('merges what each page returns and reports progress', async () => {
		const read = vi.fn(async (_chrome, url) => {
			if (url.endsWith('/ana/')) {
				return { profile: { headline: 'Dev Java', profileUrl }, photoUrl: 'p', bannerUrl: null }
			}
			if (url.includes('skills')) {
				return { profile: { skills: ['Java', 'Spring'] }, photoUrl: null, bannerUrl: null }
			}
			return null
		})
		const onProgress = vi.fn()

		const draft = await captureProfile({ chromeApi: {}, profileUrl, onProgress, pause: noPause, read })

		expect(draft.profile.headline).toBe('Dev Java')
		expect(draft.profile.skills).toEqual(['Java', 'Spring'])
		expect(draft.photoUrl).toBe('p')
		expect(onProgress).toHaveBeenCalledTimes(read.mock.calls.length)
		expect(onProgress.mock.calls[0][0]).toEqual({ step: 1, total: read.mock.calls.length })
	})

	it('fails when the main page has no headline', async () => {
		const read = vi.fn(async () => ({ profile: {}, photoUrl: null, bannerUrl: null }))

		await expect(captureProfile({ chromeApi: {}, profileUrl, pause: noPause, read })).rejects.toMatchObject({ code: 'unreadable' })
		expect(read).toHaveBeenCalledTimes(1)
	})

	it('skips a details page that fails and keeps the rest', async () => {
		const read = vi.fn(async (_chrome, url) => {
			if (url.includes('projects')) {
				throw new CaptureError('timeout', 'lento')
			}
			return url.endsWith('/ana/') ? { profile: { headline: 'Dev' }, photoUrl: null, bannerUrl: null } : null
		})

		const draft = await captureProfile({ chromeApi: {}, profileUrl, pause: noPause, read })

		expect(draft.profile.headline).toBe('Dev')
	})

	it('retries a page that did not render in the background with a visible tab and restores the active one', async () => {
		const update = vi.fn(async () => {})
		const chromeApi = { tabs: { query: vi.fn(async () => [{ id: 7 }]), update } }
		const read = vi.fn(async (_chrome, url, _pause, options) => {
			if (url.endsWith('/ana/')) {
				return { profile: { headline: 'Dev' }, photoUrl: null, bannerUrl: null }
			}
			if (url.includes('skills')) {
				if (!options?.visible) {
					throw new CaptureError('not-rendered', 'fundo')
				}
				return { profile: { skills: ['Java'] }, photoUrl: null, bannerUrl: null }
			}
			return null
		})

		const draft = await captureProfile({ chromeApi, profileUrl, pause: noPause, read })

		expect(draft.profile.skills).toEqual(['Java'])
		expect(update).toHaveBeenCalledWith(7, { active: true })
	})

	it('stops as soon as the user is not logged in', async () => {
		const read = vi.fn(async () => {
			throw new CaptureError('login-required', 'Entre no LinkedIn')
		})

		await expect(captureProfile({ chromeApi: {}, profileUrl, pause: noPause, read })).rejects.toMatchObject({ code: 'login-required' })
	})

	it('refuses an unknown profile url without opening any tab', async () => {
		const read = vi.fn()

		await expect(captureProfile({ chromeApi: {}, profileUrl: null, pause: noPause, read })).rejects.toMatchObject({ code: 'no-profile' })
		expect(read).not.toHaveBeenCalled()
	})
})

describe('readPage', () => {
	function fakeChrome(finalUrl) {
		const remove = vi.fn().mockResolvedValue()
		return {
			remove,
			tabs: {
				create: vi.fn().mockResolvedValue({ id: 7 }),
				get: vi.fn().mockResolvedValue({ id: 7, status: 'complete', url: finalUrl }),
				remove,
				onUpdated: { addListener: vi.fn(), removeListener: vi.fn() },
			},
			scripting: { executeScript: vi.fn().mockResolvedValue([{ result: { page: 'profile', profile: { headline: 'Dev' } } }]) },
		}
	}

	it('reads the page in a background tab and closes it', async () => {
		const chromeApi = fakeChrome('https://www.linkedin.com/in/ana/')

		const result = await readPage(chromeApi, 'https://www.linkedin.com/in/ana/', noPause)

		expect(chromeApi.tabs.create).toHaveBeenCalledWith({ url: 'https://www.linkedin.com/in/ana/', active: false })
		expect(result.profile.headline).toBe('Dev')
		expect(chromeApi.remove).toHaveBeenCalledWith(7)
	})

	it('reports a login wall and still closes the tab', async () => {
		const chromeApi = fakeChrome('https://www.linkedin.com/authwall?trk=x')

		await expect(readPage(chromeApi, 'https://www.linkedin.com/in/ana/', noPause)).rejects.toMatchObject({ code: 'login-required' })
		expect(chromeApi.remove).toHaveBeenCalledWith(7)
	})
})
