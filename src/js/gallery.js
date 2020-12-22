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

    if (prevButton instanceof HTMLButtonElement && nextButton instanceof HTMLButtonElement) {
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
    }
  }
}

/**
 * @param {Element} scrollContainer
 */
function getGalleryItemIndex(scrollContainer) {
  return Math.round(scrollContainer.scrollLeft / scrollContainer.clientWidth)
}
