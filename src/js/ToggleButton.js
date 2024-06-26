class ToggleButton extends HTMLElement {
	static {
		if (window.customElements.get('toggle-button') === undefined) {
			window.customElements.define('toggle-button', ToggleButton)
		}
	}

	get [Symbol.toStringTag]() {
		return 'ToggleButton'
	}

	constructor() {
		super()

		this.setAttribute('data-js', 'true')

		const button = /** @type {HTMLButtonElement} */ (this.querySelector('[data-toggle-button]'))
		button.addEventListener('click', () => {
			const isPressed = button.getAttribute('aria-pressed') === 'true'
			button.setAttribute('aria-pressed', String(!isPressed))
		})
	}
}
