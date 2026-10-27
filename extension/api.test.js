import { describe, expect, it, vi } from 'vitest'
import { sendSnapshot } from './api.js'

const draft = { profile: { headline: 'Dev' }, photoUrl: 'https://media.licdn.com/p', bannerUrl: null }

describe('sendSnapshot', () => {
	it('posts the profile and the downloaded photo with the pairing token', async () => {
		const download = vi.fn().mockResolvedValue({ base64: 'AQID', mimeType: 'image/jpeg' })
		const doFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: '1' }) })

		const result = await sendSnapshot({ serverUrl: 'http://localhost:8080/', token: 'abc', draft }, download, doFetch)

		const [url, init] = doFetch.mock.calls[0]
		expect(url).toBe('http://localhost:8080/api/v1/linkedin/snapshots')
		expect(init.headers['X-Pairing-Token']).toBe('abc')
		expect(JSON.parse(init.body)).toEqual({
			profile: { headline: 'Dev' },
			photoBase64: 'AQID',
			photoMimeType: 'image/jpeg',
			bannerBase64: null,
			bannerMimeType: null,
		})
		expect(download).toHaveBeenCalledTimes(1)
		expect(result).toEqual({ id: '1' })
	})

	it('surfaces the server message when the app refuses the snapshot', async () => {
		const doFetch = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ detail: 'Token de pareamento ausente ou inválido.' }) })

		await expect(sendSnapshot({ serverUrl: 'http://localhost:8080', token: 'x', draft }, async () => null, doFetch)).rejects.toThrow(
			'Token de pareamento ausente ou inválido.',
		)
	})
})
