document.querySelector('[data-site-nav]')
	?.addEventListener('click', function (event) {
		const button = /** @type {HTMLButtonElement} */ (event.currentTarget)
		const isPressed = button.getAttribute('aria-pressed') === 'true'

		button.setAttribute('aria-pressed', String(!isPressed))
	})
