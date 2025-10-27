<script>
  import { onMount } from 'svelte';
  export let items = [];

  let trackEl;
  let cardWidth = 0;
  let ro;

  function updateWidth() {
    if (trackEl) cardWidth = trackEl.clientWidth;
  }

  onMount(() => {
    updateWidth();
    ro = new ResizeObserver(updateWidth);
    if (trackEl) ro.observe(trackEl);
    return () => ro?.disconnect();
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
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 200px;
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
  <div bind:this={trackEl} class="track" tabindex="0" role="list" on:keydown={onKey}>
    {#each items as it}
      <article class="card" role="listitem">
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
