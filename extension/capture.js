import { CaptureError } from './capture-error.js'
import { emptyDraft, mergeCapture } from './merge.js'

export { CaptureError }

const DETAIL_PAGES = ['experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'publications', 'recommendations']
const PROFILE_URL = /^https:\/\/([a-z]+\.)?linkedin\.com\/in\/([^/?#]+)/
const LOGIN_PATH = /^\/(login|uas\/login|authwall|checkpoint)/
const PAGE_TIMEOUT_MS = 30000
const SETTLE_MS = 1500
const PAUSE_MS = 800

export function profileBase(url) {
	const match = PROFILE_URL.exec(url || '')
	return match ? `https://www.linkedin.com/in/${match[2]}/` : null
}

export function pagesToRead(base) {
	return [base, ...DETAIL_PAGES.map((page) => `${base}details/${page}/`)]
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function waitUntilLoaded(chromeApi, tabId) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			chromeApi.tabs.onUpdated.removeListener(listener)
			reject(new CaptureError('timeout', 'O LinkedIn demorou demais para abrir a página.'))
		}, PAGE_TIMEOUT_MS)
		function listener(updatedId, change) {
			if (updatedId === tabId && change.status === 'complete') {
				clearTimeout(timer)
				chromeApi.tabs.onUpdated.removeListener(listener)
				resolve()
			}
		}
		chromeApi.tabs.onUpdated.addListener(listener)
		chromeApi.tabs.get(tabId).then((tab) => listener(tabId, { status: tab.status }), () => {})
	})
}

export async function readPage(chromeApi, url, pause = sleep, { visible = false } = {}) {
	const tab = await chromeApi.tabs.create({ url, active: visible })
	try {
		await waitUntilLoaded(chromeApi, tab.id)
		const loaded = await chromeApi.tabs.get(tab.id)
		if (loaded.url && LOGIN_PATH.test(new URL(loaded.url).pathname)) {
			throw new CaptureError('login-required', 'Entre no LinkedIn neste navegador e tente de novo.')
		}
		await pause(SETTLE_MS)
		await chromeApi.scripting.executeScript({ target: { tabId: tab.id }, files: ['extract.js', 'page-reader.js'] })
		const [reading] = await chromeApi.scripting.executeScript({ target: { tabId: tab.id }, func: () => globalThis.atsPage.read() })
		if (!(reading && reading.result && reading.result.rendered)) {
			throw new CaptureError('not-rendered', 'A página não terminou de carregar em segundo plano.')
		}
		return reading.result.result
	} finally {
		await chromeApi.tabs.remove(tab.id).catch(() => {})
	}
}

export function adaptiveReader(frameReader) {
	let frameBroken = false
	return async (chromeApi, url, pause, options) => {
		if (frameReader && !frameBroken && !options?.visible) {
			try {
				const result = await frameReader.read(url)
				console.info('[ats-linkedin] iframe oculto', url)
				return result
			} catch (error) {
				frameBroken = true
				console.info('[ats-linkedin] iframe falhou, usando aba', url, error.code || error.message)
			}
		}
		console.info('[ats-linkedin] aba', url, options?.visible ? '(visível)' : '(fundo)')
		return readPage(chromeApi, url, pause, options)
	}
}

async function readWithFallback(read, chromeApi, url, pause) {
	try {
		return await read(chromeApi, url, pause)
	} catch (error) {
		if (error.code !== 'not-rendered') {
			throw error
		}
		return restoringActiveTab(chromeApi, () => read(chromeApi, url, pause, { visible: true }))
	}
}

async function restoringActiveTab(chromeApi, action) {
	const [previous] = await chromeApi.tabs.query({ active: true, lastFocusedWindow: true })
	try {
		return await action()
	} finally {
		if (previous) {
			await chromeApi.tabs.update(previous.id, { active: true }).catch(() => {})
		}
	}
}

export async function captureProfile({ chromeApi, profileUrl, onProgress = () => {}, pause = sleep, read = readPage }) {
	const base = profileBase(profileUrl)
	if (!base) {
		throw new CaptureError('no-profile', 'Não sei qual é o seu perfil. Abra-o no LinkedIn uma vez e tente de novo.')
	}
	const pages = pagesToRead(base)
	let draft = emptyDraft()
	for (const [index, url] of pages.entries()) {
		onProgress({ step: index + 1, total: pages.length })
		const isMainPage = index === 0
		try {
			const capture = await readWithFallback(read, chromeApi, url, pause)
			if (capture) {
				draft = mergeCapture(draft, capture)
			}
		} catch (error) {
			if (isMainPage || error.code === 'login-required') {
				throw error
			}
		}
		if (isMainPage && !draft.profile.headline) {
			throw new CaptureError('unreadable', 'Não consegui ler o seu perfil. Confira se o LinkedIn abriu normalmente.')
		}
		await pause(PAUSE_MS)
	}
	return draft
}
