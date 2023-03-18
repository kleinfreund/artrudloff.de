function initGallery() {
	document.addEventListener('keydown', handleKeyboardShortcut)
	window.customElements.define('image-gallery', ImageGallery)
}

/**
 * @param {KeyboardEvent} event
 */
function handleKeyboardShortcut(event) {
	if (event.target instanceof Element) {
		const component = /** @type {ImageGallery | null} */ (event.target.closest('.gallery'))

		if (component !== null) {
			component.triggerCommand(event)
		}
	}
}

class ImageGallery extends HTMLElement {
	/** @type {boolean} */ hasLoadedHighResImages = false

	/** @type {HTMLElement} */ scrollContainer
	/** @type {HTMLButtonElement} */ openOverlayButton
	/** @type {HTMLButtonElement} */ closeOverlayButton
	/** @type {HTMLButtonElement | null} */ prevButton
	/** @type {HTMLButtonElement | null} */ nextButton

	/** @type {Record<string, (event: KeyboardEvent) => void>} */ commands = {
		Escape: () => {
			if (this.classList.contains('gallery--is-overlay')) {
				this.closeOverlay()
			}
		},

		Enter: () => {
			if (!this.classList.contains('gallery--is-overlay') && this.scrollContainer === this.ownerDocument.activeElement) {
				this.scrollContainer.dispatchEvent(new Event('click'))
			}
		},
	}

	constructor() {
		super()

		this.scrollContainer = /** @type {HTMLElement} */ (this.querySelector('.gallery-scroll-container'))
		this.openOverlayButton = /** @type {HTMLButtonElement} */ (this.querySelector('.gallery-open-overlay-button'))
		this.closeOverlayButton = /** @type {HTMLButtonElement} */ (this.querySelector('.gallery-close-overlay-button'))
		this.prevButton = /** @type {HTMLButtonElement | null} */ (this.querySelector('.gallery-controls__prev-button'))
		this.nextButton = /** @type {HTMLButtonElement | null} */ (this.querySelector('.gallery-controls__next-button'))

		this.updateGalleryButtonDisabledState()
	}

	get [Symbol.toStringTag]() {
		return 'ImageGallery'
	}

	connectedCallback() {
		if (!this.isConnected) {
			return
		}

		const debouncedHandleScrollContainerScrollEvent = debounce(() => this.handleScrollContainerScroll, 50)
		this.scrollContainer.addEventListener('scroll', debouncedHandleScrollContainerScrollEvent)
		this.scrollContainer.addEventListener('click', this.handleScrollContainerClick)
		this.openOverlayButton.addEventListener('click', this.handleOpenOverlayButtonClick)
		this.closeOverlayButton.addEventListener('click', this.handleCloseOverlayButtonClick)
		this.prevButton?.addEventListener('click', this.handlePrevButtonClick)
		this.nextButton?.addEventListener('click', this.handleNextButtonClick)
	}

	handleScrollContainerScroll = () => {
		this.updateGalleryButtonDisabledState()
	}

	handleScrollContainerClick = () => {
		this.toggleOverlay()
	}

	handleOpenOverlayButtonClick = () => {
		this.toggleOverlay()
	}

	handleCloseOverlayButtonClick = () => {
		this.toggleOverlay()
	}

	handlePrevButtonClick = () => {
		this.goToImage(this.getGalleryItemIndex() - 1)
	}

	handleNextButtonClick = () => {
		this.goToImage(this.getGalleryItemIndex() + 1)
	}

	toggleOverlay() {
		// Retrieves the currently visible gallery item index **before** toggling the overlay mode which causes the scroll container to have different dimensions which would make that computation incorrect.
		const galleryItemIndex = this.getGalleryItemIndex()

		if (this.classList.contains('gallery--is-overlay')) {
			this.closeOverlay()
		} else {
			this.openOverlay()
		}

		// Corrects the scroll position of the currently visible gallery item as the scroll container generally has different dimensions in overlay mode. That's why the correct index is determined **before** switching modes.
		setTimeout(() => {
			this.goToImage(galleryItemIndex)
		}, 0)
	}

	openOverlay() {
		this.classList.add('gallery--is-overlay')
		this.ownerDocument.body.style.setProperty('overflow', 'hidden')

		if (!this.hasLoadedHighResImages) {
			this.hasLoadedHighResImages = true

			for (const image of this.querySelectorAll('[data-high-res-src]')) {
				image.setAttribute('src', /** @type {string} */(image.getAttribute('data-high-res-src')))
				image.removeAttribute('data-high-res-src')
			}
		}

		// Ensures that triggering the open overlay button doesn't also trigger the close button.
		setTimeout(() => {
			this.closeOverlayButton.focus()
		}, 0)
	}

	closeOverlay() {
		this.classList.remove('gallery--is-overlay')
		this.ownerDocument.body.style.removeProperty('overflow')

		// Ensures that triggering the close overlay button doesn't also trigger the scroll container's click event listener.
		setTimeout(() => {
			this.scrollContainer.focus()
		}, 0)
	}

	/**
	 * @param {number} galleryItemIndex
	 */
	goToImage(galleryItemIndex) {
		this.scrollContainer.scrollLeft = galleryItemIndex * this.scrollContainer.clientWidth
		this.updateGalleryButtonDisabledState()
	}

	updateGalleryButtonDisabledState() {
		if (!(this.prevButton instanceof HTMLButtonElement && this.nextButton instanceof HTMLButtonElement)) {
			return
		}

		const galleryItemIndex = this.getGalleryItemIndex()

		this.prevButton.disabled = galleryItemIndex <= 0
		this.nextButton.disabled = galleryItemIndex >= this.scrollContainer.children.length - 1
	}

	/**
	 * @returns {number}
	 */
	getGalleryItemIndex() {
		return Math.round(this.scrollContainer.scrollLeft / this.scrollContainer.clientWidth)
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	triggerCommand(event) {
		const command = this.commands[event.code]

		if (command) {
			command(event)
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
		clearTimeout(timeoutId)

		// Starts a new timer which will call the initial function after the
		// specified wait time unless the debounced function is called again.
		timeoutId = window.setTimeout(() => {
			initialFunction(...args)
		}, delay)
	}
}

initGallery()
