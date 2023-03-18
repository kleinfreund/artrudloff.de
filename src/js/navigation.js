function initNavigation() {
	const toggleNavButton = document.querySelector('.site-nav-toggle-button')

	toggleNavButton?.addEventListener('click', handleToggleNavButtonClickEvent)
}

/**
 * @param {Event} event
 */
function handleToggleNavButtonClickEvent(event) {
	const button = /** @type {HTMLButtonElement} */ (event.currentTarget)
	const isPressed = button.getAttribute('aria-pressed') === 'true'

	button.setAttribute('aria-pressed', String(!isPressed))
}

initNavigation()
