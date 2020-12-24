(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.remove("js-disabled");

    for (const gallery of document.querySelectorAll('.gallery')) {
      initGallery(gallery)
    }
  });
})();

/**
 * @param {Element} gallery
 */
function initGallery(gallery) {
  const scrollContainer = gallery.querySelector('.gallery-scroll-container')
  const toggleOverlayButtons = gallery.querySelectorAll('.gallery-toggle-overlay-button')
  const closeButton = gallery.querySelector('.gallery-close-overlay-button')
  const prevButton = gallery.querySelector('.gallery-controls__prev-button')
  const nextButton = gallery.querySelector('.gallery-controls__next-button')

  if (scrollContainer instanceof HTMLElement) {
    for (const toggleOverlayButton of toggleOverlayButtons) {
      toggleOverlayButton.addEventListener('click', function () {
        toggleOverlay(gallery, scrollContainer, prevButton, nextButton)
      })
    }

    closeButton.addEventListener('click', function (event) {
      event.stopPropagation()
      toggleOverlay(gallery, scrollContainer, prevButton, nextButton)
    })

    if (prevButton instanceof HTMLButtonElement && nextButton instanceof HTMLButtonElement) {
      prevButton.disabled = getGalleryItemIndex(scrollContainer) === 0

      prevButton.addEventListener('click', function () {
        goToPreviousImage(scrollContainer, prevButton, nextButton)
      })

      nextButton.addEventListener('click', function () {
        goToNextImage(scrollContainer, prevButton, nextButton)
      })

      scrollContainer.addEventListener('scroll', debounce(function () {
        updateGalleryButtons(scrollContainer, prevButton, nextButton)
      }, 50))
    }
  }
}

/**
 * @param {Element} gallery
 * @param {HTMLElement} scrollContainer
 * @param {Element | null} prevButton
 * @param {Element | null} nextButton
 */
function toggleOverlay(gallery, scrollContainer, prevButton, nextButton) {
  const galleryItemIndex = getGalleryItemIndex(scrollContainer)

  if (gallery.classList.contains('gallery--is-overlay')) {
    gallery.classList.remove('gallery--is-overlay')
    document.body.style.removeProperty('overflow')
  } else {
    gallery.classList.add('gallery--is-overlay')
    document.body.style.setProperty('overflow', 'hidden')

    if (!gallery.hasAttribute('data-has-loaded-high-res-images')) {
      gallery.setAttribute('data-has-loaded-high-res-images', '')
      const images = gallery.querySelectorAll('.gallery-item__image')
      for (const image of images) {
        const highResSource = image.getAttribute('data-high-res-src')
        if (highResSource) {
          image.setAttribute('src', highResSource)
          image.removeAttribute('data-high-res-src')
        }
      }
    }
  }

  if (prevButton instanceof HTMLButtonElement && nextButton instanceof HTMLButtonElement) {
    setTimeout(() => {
      goToImage(scrollContainer, prevButton, nextButton, galleryItemIndex)
    }, 0)
  }
}

/**
 * @param {HTMLElement} scrollContainer
 * @param {HTMLButtonElement} prevButton
 * @param {HTMLButtonElement} nextButton
 */
function goToPreviousImage(scrollContainer, prevButton, nextButton) {
  goToImage(scrollContainer, prevButton, nextButton, getGalleryItemIndex(scrollContainer) - 1)
}

/**
 * @param {HTMLElement} scrollContainer
 * @param {HTMLButtonElement} prevButton
 * @param {HTMLButtonElement} nextButton
 */
function goToNextImage(scrollContainer, prevButton, nextButton) {
  goToImage(scrollContainer, prevButton, nextButton, getGalleryItemIndex(scrollContainer) + 1)
}

/**
 * @param {HTMLElement} scrollContainer
 * @param {HTMLButtonElement} prevButton
 * @param {HTMLButtonElement} nextButton
 * @param {number} galleryItemIndex
 */
function goToImage(scrollContainer, prevButton, nextButton, galleryItemIndex) {
  scrollContainer.scrollLeft = galleryItemIndex * scrollContainer.clientWidth
  updateGalleryButtons(scrollContainer, prevButton, nextButton)
}

/**
 * @param {HTMLElement} scrollContainer
 * @param {HTMLButtonElement} prevButton
 * @param {HTMLButtonElement} nextButton
 */
function updateGalleryButtons(scrollContainer, prevButton, nextButton) {
  const galleryItemIndex = getGalleryItemIndex(scrollContainer)
  prevButton.disabled = galleryItemIndex <= 0
  nextButton.disabled = galleryItemIndex >= scrollContainer.children.length - 1
}

/**
 * @param {HTMLElement} scrollContainer
 * @returns {number}
 */
function getGalleryItemIndex(scrollContainer) {
  return Math.round(scrollContainer.scrollLeft / scrollContainer.clientWidth)
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
    // the earlier timeout; thus, it’s callback will not be invoked.
    clearTimeout(timeoutId)

    // Starts a new timer which will call the initial function after the
    // specified wait time unless the debounced function is called again.
    timeoutId = window.setTimeout(() => {
      initialFunction(...args)
    }, delay)
  }
}
