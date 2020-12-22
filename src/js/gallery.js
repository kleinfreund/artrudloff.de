(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.remove("js-disabled");
    initGallery();
  });
})();

function initGallery() {
  const galleries = document.querySelectorAll('.gallery')

  for (const gallery of galleries) {
    const scrollContainer = gallery.querySelector('.gallery__scroll-container')
    const prevButton = gallery.querySelector('.gallery__prev-button')
    const nextButton = gallery.querySelector('.gallery__next-button')

    if (scrollContainer instanceof HTMLElement && prevButton instanceof HTMLButtonElement && nextButton instanceof HTMLButtonElement) {
      prevButton.disabled = getGalleryItemIndex(scrollContainer) === 0

      prevButton.addEventListener('click', function () {
        nextButton.disabled = false
        const galleryItemIndex = getGalleryItemIndex(scrollContainer) - 1
        scrollContainer.scrollLeft = galleryItemIndex * scrollContainer.clientWidth
        prevButton.disabled = galleryItemIndex <= 0
      })

      nextButton.addEventListener('click', function () {
        prevButton.disabled = false
        const galleryItemIndex = getGalleryItemIndex(scrollContainer) + 1
        scrollContainer.scrollLeft = galleryItemIndex * scrollContainer.clientWidth
        nextButton.disabled = galleryItemIndex >= scrollContainer.children.length - 1
      })

      scrollContainer.addEventListener('scroll', debounce(function () {
        const galleryItemIndex = getGalleryItemIndex(scrollContainer)
        prevButton.disabled = galleryItemIndex <= 0
        nextButton.disabled = galleryItemIndex >= scrollContainer.children.length - 1
      }, 50))
    }
  }
}

/**
 * @param {Element} scrollContainer
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
