<script>
  import { supabase } from './lib/supabaseClient.js';
  import { onMount } from 'svelte';
  import Carousel from './components/Carousel.svelte';

  let count = 0;
  let supabaseStatus = '';

  async function checkSupabase() {
    supabaseStatus = 'Checking...';
    try {
      // Try a harmless call - get current auth session (won't error if anon key)
      const {
        data: sessionData,
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError) {
        supabaseStatus = `Error: ${sessionError.message}`;
        return;
      }

      supabaseStatus = `OK — session: ${JSON.stringify(sessionData ?? null)}`;
    } catch (err) {
      supabaseStatus = `Error: ${err?.message ?? err}`;
    }
  }

  const snippets = [
    { title: 'Focus Tip', excerpt: 'Try the Pomodoro technique: 25 minutes focused, 5 minutes break.', meta: 'Practice daily' },
    { title: 'Quick Strategy', excerpt: 'Break tasks into 2–3 minute actions to reduce overwhelm.', meta: 'Small wins' },
    { title: 'Mindful Pause', excerpt: 'Take three deep breaths before switching tasks.', meta: 'Reset attention' },
    { title: 'Routine', excerpt: 'Schedule the hardest task first when energy is high.', meta: 'Peak performance' }
  ];
</script>

<style>
  main {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    padding: 2rem;
    max-width: 720px;
    margin: 0 auto;
  }
  h1 {
    color: #4400ff;
    margin-bottom: 1rem;
  }
  button {
    background: #00ff0d;
    color: rgb(88, 20, 20);
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }
</style>

<main>
  <h1>ADHD Learning App</h1>
  <!-- <p>Click count: {count}</p>
  <button on:click={() => count++}>Increment</button> -->

  <hr />
  <h2>Snippets</h2>
  <p>Swipe or click the arrows to scroll through short tips.</p>
  <Carousel items={snippets} />
  <hr />
  <!-- <h2>Supabase</h2> -->
  <!-- <p>
    Use the button below to test the Supabase client. Make sure you set
    <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in a
    `.env` file at the project root.
  </p> -->
  <!-- <button on:click={checkSupabase}>Check Supabase</button>
  <p>{supabaseStatus}</p> -->



</main>
