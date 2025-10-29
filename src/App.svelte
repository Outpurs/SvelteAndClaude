<script>
  import { supabase } from './lib/supabaseClient.js';
  import { onMount } from 'svelte';
  import Carousel from './components/Carousel.svelte';

  let count = 0;
  let supabaseStatus = '';
  let snippets = [];
  let loadingSnippets = false;

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

  // Local fallback snippets used if Supabase is not configured or returns no rows
  const fallbackSnippets = [
    { 
      title: 'Focus Tip', 
      snippet: '<h3>Pomodoro Technique</h3><p>Try working in focused 25-minute blocks:</p><ul><li>Set a timer for 25 minutes</li><li>Work with *full* focus</li><li>Take a **5-minute** break</li></ul>', 
      meta: 'Practice daily' 
    },
    { 
      title: 'Quick Strategy', 
      snippet: '<h3>Break It Down</h3><p>Make progress by breaking tasks into tiny steps:</p><ul><li>2-3 minute actions</li><li>Clear starting point</li><li>Visible progress</li></ul>', 
      meta: 'Small wins' 
    },
    { 
      title: 'Mindful Pause', 
      snippet: '<h3>Reset Your Focus</h3><p>Before switching tasks:</p><ol><li>Take three deep breaths</li><li>Notice your surroundings</li><li>Set a clear intention</li></ol>', 
      meta: 'Reset attention' 
    },
    { 
      title: 'Routine', 
      snippet: '<h3>Energy Management</h3><p>Align tasks with your energy levels:</p><blockquote>Schedule your most challenging work when your energy peaks</blockquote><p>For most people this is <code>2-4 hours</code> after waking.</p>', 
      meta: 'Peak performance' 
    }
  ];

  async function loadSnippetsFromSupabase() {
    loadingSnippets = true;
    supabaseStatus = 'Loading snippets...';
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('snippet_id, snippet_title, snippet, images, course_id')
        .order('snippet_id', { ascending: true });

      if (error) {
        supabaseStatus = `Error loading snippets: ${error.message}`;
        snippets = fallbackSnippets;
      } else if (!data || data.length === 0) {
        supabaseStatus = 'No snippets found in Supabase — using fallback data.';
        snippets = fallbackSnippets;
      } else {
        supabaseStatus = `Loaded ${data.length} snippets`;
        // map DB columns to the UI shape (adjust if your column names differ)
        snippets = data.map((r) => ({ 
          title: r.snippet_title ?? r.title, 
          snippet: r.snippet ?? r.excerpt, 
          meta: r.images ?? null, 
          course_id: r.course_id ?? null 
        }));
      }
    } catch (err) {
      supabaseStatus = `Unexpected error: ${err?.message ?? err}`;
      snippets = fallbackSnippets;
    } finally {
      loadingSnippets = false;
    }
  }

  // Try to load snippets when the component mounts
  onMount(() => {
    loadSnippetsFromSupabase();
  });
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
  /* button styles moved to components; keep app-level styles minimal */
</style>

<main>
  <h1>eli5</h1>
  <!-- <p>Click count: {count}</p>
  <button on:click={() => count++}>Increment</button> -->

  <hr />
  <h2>Snippets</h2>
  <p>Swipe or click the arrows to scroll through short tips.</p>
  <Carousel items={snippets} />
  <hr />
  <h2>Supabase</h2>
  <p>
    Use the button below to test the Supabase client. Make sure you set
    <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in a
    `.env` file at the project root.
  </p>
  <button on:click={checkSupabase}>Check Supabase</button>
  <p>{supabaseStatus}</p>



</main>
