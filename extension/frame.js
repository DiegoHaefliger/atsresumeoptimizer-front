import { CaptureError } from './capture-error.js'

const RULE_ID = 1
const START_TIMEOUT_MS = 12000
const READ_TIMEOUT_MS = 70000
const STRIPPED_HEADERS = ['x-frame-options', 'content-security-policy']

function frameRule(extensionId) {
	return {
		id: RULE_ID,
		priority: 1,
		action: { type: 'modifyHeaders', responseHeaders: STRIPPED_HEADERS.map((header) => ({ header, operation: 'remove' })) },
		condition: { urlFilter: '||linkedin.com/in/', resourceTypes: ['sub_frame'], initiatorDomains: [extensionId] },
	}
}

export class FrameReader {
	constructor(chromeApi) {
		this.chrome = chromeApi
		this.pending = null
	}

	async prepare() {
		const { chrome } = this
		await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [RULE_ID], addRules: [frameRule(chrome.runtime.id)] })
		const existing = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] })
		if (existing.length === 0) {
			await chrome.offscreen.createDocument({
				url: 'offscreen.html',
				reasons: ['IFRAME_SCRIPTING'],
				justification: 'Ler as páginas do próprio perfil do LinkedIn sem abrir abas.',
			})
		}
	}

	async dispose() {
		const { chrome } = this
		await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [RULE_ID] }).catch(() => {})
		await chrome.offscreen.closeDocument().catch(() => {})
	}

	handleMessage(message, sender) {
		const pending = this.pending
		if (!pending || sender.tab || !message.path || message.path !== pending.path) {
			return
		}
		if (message.type === 'frame-started') {
			pending.started = true
		} else if (message.type === 'frame-read') {
			pending.resolve(message.reading)
		}
	}

	async read(url) {
		const path = new URL(url).pathname
		const result = await new Promise((resolve, reject) => {
			const pending = { path, started: false, resolve }
			this.pending = pending
			const startTimer = setTimeout(() => !pending.started && reject(new CaptureError('frame-blocked', 'A página não abriu em segundo plano.')), START_TIMEOUT_MS)
			const readTimer = setTimeout(() => reject(new CaptureError('timeout', 'A leitura em segundo plano demorou demais.')), READ_TIMEOUT_MS)
			pending.clear = () => {
				clearTimeout(startTimer)
				clearTimeout(readTimer)
			}
			this.chrome.runtime.sendMessage({ target: 'offscreen', type: 'open', url }).catch(reject)
		}).finally(() => {
			this.pending?.clear()
			this.pending = null
			this.chrome.runtime.sendMessage({ target: 'offscreen', type: 'close' }).catch(() => {})
		})
		if (!result.rendered) {
			throw new CaptureError('not-rendered', 'A página não terminou de carregar em segundo plano.')
		}
		return result.result
	}
}
