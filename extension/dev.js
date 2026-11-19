const LOG_KEY = 'debugLog'
const LOG_LIMIT = 300
const RELOAD_DELAY_MS = 150

export function createDevTools(chromeApi) {
	async function isDevelopmentInstall() {
		try {
			return (await chromeApi.management.getSelf()).installType === 'development'
		} catch {
			return false
		}
	}

	async function log(entry) {
		if (!(await isDevelopmentInstall())) {
			return
		}
		const stored = await chromeApi.storage.local.get(LOG_KEY)
		const entries = [...(stored[LOG_KEY] || []), { at: new Date().toISOString(), ...entry }]
		await chromeApi.storage.local.set({ [LOG_KEY]: entries.slice(-LOG_LIMIT) })
	}

	async function handle(message) {
		if (!(await isDevelopmentInstall())) {
			return { error: 'not-a-development-install' }
		}
		if (message.action === 'reload') {
			setTimeout(() => chromeApi.runtime.reload(), RELOAD_DELAY_MS)
			return { ok: true }
		}
		if (message.action === 'set') {
			await chromeApi.storage.local.set(message.payload || {})
			return { ok: true }
		}
		if (message.action === 'get') {
			return { value: await chromeApi.storage.local.get(message.payload || null) }
		}
		if (message.action === 'clear-log') {
			await chromeApi.storage.local.remove(LOG_KEY)
			return { ok: true }
		}
		return { error: 'unknown-action' }
	}

	return { log, handle }
}
