import { SECTION_LABELS, capturedSections, emptyDraft, mergeCapture, missingSections } from './merge.js'
import { sendSnapshot } from './api.js'

const DEFAULT_SERVER = 'http://localhost:8080'
const elements = {
	capture: document.getElementById('capture'),
	send: document.getElementById('send'),
	reset: document.getElementById('reset'),
	sections: document.getElementById('sections'),
	status: document.getElementById('status'),
	serverUrl: document.getElementById('serverUrl'),
}

async function load() {
	const stored = await chrome.storage.local.get(['draft', 'serverUrl'])
	elements.serverUrl.value = stored.serverUrl || DEFAULT_SERVER
	return stored.draft || emptyDraft()
}

function say(message, isError = false) {
	elements.status.textContent = message
	elements.status.className = isError ? 'error' : ''
}

function render(draft) {
	elements.sections.replaceChildren()
	for (const [keys, className] of [[capturedSections(draft), 'ok'], [missingSections(draft), '']]) {
		for (const key of keys) {
			const item = document.createElement('li')
			item.textContent = (className ? '✓ ' : '') + SECTION_LABELS[key]
			item.className = className
			elements.sections.append(item)
		}
	}
	elements.send.disabled = capturedSections(draft).length === 0
}

async function save(draft) {
	await chrome.storage.local.set({ draft })
	render(draft)
}

async function readCurrentPage() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
	if (!tab || !/^https:\/\/([a-z]+\.)?linkedin\.com\/in\//.test(tab.url || '')) {
		throw new Error('Abra o seu perfil em linkedin.com/in/... e tente de novo.')
	}
	const [injection] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['extract.js'] })
	if (!injection || !injection.result) {
		throw new Error('Não consegui ler esta página.')
	}
	return injection.result
}

let draft = emptyDraft()

elements.capture.addEventListener('click', async () => {
	try {
		const capture = await readCurrentPage()
		draft = mergeCapture(draft, capture)
		await save(draft)
		say(capture.found.length ? 'Página lida. Role a página até o fim para carregar todas as seções.' : 'Nenhuma seção reconhecida nesta página.')
	} catch (error) {
		say(error.message, true)
	}
})

elements.send.addEventListener('click', async () => {
	elements.send.disabled = true
	try {
		const serverUrl = elements.serverUrl.value.trim()
		await sendSnapshot({ serverUrl, draft })
		await chrome.storage.local.set({ serverUrl })
		draft = emptyDraft()
		await save(draft)
		say('Perfil enviado. Abra o app para ver a análise.')
	} catch (error) {
		say(error.message, true)
		render(draft)
	}
})

elements.reset.addEventListener('click', async () => {
	draft = emptyDraft()
	await save(draft)
	say('')
})

draft = await load()
render(draft)
