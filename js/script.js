document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.highlight-hover');

  elements.forEach((el) => {
    const text = el.getAttribute('data-animated-text');
    if (!text) return;

    el.innerHTML = '';

    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.transitionDelay = `${index * 30}ms`;
      el.appendChild(span);
    });
  });

  const menuToggle = document.getElementById('menu-toggle');
  const menuLinks = document.querySelector('.menu-links');

  if (menuToggle && menuLinks) {
    menuToggle.addEventListener('click', () => {
      menuLinks.classList.toggle('show');
    });
  }

  const body = document.body;
  const modalTriggers = document.querySelectorAll('.nav-modal-trigger');
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('[data-modal-close]');
  let lastModalTrigger = null;

  const lightbox = document.getElementById('rankingLightbox');
  const lightboxImage = lightbox ? lightbox.querySelector('.lightbox__image') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox__caption') : null;
  const lightboxPrev = lightbox ? lightbox.querySelector('[data-lightbox-prev]') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('[data-lightbox-next]') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('[data-lightbox-close]') : null;

  const carouselInstances = new Map();
  let activeCarousel = null;
  let activeCarouselIndex = 0;
  let lastLightboxTrigger = null;

  const isLightboxOpen = () =>
    Boolean(lightbox && lightbox.classList.contains('is-open'));

  const syncBodyScrollState = () => {
    if (!document.querySelector('.modal.is-open') && !isLightboxOpen()) {
      body.classList.remove('modal-open');
    }
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    syncBodyScrollState();

    if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
      lastModalTrigger.focus();
    }
  };

  const openModal = (modal) => {
    if (!modal) return;
    document.querySelectorAll('.modal.is-open').forEach((open) => {
      if (open !== modal) {
        closeModal(open);
      }
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');

    const closeButton = modal.querySelector('[data-modal-close]');
    if (closeButton) {
      closeButton.focus();
    }
  };

  const updateLightboxControls = (count) => {
    const shouldDisable = count <= 1;
    [lightboxPrev, lightboxNext].forEach((button) => {
      if (!button) return;
      button.disabled = shouldDisable;
      button.classList.toggle('is-disabled', shouldDisable);
    });
  };

  const updateLightbox = () => {
    if (!lightbox || !activeCarousel) return;

    const instance = carouselInstances.get(activeCarousel);
    if (!instance) return;

    const slides = instance.getSlides();
    if (!slides.length) return;

    const total = slides.length;
    activeCarouselIndex = (activeCarouselIndex + total) % total;
    instance.goTo(activeCarouselIndex);

    const slide = slides[activeCarouselIndex];
    const src = slide.getAttribute('data-lightbox-src') || slide.getAttribute('src') || '';
    const altText = slide.getAttribute('data-lightbox-alt') || slide.getAttribute('alt') || '';
    const captionText = slide.getAttribute('data-caption') || altText;

    if (lightboxImage) {
      lightboxImage.src = src;
      lightboxImage.alt = altText;
    }

    if (lightboxCaption) {
      lightboxCaption.textContent = captionText || '';
      lightboxCaption.style.display = captionText ? 'block' : 'none';
    }

    updateLightboxControls(total);
  };

  const openLightbox = (carousel, index, trigger) => {
    if (!lightbox) return;
    activeCarousel = carousel;
    activeCarouselIndex = index;
    lastLightboxTrigger = trigger;

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');

    updateLightbox();

    if (lightboxClose) {
      lightboxClose.focus();
    }
  };

  const closeLightbox = () => {
    if (!isLightboxOpen() || !lightbox) return;

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');

    const trigger = lastLightboxTrigger;
    activeCarousel = null;
    lastLightboxTrigger = null;

    syncBodyScrollState();

    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus();
    }
  };

  const initCarousel = (carousel) => {
    const track = carousel.querySelector('.carousel__track');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.carousel__slide'));
    if (!slides.length) return;

    const prevButton = carousel.querySelector('.carousel__control--prev');
    const nextButton = carousel.querySelector('.carousel__control--next');
    let currentIndex = 0;

    const updateControlsState = () => {
      const shouldDisable = slides.length <= 1;
      [prevButton, nextButton].forEach((button) => {
        if (!button) return;
        button.disabled = shouldDisable;
        button.classList.toggle('is-disabled', shouldDisable);
      });
    };

    const goTo = (index) => {
      if (!slides.length) return;
      const total = slides.length;
      currentIndex = (index + total) % total;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, idx) => {
        const isActive = idx === currentIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('data-active', isActive ? 'true' : 'false');
      });
    };

    const showPrev = () => goTo(currentIndex - 1);
    const showNext = () => goTo(currentIndex + 1);

    prevButton?.addEventListener('click', showPrev);
    nextButton?.addEventListener('click', showNext);

    slides.forEach((slide, idx) => {
      slide.setAttribute('draggable', 'false');
      slide.setAttribute('tabindex', '0');
      slide.addEventListener('click', () => {
        openLightbox(carousel, idx, slide);
      });
      slide.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(carousel, idx, slide);
        }
      });
    });

    updateControlsState();
    goTo(0);

    carouselInstances.set(carousel, {
      goTo,
      getSlides: () => slides,
      getCurrentIndex: () => currentIndex,
      getSlidesCount: () => slides.length,
    });
  };

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-modal-target');
      if (!targetId) return;

      const modal = document.getElementById(targetId);
      if (!modal) return;

      lastModalTrigger = trigger;
      openModal(modal);

      if (menuLinks && menuLinks.classList.contains('show')) {
        menuLinks.classList.remove('show');
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    });
  });

  modals.forEach((modal) => {
    modal.setAttribute('aria-hidden', 'true');
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    initCarousel(carousel);
  });

  lightboxPrev?.addEventListener('click', () => {
    if (!isLightboxOpen()) return;
    activeCarouselIndex -= 1;
    updateLightbox();
  });

  lightboxNext?.addEventListener('click', () => {
    if (!isLightboxOpen()) return;
    activeCarouselIndex += 1;
    updateLightbox();
  });

  lightboxClose?.addEventListener('click', () => {
    closeLightbox();
  });

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (isLightboxOpen()) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        activeCarouselIndex += 1;
        updateLightbox();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        activeCarouselIndex -= 1;
        updateLightbox();
        return;
      }
    }

    if (event.key === 'Escape') {
      const openModalElement = document.querySelector('.modal.is-open');
      if (openModalElement) {
        closeModal(openModalElement);
      }
    }
  });
});
