import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    dev: process.env.NODE_ENV === 'development',
    // Keep componentApi compatibility with Svelte 4 (allows `new Component()` to work)
    // This helps when the Vite plugin or other tooling expects the older API.
    compatibility: { componentApi: 4 }
  }
};
