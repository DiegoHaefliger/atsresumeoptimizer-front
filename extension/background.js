import { adaptiveReader, captureProfile, CaptureError, profileBase } from './capture.js'
import { FrameReader } from './frame.js'
import { sendSnapshot } from './api.js'

const DEFAULT_SERVER = 'http://localhost:8080'
const PORT_NAME = 'ats-capture'

async function openProfileUrl() {
	const tabs = await chrome.tabs.query({ url: 'https://*.linkedin.com/in/*' })
	const found = tabs.map((tab) => profileBase(tab.url)).find(Boolean)
	return found || null
}

const frameReader = new FrameReader(chrome)

async function startFrameReader() {
	try {
		await frameReader.prepare()
		return frameReader
	} catch {
		await frameReader.dispose()
		return null
	}
}

chrome.runtime.onMessage.addListener((message, sender) => frameReader.handleMessage(message, sender))

async function run(port, request) {
	const stored = await chrome.storage.local.get(['serverUrl', 'lastProfileUrl'])
	const serverUrl = stored.serverUrl || DEFAULT_SERVER
	const profileUrl = request.profileUrl || stored.lastProfileUrl || (await openProfileUrl())
	const activeFrameReader = await startFrameReader()
	let draft
	try {
		draft = await captureProfile({
			chromeApi: chrome,
			profileUrl,
			read: adaptiveReader(activeFrameReader),
			onProgress: (progress) => port.postMessage({ type: 'progress', ...progress }),
		})
	} finally {
		await activeFrameReader?.dispose()
	}
	const snapshot = await sendSnapshot({ serverUrl, draft })
	await chrome.storage.local.set({ lastProfileUrl: draft.profile.profileUrl })
	port.postMessage({ type: 'result', snapshot })
}

chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== PORT_NAME) {
		return
	}
	port.onMessage.addListener((request) => {
		if (request.type !== 'capture') {
			return
		}
		run(port, request).catch((error) => {
			const code = error instanceof CaptureError ? error.code : 'failed'
			port.postMessage({ type: 'error', code, message: error.message })
		})
	})
})

chrome.runtime.onInstalled.addListener(async () => {
	const tabs = await chrome.tabs.query({ url: ['http://localhost/*', 'http://127.0.0.1/*'] })
	for (const tab of tabs) {
		chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['bridge.js'] }).catch(() => {})
	}
})
