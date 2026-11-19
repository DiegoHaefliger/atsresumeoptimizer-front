(function () {
	const PORT_NAME = 'ats-capture'
	const APP = 'ats-app'
	const EXTENSION = 'ats-extension'

	function reply(message) {
		window.postMessage({ source: EXTENSION, ...message }, window.location.origin)
	}

	function capture(request) {
		if (!chrome.runtime || !chrome.runtime.id) {
			return
		}
		let port
		try {
			port = chrome.runtime.connect({ name: PORT_NAME })
		} catch (error) {
			reply({ id: request.id, type: 'error', code: 'extension-reloaded', message: 'Recarregue a página do app e tente de novo.' })
			return
		}
		port.onMessage.addListener((message) => {
			reply({ id: request.id, ...message })
			if (message.type === 'result' || message.type === 'error') {
				port.disconnect()
			}
		})
		port.onDisconnect.addListener(() => reply({ id: request.id, type: 'disconnected' }))
		port.postMessage({ type: 'capture', profileUrl: request.profileUrl || null })
	}

	window.addEventListener('message', (event) => {
		const message = event.data
		if (event.source !== window || !message || message.source !== APP) {
			return
		}
		if (message.type === 'ping') {
			reply({ id: message.id, type: 'pong', version: chrome.runtime.getManifest().version })
		} else if (message.type === 'capture') {
			capture(message)
		} else if (message.type === 'dev') {
			chrome.runtime
				.sendMessage({ type: 'dev', action: message.action, payload: message.payload })
				.then((result) => reply({ id: message.id, type: 'dev-result', result }))
				.catch((error) => reply({ id: message.id, type: 'dev-result', result: { error: String(error) } }))
		}
	})
	reply({ type: 'ready' })
})()
