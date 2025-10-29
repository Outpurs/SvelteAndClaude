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
  :global(body) {
    margin: 0;
    background: linear-gradient(135deg, #f6f8ff 0%, #ffffff 100%);
    min-height: 100vh;
  }

  main {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    padding: 2rem;
    max-width: 720px;
    margin: 0 auto;
  }

  .hero {
    text-align: center;
    padding: 2rem 1rem 3rem;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%);
    border-radius: 0 0 30px 30px;
    margin: -2rem -2rem 2rem;
  }

  h1 {
    font-size: 2.5rem;
    background: linear-gradient(135deg, #4400ff 0%, #8066ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 0.5rem;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
  }

  .tagline {
    color: #666;
    font-size: 1.1rem;
    margin: 0;
  }

  section {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    margin: 2rem 0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  }

  h2 {
    color: #2d2d2d;
    font-size: 1.5rem;
    margin: 0 0 1rem;
  }

  p {
    color: #4a4a4a;
    line-height: 1.6;
    margin: 1rem 0;
  }

  code {
    background: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
    color: #4400ff;
  }

  .debug-section {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 2rem;
    background: #fafafa;
  }

  button {
    background: #4400ff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background: #3300cc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(68,0,255,0.15);
  }

  .status {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background: #f5f5f5;
    color: #666;
    font-size: 0.9rem;
    margin-top: 1rem;
  }

  .course-header {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .course-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #4400ff 0%, #8066ff 100%);
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(68,0,255,0.15);
    transition: all 0.3s ease;
  }
</style>

<main>
  <div class="hero">
    <h1>eli5</h1>
    <p class="tagline">Complex ideas, explained simply</p>
  </div>

  <section>
    <div class="course-header">
      {#if snippets.length > 0}
        <div class="course-badge">
          Course: {snippets[0].course_id}
        </div>
      {/if}
    </div>
    <Carousel 
      items={snippets}
      on:change={({ detail }) => {
        // Update visible course ID when active slide changes
        const courseEl = document.querySelector('.course-badge');
        if (courseEl && snippets[detail]) {
          courseEl.textContent = `Course: ${snippets[detail].course_id}`;
        }
      }}
    />
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
