<script>
  import { supabase } from '../lib/supabaseClient.js';
  import { onMount } from 'svelte';

  let loading = false;
  let errorMsg = '';
  const devEnabled = (import.meta.env?.DEV === true) || (import.meta.env?.VITE_DEV_LOGIN_ENABLED === 'true');

  async function signInWithGoogle() {
    // Temporary bypass: immediately consider user "logged in" and go to app
    try {
      loading = true;
      localStorage.setItem('eli5_mock_session', '1');
      // Soft redirect to root to trigger App.svelte session gate
      window.location.href = '/';
    } catch (err) {
      errorMsg = err?.message ?? String(err);
      loading = false;
    }
    // To re-enable real OAuth later, replace the above with Supabase signInWithOAuth
    // and remove the localStorage bypass.
  }

  function devLogin() {
    // Simple bypass for development: set mock session and navigate
    const mockUser = { email: 'dev@example.com', role: 'admin', ts: Date.now() };
    localStorage.setItem('eli5_mock_session', '1');
    localStorage.setItem('eli5_mock_user', JSON.stringify(mockUser));
    // Force a hard reload to ensure App.svelte re-runs onMount
    window.location.reload();
  }
</script>

<style>
  :root{
    --bg: #f6f7f9;
    --card: #ffffff;
    --muted: #7a7a7a;
    --accent: #1f2937;
  }

  .wrap{
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--bg);
    padding: 2rem;
  }
  .card{
    width: 100%;
    max-width: 420px;
    background: var(--card);
    border: 1px solid #ececec;
    border-radius: 16px;
    box-shadow: 0 12px 36px rgba(12,18,28,0.06);
    padding: 2rem;
    text-align: center;
  }
  h1{margin:0;color:var(--accent);font-size:1.6rem}
  p{color:var(--muted);margin:.6rem 0 1.2rem}

  .google{
    display:inline-flex;align-items:center;gap:.6rem;
    padding:.75rem 1rem;border-radius:12px;border:1px solid rgba(0,0,0,0.08);
    background: linear-gradient(180deg,#fff,#fafafa);
    color:#111;font-weight:600;cursor:pointer;
    box-shadow:0 2px 4px rgba(0,0,0,0.04),0 0 1px rgba(0,0,0,0.08);
    transition: transform .1s ease, box-shadow .2s ease;
  }
  .google:hover{box-shadow:0 6px 16px rgba(0,0,0,0.08)}
  .google:active{transform:translateY(1px)}
  .google[disabled]{opacity:.7;cursor:not-allowed}
  .gicon{width:18px;height:18px}

  .foot{margin-top:1rem;color:#9aa0a6;font-size:.85rem}
  .err{margin-top:.8rem;color:#b42318;font-size:.9rem}

  .dev{
    margin-top:1.6rem; text-align:left;
    border-top:1px dashed #e5e7eb; padding-top:1.2rem;
  }
  .dev h2{margin:.2rem 0 .4rem; font-size:1rem; color:#384152}
  .dev p{margin:.3rem 0 .8rem; font-size:.85rem; color:var(--muted)}
  .dev button{margin-top:.4rem; width:100%; padding:.65rem .8rem; border-radius:10px; border:1px solid rgba(0,0,0,0.08); background:linear-gradient(180deg,#fff,#fafafa); font-weight:600; cursor:pointer; transition:all .2s ease}
  .dev button:hover{box-shadow:0 4px 12px rgba(0,0,0,0.08)}
</style>

<div class="wrap">
  <div class="card" role="dialog" aria-modal="true">
    <h1>Welcome</h1>
    <p>Sign in to continue</p>

    <button class="google" on:click={signInWithGoogle} disabled={loading} aria-label="Sign in with Google">
      <svg class="gicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12   s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20   s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.39,16.108,18.842,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657   C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.2l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946  l-6.563,5.047C9.463,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-3.997,5.571c0.001-0.001,0.002-0.001,0.003-0.002  l6.19,5.238C35.233,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
      {loading ? 'Redirecting…' : 'Continue with Google'}
    </button>

    {#if errorMsg}
      <div class="err">{errorMsg}</div>
    {/if}

    <div class="foot">By continuing you agree to our terms.</div>

    {#if devEnabled}
      <div class="dev" aria-label="Development login">
        <h2>Development login</h2>
        <p>For admins while auth is being set up.</p>
        <button type="button" on:click={devLogin}>Continue (dev)</button>
      </div>
    {/if}
  </div>
</div>
