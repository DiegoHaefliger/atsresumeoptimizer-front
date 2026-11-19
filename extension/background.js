import { adaptiveReader, captureProfile, CaptureError, profileBase } from './capture.js'
import { createDevTools } from './dev.js'
import { FrameReader } from './frame.js'
import { sendSnapshot } from './api.js'

const DEFAULT_SERVER = 'http://localhost:8080'
const PORT_NAME = 'ats-capture'

async function openProfileUrl() {
	const tabs = await chrome.tabs.query({ url: 'https://*.linkedin.com/in/*' })
	const found = tabs.map((tab) => profileBase(tab.url)).find(Boolean)
	return found || null
}

const dev = createDevTools(chrome)
const frameReader = new FrameReader(chrome, dev.log)

async function startFrameReader() {
	const { hiddenFrames } = await chrome.storage.local.get('hiddenFrames')
	if (hiddenFrames === false) {
		return null
	}
	try {
		await frameReader.prepare()
		return frameReader
	} catch {
		await frameReader.dispose()
		return null
	}
}

chrome.runtime.onMessage.addListener((message, sender) => frameReader.handleMessage(message, sender))

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type !== 'dev') {
		return false
	}
	dev.handle(message).then(sendResponse)
	return true
})

async function run(request, onProgress) {
	const stored = await chrome.storage.local.get(['serverUrl', 'lastProfileUrl'])
	const serverUrl = stored.serverUrl || DEFAULT_SERVER
	const profileUrl = request.profileUrl || stored.lastProfileUrl || (await openProfileUrl())
	dev.log({ event: 'capture-start', profileUrl })
	const activeFrameReader = await startFrameReader()
	let draft
	try {
		draft = await captureProfile({
			chromeApi: chrome,
			profileUrl,
			read: adaptiveReader(activeFrameReader, dev.log),
			onProgress,
		})
	} finally {
		await activeFrameReader?.dispose()
	}
	const snapshot = await sendSnapshot({ serverUrl, draft })
	await chrome.storage.local.set({ lastProfileUrl: draft.profile.profileUrl })
	return snapshot
}

let activeCapture = null

function broadcast(message) {
	for (const port of activeCapture.ports) {
		try {
			port.postMessage(message)
		} catch {
			activeCapture.ports.delete(port)
		}
	}
}

async function capture(port, request) {
	if (activeCapture) {
		activeCapture.ports.add(port)
		return
	}
	activeCapture = { ports: new Set([port]) }
	try {
		const snapshot = await run(request, (progress) => broadcast({ type: 'progress', ...progress }))
		broadcast({ type: 'result', snapshot })
	} catch (error) {
		broadcast({ type: 'error', code: error instanceof CaptureError ? error.code : 'failed', message: error.message })
	} finally {
		activeCapture = null
	}
}

chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== PORT_NAME) {
		return
	}
	port.onMessage.addListener((request) => {
		if (request.type !== 'capture') {
			return
		}
		void capture(port, request)
	})
})

chrome.runtime.onInstalled.addListener(async () => {
	const tabs = await chrome.tabs.query({ url: ['http://localhost/*', 'http://127.0.0.1/*'] })
	for (const tab of tabs) {
		chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['bridge.js'] }).catch(() => {})
	}
})
