<script>
  import { supabase } from './lib/supabaseClient.js';
  import { onMount } from 'svelte';
  import Carousel from './components/Carousel.svelte';

  let count = 0;
  let supabaseStatus = '';
  let snippets = [];
  let allSnippets = [];
  let selectedCourseId = '';

  $: {
    if (selectedCourseId) {
      snippets = allSnippets.filter(s => s.course_id === selectedCourseId);
    } else {
      snippets = allSnippets;
    }
  }

  $: uniqueCourses = [...new Set(allSnippets.map(s => s.course_id).filter(Boolean))].sort();
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
      meta: 'Practice daily',
      course_id: 'PROD101' 
    },
    { 
      title: 'Quick Strategy', 
      snippet: '<h3>Break It Down</h3><p>Make progress by breaking tasks into tiny steps:</p><ul><li>2-3 minute actions</li><li>Clear starting point</li><li>Visible progress</li></ul>', 
      meta: 'Small wins',
      course_id: 'PROD101' 
    },
    { 
      title: 'Mindful Pause', 
      snippet: '<h3>Reset Your Focus</h3><p>Before switching tasks:</p><ol><li>Take three deep breaths</li><li>Notice your surroundings</li><li>Set a clear intention</li></ol>', 
      meta: 'Reset attention',
      course_id: 'MIND201' 
    },
    { 
      title: 'Routine', 
      snippet: '<h3>Energy Management</h3><p>Align tasks with your energy levels:</p><blockquote>Schedule your most challenging work when your energy peaks</blockquote><p>For most people this is <code>2-4 hours</code> after waking.</p>', 
      meta: 'Peak performance',
      course_id: 'MIND201' 
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
        allSnippets = fallbackSnippets;
        snippets = allSnippets;
      } else if (!data || data.length === 0) {
        supabaseStatus = 'No snippets found in Supabase — using fallback data.';
        allSnippets = fallbackSnippets;
        snippets = allSnippets;
      } else {
        supabaseStatus = `Loaded ${data.length} snippets`;
        // map DB columns to the UI shape (adjust if your column names differ)
        allSnippets = data.map((r) => ({ 
          title: r.snippet_title ?? r.title, 
          snippet: r.snippet ?? r.excerpt, 
          meta: r.images ?? null, 
          course_id: r.course_id ?? null 
        }));
        snippets = allSnippets;
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
  :root{
    --bg: #f6f7f9;
    --card: #ffffff;
    --muted: #7a7a7a;
    --accent: #1f2937; /* dark slate */
  }

  :global(body){
    margin:0;
    background:var(--bg);
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
  }

  main{
    max-width:980px;
    margin: 3rem auto;
    padding: 0 1.25rem;
  }

  .hero{
    text-align:center;
    margin-bottom:1.5rem;
  }

  h1{font-size:2rem;margin:0;color:var(--accent);font-weight:600}
  .tagline{color:var(--muted);margin-top:0.35rem}

  .snippet-section{
    background:transparent;padding:0;margin:1.25rem 0 2rem;border-radius:12px;display:block
  }

  .course-header{display:flex;justify-content:center;margin-bottom:1rem}
  .course-select{appearance:none;padding:0.6rem 1.1rem;border-radius:999px;border:1px solid #e6e6e6;background:#fff;color:var(--accent);min-width:180px}

  /* keep sections clean */
  section{background:transparent;padding:0;margin:0}

  .status{display:inline-block;padding:0.35rem 0.8rem;border-radius:8px;background:#fff;color:var(--muted);border:1px solid #eee}

  button{background:var(--accent);color:#fff;border:none;padding:0.6rem 1rem;border-radius:10px;cursor:pointer}
  button:hover{opacity:0.95}

</style>

<main>
  <div class="hero">
    <h1>eli5</h1>
    <p class="tagline">Complex ideas, explained simply</p>
  </div>

  <section class="snippet-section">
    <div class="course-header">
      <select bind:value={selectedCourseId} class="course-select" aria-label="Filter by course">
        <option value=''>All Courses</option>
        {#each uniqueCourses as cid}
          <option value={cid}>{cid}</option>
        {/each}
      </select>
    </div>
    <Carousel items={snippets} />
  </section>

  <section class="debug-section">
    <h2>Connection Status</h2>
    <p>
      Testing Supabase connection. Ensure you have set up:
      <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>
      in your <code>.env</code> file.
    </p>
    <button on:click={checkSupabase}>Check Connection</button>
    <div class="status">{supabaseStatus}</div>
  </section>



</main>
