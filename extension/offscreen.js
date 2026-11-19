chrome.runtime.onMessage.addListener((message) => {
	if (message.target !== 'offscreen') {
		return
	}
	document.querySelectorAll('iframe').forEach((frame) => frame.remove())
	if (message.type === 'open') {
		const frame = document.createElement('iframe')
		frame.width = '1280'
		frame.height = '1600'
		frame.src = message.url
		document.body.append(frame)
	}
})
