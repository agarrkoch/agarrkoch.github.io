(() => {
  /* ── Config ───────────────────────────────────────────── */
  const JSON_URL   = 'archive_images.json';
  const BATCH_SIZE = 20;
  const IO_MARGIN  = '400px'; // how far ahead to trigger the next load

  /* ── State ────────────────────────────────────────────── */
  let images  = [];  // full list from JSON
  let cursor  = 0;   // next image to render
  let loading = false;
  let exhausted = false;

  /* ── DOM refs ─────────────────────────────────────────── */
  const gallery   = document.getElementById('gallery');
  const sentinel  = document.getElementById('sentinel');
  const loader    = document.getElementById('loader');
  const countEl   = document.getElementById('image-count');
  const emptyEl   = document.getElementById('empty');
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbClose   = document.getElementById('lightbox-close');

  /* ─────────────────────────────────────────────────────── *
   *  GRID ORDER
   *  CSS Grid with grid-template-columns + auto-placement
   *  fills cells left-to-right, top-to-bottom automatically.
   *  No column tracking needed — just append in JSON order.
   * ─────────────────────────────────────────────────────── */

  /* ── Create one image card ────────────────────────────── */
  function createCard(src, globalIndex) {
    const wrap = document.createElement('div');
    wrap.className  = 'img-wrap';
    wrap.tabIndex   = 0;
    wrap.setAttribute('role', 'listitem');
    // stagger entrance animation within the batch
    wrap.style.animationDelay = `${(globalIndex % BATCH_SIZE) * 30}ms`;

    const img     = document.createElement('img');
    img.src       = src;
    img.alt       = `Image ${globalIndex + 1}`;
    img.loading   = 'lazy';
    img.decoding  = 'async';

    // open lightbox on click or keyboard
    const open = () => openLightbox(src, img.alt);
    wrap.addEventListener('click', open);
    wrap.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    wrap.appendChild(img);
    return wrap;
  }

  /* ── Load the next batch ──────────────────────────────── */
  function loadBatch() {
    if (loading || exhausted) return;
    loading = true;
    loader.classList.add('visible');

    // Use rAF so DOM writes are batched in one paint cycle
    requestAnimationFrame(() => {
      const end = Math.min(cursor + BATCH_SIZE, images.length);

      // Build a fragment to minimise reflows
      const frag = document.createDocumentFragment();
      for (let i = cursor; i < end; i++) {
        frag.appendChild(createCard(images[i], i));
      }
      gallery.appendChild(frag);

      cursor  = end;
      loading = false;
      loader.classList.remove('visible');

      if (cursor >= images.length) {
        exhausted = true;
        observer.disconnect();
      }
    });
  }

  /* ── Intersection Observer (infinite scroll) ──────────── */
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) loadBatch();
  }, { rootMargin: IO_MARGIN });

  /* ── Lightbox ─────────────────────────────────────────── */
  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = ''; // release memory
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ── Boot: fetch JSON, then kick off ──────────────────── */
  fetch(JSON_URL)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      images = Array.isArray(data) ? data : [];

      if (images.length === 0) {
        emptyEl.classList.add('show');
        return;
      }

      countEl.textContent = `${images.length.toLocaleString()} images`;
      loadBatch();
      observer.observe(sentinel);
    })
    .catch(err => {
      console.error('Gallery: could not load', JSON_URL, err);
      emptyEl.classList.add('show');
    });

})();
