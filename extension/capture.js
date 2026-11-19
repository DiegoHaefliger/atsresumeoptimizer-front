import { CaptureError } from './capture-error.js'
import { emptyDraft, hasValue, mergeCapture, SECTION_LABELS } from './merge.js'

export { CaptureError }

const DETAIL_PAGES = ['experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'publications', 'recommendations']
const SECTION_FIELD = { experience: 'experiences', education: 'educations', activity: 'recentActivity' }
const MAX_FRAME_FAILURES = 2
const CORE_SECTIONS = ['about', 'experience', 'education', 'skills']
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

export async function readPage(chromeApi, url, pause = sleep, { visible = true } = {}) {
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

export function adaptiveReader(frameReader, log = () => {}) {
	let failures = 0
	return async (chromeApi, url, pause, options) => {
		if (frameReader && failures < MAX_FRAME_FAILURES && !options?.visible) {
			try {
				const result = await frameReader.read(url)
				failures = 0
				log({ event: 'read', method: 'iframe', url })
				return result
			} catch (error) {
				failures += 1
				log({ event: 'iframe-failed', url, code: error.code, message: error.message })
			}
		}
		log({ event: 'read', method: 'tab', url })
		return readPage(chromeApi, url, pause, options)
	}
}

async function restoringActiveTab(chromeApi, action) {
	if (!chromeApi.tabs?.query) {
		return action()
	}
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
	return restoringActiveTab(chromeApi, () => readAllPages({ chromeApi, base, onProgress, pause, read }))
}

const fieldOf = (key) => SECTION_FIELD[key] || key

function seenButEmpty(draft, seen) {
	return seen.filter((key) => !hasValue(draft.profile[fieldOf(key)]))
}

async function readAllPages({ chromeApi, base, onProgress, pause, read }) {
	const pages = pagesToRead(base)
	let draft = emptyDraft()
	let seen = []
	for (const [index, url] of pages.entries()) {
		onProgress({ step: index + 1, total: pages.length, page: index === 0 ? 'profile' : DETAIL_PAGES[index - 1] })
		const isMainPage = index === 0
		try {
			const capture = await read(chromeApi, url, pause)
			if (capture) {
				draft = mergeCapture(draft, capture)
				seen = isMainPage ? capture.found || [] : seen
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
	draft = await rereadMissing({ chromeApi, base, pause, read, draft, seen, onProgress })
	draft = await rereadMissing({ chromeApi, base, pause, read, draft, seen, options: { visible: true }, onProgress })
	const missingCore = seenButEmpty(draft, seen).filter((key) => CORE_SECTIONS.includes(key))
	if (missingCore.length > 0) {
		const names = missingCore.map((key) => SECTION_LABELS[fieldOf(key)]).join(', ')
		throw new CaptureError('incomplete', `O LinkedIn não carregou: ${names}. Tente de novo.`)
	}
	return draft
}

async function rereadMissing({ chromeApi, base, pause, read, draft, seen, options, onProgress }) {
	let current = draft
	const missing = seenButEmpty(draft, seen)
	for (const key of missing) {
		onProgress({ step: DETAIL_PAGES.length + 1, total: DETAIL_PAGES.length + 1, page: 'recheck' })
		const url = DETAIL_PAGES.includes(key) ? `${base}details/${key}/` : base
		try {
			const capture = await read(chromeApi, url, pause, options)
			if (capture) {
				current = mergeCapture(current, capture)
			}
		} catch (error) {
			if (error.code === 'login-required') {
				throw error
			}
		}
		await pause(PAUSE_MS)
	}
	return current
}
