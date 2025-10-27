<script>
  import { onMount, onDestroy } from 'svelte';
  export let items = [];

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
            if (!Number.isNaN(idx)) activeIndex = idx;
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
    trackEl.scrollBy({ left: Math.round(cardWidth), behavior: 'smooth' });
  }

  function scrollPrev() {
    if (!trackEl) return;
    trackEl.scrollBy({ left: -Math.round(cardWidth), behavior: 'smooth' });
  }

  function onKey(e) {
    if (e.key === 'ArrowLeft') scrollPrev();
    if (e.key === 'ArrowRight') scrollNext();
  }
</script>

<style>
  .viewport {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
  }

  .track {
    display: flex;
    gap: 0;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
    scroll-padding: 0;
    scrollbar-width: none;
  }

  .track::-webkit-scrollbar { display: none; }

  .card {
    scroll-snap-align: start;
    min-width: 100%;
    flex: 0 0 100%;
    /* parchment gradient with subtle SVG grain overlay */
    background-image: linear-gradient(180deg, #fbf6e3 0%, #f0e6c8 100%), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='noise'><feTurbulence baseFrequency='0.8' numOctaves='2' seed='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23noise)' opacity='0.03' /></svg>");
    background-repeat: no-repeat, repeat;
    background-size: cover, 200px 200px;
    background-position: center, 0 0;
    border: 1px solid rgba(160,140,100,0.25);
    border-radius: 10px;
    padding: 1.25rem;
    box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 200px;
    color: #2b240f; /* slightly dark brown text for parchment */
    transform: translateY(-8px);
    opacity: 0.95;
    transition: transform 320ms cubic-bezier(.2,.8,.2,1), opacity 240ms ease, box-shadow 240ms ease;
  }

  .card.active {
    transform: translateY(0);
    opacity: 1;
    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  }

  .controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .arrow {
    background: #111827;
    color: white;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
  }

  /* focus styles */
  .track:focus {
    outline: 2px solid rgba(59,130,246,0.5);
    outline-offset: 4px;
  }
</style>

<div class="viewport" role="region" aria-label="Snippet carousel">
  <div bind:this={trackEl} class="track" role="list" aria-label="Snippets">
    {#each items as it, i}
      <article class="card {i === activeIndex ? 'active' : ''}" role="listitem" data-index={i}>
        <h3>{it.title}</h3>
        <p>{it.excerpt}</p>
        {#if it.meta}
          <small>{it.meta}</small>
        {/if}
      </article>
    {/each}
  </div>

  <div class="controls">
    <button class="arrow" on:click={scrollPrev} aria-label="Previous">◀</button>
    <button class="arrow" on:click={scrollNext} aria-label="Next">▶</button>
  </div>
</div>
