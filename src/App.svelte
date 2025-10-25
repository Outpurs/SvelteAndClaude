<script>
  let count = 0;
</script>

<style>
  main {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    padding: 2rem;
    max-width: 720px;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }
  button {
    background: #ff3e00;
    color: rgb(88, 20, 20);
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }
</style>

<main>
  <h1>Svelte 5 — Minimal Template</h1>
  <p>Click count: {count}</p>
  <button on:click={() => count++}>Increment</button>
</main>
