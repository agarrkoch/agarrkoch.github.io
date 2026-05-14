(() => {
  /* ── Config ───────────────────────────────────────────── */
  const JSON_URL   = 'archive_images.json';
  const BATCH_SIZE = 20;
  const IO_MARGIN  = '400px';

  /* ── State ────────────────────────────────────────────── */
  let images    = [];
  let cursor    = 0;
  let loading   = false;
  let exhausted = false;
  let cols      = getColCount();
  let columnEls = [];

  /* ── DOM refs ─────────────────────────────────────────── */
  const gallery  = document.getElementById('gallery');
  const sentinel = document.getElementById('sentinel');
  const loader   = document.getElementById('loader');
  const countEl  = document.getElementById('image-count');
  const emptyEl  = document.getElementById('empty');
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const lbClose  = document.getElementById('lightbox-close');

  /* ── Column helpers ───────────────────────────────────── */
  function getColCount() {
    if (window.innerWidth <= 500) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function buildColumns(n) {
    gallery.innerHTML = '';
    return Array.from({ length: n }, () => {
      const col = document.createElement('div');
      col.className = 'column';
      gallery.appendChild(col);
      return col;
    });
  }

  /* ── Create one image card ────────────────────────────── */
  function createCard(src, globalIndex) {
    const wrap = document.createElement('div');
    wrap.className = 'img-wrap';
    wrap.tabIndex  = 0;
    wrap.setAttribute('role', 'listitem');
    wrap.style.animationDelay = `${(globalIndex % BATCH_SIZE) * 30}ms`;

    const img    = document.createElement('img');
    img.src      = src;
    img.alt      = `Image ${globalIndex + 1}`;
    img.loading  = 'lazy';
    img.decoding = 'async';

    const open = () => openLightbox(src, img.alt);
    wrap.addEventListener('click', open);
    wrap.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    wrap.appendChild(img);
    return wrap;
  }

  /* ── Load next batch ──────────────────────────────────── */
  function loadBatch() {
    if (loading || exhausted) return;
    loading = true;
    loader.classList.add('visible');

    requestAnimationFrame(() => {
      const end = Math.min(cursor + BATCH_SIZE, images.length);

      for (let i = cursor; i < end; i++) {
        // Row-by-row distribution: image i → column (i % cols)
        // Preserves left→right JSON order within each row,
        // while columns collapse vertically for masonry effect.
        const colIndex = i % cols;
        columnEls[colIndex].appendChild(createCard(images[i], i));
      }

      cursor  = end;
      loading = false;
      loader.classList.remove('visible');

      if (cursor >= images.length) {
        exhausted = true;
        observer.disconnect();
      }
    });
  }

  /* ── Responsive rebuild (debounced) ───────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newCols = getColCount();
      if (newCols === cols) return;
      cols      = newCols;
      cursor    = 0;
      exhausted = false;
      columnEls = buildColumns(cols);
      loadBatch();
      if (!exhausted) observer.observe(sentinel);
    }, 200);
  });

  /* ── Intersection observer ────────────────────────────── */
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
    lbImg.src = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* ── Boot ─────────────────────────────────────────────── */
  fetch('archive_images.json')
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      images = Array.isArray(data) ? data : [];
      if (images.length === 0) { emptyEl.classList.add('show'); return; }
      countEl.textContent = `${images.length.toLocaleString()} images`;
      columnEls = buildColumns(cols);
      loadBatch();
      observer.observe(sentinel);
    })
    .catch(err => {
      console.error('Gallery: could not load archive_images.json', err);
      emptyEl.classList.add('show');
    });
})();
