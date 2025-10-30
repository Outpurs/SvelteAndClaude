<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  export let items = [];

  const dispatch = createEventDispatcher();
  let trackEl;
  let cardWidth = 0;
  let ro;
  let io; // intersection observer
  let activeIndex = 0;

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
</script>

<style>
  :root{--bg:#f7f8fa;--card:#fff;--muted:#8b8b8b;--accent:#222}
  .viewport{width:100%;max-width:920px;margin:0 auto;padding:0}
  .track{display:flex;gap:0;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:1rem;scroll-padding:0;scrollbar-width:none}
  .track::-webkit-scrollbar{display:none}

  .card{scroll-snap-align:start;min-width:100%;flex:0 0 100%;background:var(--card);border:1px solid #ececec;border-radius:12px;padding:2rem;box-shadow:0 6px 20px rgba(11,15,20,0.03);display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-height:220px;color:var(--accent);transform:translateY(-6px);opacity:.98;transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .2s}
  .card h3{margin:0 0 .5rem;font-size:1.05rem}
  .card.active{transform:translateY(0);box-shadow:0 10px 30px rgba(11,15,20,0.06);border-color:#e0e0e0}

  .content{width:100%;color:#444;line-height:1.6}
  .content :global(h1),
  .content :global(h2),
  .content :global(h3) {
    margin:.6rem 0;
  }
  .content :global(p){margin:.45rem 0}
  .content :global(code){background:#f3f4f6;padding:.1rem .3rem;border-radius:4px;font-family:monospace}
  
  .image-container{margin:1.5rem 0 1rem;border-radius:8px;overflow:hidden}
  .image-container img{
    width:100%;
    height:auto;
    display:block;
    border-radius:8px;
    margin-bottom:1rem;
    box-shadow:0 2px 8px rgba(0,0,0,0.08);
  }
  .image-container img:last-child{margin-bottom:0}

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
            <div class="image-container">
              {#each it.images as imageUrl}
                <img 
                  src={imageUrl} 
                  alt={it.title}
                  loading="lazy"
                  width="100%"
                />
              {/each}
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
</div>
