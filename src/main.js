import App from './App.svelte';

// Use the classic constructor API. We enabled compiler compatibility
// via `svelte.config.js` so this will work even with Svelte 5 here.
const app = new App({
  target: document.getElementById('app')
});

export default app;
