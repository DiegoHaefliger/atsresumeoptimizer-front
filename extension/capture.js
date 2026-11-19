import { emptyDraft, mergeCapture } from './merge.js'

const DETAIL_PAGES = ['experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'publications', 'recommendations']
const PROFILE_URL = /^https:\/\/([a-z]+\.)?linkedin\.com\/in\/([^/?#]+)/
const LOGIN_PATH = /^\/(login|uas\/login|authwall|checkpoint)/
const PAGE_TIMEOUT_MS = 30000
const SETTLE_MS = 1500
const PAUSE_MS = 800
const SCROLL_STEPS = 40
const SCROLL_PATIENCE = 3
const SCROLL_WAIT_MS = 600
const RENDER_WAIT_MS = 10000
const RENDER_POLL_MS = 500
const MIN_RENDERED_CHARS = 80

export class CaptureError extends Error {
	constructor(code, message) {
		super(message)
		this.code = code
	}
}

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

async function scrollToEnd(maxSteps, wait, patience) {
	const scrollers = [document.scrollingElement, document.querySelector('main')].filter(Boolean)
	const size = () => scrollers.reduce((total, element) => total + element.scrollHeight, 0)
	let last = -1
	let unchanged = 0
	for (let step = 0; step < maxSteps && unchanged < patience; step++) {
		scrollers.forEach((element) => element.scrollTo(0, element.scrollHeight))
		await new Promise((resolve) => setTimeout(resolve, wait))
		unchanged = size() === last ? unchanged + 1 : 0
		last = size()
	}
	scrollers.forEach((element) => element.scrollTo(0, 0))
}

async function waitForRender(maxWait, poll, minChars) {
	for (let waited = 0; waited <= maxWait; waited += poll) {
		const main = document.querySelector('main')
		if (main && main.innerText.trim().length >= minChars) {
			return true
		}
		await new Promise((resolve) => setTimeout(resolve, poll))
	}
	return false
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
		const [rendering] = await chromeApi.scripting.executeScript({
			target: { tabId: tab.id },
			func: waitForRender,
			args: [RENDER_WAIT_MS, RENDER_POLL_MS, MIN_RENDERED_CHARS],
		})
		if (!(rendering && rendering.result)) {
			throw new CaptureError('not-rendered', 'A página não terminou de carregar em segundo plano.')
		}
		await chromeApi.scripting.executeScript({ target: { tabId: tab.id }, func: scrollToEnd, args: [SCROLL_STEPS, SCROLL_WAIT_MS, SCROLL_PATIENCE] })
		const [injection] = await chromeApi.scripting.executeScript({ target: { tabId: tab.id }, files: ['extract.js'] })
		return injection && injection.result
	} finally {
		await chromeApi.tabs.remove(tab.id).catch(() => {})
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
