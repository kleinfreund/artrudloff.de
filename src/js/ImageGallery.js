class ImageGallery extends HTMLElement {
	static {
		if (window.customElements.get('image-gallery') === undefined) {
			window.customElements.define('image-gallery', ImageGallery)
		}
	}

	get [Symbol.toStringTag]() {
		return 'ImageGallery'
	}

	/** @type {boolean} */ #hasLoadedHighResImages = false
	/** @type {HTMLElement} */ #scrollContainer
	/** @type {HTMLButtonElement} */ #openOverlayButton
	/** @type {HTMLButtonElement} */ #closeOverlayButton
	/** @type {HTMLButtonElement | null} */ #previousButton
	/** @type {HTMLButtonElement | null} */ #nextButton

	get #itemIndex() {
		return Math.round(this.#scrollContainer.scrollLeft / this.#scrollContainer.clientWidth)
	}

	get #isOverlayOpen() {
		return this.hasAttribute('data-is-overlay-open')
	}

	constructor() {
		super()

		this.removeAttribute('data-js-disabled')

		this.#scrollContainer = /** @type {HTMLElement} */ (this.querySelector('.ig-scroll-container'))
		this.#scrollContainer.addEventListener('scroll', this.#updateButtonDisabledState)
		this.#scrollContainer.addEventListener('scrollend', this.#updateButtonDisabledState)
		this.#scrollContainer.addEventListener('click', this.#toggleOverlay)

		this.#openOverlayButton = /** @type {HTMLButtonElement} */ (this.querySelector('.ig-open-overlay-button'))
		this.#openOverlayButton.addEventListener('click', this.#toggleOverlay)

		this.#closeOverlayButton = /** @type {HTMLButtonElement} */ (this.querySelector('.ig-close-overlay-button'))
		this.#closeOverlayButton.addEventListener('click', this.#toggleOverlay)

		this.#previousButton = /** @type {HTMLButtonElement | null} */ (this.querySelector('.ig-previous-button'))
		if (this.#previousButton instanceof HTMLButtonElement) {
			this.#previousButton.addEventListener('click', this.#goToPreviousItem)
		}

		this.#nextButton = /** @type {HTMLButtonElement | null} */ (this.querySelector('.ig-next-button'))
		if (this.#nextButton instanceof HTMLButtonElement) {
			this.#nextButton.addEventListener('click', this.#goToNextItem)
		}

		this.#updateButtonDisabledState()
	}

	#goToPreviousItem = () => {
		this.#goToItem(this.#itemIndex - 1)
	}

	#goToNextItem = () => {
		this.#goToItem(this.#itemIndex + 1)
	}

	/**
	 * @param {number} itemIndex
	 */
	#goToItem = (itemIndex) => {
		this.#scrollContainer.scrollLeft = itemIndex * this.#scrollContainer.clientWidth
		this.#updateButtonDisabledState()
	}

	#updateButtonDisabledState = () => {
		if (this.#previousButton instanceof HTMLButtonElement && this.#nextButton instanceof HTMLButtonElement) {
			this.#previousButton.disabled = this.#itemIndex <= 0
			this.#nextButton.disabled = this.#itemIndex >= this.#scrollContainer.children.length - 1
		}
	}

	#toggleOverlay = () => {
		// Retrieves the currently visible gallery item index **before** toggling the overlay mode which causes the scroll container to have different dimensions which would make that computation incorrect.
		const itemIndex = this.#itemIndex

		if (this.#isOverlayOpen) {
			this.#closeOverlay()
		} else {
			this.#openOverlay()
		}

		// Corrects the scroll position of the currently visible gallery item as the scroll container generally has different dimensions in overlay mode. That's why the correct index is determined **before** switching modes.
		window.setTimeout(() => {
			this.#goToItem(itemIndex)
		}, 0)
	}

	#openOverlay() {
		this.setAttribute('data-is-overlay-open', '')
		this.ownerDocument.body.style.setProperty('overflow', 'hidden')

		if (!this.#hasLoadedHighResImages) {
			this.#hasLoadedHighResImages = true

			for (const image of this.querySelectorAll('image[data-high-res-src]')) {
				image.setAttribute('src', /** @type {string} */(image.getAttribute('data-high-res-src')))
				image.removeAttribute('data-high-res-src')
			}
		}

		// Ensures that triggering the open overlay button doesn't also trigger the close button.
		window.setTimeout(() => {
			this.#closeOverlayButton.focus()
		}, 0)
	}

	#closeOverlay() {
		this.removeAttribute('data-is-overlay-open')
		this.ownerDocument.body.style.removeProperty('overflow')

		// Ensures that triggering the close overlay button doesn't also trigger the scroll container's click event listener.
		window.setTimeout(() => {
			this.#scrollContainer.focus()
		}, 0)
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	handleKeydownEvent(event) {
		if (event.code === 'Escape' && this.#isOverlayOpen) {
			this.#closeOverlay()
		}
	}
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The initial function will be called after the debounced
 * function stops being called for a certain number of milliseconds.
 *
 * @param {(...args: any) => any} initialFunction Initial function to debounce
 * @param {number} delay Time to wait for recurring bounces
 * @returns {(...args: any) => void} the debounced function.
 */
function debounce(initialFunction, delay) {
	// Store timeout ID outside the returned function.
	/** @type {number} */ let timeoutId

	return (/** @type {any[]} */ ...args) => {
		// If the debounced function was already invoked before, this will cancel
		// the earlier timeout; thus, its callback will not be invoked.
		window.clearTimeout(timeoutId)

		// Starts a new timer which will call the initial function after the
		// specified wait time unless the debounced function is called again.
		timeoutId = window.setTimeout(() => {
			initialFunction(...args)
		}, delay)
	}
}

document.addEventListener('keydown', function (event) {
	if (event.target instanceof Element) {
		const component = event.target.closest('image-gallery')

		if (component instanceof ImageGallery) {
			component.handleKeydownEvent(event)
		}
	}
})
