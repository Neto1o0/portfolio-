// Initialize Lenis Smooth Scrolling. The library is loaded from a CDN, so
// guard against it being blocked or unavailable and fall back to native
// scrolling instead of breaking the whole script.
const lenis = typeof Lenis !== 'undefined'
  ? new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  })
  : null;

function raf(time) {
  if (lenis) lenis.raf(time);
  requestAnimationFrame(raf);
}

if (lenis) requestAnimationFrame(raf);

// --- Shared rAF-throttled scroll dispatcher ---------------------------------
// One passive scroll listener and one rAF per frame for every scroll-driven
// effect. Safari recalculates layout far more aggressively than Blink, so
// keeping per-event work to a single scheduler avoids repeated forced layouts.
const scrollHandlers = [];
let scrollFrameRequested = false;

function registerScrollHandler(fn) {
  scrollHandlers.push(fn);
}

function runScrollHandlers() {
  scrollFrameRequested = false;
  for (let i = 0; i < scrollHandlers.length; i++) scrollHandlers[i]();
}

window.addEventListener('scroll', () => {
  if (scrollFrameRequested) return;
  scrollFrameRequested = true;
  requestAnimationFrame(runScrollHandlers);
}, { passive: true });

// Tag WebKit so CSS can avoid effects that only pay off on Blink (e.g.
// animating filter: blur, which forces a re-rasterization every frame).
const isWebKit = /AppleWebKit/.test(navigator.userAgent) &&
  !/Chrome|Chromium|Edg|OPR|Android/.test(navigator.userAgent);
if (isWebKit) document.documentElement.classList.add('is-webkit');

// Typewriter Array
const phrases = [
  "Renato Nuñez",
  "Informatic Engineer",
  "Experience designer",
  "Developer"
];

let currentPhraseIndex = 0;
let isDeleting = false;
let currentText = "";
let typingSpeed = 100; // ms per char

const typewriterElement = document.getElementById('typewriter');

function type() {
  const currentPhrase = phrases[currentPhraseIndex];

  if (isDeleting) {
    // Remove a character
    currentText = currentPhrase.substring(0, currentText.length - 1);
    typingSpeed = 50; // faster when deleting
  } else {
    // Add a character
    currentText = currentPhrase.substring(0, currentText.length + 1);
    typingSpeed = 100;
  }

  typewriterElement.textContent = currentText;

  // Determine next state
  if (!isDeleting && currentText === currentPhrase) {
    // Finished typing a phrase, pause before deleting
    typingSpeed = 1500; // 1.5 second pause
    isDeleting = true;
  } else if (isDeleting && currentText === "") {
    // Finished deleting a phrase, move to the next one
    isDeleting = false;
    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
    typingSpeed = 300; // pause before typing next
  }

  setTimeout(type, typingSpeed);
}

// Start the typing effect after a short initial delay to allow entrance animations
setTimeout(type, 800);

// Scroll listener for dynamic notch
const notch = document.getElementById('notch-container');

// Sync the dual-layer notch background widths
const notchLeft = document.getElementById('notch-left');
const notchRight = document.getElementById('notch-right');
const bgLeft = document.getElementById('bg-left');
const bgRight = document.getElementById('bg-right');

function syncNotchWidths() {
  if (notchLeft && bgLeft) {
    bgLeft.style.width = `${notchLeft.offsetWidth}px`;
  }
  if (notchRight && bgRight) {
    bgRight.style.width = `${notchRight.offsetWidth}px`;
  }
}

// Observe changes (like font loading or scrolling hiding the name)
if (notchLeft || notchRight) {
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(syncNotchWidths);
    if (notchLeft) resizeObserver.observe(notchLeft);
    if (notchRight) resizeObserver.observe(notchRight);
  } else {
    window.addEventListener('resize', syncNotchWidths);
  }
}
// Initial sync
syncNotchWidths();

let notchScrolled = false;
let hasShownTranslateHint = false;
let translateHintPending = false;
const langToggle = document.querySelector('.lang-toggle');
const translateHint = document.getElementById('translate-hint');

function showTranslateHint() {
  if (hasShownTranslateHint || translateHintPending || !langToggle || !translateHint) return;
  translateHintPending = true;

  const label = translateHint.querySelector('span');
  if (label) {
    label.textContent = document.documentElement.lang === 'es' ? 'Traducir página' : 'Translate page';
  }

  setTimeout(() => {
    translateHintPending = false;
    if (!notch?.classList.contains('scrolled')) return;

    const toggleRect = langToggle.getBoundingClientRect();
    const horizontalPadding = 12;
    const hintHalfWidth = Math.min(95, (window.innerWidth - horizontalPadding * 2) / 2);
    const centerX = toggleRect.left + toggleRect.width / 2;
    const left = Math.max(hintHalfWidth + horizontalPadding, Math.min(centerX, window.innerWidth - hintHalfWidth - horizontalPadding));

    translateHint.style.left = `${left}px`;
    translateHint.style.top = `${toggleRect.bottom + 8}px`;
    translateHint.classList.add('visible');
    hasShownTranslateHint = true;
    setTimeout(() => translateHint.classList.remove('visible'), 2800);
  }, 650);
}

registerScrollHandler(() => {
  if (!notch) return;
  const shouldCollapse = window.scrollY > 50;
  if (shouldCollapse !== notchScrolled) {
    notchScrolled = shouldCollapse;
    notch.classList.toggle('scrolled', shouldCollapse);
    if (shouldCollapse) showTranslateHint();
  }
});

// Active section logic
const sections = document.querySelectorAll('section, footer');
const navItems = document.querySelectorAll('.nav-item');

const observerOptions = {
  root: null,
  rootMargin: '-20% 0px -20% 0px', // triggers when section is within the middle 60% of viewport
  threshold: 0 // trigger as soon as the rootMargin condition is met
};

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find the corresponding nav item and add 'active' class
        navItems.forEach(item => {
          item.classList.remove('active');
          if (entry.target.id !== 'home' && item.getAttribute('href') === `#${entry.target.id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
}

// Fluid Normal Cursor Logic (Classic Arrow / Hand with Organic Physics)
const normalCursor = document.getElementById('normal-cursor');
const customCursor = document.getElementById('custom-cursor');
const glow = document.getElementById('cursor-glow');

// Suppress native system cursor
document.documentElement.style.cursor = 'none';
document.body.style.cursor = 'none';

let mouseX = -100, mouseY = -100;
let prevMouseX = -100, prevMouseY = -100;
let cursorX = -100, cursorY = -100;
let glowX = -100, glowY = -100;
let cursorAngle = 0;
let isCursorVisible = false;
let isPointer = false;
let isClicking = false;
let isProjectCardHovered = false;
let cursorDirty = true;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  window.mouseX = mouseX;
  window.mouseY = mouseY;

  if (!isCursorVisible) {
    isCursorVisible = true;
    cursorX = mouseX;
    cursorY = mouseY;
    glowX = mouseX;
    glowY = mouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    if (normalCursor) normalCursor.classList.add('active');
  }
});

document.addEventListener('mousedown', () => {
  isClicking = true;
  cursorDirty = true;
  if (normalCursor) normalCursor.classList.add('is-clicking');
});

document.addEventListener('mouseup', () => {
  isClicking = false;
  cursorDirty = true;
  if (normalCursor) normalCursor.classList.remove('is-clicking');
});

document.addEventListener('mouseleave', () => {
  isCursorVisible = false;
  cursorDirty = true;
  if (normalCursor) normalCursor.classList.remove('active');
  if (customCursor) customCursor.classList.remove('visible');
});

// Interactive hover detection for switching between normal arrow and pointer hand
const interactiveSelector = 'a, button, [role="button"], .more-about-block, .pill-close, .final-close-btn, .sound-control-btn, .lang-toggle, .footer-link, .nav-item, .back-to-top, .project-card';

document.addEventListener('mouseover', (e) => {
  if (e.target.closest(interactiveSelector)) {
    isPointer = true;
    cursorDirty = true;
    if (normalCursor) normalCursor.classList.add('is-pointer');
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.closest(interactiveSelector)) {
    isPointer = false;
    cursorDirty = true;
    if (normalCursor) normalCursor.classList.remove('is-pointer');
  }
});

// Project cards custom badge integration
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    isProjectCardHovered = true;
    cursorDirty = true;
    if (customCursor) customCursor.classList.add('visible');
    // Replaces .projects-grid:has(.project-card:hover). :has() is expensive in
    // WebKit and gets re-evaluated whenever the grid subtree changes.
    const grid = card.closest('.projects-grid');
    if (grid) grid.classList.add('has-hover');
  });
  card.addEventListener('mouseleave', () => {
    isProjectCardHovered = false;
    cursorDirty = true;
    if (customCursor) customCursor.classList.remove('visible');
    const grid = card.closest('.projects-grid');
    if (grid) grid.classList.remove('has-hover');
  });
});

// Smooth RAF loop for fluid physics (creamy lerp + banking tilt + liquid stretch)
let currentScaleX = 1;
let currentScaleY = 1;
let cursorSettled = false;

function writeCursorStyles() {
  // Hotspot offset:
  // Arrow tip is at (3, 2), Hand pointer fingertip is at (9.5, 2)
  const offsetX = isPointer ? 9.5 : 3;
  const offsetY = 2;

  if (normalCursor) {
    normalCursor.style.transform = `translate3d(${cursorX - offsetX}px, ${cursorY - offsetY}px, 0) rotate(${cursorAngle}deg) scale(${currentScaleX}, ${currentScaleY})`;
  }

  if (customCursor && isProjectCardHovered) {
    customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(20px, 20px)`;
  }

  if (glow) {
    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
  }
}

function renderFluidCursor() {
  if (isCursorVisible) {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    const dist = Math.hypot(dx, dy);

    // Once the cursor has visually settled, stop writing transforms every
    // frame. A permanent compositor update costs real FPS in Safari.
    const atRest =
      Math.abs(dx) < 0.1 &&
      Math.abs(dy) < 0.1 &&
      Math.abs(mouseX - glowX) < 0.1 &&
      Math.abs(mouseY - glowY) < 0.1 &&
      Math.abs(cursorAngle) < 0.05 &&
      Math.abs(currentScaleX - 1) < 0.002 &&
      Math.abs(currentScaleY - 1) < 0.002 &&
      !isClicking &&
      !cursorDirty;

    if (atRest) {
      if (!cursorSettled) {
        cursorSettled = true;
        cursorX = mouseX;
        cursorY = mouseY;
        glowX = mouseX;
        glowY = mouseY;
        cursorAngle = 0;
        currentScaleX = 1;
        currentScaleY = 1;
        cursorDirty = false;
        writeCursorStyles();
      }
      requestAnimationFrame(renderFluidCursor);
      return;
    }

    cursorSettled = false;
    cursorDirty = false;

    // Creamy fluid lerp (0.20 provides silky momentum and liquid inertia)
    const ease = 0.20;
    cursorX += dx * ease;
    cursorY += dy * ease;

    // Banking angle smoothly follows lead trajectory (tilts up to ±18°)
    const targetAngle = Math.max(-18, Math.min(18, dx * 0.65));
    cursorAngle += (targetAngle - cursorAngle) * 0.12;

    // Fluid organic squash & stretch based on velocity
    const targetStretch = Math.min(0.18, dist * 0.0016);
    const clickScale = isClicking ? 0.85 : 1;
    const targetScaleX = (1 - targetStretch * 0.5) * clickScale;
    const targetScaleY = (1 + targetStretch) * clickScale;

    currentScaleX += (targetScaleX - currentScaleX) * 0.15;
    currentScaleY += (targetScaleY - currentScaleY) * 0.15;

    glowX += (mouseX - glowX) * 0.06;
    glowY += (mouseY - glowY) * 0.06;

    writeCursorStyles();
  }

  requestAnimationFrame(renderFluidCursor);
}
requestAnimationFrame(renderFluidCursor);



// Scroll-Jacking About Section Logic
const scrollSection = document.querySelector('.scroll-jacking-section');
const horizontalTrack = document.getElementById('horizontal-track');
const carouselItems = document.querySelectorAll('.carousel-item');

// Hacker Text Animation Logic
const chars = '!<>-_\\/[]{}—=+*^?#_';
let currentActiveIndex = -1;

function generateRandomSymbols(length) {
  let res = '';
  for (let i = 0; i < length; i++) {
    if (Math.random() > 0.8) res += ' ';
    else res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

function decipherEffect(element, originalText) {
  let iteration = 0;
  clearInterval(element.dataset.intervalId);

  element.dataset.intervalId = setInterval(() => {
    element.innerText = originalText.split('').map((char, index) => {
      if (index < iteration) {
        return originalText[index];
      }
      return char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
    }).join('');

    if (iteration >= originalText.length) {
      clearInterval(element.dataset.intervalId);
      const originalHtml = element.getAttribute('data-original-html');
      if (originalHtml) element.innerHTML = originalHtml;
    }

    iteration += 2; // Much faster speed
  }, 10);
}

function encipherEffect(element, originalText) {
  let iteration = originalText.length;
  clearInterval(element.dataset.intervalId);

  element.dataset.intervalId = setInterval(() => {
    element.innerText = originalText.split('').map((char, index) => {
      if (index < iteration) {
        return originalText[index];
      }
      return char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
    }).join('');

    if (iteration <= 0) {
      clearInterval(element.dataset.intervalId);
    }

    iteration -= 2; // Faster reverse speed
  }, 10);
}

// Initialize texts
carouselItems.forEach((item, index) => {
  const desc = item.querySelector('.item-desc');
  if (desc) {
    desc.setAttribute('data-original', desc.innerText);
    desc.setAttribute('data-original-html', desc.innerHTML);
    desc.innerText = generateRandomSymbols(desc.innerText.length);
  }
});

function measureAboutDescriptionHeight() {
  const descriptions = Array.from(scrollSection?.querySelectorAll('.item-desc') ?? []);
  if (window.innerWidth > 768 || descriptions.length === 0) {
    document.documentElement.style.removeProperty('--about-desc-height');
    return;
  }

  let maxHeight = 0;
  descriptions.forEach(desc => {
    const currentText = desc.textContent;
    desc.textContent = desc.getAttribute('data-original') ?? currentText;
    maxHeight = Math.max(maxHeight, desc.scrollHeight);
    desc.textContent = currentText;
  });
  document.documentElement.style.setProperty('--about-desc-height', `${Math.ceil(maxHeight)}px`);
}

// About carousel metrics are cached. Reading offsetLeft/offsetWidth for every
// item on every scroll event forces layout in Safari and causes jank.
let aboutSectionTop = 0;
let aboutSectionHeight = 0;
let aboutScrollableDistance = 0;
let carouselCenters = [];
let cachedScreenCenter = window.innerWidth / 2;

function measureCarousel() {
  if (!scrollSection) return;
  const rect = scrollSection.getBoundingClientRect();
  aboutSectionTop = rect.top + window.scrollY;
  aboutSectionHeight = rect.height;
  aboutScrollableDistance = rect.height - window.innerHeight;
  carouselCenters = Array.from(carouselItems).map(item => item.offsetLeft + (item.offsetWidth / 2));
  cachedScreenCenter = window.innerWidth / 2;
}

function measureAboutLayout() {
  measureAboutDescriptionHeight();
  measureCarousel();
}

function updateCarouselOnScroll() {
  if (!scrollSection || !horizontalTrack) return;

  // On mobile devices (<= 768px), horizontal browsing is optional via touch-swipe / arrow
  if (window.innerWidth <= 768) {
    if (horizontalTrack.style.transform && horizontalTrack.style.transform !== 'none') {
      horizontalTrack.style.transform = 'none';
    }
    return;
  }

  if (!carouselCenters.length || aboutScrollableDistance <= 0) return;

  const sectionTop = aboutSectionTop - window.scrollY;

  // While the section is completely off-screen the last applied state is
  // already correct (the track was parked at progress 0/1 as it left).
  if (sectionTop > window.innerHeight || sectionTop + aboutSectionHeight < 0) return;

  // Calculate progress from 0 to 1
  let progress = -sectionTop / aboutScrollableDistance;
  progress = Math.max(0, Math.min(1, progress));

  const firstCenter = carouselCenters[0];
  const lastCenter = carouselCenters[carouselCenters.length - 1];

  // As progress goes from 0 to 1, the target center shifts from the first item to the last item
  const targetCenter = firstCenter + progress * (lastCenter - firstCenter);

  // To place the target center in the middle of the screen, we translate the track
  const translateX = cachedScreenCenter - targetCenter;

  horizontalTrack.style.transform = `translateX(${translateX}px)`;

  // Determine active index by finding the item whose center is closest to the targetCenter
  let activeIndex = 0;
  let minDistance = Infinity;
  carouselCenters.forEach((center, index) => {
    const dist = Math.abs(center - targetCenter);
    if (dist < minDistance) {
      minDistance = dist;
      activeIndex = index;
    }
  });

  if (activeIndex !== currentActiveIndex) {
    // Scramble old active
    if (currentActiveIndex >= 0 && carouselItems[currentActiveIndex]) {
      const oldItem = carouselItems[currentActiveIndex];
      oldItem.classList.remove('active');
      const oldDesc = oldItem.querySelector('.item-desc');
      if (oldDesc) {
        encipherEffect(oldDesc, oldDesc.getAttribute('data-original'));
      }
    }

    // Decipher new active
    currentActiveIndex = activeIndex;
    const newItem = carouselItems[currentActiveIndex];
    newItem.classList.add('active');
    const newDesc = newItem.querySelector('.item-desc');
    if (newDesc) {
      decipherEffect(newDesc, newDesc.getAttribute('data-original'));
    }
  }
}

registerScrollHandler(updateCarouselOnScroll);
window.addEventListener('resize', () => {
  measureAboutLayout();
  updateCarouselOnScroll();
}, { passive: true });
window.addEventListener('load', measureAboutLayout);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(measureAboutLayout);
}
// Item widths depend on media aspect ratios, so re-measure whenever a card or
// the track changes size (videos report their intrinsic size asynchronously).
if ('ResizeObserver' in window && horizontalTrack) {
  const carouselResizeObserver = new ResizeObserver(() => {
    measureCarousel();
    updateCarouselOnScroll();
  });
  carouselResizeObserver.observe(horizontalTrack);
  carouselItems.forEach(item => carouselResizeObserver.observe(item));
}
carouselItems.forEach(item => {
  const video = item.querySelector('video');
  if (video) video.addEventListener('loadedmetadata', measureCarousel, { once: true });
});
measureAboutLayout();

// Mobile Horizontal Swipe & Arrow Indicator Logic
const aboutScrollArrow = document.getElementById('about-scroll-arrow');
const scrollTrackWrapper = document.getElementById('scroll-track-wrapper');

function checkMobileActiveItem() {
  if (window.innerWidth > 768 || !scrollTrackWrapper) return;
  const wrapperRect = scrollTrackWrapper.getBoundingClientRect();
  const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

  let activeIndex = -1;
  let minDistance = Infinity;

  carouselItems.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2;
    const dist = Math.abs(itemCenter - wrapperCenter);
    if (dist < minDistance && dist < wrapperRect.width * 0.45) {
      minDistance = dist;
      activeIndex = index;
    }
  });

  if (activeIndex !== -1 && activeIndex !== currentActiveIndex) {
    if (currentActiveIndex >= 0 && carouselItems[currentActiveIndex]) {
      const oldItem = carouselItems[currentActiveIndex];
      oldItem.classList.remove('active');
      const oldDesc = oldItem.querySelector('.item-desc');
      if (oldDesc) {
        encipherEffect(oldDesc, oldDesc.getAttribute('data-original'));
      }
    }

    currentActiveIndex = activeIndex;
    if (currentActiveIndex >= 0 && carouselItems[currentActiveIndex]) {
      const newItem = carouselItems[currentActiveIndex];
      newItem.classList.add('active');
      const newDesc = newItem.querySelector('.item-desc');
      if (newDesc) {
        decipherEffect(newDesc, newDesc.getAttribute('data-original'));
      }
    }
  }
}

if (scrollTrackWrapper) {
  scrollTrackWrapper.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
      checkMobileActiveItem();
      if (aboutScrollArrow) {
        const maxScroll = scrollTrackWrapper.scrollWidth - scrollTrackWrapper.clientWidth;
        if (scrollTrackWrapper.scrollLeft >= maxScroll - 30) {
          aboutScrollArrow.classList.add('hidden');
        } else {
          aboutScrollArrow.classList.remove('hidden');
        }
      }
    }
  }, { passive: true });
}

if (aboutScrollArrow && scrollTrackWrapper) {
  aboutScrollArrow.addEventListener('click', () => {
    const scrollAmount = Math.min(320, window.innerWidth * 0.82);
    scrollTrackWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth <= 768 && horizontalTrack) {
    horizontalTrack.style.transform = 'none';
    checkMobileActiveItem();
  }
});

// Pause/Reset videos & trigger About titles when About section enters/leaves view
const aboutVideos = scrollSection.querySelectorAll('video');
const aboutTitles = document.getElementById('about-titles');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        // Pause and reset
        aboutVideos.forEach(video => {
          video.pause();
          video.currentTime = 0;
        });
        if (aboutTitles) aboutTitles.classList.remove('visible');
      } else {
        // Play videos again when visible
        aboutVideos.forEach(video => {
          video.play().catch(e => console.log('Autoplay blocked', e));
        });
        if (aboutTitles) aboutTitles.classList.add('visible');
        if (window.innerWidth <= 768) {
          checkMobileActiveItem();
        }
      }
    });
  }, { threshold: 0.1 });

  if (scrollSection) {
    sectionObserver.observe(scrollSection);
  }
}

// Projects Expanding Effect
const projectsScrollWrapper = document.getElementById('projects-scroll-wrapper');
const projectsSection = document.getElementById('projects');
const projectsGrid = document.querySelector('.projects-grid');
const explosionLogo = document.getElementById('explosion-logo');
const projectsTitle = document.querySelector('.projects-titles');

function isProjectsMobile() {
  return window.innerWidth <= 768;
}

// Grid target state
let targetScale = 0;
let currentScale = 0;
let targetGridOp = 0;
let currentGridOp = 0;

// Logo target state
let targetLogoScale = 1;
let currentLogoScale = 1;
let targetLogoOp = 1;
let currentLogoOp = 1;

let targetPanX = 0;
let targetPanY = 0;
let currentPanX = 0;
let currentPanY = 0;

// The sphere animation is only allowed to run while it can be seen: the logo
// fades out when Projects is open and is irrelevant when the modal is up.
let spherePaused = false;
let sphereInViewport = true;
let projectsModalOpen = false;

function updateSpherePlayState() {
  if (!explosionLogo) return;
  const paused = projectsModalOpen || document.hidden ||
    (isProjectsMobile() ? !sphereInViewport : currentLogoOp <= 0.02);
  if (paused !== spherePaused) {
    spherePaused = paused;
    explosionLogo.classList.toggle('sphere-paused', paused);
  }
}

document.addEventListener('visibilitychange', updateSpherePlayState);
if (explosionLogo && 'IntersectionObserver' in window) {
  const sphereVisibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      sphereInViewport = entry.isIntersecting;
      updateSpherePlayState();
    });
  });
  sphereVisibilityObserver.observe(explosionLogo);
}

// Projects/footer measurements are cached. Calling getBoundingClientRect()
// on every scroll event forces layout, which is especially costly in Safari.
const footerSection = document.getElementById('footer');
const footerHero = document.querySelector('.footer-hero');
let projectsWrapperTop = 0;
let projectsScrollableDistance = 0;
let cachedFooterTop = 0;
let cachedFooterHeight = 0;
let cachedFooterHeroCenter = 0;
let lastFooterProgress = -1;

function measureProjectsScroll() {
  const vh = window.innerHeight;
  if (projectsScrollWrapper && !isProjectsMobile()) {
    const rect = projectsScrollWrapper.getBoundingClientRect();
    projectsWrapperTop = rect.top + window.scrollY;
    projectsScrollableDistance = rect.height - vh;
  }
  if (footerSection) {
    const rect = footerSection.getBoundingClientRect();
    cachedFooterTop = rect.top + window.scrollY;
    cachedFooterHeight = rect.height;
  }
  if (footerHero) {
    const rect = footerHero.getBoundingClientRect();
    cachedFooterHeroCenter = rect.top + window.scrollY + rect.height / 2;
  }
}

let projectsInSection = null;

function updateProjectsOnScroll() {
  // Footer scroll animation. The custom properties are only consumed by the
  // notch pieces and the footer title, so set them on those subtrees instead
  // of <body>: a body-level change invalidates style for the whole document.
  if (footerSection && cachedFooterHeight > 0) {
    let footerProgress;
    if (isProjectsMobile() && cachedFooterHeroCenter > 0) {
      const heroCenter = cachedFooterHeroCenter - window.scrollY;
      footerProgress = (window.innerHeight - heroCenter) / (window.innerHeight / 2);
    } else {
      const footerTop = cachedFooterTop - window.scrollY;
      footerProgress = (window.innerHeight - footerTop) / cachedFooterHeight;
    }
    footerProgress = Math.max(0, Math.min(1, footerProgress));
    // Only touch the custom properties when the value actually changes.
    if (Math.abs(footerProgress - lastFooterProgress) > 0.0001) {
      lastFooterProgress = footerProgress;
      if (notch) {
        notch.style.setProperty('--footer-progress', footerProgress);
        notch.style.setProperty('--split-radius', `${footerProgress * 50}px`);
      }
      footerSection.style.setProperty('--footer-progress', footerProgress);
    }
  }

  if (!projectsScrollWrapper || !projectsGrid) return;

  if (isProjectsMobile()) {
    projectsInSection = null;
    if (notch?.classList.contains('notch-hidden')) notch.classList.remove('notch-hidden');
    if (projectsSection?.classList.contains('dark-mode')) projectsSection.classList.remove('dark-mode');
    updateSpherePlayState();
    return;
  }

  const wrapperTop = projectsWrapperTop - window.scrollY;
  const scrollableDistance = projectsScrollableDistance;
  let progress = scrollableDistance > 0 ? -wrapperTop / scrollableDistance : 0;

  // Inside section: grid explodes to 2.5, logo explodes out and fades.
  // Only flip state when crossing the boundary; repeating these writes on
  // every scroll frame is wasted work.
  const isInside = progress >= 0 && progress <= 1;
  if (isInside !== projectsInSection) {
    projectsInSection = isInside;
    if (isInside) {
      targetScale = 2.5;
      targetGridOp = 1;
      targetLogoScale = 10;
      targetLogoOp = 0;
      notch?.classList.add('notch-hidden');
      projectsSection?.classList.add('dark-mode');
    } else {
      // Outside section: grid shrinks and fades, logo returns to normal
      targetScale = 0.01;
      targetGridOp = 0;
      targetLogoScale = 1;
      targetLogoOp = 1;
      notch?.classList.remove('notch-hidden');
      projectsSection?.classList.remove('dark-mode');
    }
  }

}

registerScrollHandler(updateProjectsOnScroll);
window.addEventListener('resize', () => {
  measureProjectsScroll();
  updateProjectsOnScroll();
  updateSpherePlayState();
}, { passive: true });
window.addEventListener('load', measureProjectsScroll);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(measureProjectsScroll);
}
measureProjectsScroll();

if ((projectsScrollWrapper || footerSection || footerHero) && 'ResizeObserver' in window) {
  const footerLayoutObserver = new ResizeObserver(() => {
    measureProjectsScroll();
    updateProjectsOnScroll();
  });
  if (projectsScrollWrapper) footerLayoutObserver.observe(projectsScrollWrapper);
  if (footerSection) footerLayoutObserver.observe(footerSection);
  if (footerHero) footerLayoutObserver.observe(footerHero);
}

function applyProjectsStyles() {
  projectsGrid.style.transform = `translate(${currentPanX}%, ${currentPanY}%) scale(${currentScale})`;
  projectsGrid.style.opacity = currentGridOp;

  if (explosionLogo) {
    // Re-center the logo with its scale
    explosionLogo.style.transform = `translate(-50%, -50%) scale(${currentLogoScale})`;
    explosionLogo.style.opacity = currentLogoOp;
  }

  updateSpherePlayState();

  if (projectsTitle) {
    projectsTitle.style.opacity = currentGridOp;
  }
}

let projectsCanvasSettled = false;
let lastPanMouseX = NaN;
let lastPanMouseY = NaN;

function animateProjectsCanvas() {
  updateProjectVideos(performance.now());

  if (isProjectsMobile()) {
    requestAnimationFrame(animateProjectsCanvas);
    return;
  }

  if (projectsGrid) {
    const mx = window.mouseX ?? (window.innerWidth / 2);
    const my = window.mouseY ?? (window.innerHeight / 2);
    const mouseMoved = mx !== lastPanMouseX || my !== lastPanMouseY;

    const settled =
      Math.abs(targetScale - currentScale) < 0.001 &&
      Math.abs(targetGridOp - currentGridOp) < 0.001 &&
      Math.abs(targetLogoScale - currentLogoScale) < 0.001 &&
      Math.abs(targetLogoOp - currentLogoOp) < 0.001 &&
      Math.abs(targetPanX - currentPanX) < 0.001 &&
      Math.abs(targetPanY - currentPanY) < 0.001;

    // When nothing can change this frame, skip every style write. This stops
    // the Projects layer from being repainted while the page sits idle, which
    // saves a lot of continuous compositing work in Safari.
    if (settled && !mouseMoved) {
      if (!projectsCanvasSettled) {
        projectsCanvasSettled = true;
        // Snap once to the exact targets so a later change starts from them.
        currentScale = targetScale;
        currentGridOp = targetGridOp;
        currentLogoScale = targetLogoScale;
        currentLogoOp = targetLogoOp;
        currentPanX = targetPanX;
        currentPanY = targetPanY;
        applyProjectsStyles();
      }
      requestAnimationFrame(animateProjectsCanvas);
      return;
    }

    projectsCanvasSettled = false;
    lastPanMouseX = mx;
    lastPanMouseY = my;

    // Fluid lerp speed. 0.08 converges in ~1.2 s instead of ~1.6 s, which
    // shortens the window where WebKit re-rasterizes the scaled grid layer.
    let lerpSpeed = 0.08;

    // Lerp Grid
    currentScale += (targetScale - currentScale) * lerpSpeed;
    currentGridOp += (targetGridOp - currentGridOp) * lerpSpeed;

    // Lerp Logo
    currentLogoScale += (targetLogoScale - currentLogoScale) * lerpSpeed;
    currentLogoOp += (targetLogoOp - currentLogoOp) * lerpSpeed;

    // Normalized from -1 to 1
    let normX = (mx / window.innerWidth) * 2 - 1;
    let normY = (my / window.innerHeight) * 2 - 1;

    // Calculate target pan. Pan distance depends on how scaled up it is
    let maxPan = (currentScale - 1) * 14; // percentage
    // Don't pan if maxPan is negative (when scaling down to 0)
    if (maxPan < 0) maxPan = 0;

    targetPanX = normX * -maxPan;
    targetPanY = normY * -maxPan;

    // Lerp pan for smoothness
    currentPanX += (targetPanX - currentPanX) * 0.1;
    currentPanY += (targetPanY - currentPanY) * 0.1;

    applyProjectsStyles();
  }

  requestAnimationFrame(animateProjectsCanvas);
}

// Start RAF loop
requestAnimationFrame(animateProjectsCanvas);

// --- Projects video visibility manager --------------------------------------
// Project cards live inside a grid scaled up to 2.5x. An IntersectionObserver
// measures the post-transform rect, so with the grid scaled every card
// "intersects" the viewport and all 7 videos decode at once — only in this
// section, which is exactly where WebKit drops frames. Measure the real
// on-screen rects instead, with hysteresis so videos do not flicker.
const projectVideos = Array.from(document.querySelectorAll('.project-card video'));
const projectVideoPlaying = new Map();
const PROJECT_VIDEO_CHECK_MS = 120;
const MOBILE_PROJECT_HYSTERESIS = 0.2;
let projectVideoLastCheck = 0;
let mobileActiveProjectCard = null;

function setProjectVideoPlaying(video, playing) {
  if (projectVideoPlaying.get(video) === playing) return;
  projectVideoPlaying.set(video, playing);
  if (playing) {
    const playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(() => {});
  } else {
    video.pause();
  }
}

function pauseAllProjectVideos() {
  projectVideos.forEach(video => setProjectVideoPlaying(video, false));
}

function updateMobileProjectVideos(now) {
  if (now - projectVideoLastCheck < PROJECT_VIDEO_CHECK_MS) return;
  projectVideoLastCheck = now;

  if (projectsModalOpen || document.hidden || !projectsSection) {
    pauseAllProjectVideos();
    return;
  }

  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  const visibleCards = Array.from(projectCards)
    .map(card => {
      const rect = card.getBoundingClientRect();
      return { card, rect };
    })
    .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight);

  if (visibleCards.length === 0) {
    mobileActiveProjectCard = null;
    projectCards.forEach(card => card.classList.add('is-inactive'));
    pauseAllProjectVideos();
    return;
  }

  const distanceFromCenter = rect => Math.hypot(
    rect.left + rect.width / 2 - viewportCenterX,
    rect.top + rect.height / 2 - viewportCenterY
  );
  const nearest = visibleCards.reduce((closest, candidate) =>
    distanceFromCenter(candidate.rect) < distanceFromCenter(closest.rect) ? candidate : closest
  );

  let activeCard = nearest.card;
  const current = visibleCards.find(({ card }) => card === mobileActiveProjectCard);
  if (current && current.card !== nearest.card) {
    const hysteresis = Math.max(
      32,
      Math.min(current.rect.height, nearest.rect.height) * MOBILE_PROJECT_HYSTERESIS
    );
    if (distanceFromCenter(nearest.rect) + hysteresis >= distanceFromCenter(current.rect)) {
      activeCard = current.card;
    }
  }
  mobileActiveProjectCard = activeCard;

  projectCards.forEach(card => {
    const video = card.querySelector('video');
    const isActive = card === activeCard;
    card.classList.toggle('is-inactive', !isActive);
    if (!video) return;
    if (video.preload !== 'metadata') video.preload = 'metadata';
    setProjectVideoPlaying(video, isActive);
    if (!isActive && video.readyState > 0 && video.currentTime !== 0) {
      video.currentTime = 0;
    }
  });
}

function updateProjectVideos(now) {
  if (isProjectsMobile()) {
    updateMobileProjectVideos(now);
    return;
  }

  if (!projectVideos.length) return;
  if (projectsModalOpen || !projectsInSection) {
    pauseAllProjectVideos();
    return;
  }
  if (now - projectVideoLastCheck < PROJECT_VIDEO_CHECK_MS) return;
  projectVideoLastCheck = now;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const playLeft = vw * 0.05;
  const playRight = vw * 0.95;
  const playTop = vh * 0.05;
  const playBottom = vh * 0.95;
  const pauseLeft = vw * -0.25;
  const pauseRight = vw * 1.25;
  const pauseTop = vh * -0.25;
  const pauseBottom = vh * 1.25;

  for (let i = 0; i < projectVideos.length; i++) {
    const video = projectVideos[i];
    const rect = video.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setProjectVideoPlaying(video, false);
      continue;
    }
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Hysteresis: start playing only when the card center is well inside the
    // viewport, stop only once it is well outside.
    const playing = projectVideoPlaying.get(video) === true;
    const shouldPlay = playing
      ? cx > pauseLeft && cx < pauseRight && cy > pauseTop && cy < pauseBottom
      : cx > playLeft && cx < playRight && cy > playTop && cy < playBottom;
    setProjectVideoPlaying(video, shouldPlay);
  }
}

// Pause off-screen videos: they keep decoding and compositing even when
// hidden, which competes with scrolling on Safari. About-section videos are
// already handled by sectionObserver; this covers the modal video. Project
// cards use the manager above (their grid is scaled).
const offscreenVideoObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        const playPromise = video.play();
        if (playPromise && playPromise.catch) playPromise.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '50px 0px' })
  : null;

document.querySelectorAll('video').forEach(video => {
  if (scrollSection && scrollSection.contains(video)) return;
  if (video.closest('.project-card')) return;
  if (!video.hasAttribute('preload')) video.preload = 'metadata';
  if (offscreenVideoObserver) offscreenVideoObserver.observe(video);
});

// Initialize scroll-driven state once layout is available. This also covers
// reloads restored at a non-zero scroll position.
requestAnimationFrame(runScrollHandlers);

// Project Modal Logic
const projectModal = document.getElementById('project-modal');
const modalCloseBtn = document.getElementById('modal-close');
const modalTitleEl = document.getElementById('modal-title');
const modalYearEl = document.getElementById('modal-year');
const modalDescEl = document.getElementById('modal-desc');
const modalVideoEl = document.getElementById('modal-video');

const projectDescriptionTranslations = {
  videospace: "VideoSpace es una aplicación creada para beatmakers. Permite crear videos con calidad de audio y video sin pérdida en segundos, ideal para promocionar música en plataformas como YouTube y TikTok.",
  focusgram: "Focusgram es una red social inspirada en Instagram que ayuda a reducir el desplazamiento infinito. Está pensada para quienes quieren enfocarse en lo que importa: permite usar Instagram sin los Reels adictivos ni la sección Explorar interminable.",
  "neto-compressor": "Neto Compressor es un plugin VST para productores musicales. Tiene una interfaz sencilla e intuitiva, diseñada para lograr un sonido profesional. Permite controlar la dinámica de las señales de audio para obtener mezclas más pulidas y equilibradas.",
  "mac-island": "Mac Island es un experimento de interfaz para macOS inspirado en la Dynamic Island de Apple. Reúne pequeñas actualizaciones y controles útiles en un espacio flotante y compacto, para mantener la información a mano sin saturar el escritorio.",
  beatstore: "Beatstore es una tienda en línea para presentar, vender y descubrir instrumentales de mi marca. Es un espacio dedicado a mi música, con énfasis en el diseño, una infraestructura de software sólida y una buena experiencia de usuario.",
  cvmaker: "CVmaker es una página web que crea distintas versiones de un currículum a partir del documento que sube el usuario. Ayuda a postular a trabajos que requieren cualidades y enfoques específicos, sin dedicar demasiado tiempo al diseño. Es una herramienta sencilla e intuitiva."
};

let typeWriterInterval;

function getProjectDescription(card, language = document.documentElement.lang) {
  const description = language === 'es'
    ? projectDescriptionTranslations[card.dataset.projectId]
    : card.dataset.description?.trim();

  if (!description) {
    console.error(`Project card is missing a description for language "${language}".`, card);
    return null;
  }
  return description;
}

function typeProjectDescription(description) {
  clearInterval(typeWriterInterval);
  modalDescEl.textContent = '';
  modalDescEl.classList.add('typing-cursor');

  let charIndex = 0;
  typeWriterInterval = setInterval(() => {
    if (charIndex < description.length) {
      modalDescEl.textContent += description.charAt(charIndex);
      charIndex++;
    } else {
      clearInterval(typeWriterInterval);
      modalDescEl.classList.remove('typing-cursor');
    }
  }, 2);
}

// Safety net: if a view transition ever gets stuck (WebKit can leave the
// ::view-transition overlay on top of the page), force a usable state back
// after the expected animation duration.
function clearTransitionNames() {
  modalVideoEl.style.viewTransitionName = 'none';
  modalTitleEl.style.viewTransitionName = 'none';
  const card = window.activeProjectCard;
  if (card) {
    const videoEl = card.querySelector('video');
    const titleEl = card.querySelector('.project-title');
    if (videoEl) videoEl.style.viewTransitionName = 'none';
    if (titleEl) titleEl.style.viewTransitionName = 'none';
  }
}

function viewTransitionOverlayActive() {
  try {
    return document.getAnimations().some(anim => {
      const name = anim.animationName;
      return typeof name === 'string' && name.indexOf('view-transition') !== -1;
    });
  } catch (e) {
    return false;
  }
}

function maybeRecoverStuckTransition(modalShouldBeOpen) {
  setTimeout(() => {
    if (projectModal.classList.contains('active') !== modalShouldBeOpen) return;
    if (!viewTransitionOverlayActive()) return;
    clearTransitionNames();
    projectModal.classList.toggle('active', modalShouldBeOpen);
  }, 1500);
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const projectDescription = getProjectDescription(card);
    if (!projectDescription) {
      return;
    }

    clearInterval(typeWriterInterval);
    modalDescEl.textContent = '';
    modalDescEl.classList.add('typing-cursor');

    const titleEl = card.querySelector('.project-title');
    const videoEl = card.querySelector('video');
    const year = card.querySelector('.project-year').textContent;
    const wrapper = card.querySelector('.project-image-wrapper');

    // Copy the exact aspect ratio from the card's wrapper so the modal video retains the same shape
    const computedAspect = getComputedStyle(wrapper).aspectRatio;
    modalVideoEl.style.aspectRatio = computedAspect;

    // Hand-off of view-transition-name: the OLD capture (taken before updateDOM)
    // must see only the card elements, and the NEW capture only the modal ones.
    // Keeping both alive with the same name makes WebKit reject the transition
    // with InvalidStateError and can leave the overlay stuck over the page.
    videoEl.style.viewTransitionName = 'project-video-transition';
    titleEl.style.viewTransitionName = 'project-title-transition';

    const updateDOM = () => {
      videoEl.style.viewTransitionName = 'none';
      titleEl.style.viewTransitionName = 'none';
      modalVideoEl.style.viewTransitionName = 'project-video-transition';
      modalTitleEl.style.viewTransitionName = 'project-title-transition';

      modalTitleEl.textContent = titleEl.textContent;
      modalYearEl.textContent = year;
      modalVideoEl.src = videoEl.dataset.modalSrc || videoEl.src;

      projectModal.classList.add('active');
      projectsModalOpen = true;
      pauseAllProjectVideos();
      updateSpherePlayState();
      if (projectsGrid) projectsGrid.classList.remove('has-hover');
      // Hide the background grid so it disappears fluidly
      if (projectsGrid) projectsGrid.style.visibility = 'hidden';
      if (projectsTitle) projectsTitle.style.visibility = 'hidden';

      // Disable scrolling
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    };

    const startTyping = () => {
      typeProjectDescription(projectDescription);
    };

    window.activeProjectCard = card;

    if (document.startViewTransition) {
      let transition = null;
      try {
        transition = document.startViewTransition(updateDOM);
      } catch (e) {
        transition = null;
      }

      if (transition) {
        transition.ready?.catch(() => {});
        transition.updateCallbackDone?.catch(() => {});
        transition.finished.catch(() => {}).finally(() => {
          startTyping();
        });
        maybeRecoverStuckTransition(true);
      } else {
        updateDOM();
        setTimeout(startTyping, 400);
      }
    } else {
      updateDOM();
      setTimeout(startTyping, 400);
    }
  });
});

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    clearInterval(typeWriterInterval);

    const card = window.activeProjectCard;

    const updateDOM = () => {
      // Hand-off names back to the card for the NEW capture and drop them from
      // the modal, so WebKit never sees duplicate view-transition-names.
      if (card) {
        const videoEl = card.querySelector('video');
        const titleEl = card.querySelector('.project-title');
        if (videoEl) videoEl.style.viewTransitionName = 'project-video-transition';
        if (titleEl) titleEl.style.viewTransitionName = 'project-title-transition';
      }
      modalVideoEl.style.viewTransitionName = 'none';
      modalTitleEl.style.viewTransitionName = 'none';

      projectModal.classList.remove('active');
      projectsModalOpen = false;
      updateSpherePlayState();
      if (projectsGrid) projectsGrid.style.visibility = 'visible';
      if (projectsTitle) projectsTitle.style.visibility = 'visible';
      modalDescEl.classList.remove('typing-cursor');
      modalDescEl.textContent = '';
      if (modalVideoEl) modalVideoEl.pause();

      // Re-enable scrolling
      lenis?.start();
      document.body.style.overflow = '';
    };

    if (document.startViewTransition) {
      let transition = null;
      try {
        transition = document.startViewTransition(updateDOM);
      } catch (e) {
        transition = null;
      }

      if (transition) {
        transition.ready?.catch(() => {});
        transition.updateCallbackDone?.catch(() => {});
        transition.finished.catch(() => {}).finally(() => {
          if (card) {
            const videoEl = card.querySelector('video');
            const titleEl = card.querySelector('.project-title');
            if (videoEl) videoEl.style.viewTransitionName = 'none';
            if (titleEl) titleEl.style.viewTransitionName = 'none';
          }
          window.activeProjectCard = null;
        });
        maybeRecoverStuckTransition(false);
      } else {
        updateDOM();
        window.activeProjectCard = null;
      }
    } else {
      updateDOM();
      window.activeProjectCard = null;
    }
  });
}


// Translate tooltip logic
const translateTooltip = document.getElementById('translate-tooltip');

if (langToggle && translateTooltip) {
  langToggle.addEventListener('mouseenter', () => {
    translateTooltip.style.opacity = '1';
  });
  langToggle.addEventListener('mouseleave', () => {
    translateTooltip.style.opacity = '0';
  });
  langToggle.addEventListener('mousemove', (e) => {
    translateTooltip.style.left = (e.clientX + 15) + 'px';
    translateTooltip.style.top = (e.clientY + 15) + 'px';
  });

}

// Profile picture click to scroll to top
const profilePic = document.querySelector('.profile-pic');
if (profilePic) {
  profilePic.style.cursor = 'pointer';
  profilePic.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Translations logic
const translateDict = {
  ".subtitle": {
    en: "Chilean Civil informatic engineer who loves blending technology with design and modern aesthetics",
    es: "Ingeniero Civil Informático chileno al que le encanta combinar tecnología con diseño y estética moderna"
  },
  ".nav-item[href='#about']": { en: "About", es: "Sobre mí" },
  ".nav-item[href='#projects']": { en: "Playground", es: "Playground" },
  ".nav-item[href='#footer']": { en: "Contact", es: "Contacto" },
  ".intro-text": { en: "THIS<br>IS<br>ME<br>", es: "ESTE<br>SOY<br>YO<br>" },
  // NOTE: nth-child follows the .horizontal-track order (intro-block is child 1).
  // Adding or reordering carousel items means updating these indices.
  ".carousel-item:nth-child(2) .item-title": { en: "IT Engineer", es: "Ingeniero Informático" },
  ".carousel-item:nth-child(2) .item-desc": {
    en: "In my 5th year of Civil Informatics Engineering at Universidad San Sebastián, backed by solid industry experience. I bridge technical rigor with creative exploration, balancing robust enterprise solutions for major brands with experimental sandbox projects.",
    es: "Cursando el 5to año de Ingeniería Civil Informática en la Universidad San Sebastián, respaldado por experiencia profesional en el sector. Combino el rigor técnico con la exploración creativa, equilibrando soluciones robustas para grandes marcas con proyectos experimentales donde pongo a prueba nuevas ideas."
  },
  ".carousel-item:nth-child(3) .item-title": { en: "Music producer", es: "Productor musical" },
  ".carousel-item:nth-child(3) .item-desc": {
    en: "Music production was my first professional venture and remains a vibrant part of my identity. Through my brand Neto Beats, I built an active catalog and a loyal client roster for production and mixing. Today, it serves as both a creative outlet and a growing craft—one I continually bridge with audio engineering and software development.",
    es: "La producción musical fue mi primer trabajo y sigue viva hasta hoy. A través de mi marca Neto Beats, construí un catálogo activo y una comunidad de clientes para producción y mezcla. Hoy es tanto un refugio creativo como un oficio que sigo expandiendo, fusionando el arte sonoro con la ingeniería de software y la tecnología."
  },
  ".carousel-item:nth-child(4) .item-title": { en: "Web designer", es: "Diseñador web" },
  ".carousel-item:nth-child(4) .item-desc": {
    en: "Web design is where my professional experience runs deepest, backed by playground experiments that explore modern interaction. I always had an aesthetic curiosity waiting for the right medium; as my engineering foundation grew, UI/UX became the natural voice for that expression and a signature cornerstone of my brand.",
    es: "El diseño web es el área donde más se concentra mi experiencia profesional, respaldada por proyectos experimentales donde exploro nuevas interacciones. Siempre tuve una inquietud visual latente por expresar; al ganar experiencia técnica, el diseño interactivo se convirtió en el medio natural para canalizarla y en un pilar esencial de mi marca personal."
  },
  ".carousel-item:nth-child(5) .item-title": { en: "Sustainable manager", es: "Gestor de sostenibilidad" },
  ".carousel-item:nth-child(5) .item-desc": {
    en: "Working on projects focused on sustainability and social responsibility opened up a whole new world for me. Being part of a foundation that supports people in need was one of the most meaningful and rewarding experiences of my career. I am grateful for what I learned and for the opportunity to contribute to work that makes a positive difference in people's lives. If you'd like to learn more about the foundation, you can do so <a href=\"https://www.dutchcivilianaction.nl\" target=\"_blank\" rel=\"noopener noreferrer\">here!</a>",
    es: "Trabajar en proyectos enfocados en la sostenibilidad y la responsabilidad social me permitió descubrir un mundo nuevo. Ser parte de una fundación que apoya a personas que lo necesitan fue una de las experiencias más significativas y gratificantes de mi trayectoria. Agradezco todo lo que aprendí y la oportunidad de contribuir a una labor que genera un impacto positivo en la vida de las personas. Si quieres conocer más sobre la fundación, puedes hacerlo <a href=\"https://www.dutchcivilianaction.nl\" target=\"_blank\" rel=\"noopener noreferrer\">aquí.</a>"
  },
  ".carousel-item:nth-child(6) .item-title": { en: "Volleyball player", es: "Jugador de voleibol" },
  ".carousel-item:nth-child(6) .item-desc": {
    en: "Volleyball is what defines my character most. Having played since age 10 and competed professionally since 16, high-performance athletics shaped my mindset—teaching me deep resilience, the power of collective trust, and the discipline needed to constantly transcend personal limits.",
    es: "El voleibol es la faceta que más define mi carácter. Jugando desde los 10 años y compitiendo a nivel profesional desde los 16, el deporte de alto rendimiento moldeó mi mentalidad: me enseñó resiliencia profunda, el valor de la confianza en equipo y la disciplina necesaria para superar constantemente mis propios límites."
  },
  ".title-about": { en: "About", es: "Sobre mí" },
  ".title-featured": { en: "Playground", es: "Playground" },
  // Timeline modal content
  ".stop-1 .timeline-content h3": { en: "Origins", es: "Orígenes" },
  ".stop-1 .timeline-content p": {
    en: "I was born in Santiago, the bustling capital of Chile, but my family's roots lie deeply in rural living. Growing up between these two contrasting environments taught me to appreciate the best of both worlds. I learned to value the boundless freedom, independence, and tranquility of a rural lifestyle, while simultaneously embracing the vibrant energy and diverse social opportunities that a massive city offers. This duality fueled my lifelong dream of traveling the globe to experience new cultures—a dream I proudly achieved later in my life.",
    es: "Nací en Santiago, la ajetreada capital de Chile, pero las raíces de mi familia están profundamente ligadas a la vida rural. Crecer entre estos dos entornos tan contrastantes me enseñó a apreciar lo mejor de ambos mundos. Aprendí a valorar la libertad sin límites, la independencia y la tranquilidad de la vida rural, mientras abrazaba al mismo tiempo la energía vibrante y las diversas oportunidades sociales que ofrece una gran ciudad. Esa dualidad alimentó el sueño de mi vida: recorrer el mundo y conocer nuevas culturas, un sueño que con orgullo cumplí más adelante."
  },
  ".stop-2 .timeline-content h3": { en: "Team work", es: "Trabajo en equipo" },
  ".stop-2 .timeline-content p": {
    en: "Back in fifth grade, I joined my school's volleyball team and immediately fell in love with the sport. As my athletic skills evolved, new doors opened to compete in increasingly prestigious teams, inherently sharpening my teamwork capabilities. One of my proudest achievements was playing for Chile's National Team. Competing at that elite level scaled my skills exponentially—teaching me discipline, high-stakes collaboration, and leadership—many of which I seamlessly apply to my professional life today.",
    es: "En quinto básico me uní al equipo de voleibol de mi colegio y me enamoré de inmediato del deporte. A medida que evolucionaban mis habilidades deportivas, se abrieron nuevas puertas para competir en equipos cada vez más prestigiosos, lo que fue afinando naturalmente mi capacidad de trabajo en equipo. Uno de mis mayores logros fue jugar en la Selección Nacional de Chile. Competir a ese nivel de élite multiplicó mis habilidades: me enseñó disciplina, colaboración bajo presión y liderazgo, muchas de las cuales aplico hoy con naturalidad en mi vida profesional."
  },
  ".stop-3 .timeline-content h3": { en: "Problem solving", es: "Resolución de problemas" },
  ".stop-3 .timeline-content p": {
    en: "My early years in college taught me the true essence of being an engineer. I became deeply fascinated by projects that solve everyday, real-world problems in innovative ways I could never have imagined. Through these challenges, my vision completely transformed; I now see engineering not just as math, but as a vital pillar that humanity simply could not live without. This profound realization inspires my relentless drive to build meaningful projects that make a genuine difference in society.",
    es: "Mis primeros años en la universidad me enseñaron la verdadera esencia de ser ingeniero. Quedé profundamente fascinado por proyectos que resuelven problemas cotidianos y reales de formas innovadoras que jamás habría imaginado. A través de esos desafíos, mi visión se transformó por completo: hoy veo la ingeniería no solo como matemática, sino como un pilar vital sin el cual la humanidad simplemente no podría vivir. Esa comprensión profunda inspira mi impulso constante por construir proyectos significativos que generen un cambio real en la sociedad."
  },
  ".stop-4 .timeline-content h3": { en: "Multicultural awareness", es: "Conciencia multicultural" },
  ".stop-4 .timeline-content p": {
    en: "In 2025, I embarked on an international exchange program to the Netherlands through my university—an adventure that became the most defining experience of my life. I was immersed not just in one new culture, but a rich melting pot of global perspectives. Collaborating closely on a high-impact project with brilliant minds from diverse nationalities pushed my adaptability to the absolute limit. I knew that living in such an advanced nation would accelerate my personal growth, so I made the most of every second. Our project was a massive success, and I proudly maintain lasting connections with both our clients and my remarkable teammates.",
    es: "En 2025 emprendí un intercambio internacional a Países Bajos a través de mi universidad, una aventura que se convirtió en la experiencia más definitoria de mi vida. Me sumergí no en una sola cultura nueva, sino en un rico crisol de perspectivas globales. Colaborar estrechamente en un proyecto de alto impacto con mentes brillantes de diversas nacionalidades llevó mi adaptabilidad al límite absoluto. Sabía que vivir en una nación tan avanzada aceleraría mi crecimiento personal, así que aproveché cada segundo. Nuestro proyecto fue un éxito rotundo y mantengo con orgullo vínculos duraderos tanto con nuestros clientes como con mis notables compañeros de equipo."
  },
  "#versatility-title": { en: "Versatility", es: "Versatilidad" },
  ".ball-scroll-text": { en: "Scroll", es: "Desliza" },
  "#map-modal-close span": { en: "Back to page", es: "Volver a la página" },
  "#final-close-btn-id": { en: "BACK TO PAGE ✕", es: "VOLVER A LA PÁGINA ✕" },
  ".footer-huge-title .word:nth-child(1)": { en: "Let's", es: ":)" },
  ".footer-huge-title .word:nth-child(2)": { en: "Link!", es: "Hablemos!" },
  ".footer-col:nth-child(1) .col-title": { en: "MENU", es: "MENÚ" },
  ".footer-link[href='#home']": { en: "Home", es: "Inicio" },
  ".footer-link[href='#projects']": { en: "Work", es: "Trabajos" },
  ".footer-col:nth-child(2) .col-title": { en: "CONNECT", es: "CONECTAR" },
  ".footer-hello-col .col-title": { en: "SAY HELLO", es: "DI HOLA" },
  ".footer-credits span": { en: "©2026 — All rights reserved", es: "©2026 — Todos los derechos reservados" },
  ".back-to-top": { en: "BACK TO TOP ↑", es: "VOLVER ARRIBA ↑" },
  "#custom-cursor": { en: "see the project", es: "ver proyecto" }
};

const cvLinkSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
const translateDictHTML = {
  ".cv-link": {
    en: cvLinkSvg + "\n            Download CV",
    es: cvLinkSvg + "\n            Descargar CV"
  },
  ".availability": {
    en: '<span class="pulse-dot"></span> Available for work',
    es: '<span class="pulse-dot"></span> Disponible para trabajar'
  },
  ".ball-final-text > p": {
    en: "One thing I am deeply proud of is my relentless drive to specialize in every pursuit I dedicate myself to—whether it be music, computer science, high-level sports, or fashion. While I may not practice all of them at a strictly professional level, I dive deep enough to achieve genuine excellence. This lifelong curiosity has made true <strong>versatility</strong> the core of my identity, allowing me to draw unique inspiration from multiple diverse fields rather than being confined to a single area of expertise.",
    es: "Algo de lo que estoy profundamente orgulloso es mi impulso incansable por especializarme en cada disciplina a la que me dedico: ya sea música, ciencias de la computación, deporte de alto nivel o moda. Aunque no las practique todas a un nivel estrictamente profesional, me sumerjo lo suficiente para alcanzar una excelencia genuina. Esta curiosidad de toda la vida ha convertido la verdadera <strong>versatilidad</strong> en el núcleo de mi identidad, permitiéndome inspirarme de manera única en múltiples campos diversos en lugar de quedarme confinado a una sola área de especialidad."
  }
};

const typewriterPhrases = {
  en: ["Renato Nuñez", "Informatic Engineer", "Experience designer", "Developer"],
  es: ["Renato Nuñez", "Ing. Informático", "Diseñador", "Desarrollador"]
};

// Update translator click logic
if (langToggle && translateTooltip) {
  langToggle.addEventListener('click', () => {
    const isEs = document.documentElement.lang === 'es';
    const nextLang = isEs ? 'en' : 'es';
    document.documentElement.lang = nextLang;

    // Update tooltip
    translateTooltip.textContent = isEs ? 'translate' : 'traducir';

    // Update text content
    Object.keys(translateDict).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.innerHTML = translateDict[selector][nextLang];
        if (el.classList.contains('item-desc')) {
          el.setAttribute('data-original', el.innerText);
          el.setAttribute('data-original-html', el.innerHTML);
        }
      }
    });
    measureAboutDescriptionHeight();

    // Update HTML content
    Object.keys(translateDictHTML).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) el.innerHTML = translateDictHTML[selector][nextLang];
    });

    // Point the CV download to the matching language when available.
    const cvLink = document.querySelector('.cv-link');
    if (cvLink) {
      const isSpanishCv = nextLang === 'es';
      cvLink.href = isSpanishCv
        ? '/Renato%20N%C3%BA%C3%B1ez%20%7C%20Curr%C3%ADculum.pdf'
        : '/resume.pdf';
      cvLink.setAttribute('download', isSpanishCv
        ? 'Renato Núñez | Currículum.pdf'
        : 'Renato Nuñez [ENG] | Resume.pdf');
    }

    // Update typewriter array
    // Phrases is a global variable from earlier in the script.
    // We can't re-assign `phrases` directly if it's `const`, so we update its elements.
    phrases.length = 0;
    phrases.push(...typewriterPhrases[nextLang]);
    // reset typewriter state
    isDeleting = true;
  });
}

const copyToast = document.getElementById('copy-toast');
let copyToastTimer;

function showCopyToast(message) {
  if (!copyToast) return;
  copyToast.textContent = message;
  copyToast.classList.add('visible');
  clearTimeout(copyToastTimer);
  copyToastTimer = setTimeout(() => copyToast.classList.remove('visible'), 2200);
}

document.querySelectorAll('[data-copy-value][data-copy-label]').forEach(button => {
  button.addEventListener('click', async () => {
    const isSpanish = document.documentElement.lang === 'es';
    const value = button.getAttribute('data-copy-value')?.trim();
    const label = button.getAttribute('data-copy-label');
    const translatedLabel = label === 'phone'
      ? (isSpanish ? 'número de teléfono' : 'phone number')
      : (isSpanish ? 'correo' : 'email');

    if (!value) {
      showCopyToast(isSpanish
        ? 'Agrega tu número en index.html, en data-copy-value.'
        : 'Add your phone number in index.html, in data-copy-value.');
      return;
    }

    // Older Safari and non-secure contexts lack the async Clipboard API.
    // Fall back to the legacy textarea + execCommand path before giving up.
    const legacyCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-1000px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, value.length);
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(textarea);
      return copied;
    };

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(value);
      } else if (!legacyCopy()) {
        throw new Error('Clipboard API unavailable');
      }
      showCopyToast(isSpanish
        ? `${translatedLabel} copiado al portapapeles.`
        : `${translatedLabel} copied to clipboard.`);
    } catch (error) {
      console.error(`Could not copy ${translatedLabel} to the clipboard.`, error);
      showCopyToast(isSpanish
        ? `No se pudo copiar el ${translatedLabel}. Revisa los permisos del portapapeles.`
        : `Could not copy the ${translatedLabel}. Check clipboard permissions.`);
    }
  });
});

// Smooth scroll for nav links
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    if (lenis) {
      lenis.scrollTo(targetElement, {
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Map Modal Logic
const moreAboutBtn = document.getElementById('more-about-btn');
const aboutMapModal = document.getElementById('about-map-modal');
const mapModalClose = document.getElementById('map-modal-close');

if (moreAboutBtn && aboutMapModal) {
  moreAboutBtn.addEventListener('click', () => {
    moreAboutBtn.classList.add('launching');

    setTimeout(() => {
      aboutMapModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Reset scroll and timeline state for entrance animation
      if (mapScrollArea) mapScrollArea.scrollTop = 0;
      targetMapProgress = 0;
      currentTrackProgress = 0;
      currentLineProgress = 0;
      entranceAnimationProgress = 0;

      setTimeout(() => {
        moreAboutBtn.classList.remove('launching');
      }, 500);
    }, 400);
  });

  // Periodic gentle elongation invitation for Timeline button
  const timelineArrow = moreAboutBtn.querySelector('.line-dot-arrow');
  if (timelineArrow) {
    setInterval(() => {
      if (!moreAboutBtn.matches(':hover') && !moreAboutBtn.classList.contains('launching')) {
        timelineArrow.classList.add('nudging');
        setTimeout(() => {
          timelineArrow.classList.remove('nudging');
        }, 900);
      }
    }, 3800);
  }

  // Precise mathematical alignment for Timeline T-stem and seamless corner
  function updateTimelineGeometry() {
    const tEl = moreAboutBtn.querySelector('.timeline-t');
    const textEl = moreAboutBtn.querySelector('.more-about-text');
    const arrowEl = moreAboutBtn.querySelector('.line-dot-arrow');
    if (!tEl || !textEl || !arrowEl) return;

    const tRect = tEl.getBoundingClientRect();
    const textRect = textEl.getBoundingClientRect();

    // Exact horizontal center of 'T' relative to .more-about-text container
    const tCenter = (tRect.left + tRect.width / 2) - textRect.left;
    
    // Stem thickness in Outfit (proportional to font-size, ratio ~0.128)
    const stemWidth = Math.max(3.5, Math.round(tRect.width * 0.128 * 2) / 2);
    const stemLeftEdge = tCenter - stemWidth / 2;

    textEl.style.setProperty('--t-center', `${tCenter.toFixed(2)}px`);
    textEl.style.setProperty('--stem-width', `${stemWidth.toFixed(2)}px`);
    textEl.style.setProperty('--stem-left-edge', `${stemLeftEdge.toFixed(2)}px`);
  }

  updateTimelineGeometry();
  if (document.fonts) {
    document.fonts.ready.then(updateTimelineGeometry);
  }
  window.addEventListener('resize', updateTimelineGeometry);
}

// Decoding Effect for Versatility Title
const versatilityTitle = document.getElementById('versatility-title');
if (versatilityTitle) {
  const originalText = versatilityTitle.textContent.trim() || 'Versatility';
  const chars = '!<>-_\\\\/[]{}—=+*^?#________';

  setInterval(() => {
    if (window.isBlackoutActive && Math.random() > 0.2) {
      let glitchedText = originalText.split('');
      const glitchCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < glitchCount; i++) {
        const randomIndex = Math.floor(Math.random() * glitchedText.length);
        glitchedText[randomIndex] = chars[Math.floor(Math.random() * chars.length)];
      }
      versatilityTitle.textContent = glitchedText.join('');

      setTimeout(() => {
        versatilityTitle.textContent = originalText;
      }, 50 + Math.random() * 100);
    }
  }, 800);
}

if (mapModalClose && aboutMapModal) {
  mapModalClose.addEventListener('click', () => {
    setTimelineBlackout(false, window.innerWidth <= 768);
    aboutMapModal.classList.remove('active');
    document.body.style.overflow = '';
  });
}

const finalCloseBtn = document.getElementById('final-close-btn-id');
if (finalCloseBtn && aboutMapModal) {
  finalCloseBtn.addEventListener('click', () => {
    setTimelineBlackout(false, window.innerWidth <= 768);
    aboutMapModal.classList.remove('active');
    document.body.style.overflow = '';
  });
}

// Keyboard users expect Escape to dismiss an open overlay.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (projectModal && projectModal.classList.contains('active') && modalCloseBtn) {
    modalCloseBtn.click();
  } else if (aboutMapModal && aboutMapModal.classList.contains('active') && mapModalClose) {
    mapModalClose.click();
  }
});

// Map Modal Scroll Logic with Lerping
const mapScrollArea = document.getElementById('about-map-modal');
const mapTrack = document.getElementById('map-timeline-track');
const mapStickyViewport = document.querySelector('.map-sticky-viewport');
const waveProgress = document.getElementById('wave-progress');
const waveBall = document.getElementById('wave-ball');
const timelineStops = document.querySelectorAll('.timeline-stop');

let targetMapProgress = 0;
let currentTrackProgress = 0;
let currentLineProgress = 0;
let entranceAnimationProgress = 0;

function setTimelineBlackout(active, isMobile) {
  const wasBlackoutActive = Boolean(window.isBlackoutActive);
  mapStickyViewport?.classList.toggle('timeline-blackout', active);
  aboutMapModal?.classList.toggle('mobile-timeline-blackout', active && isMobile);
  window.isBlackoutActive = active;

  if (active === wasBlackoutActive) return;
  if (active && isMobile) {
    startBlackoutImageSequence();
  } else {
    stopBlackoutImageSequence();
  }
}

if (mapScrollArea) {
  mapScrollArea.addEventListener('scroll', () => {
    const scrollTop = mapScrollArea.scrollTop;
    const scrollHeight = mapScrollArea.scrollHeight - mapScrollArea.clientHeight;
    targetMapProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
  });

  function animateMapTimeline() {
    if (!aboutMapModal.classList.contains('active')) {
      requestAnimationFrame(animateMapTimeline);
      return;
    }

    const isMobile = window.innerWidth <= 768;

    // Smooth lerping, but snap faster at the end for aggressive braking
    let easeFactor = 0.1;
    if (targetMapProgress > 0.8) {
      const endProgress = (targetMapProgress - 0.8) / 0.2;
      easeFactor = 0.1 + (0.05 * endProgress);
    }

    currentTrackProgress += (targetMapProgress - currentTrackProgress) * easeFactor;
    currentLineProgress += (targetMapProgress - currentLineProgress) * (easeFactor * 0.4);

    // Entrance animation progress
    if (entranceAnimationProgress < 1) {
      entranceAnimationProgress += 0.015;
      if (entranceAnimationProgress > 1) entranceAnimationProgress = 1;
    }

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const entranceEased = easeOutCubic(entranceAnimationProgress);

    const waveBallEl = document.getElementById('wave-ball');
    const desktopProgressEl = document.getElementById('wave-progress');
    const mobileProgressEl = document.getElementById('wave-progress-mobile');

    if (!isMobile) {
      // ---------------- DESKTOP (Horizontal Wave) ----------------
      const maxTranslate = window.innerWidth * 2.5;
      const translateX = currentTrackProgress * -maxTranslate;

      if (mapTrack) {
        mapTrack.style.transform = `translateX(${translateX}px)`;
      }

      const lineTranslateX = currentLineProgress * -maxTranslate;
      const screenCenterLine = Math.abs(lineTranslateX) + (window.innerWidth / 2);
      const trackPercentage = (screenCenterLine / (window.innerWidth * 4)) * entranceEased;

      // Ball states
      if (waveBallEl) {
        if (trackPercentage >= 0.749) {
          waveBallEl.classList.add('screen-blackout');
          waveBallEl.classList.remove('final-expanded');
          waveBallEl.classList.remove('expanded');
          setTimelineBlackout(true, false);
        } else if (trackPercentage >= 0.745) {
          waveBallEl.classList.add('final-expanded');
          waveBallEl.classList.remove('screen-blackout');
          waveBallEl.classList.remove('expanded');
          setTimelineBlackout(false, false);
        } else if (currentTrackProgress > 0.02) {
          waveBallEl.classList.remove('screen-blackout');
          waveBallEl.classList.remove('final-expanded');
          waveBallEl.classList.remove('expanded');
          setTimelineBlackout(false, false);
        } else {
          waveBallEl.classList.remove('screen-blackout');
          waveBallEl.classList.remove('final-expanded');
          waveBallEl.classList.add('expanded');
          setTimelineBlackout(false, false);
        }
      }

      if (desktopProgressEl) {
        const pathLength = desktopProgressEl.getTotalLength() || 4500;
        let clampedTrackPercentage = Math.min(0.75, trackPercentage);
        const drawLength = Math.max(0, pathLength * clampedTrackPercentage);

        desktopProgressEl.style.strokeDasharray = pathLength;
        desktopProgressEl.style.strokeDashoffset = pathLength - drawLength;

        if (waveBallEl && desktopProgressEl.getPointAtLength) {
          const point = desktopProgressEl.getPointAtLength(drawLength);
          waveBall.style.left = `${(point.x / 4000) * 100}%`;
          waveBall.style.top = `${(point.y / 800) * 100}%`;
        }
      }

      timelineStops.forEach(stop => {
        const leftVw = parseFloat(stop.style.left);
        const stopPercentage = leftVw / 400;
        if (trackPercentage >= stopPercentage - 0.01) {
          stop.classList.add('visible');
        } else {
          stop.classList.remove('visible');
        }
      });

    } else {
      // ---------------- MOBILE (Vertical Wave) ----------------
      const totalTrackHeight = 4700;
      // Scroll vertically to center the final element at end of scroll
      const maxTranslateY = totalTrackHeight - (window.innerHeight * 0.55);
      const translateY = currentTrackProgress * -maxTranslateY;

      if (mapTrack) {
        mapTrack.style.transform = `translateY(${translateY}px)`;
      }

      const lineTranslateY = currentLineProgress * -maxTranslateY;
      const screenCenterLineY = Math.abs(lineTranslateY) + (window.innerHeight / 2);
      const trackPercentage = (screenCenterLineY / totalTrackHeight) * entranceEased;
      let ballPathY = 0;

      // Ball states for mobile
      if (waveBallEl) {
        if (trackPercentage >= 0.90) {
          waveBallEl.classList.add('screen-blackout');
          waveBallEl.classList.remove('final-expanded');
          waveBallEl.classList.remove('expanded');
          setTimelineBlackout(true, true);
        } else if (trackPercentage >= 0.88) {
          waveBallEl.classList.add('final-expanded');
          waveBallEl.classList.remove('screen-blackout');
          waveBallEl.classList.remove('expanded');
          setTimelineBlackout(false, true);
        } else if (currentTrackProgress > 0.02) {
          waveBallEl.classList.remove('screen-blackout');
          waveBallEl.classList.remove('final-expanded');
          waveBallEl.classList.remove('expanded');
          setTimelineBlackout(false, true);
        } else {
          waveBallEl.classList.remove('screen-blackout');
          waveBallEl.classList.remove('final-expanded');
          waveBallEl.classList.add('expanded');
          setTimelineBlackout(false, true);
        }
      }

      if (mobileProgressEl) {
        const pathLength = mobileProgressEl.getTotalLength() || 4800;
        const pathPositionY = Math.min(totalTrackHeight * 0.96, screenCenterLineY * entranceEased);
        let low = 0;
        let high = pathLength;

        for (let i = 0; i < 14; i++) {
          const middle = (low + high) / 2;
          if (mobileProgressEl.getPointAtLength(middle).y < pathPositionY) {
            low = middle;
          } else {
            high = middle;
          }
        }

        const drawLength = pathPositionY === 0 ? 0 : (low + high) / 2;

        mobileProgressEl.style.strokeDasharray = pathLength;
        mobileProgressEl.style.strokeDashoffset = pathLength - drawLength;

        if (waveBallEl && mobileProgressEl.getPointAtLength) {
          const point = mobileProgressEl.getPointAtLength(drawLength);
          ballPathY = point.y;
          waveBall.style.left = `${(point.x / 400) * 100}%`;
          waveBall.style.top = `${(point.y / totalTrackHeight) * 100}%`;
        }
      }

      timelineStops.forEach(stop => {
        if (ballPathY >= stop.offsetTop) {
          stop.classList.add('visible');
        } else {
          stop.classList.remove('visible');
        }
      });
    }

    requestAnimationFrame(animateMapTimeline);
  }

  // Start loop
  animateMapTimeline();
}

const trailContainer = document.getElementById('image-trail-container');
const trailImages = [
  'USS.jpg',
  'design.png',
  'voleyUSS.jpeg',
  'coding.jpeg',
  'murano.JPG',
  'parlantes.jpeg'
];
let trailIndex = 0;
let lastTrailPos = { x: 0, y: 0 };

if (trailContainer) {
  document.addEventListener('mousemove', event => {
    if (!window.isBlackoutActive || window.innerWidth <= 768) return;

    const distance = Math.hypot(event.clientX - lastTrailPos.x, event.clientY - lastTrailPos.y);
    if (distance <= 130) return;

    lastTrailPos = { x: event.clientX, y: event.clientY };
    const rect = trailContainer.getBoundingClientRect();
    const image = document.createElement('img');
    image.src = `/${trailImages[trailIndex]}`;
    image.className = 'trail-image';
    image.style.left = `${event.clientX - rect.left}px`;
    image.style.top = `${event.clientY - rect.top}px`;
    trailContainer.appendChild(image);
    image.getBoundingClientRect();
    image.style.transform = 'translate(-50%, -50%) scale(1)';
    image.style.opacity = '1';

    window.setTimeout(() => {
      image.style.opacity = '0';
      window.setTimeout(() => image.remove(), 400);
    }, 500);

    trailIndex = (trailIndex + 1) % trailImages.length;
  });
}

const blackoutImages = document.querySelector('.blackout-images');
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let blackoutImageTimer = null;

function stopBlackoutImageSequence() {
  if (blackoutImageTimer !== null) {
    window.clearTimeout(blackoutImageTimer);
    blackoutImageTimer = null;
  }
  blackoutImages?.classList.remove('is-visible');
}

function startBlackoutImageSequence() {
  if (!blackoutImages) return;
  const revealImages = () => {
    blackoutImageTimer = null;
    if (!window.isBlackoutActive || window.innerWidth > 768) return;
    blackoutImages.classList.add('is-visible');
  };

  if (reducedMotionPreference.matches) {
    revealImages();
  } else {
    blackoutImageTimer = window.setTimeout(revealImages, 1550);
  }
}

reducedMotionPreference.addEventListener('change', () => {
  stopBlackoutImageSequence();
  if (window.isBlackoutActive && window.innerWidth <= 768) {
    startBlackoutImageSequence();
  }
});
