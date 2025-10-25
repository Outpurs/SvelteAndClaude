# Svelte 5 Minimal Template

This is a minimal Svelte 5 + Vite starter template.

Quick start (PowerShell):

```powershell
# install dependencies
npm install

# start dev server
npm run dev
```

Build and preview:

```powershell
npm run build
npm run preview
```

Notes:
- Uses Vite with `@sveltejs/vite-plugin-svelte`.
- Edit `src/App.svelte` and `src/main.js` to start developing.

Supabase
-------

To connect a Supabase project from the browser, create a `.env` file at the
project root with these two variables (replace the values with your project's
URL and anon key):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

The app contains a small example using `src/lib/supabaseClient.js`. After you
set the env vars, restart the dev server (`npm run dev`) and click "Check
Supabase" in the app to verify the client can reach Supabase.
