<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  export let items = [];

  const dispatch = createEventDispatcher();
  let trackEl;
  let cardWidth = 0;
  let ro;
  let io; // intersection observer
  let activeIndex = 0;
  // image overlay state is handled separately (openOverlay)

  function updateWidth() {
    if (trackEl) cardWidth = trackEl.clientWidth;
  }

  onMount(() => {
    updateWidth();
    ro = new ResizeObserver(updateWidth);
    if (trackEl) ro.observe(trackEl);

    // keyboard navigation (global) — keeps markup accessible
    const handler = (e) => onKey(e);
    window.addEventListener('keydown', handler);
  // overlay-specific keyboard handling (Esc, Left/Right)
  window.addEventListener('keydown', overlayKeydown);

    // intersection observer to detect which card is active (centered)
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            if (!Number.isNaN(idx)) {
              activeIndex = idx;
              dispatch('change', idx);
            }
          }
        });
      },
      { root: trackEl, threshold: 0.6 }
    );

    // observe cards once rendered
    const cards = trackEl?.querySelectorAll('.card') ?? [];
    cards.forEach((c) => io.observe(c));

    return () => {
      ro?.disconnect();
      io?.disconnect();
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keydown', overlayKeydown);
    };
  });

  onDestroy(() => {
    ro?.disconnect();
    io?.disconnect();
  });

  function scrollNext() {
    if (!trackEl) return;
    const maxScrollLeft = trackEl.scrollWidth - trackEl.clientWidth;
    const nextTarget = Math.min(Math.round(trackEl.scrollLeft + cardWidth), maxScrollLeft);
    // if we're at (or very near) the end, wrap back to the start
    const atEnd = trackEl.scrollLeft >= Math.max(0, maxScrollLeft - 2);
    const target = atEnd ? 0 : nextTarget;
    if (Math.abs(trackEl.scrollLeft - target) < 1) return;
    trackEl.scrollTo({ left: target, behavior: 'smooth' });
  }

  // previous/back navigation intentionally removed; UX is forward-only with wrap.

  function goTo(index) {
    if (!trackEl) return;
    const maxScrollLeft = trackEl.scrollWidth - trackEl.clientWidth;
    const target = Math.min(Math.max(Math.round(index * cardWidth), 0), maxScrollLeft);
    trackEl.scrollTo({ left: target, behavior: 'smooth' });
  }

  // only forward navigation is needed (ArrowRight). ArrowLeft/back is intentionally ignored.
  function onKey(e) {
    if (e.key === 'ArrowRight') scrollNext();
  }

  // Overlay image viewer state & controls
  let overlayOpen = false;
  let overlayImages = [];
  let overlayIndex = 0;
  let overlayImgLoaded = false;

  function openOverlay(images, start = 0) {
    if (!images || images.length === 0) return;
    overlayImages = images;
    overlayIndex = Math.max(0, Math.min(start, images.length - 1));
    overlayOpen = true;
    overlayImgLoaded = false;
    document.body.style.overflow = 'hidden';
    preloadNeighbors(overlayIndex);
  }

  function closeOverlay() {
    overlayOpen = false;
    overlayImages = [];
    overlayIndex = 0;
    overlayImgLoaded = false;
    document.body.style.overflow = '';
  }

  function setOverlayIndex(idx) {
    if (!overlayImages || overlayImages.length === 0) return;
    overlayImgLoaded = false;
    overlayIndex = (idx + overlayImages.length) % overlayImages.length;
    preloadNeighbors(overlayIndex);
  }

  function nextOverlay() {
    setOverlayIndex(overlayIndex + 1);
  }

  function prevOverlay() {
    setOverlayIndex(overlayIndex - 1);
  }

  function overlayKeydown(e) {
    if (!overlayOpen) return;
    if (e.key === 'Escape') closeOverlay();
    if (e.key === 'ArrowRight') nextOverlay();
    if (e.key === 'ArrowLeft') prevOverlay();
  }

  // preload neighbor images for instant navigation
  function preloadNeighbors(idx) {
    if (!overlayImages || overlayImages.length <= 1) return;
    const next = overlayImages[(idx + 1) % overlayImages.length];
    const prev = overlayImages[(idx - 1 + overlayImages.length) % overlayImages.length];
    [next, prev].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  // touch/swipe for overlay
  let touchStartX = 0;
  let touchEndX = 0;
  function onTouchStart(e) { touchStartX = e.touches?.[0]?.clientX ?? 0; }
  function onTouchMove(e) { touchEndX = e.touches?.[0]?.clientX ?? 0; }
  function onTouchEnd() {
    const dx = touchStartX - touchEndX;
    const threshold = 40;
    if (dx > threshold) nextOverlay();
    else if (dx < -threshold) prevOverlay();
    touchStartX = touchEndX = 0;
  }
</script>

<style>
  :root{--bg:#f7f8fa;--card:#fff;--muted:#8b8b8b;--accent:#222}
  .viewport{width:100%;max-width:920px;margin:0 auto;padding:0}
  .track{display:flex;gap:0;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:1rem;scroll-padding:0;scrollbar-width:none}
  .track::-webkit-scrollbar{display:none}

  .card{scroll-snap-align:start;min-width:100%;flex:0 0 100%;background:var(--card);border:1px solid #ececec;border-radius:12px;padding:1.2rem 1.2rem 1rem 1.2rem;box-shadow:0 6px 20px rgba(11,15,20,0.03);display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-height:140px;color:var(--accent);transform:translateY(-6px);opacity:.98;transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .2s}
  .card h3{margin:0 0 .5rem;font-size:1.05rem}
  .card.active{transform:translateY(0);box-shadow:0 10px 30px rgba(11,15,20,0.06);border-color:#e0e0e0}

  .content{width:100%;color:#444;line-height:1.6;text-align:left;}
  .content :global(h1),
  .content :global(h2),
  .content :global(h3) {
    margin:.6rem 0;
  }
  .content :global(p){margin:.45rem 0}
  .content :global(code){background:#f3f4f6;padding:.1rem .3rem;border-radius:4px;font-family:monospace}
  
  .image-toggle{
    display:inline-flex;
    align-items:center;
    gap:0.5rem;
    margin:1rem 0 0;
    padding:0.5rem 0.8rem;
    border-radius:6px;
    background:transparent;
    border:1px solid rgba(0,0,0,0.1);
    color:var(--accent);
    font-size:0.9rem;
    cursor:pointer;
    transition:all 0.2s ease;
  }
  .image-toggle:hover{
    background:rgba(0,0,0,0.03);
    border-color:rgba(0,0,0,0.15);
  }
  .image-toggle svg{
    width:18px;
    height:18px;
  }
  .image-toggle svg line{
    transition:transform 0.2s ease;
    transform-origin:center;
  }
  .image-toggle.expanded .vertical-line{
    transform:scaleY(0);
  }

  /* Thumbnails inside the card */
  .thumbs{display:flex;align-items:center;gap:.5rem;margin-left:.5rem}
  .thumb{width:56px;height:40px;object-fit:cover;border-radius:6px;cursor:pointer;box-shadow:0 6px 18px rgba(6,12,20,0.08)}
  .thumb-btn{padding:0;border:0;background:transparent;border-radius:6px;display:inline-flex;overflow:hidden}
  .thumb-btn:focus{outline:2px solid rgba(31,41,55,0.12);outline-offset:2px}

  /* Overlay styles for fullscreen viewer with fade/zoom */
  .overlay{
    position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1200;padding:1.25rem;
    background:rgba(6,8,10,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  }
  .overlay-content{display:flex;align-items:center;gap:1rem;max-width:1200px;width:100%;height:100%;box-sizing:border-box}
  .overlay-image-wrap{flex:1 1 auto;display:flex;align-items:center;justify-content:center;position:relative;max-height:100%;overflow:hidden}
  .overlay-image{max-width:100%;max-height:100%;width:auto;height:auto;border-radius:8px;box-shadow:0 8px 30px rgba(2,6,23,0.6);transform-origin:center;transition:transform .32s cubic-bezier(.2,.9,.2,1),opacity .28s ease;opacity:0;transform:scale(1.05)}
  .overlay-image.loaded{opacity:1;transform:scale(1)}
  .overlay-prev,.overlay-next{background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.08);width:52px;height:52px;border-radius:12px;font-size:28px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
  .overlay-close{position:absolute;top:1rem;right:1rem;background:transparent;color:#fff;border:none;font-size:20px;cursor:pointer;z-index:1210;padding:.4rem .6rem;border-radius:6px}
  .overlay-counter{position:absolute;bottom:12px;right:12px;color:rgba(255,255,255,0.95);font-size:13px;background:rgba(0,0,0,0.35);padding:6px 8px;border-radius:6px}

  .controls{display:flex;justify-content:center;gap:1rem;margin-top:1rem}
  .arrow{background:transparent;border:1px solid #d0d0d0;color:var(--accent);padding:.5rem .8rem;border-radius:8px;cursor:pointer;font-weight:600}
  .arrow:hover{background:#f3f4f6}

  /* indicators removed (forward-only UX) */
</style>

<div class="viewport" role="region" aria-label="Snippet carousel">
  <div bind:this={trackEl} class="track" role="list" aria-label="Snippets">
    {#each items as it, i}
      <article class="card {i === activeIndex ? 'active' : ''}" role="listitem" data-index={i}>
        <h3>{it.title}</h3>
        <div class="content">
          {@html it.snippet}
          {#if it.images && it.images.length > 0}
            <div class="image-toggle">
              <button 
                class="open-images"
                on:click={() => openOverlay(it.images, 0)}
                aria-label="Show images"
              >
                <span class="plus">+</span>
                <span class="label">Show images</span>
              </button>

              <div class="thumbs">
                {#each it.images as imageUrl, imgIdx}
                  <button class="thumb-btn" on:click={() => openOverlay(it.images, imgIdx)} aria-label={`Open image ${imgIdx + 1}`}>
                    <img
                      src={imageUrl}
                      alt={it.title}
                      loading="lazy"
                      class="thumb"
                    />
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        {#if it.meta}
          <small>{it.meta}</small>
        {/if}
      </article>
    {/each}
  </div>

  {#if items && items.length > 1}
    <div class="controls">
      <button class="arrow" on:click={scrollNext} aria-label="Next">▶</button>
    </div>
  {/if}
  
  {#if overlayOpen}
  <div class="overlay" role="dialog" aria-modal="true" tabindex="0" on:click|self={closeOverlay}>
      <button class="overlay-close" on:click={closeOverlay} aria-label="Close (Esc)">✕</button>
      <div class="overlay-content" on:touchstart={onTouchStart} on:touchmove={onTouchMove} on:touchend={onTouchEnd}>
        <button class="overlay-prev" on:click|stopPropagation={prevOverlay} aria-label="Previous image">‹</button>

        <div class="overlay-image-wrap">
          <img
            src={overlayImages[overlayIndex]}
            alt={`Image ${overlayIndex + 1} of ${overlayImages.length}`}
            class="overlay-image {overlayImgLoaded ? 'loaded' : ''}"
            on:load={() => { overlayImgLoaded = true; }}
            loading="eager"
          />
          {#if overlayImages.length > 1}
            <div class="overlay-counter">{overlayIndex + 1} / {overlayImages.length}</div>
          {/if}
        </div>

        <button class="overlay-next" on:click|stopPropagation={nextOverlay} aria-label="Next image">›</button>
      </div>
    </div>
  {/if}
</div>
