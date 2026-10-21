const q = document.querySelector('#search');
const entries = [...document.querySelectorAll('.entry')];

function initializeLanguageSwitch() {
  const languageLink = document.querySelector('.lang a');
  if (!languageLink || !entries.length) return;

  const toolbar = document.querySelector('.toolbar');
  const entryScrollMargin = (toolbar?.offsetHeight || 0) + 16;
  const targetPage = languageLink.getAttribute('href');
  let syncFrame = null;
  let userScrollIntent = false;

  entries.forEach((entry) => {
    const dateText = entry.querySelector('.date')?.textContent || '';
    const match = dateText.match(/(\d{4})\/(\d{2})\/(\d{2})/);
    if (!match) return;

    const date = `${match[1]}-${match[2]}-${match[3]}`;
    entry.dataset.date = date;
    entry.id = `entry-${date}`;
    entry.style.scrollMarginTop = `${entryScrollMargin}px`;
  });

  function findCurrentEntry() {
    const visibleEntries = entries.filter((entry) => !entry.classList.contains('hidden'));
    if (!visibleEntries.length) return null;

    const toolbarBottom = toolbar?.getBoundingClientRect().bottom || 0;
    const anchoredEntry = window.location.hash.startsWith('#entry-')
      ? document.querySelector(window.location.hash)
      : null;
    const anchoredRect = anchoredEntry?.getBoundingClientRect();
    const anchoredEntryIsVisible = anchoredEntry && !anchoredEntry.classList.contains('hidden')
      && anchoredRect.bottom > toolbarBottom && anchoredRect.top < window.innerHeight;
    const viewportCenter = (toolbarBottom + window.innerHeight) / 2;
    const dominantEntry = visibleEntries.reduce((best, entry) => {
      const rect = entry.getBoundingClientRect();
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, toolbarBottom),
      );
      const centerDistance = Math.abs((rect.top + rect.bottom) / 2 - viewportCenter);
      if (!best || visibleHeight > best.visibleHeight
        || (visibleHeight === best.visibleHeight && centerDistance < best.centerDistance)) {
        return { entry, visibleHeight, centerDistance };
      }
      return best;
    }, null)?.entry;
    return anchoredEntryIsVisible ? anchoredEntry : dominantEntry;
  }

  function syncCurrentDate() {
    syncFrame = null;
    const currentEntry = findCurrentEntry();
    if (!currentEntry?.id) return;
    const target = new URL(targetPage, window.location.href);
    target.hash = currentEntry.id;
    languageLink.href = target.href;

    if (window.location.hash !== `#${currentEntry.id}`) {
      window.history.replaceState(null, '', `#${currentEntry.id}`);
    }
  }

  function markUserScrollIntent() {
    userScrollIntent = true;
  }

  function ensureAnchorScrollSpace() {
    document.body.style.paddingBottom = `${window.innerHeight}px`;
  }

  function scheduleSync() {
    if (!userScrollIntent) return;
    if (syncFrame !== null) return;
    syncFrame = requestAnimationFrame(syncCurrentDate);
  }

  window.addEventListener('wheel', markUserScrollIntent, { passive: true });
  window.addEventListener('touchstart', markUserScrollIntent, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
      markUserScrollIntent();
    }
  });
  window.addEventListener('scroll', scheduleSync, { passive: true });

  if (window.location.hash.startsWith('#entry-')) {
    const targetEntry = document.querySelector(window.location.hash);
    if (targetEntry) {
      document.documentElement.style.overflowAnchor = 'none';
      document.body.style.overflowAnchor = 'none';
      const alignTargetEntry = () => {
        if (userScrollIntent) return;
        ensureAnchorScrollSpace();
        targetEntry.scrollIntoView();
      };
      requestAnimationFrame(() => {
        alignTargetEntry();
        window.setTimeout(alignTargetEntry, 300);
        window.setTimeout(alignTargetEntry, 1200);
        window.setTimeout(alignTargetEntry, 3000);
      });
      window.addEventListener('load', alignTargetEntry, { once: true });
      document.fonts?.ready.then(alignTargetEntry);
      document.querySelectorAll('img').forEach((image) => {
        if (!image.complete) image.addEventListener('load', alignTargetEntry, { once: true });
      });
      const target = new URL(targetPage, window.location.href);
      target.hash = targetEntry.id;
      languageLink.href = target.href;
    }
  } else {
    scheduleSync();
  }
}

function filter(term) {
  term = (term || '').toLowerCase().trim();
  entries.forEach((entry) => {
    entry.classList.toggle('hidden', term && !entry.dataset.text.includes(term));
  });
}

q?.addEventListener('input', (event) => filter(event.target.value));
document.querySelectorAll('.chip').forEach((button) => button.addEventListener('click', () => {
  q.value = button.dataset.keyword;
  filter(q.value);
  window.scrollTo({ top: document.querySelector('.toolbar').offsetTop, behavior: 'smooth' });
}));

function initializeLightbox() {
  const photoLinks = [...document.querySelectorAll('.photo-link')];
  if (!photoLinks.length) return;

  const isJapanese = document.documentElement.lang === 'ja';
  const labels = isJapanese
    ? { dialog: '写真の拡大表示', close: '閉じる', previous: '前の写真', next: '次の写真', position: (current, total) => `${current} / ${total}` }
    : { dialog: 'Enlarged photo', close: 'Close', previous: 'Previous photo', next: 'Next photo', position: (current, total) => `${current} / ${total}` };

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', labels.dialog);
  lightbox.innerHTML = `
    <div class="lightbox__content">
      <button class="lightbox__close" type="button" aria-label="${labels.close}">&times;</button>
      <button class="lightbox__nav lightbox__nav--previous" type="button" aria-label="${labels.previous}">&#10094;</button>
      <figure class="lightbox__figure">
        <img class="lightbox__image" alt="">
        <figcaption class="lightbox__caption">
          <span class="lightbox__description"></span>
          <span class="lightbox__position" aria-live="polite"></span>
        </figcaption>
      </figure>
      <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="${labels.next}">&#10095;</button>
    </div>`;
  document.body.append(lightbox);

  const image = lightbox.querySelector('.lightbox__image');
  const description = lightbox.querySelector('.lightbox__description');
  const position = lightbox.querySelector('.lightbox__position');
  const closeButton = lightbox.querySelector('.lightbox__close');
  const previousButton = lightbox.querySelector('.lightbox__nav--previous');
  const nextButton = lightbox.querySelector('.lightbox__nav--next');
  const backgroundElements = [...document.body.children].filter((element) => element !== lightbox);
  let activeLinks = [];
  let activeIndex = 0;
  let returnFocus = null;
  let previousInertStates = [];

  function showPhoto(index) {
    activeIndex = index;
    const link = activeLinks[activeIndex];
    const thumbnail = link.querySelector('img');
    image.src = link.href;
    image.alt = thumbnail?.alt || '';
    description.textContent = thumbnail?.alt || '';
    position.textContent = labels.position(activeIndex + 1, activeLinks.length);
    previousButton.setAttribute('aria-disabled', activeIndex === 0 ? 'true' : 'false');
    nextButton.setAttribute('aria-disabled', activeIndex === activeLinks.length - 1 ? 'true' : 'false');
  }

  function openLightbox(link) {
    activeLinks = [...link.closest('.entry').querySelectorAll('.photo-link')];
    activeIndex = activeLinks.indexOf(link);
    returnFocus = link;
    showPhoto(activeIndex);
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    previousInertStates = backgroundElements.map((element) => element.inert);
    backgroundElements.forEach((element) => { element.inert = true; });
    closeButton.focus();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    image.removeAttribute('src');
    document.body.classList.remove('lightbox-open');
    backgroundElements.forEach((element, index) => { element.inert = previousInertStates[index]; });
    returnFocus?.focus();
  }

  function move(offset) {
    const nextIndex = activeIndex + offset;
    if (nextIndex >= 0 && nextIndex < activeLinks.length) showPhoto(nextIndex);
  }

  photoLinks.forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openLightbox(link);
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  previousButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
    if (event.key !== 'Tab') return;

    const controls = [closeButton, previousButton, nextButton];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

initializeLanguageSwitch();
initializeLightbox();
