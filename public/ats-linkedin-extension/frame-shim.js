;(function () {
	const origins = location.ancestorOrigins
	if (window === window.top || !origins || !origins[0] || !origins[0].startsWith('chrome-extension://')) {
		return
	}
	Object.defineProperty(document, 'visibilityState', { get: () => 'visible' })
	Object.defineProperty(document, 'hidden', { get: () => false })
	window.requestAnimationFrame = (callback) => setTimeout(() => callback(performance.now()), 16)
	window.cancelAnimationFrame = (handle) => clearTimeout(handle)
	window.IntersectionObserver = class {
		constructor(callback) {
			this.callback = callback
		}
		observe(target) {
			setTimeout(() => {
				const rect = target.getBoundingClientRect()
				this.callback([{ target, isIntersecting: true, intersectionRatio: 1, boundingClientRect: rect, intersectionRect: rect, rootBounds: null, time: performance.now() }], this)
			}, 0)
		}
		unobserve() {}
		disconnect() {}
		takeRecords() {
			return []
		}
	}
})()
