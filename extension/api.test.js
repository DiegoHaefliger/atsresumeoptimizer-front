import { describe, expect, it, vi } from 'vitest'
import { fetchPairingToken, sendSnapshot } from './api.js'

const draft = { profile: { headline: 'Dev' }, photoUrl: 'https://media.licdn.com/p', bannerUrl: null }

describe('sendSnapshot', () => {
	it('posts the profile and the downloaded photo with the pairing token', async () => {
		const download = vi.fn().mockResolvedValue({ base64: 'AQID', mimeType: 'image/jpeg' })
		const doFetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'abc' }) })
			.mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1' }) })

		const result = await sendSnapshot({ serverUrl: 'http://localhost:8080/', draft }, download, doFetch)

		expect(doFetch.mock.calls[0][0]).toBe('http://localhost:8080/api/v1/linkedin/pairing-token')
		const [url, init] = doFetch.mock.calls[1]
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
		const doFetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'x' }) })
			.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: 'Token de pareamento ausente ou inválido.' }) })

		await expect(sendSnapshot({ serverUrl: 'http://localhost:8080', draft }, async () => null, doFetch)).rejects.toThrow(
			'Token de pareamento ausente ou inválido.',
		)
	})

	it('explains when the app cannot be reached for the token', async () => {
		const doFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

		await expect(fetchPairingToken('http://localhost:8080', doFetch)).rejects.toThrow('Não consegui falar com o app')
	})
})
