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

    prevButton.addEventListener('click', function () {
      advanceGallery(scrollContainer, -1)
    })

    nextButton.addEventListener('click', function () {
      advanceGallery(scrollContainer, 1)
    })
  }
}

/**
 * @param {Element} scrollContainer
 * @param {1 | -1} direction
 */
function advanceGallery(scrollContainer, direction) {
  const currentItemIndex = Math.round(scrollContainer.scrollLeft / scrollContainer.clientWidth)
  const targetItemIndex = currentItemIndex + direction
  scrollContainer.scrollLeft = targetItemIndex * scrollContainer.clientWidth
}
