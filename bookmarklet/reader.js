(function () {
	var APP = '__APP_ORIGIN__'
	var RECEIVER = 'ats-linkedin-receiver'
	var SCROLL_STEPS = 6
	var SCROLL_WAIT_MS = 600

	if (!/(^|\.)linkedin\.com$/.test(location.hostname) || !/^\/in\//.test(location.pathname)) {
		alert('Abra o seu perfil em linkedin.com/in/... e clique no favorito de novo.')
		return
	}
	var receiver = window.open('', RECEIVER)
	if (!receiver) {
		alert('O navegador bloqueou a janela do app. Permita pop-ups para o LinkedIn e clique de novo.')
		return
	}

	function scrollToEnd(done) {
		var step = 0
		var last = -1
		function tick() {
			window.scrollTo(0, document.body.scrollHeight)
			setTimeout(function () {
				var height = document.body.scrollHeight
				step += 1
				if (step >= SCROLL_STEPS || height === last) {
					window.scrollTo(0, 0)
					done()
				} else {
					last = height
					tick()
				}
			}, SCROLL_WAIT_MS)
		}
		tick()
	}

	scrollToEnd(function () {
		var capture = __EXTRACT__
		var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(capture))))
		receiver.location.href = APP + '/linkedin/receber#' + encoded
	})
})()
