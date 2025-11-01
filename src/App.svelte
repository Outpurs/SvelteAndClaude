<script>
  import { supabase } from './lib/supabaseClient.js';
  import { onMount, onDestroy } from 'svelte';
  import Carousel from './components/Carousel.svelte';
  import Login from './components/Login.svelte';

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
  let session = null;
  let checkingAuth = true;

  // Auth: load current session and listen for changes
  let authUnsub = null;
  
  async function checkSession() {
    checkingAuth = true;
    
    // Check if we're in browser context
    if (typeof sessionStorage === 'undefined') {
      checkingAuth = false;
      return;
    }
    
    // Temporary bypass: if mock flag exists, treat as logged in
    const mock = sessionStorage.getItem('eli5_mock_session');
    const mockUserStr = sessionStorage.getItem('eli5_mock_user');
    
    if (mock === '1') {
      let mockUser = null;
      try { 
        mockUser = JSON.parse(mockUserStr || 'null'); 
      } catch (e) {
        console.error('Failed to parse mock user:', e);
      }
      session = { 
        user: { 
          id: 'mock-user', 
          email: mockUser?.email || 'mock@example.com', 
          role: mockUser?.role || 'admin' 
        } 
      };
    } else {
      const { data } = await supabase.auth.getSession();
      session = data?.session ?? null;
    }
    
    checkingAuth = false;
  }
  
  onMount(async () => {
    await checkSession();
    
    // Only listen to Supabase auth changes if we're not using mock session
    const isMockSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('eli5_mock_session') === '1';
    
    if (!isMockSession) {
      authUnsub = supabase.auth.onAuthStateChange((_event, s) => {
        session = s ?? null;
        // When user logs in, refresh snippets
        if (session && allSnippets.length === 0) {
          loadSnippetsFromSupabase();
        }
      }).data?.subscription;
    }
    
    // initial data load
    loadSnippetsFromSupabase();
  });

  onDestroy(() => {
    authUnsub?.unsubscribe?.();
  });

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
        allSnippets = data.map((r) => {
          // Parse images JSON if it exists and is valid
          let imageUrls = [];
          try {
            if (r.images) {
              const imageData = typeof r.images === 'string' ? JSON.parse(r.images) : r.images;
              imageUrls = imageData.images || []; // Extract the array of URLs
            }
          } catch (e) {
            console.warn('Failed to parse images JSON for snippet:', r.snippet_id);
          }
          
          return {
            title: r.snippet_title ?? r.title,
            snippet: r.snippet ?? r.excerpt,
            images: imageUrls,
            course_id: r.course_id ?? null
          };
        });
        snippets = allSnippets;
      }
    } catch (err) {
      supabaseStatus = `Unexpected error: ${err?.message ?? err}`;
      snippets = fallbackSnippets;
    } finally {
      loadingSnippets = false;
    }
  }

  // (initial load is triggered in the auth onMount above)

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
  .course-select{
    appearance:none;
    padding:0.75rem 2.2rem 0.75rem 1.2rem;
    border-radius:12px;
    border:1px solid rgba(0,0,0,0.08);
    background:linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%);
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat:no-repeat;
    background-position:right 0.8rem center;
    background-size:1rem;
    color:var(--accent);
    min-width:200px;
    font-size:0.95rem;
    font-weight:500;
    box-shadow:0 2px 4px rgba(0,0,0,0.04),
               0 0 1px rgba(0,0,0,0.08),
               inset 0 1px 0 rgba(255,255,255,0.8);
    cursor:pointer;
    transition:all 0.2s ease;
  }
  .course-select:hover{
    border-color:rgba(0,0,0,0.12);
    background:linear-gradient(to bottom, #ffffff 0%, #f5f7f9 100%);
    box-shadow:0 3px 6px rgba(0,0,0,0.06),
               0 0 1px rgba(0,0,0,0.12),
               inset 0 1px 0 rgba(255,255,255,0.8);
  }
  .course-select:focus{
    outline:none;
    border-color:rgba(0,0,0,0.15);
    box-shadow:0 3px 8px rgba(0,0,0,0.08),
               0 0 1px rgba(0,0,0,0.12),
               inset 0 1px 0 rgba(255,255,255,0.8);
  }

  /* keep sections clean */
  section{background:transparent;padding:0;margin:0}

  .status{display:inline-block;padding:0.35rem 0.8rem;border-radius:8px;background:#fff;color:var(--muted);border:1px solid #eee}

  button{background:var(--accent);color:#fff;border:none;padding:0.6rem 1rem;border-radius:10px;cursor:pointer}
  button:hover{opacity:0.95}

</style>

<main>
  {#if checkingAuth}
    <div style="display:flex;justify-content:center;align-items:center;min-height:100vh">
      <p>Loading...</p>
    </div>
  {:else if !session}
    <Login />
  {:else}
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

  <!-- Debug section (uncomment to test Supabase connection)
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
  -->


  {/if}
</main>
