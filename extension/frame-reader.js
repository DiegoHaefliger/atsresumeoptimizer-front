(function () {
	const origins = location.ancestorOrigins
	if (window === window.top || !origins || origins[0] !== `chrome-extension://${chrome.runtime.id}`) {
		return
	}
	const path = location.pathname
	chrome.runtime.sendMessage({ type: 'frame-started', path })
	globalThis.atsPage
		.read()
		.catch(() => ({ rendered: false, result: null }))
		.then((reading) => chrome.runtime.sendMessage({ type: 'frame-read', path, reading }))
})()
