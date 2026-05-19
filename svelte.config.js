import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const allLangs = ['zh-hans', 'zh-hant', 'en', 'ja'];
const pages = ['', '/download', '/lookup', '/search', '/help', '/about', '/tos', '/feedback', '/applist', '/installing', '/info'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: false
		}),
		prerender: {
			entries: [
				...allLangs.flatMap(l => pages.map(p => `/${l}${p}`)),
				'/s',
				'/l'
			],
			crawl: true,
			handleHttpError: ({ path, message }) => {
				console.warn(`Prerender warning for ${path}: ${message}`);
				return;
			},
			handleUnseenRoutes: 'ignore'
		},
		paths: {
			// Override via VITE_BUILD_BASE_PATH env var for CDN _app mirroring.
			// e.g. VITE_BUILD_BASE_PATH=/app makes _app → /app/_app.
			// Leave empty for root deployment.
			base: process.env.VITE_BUILD_BASE_PATH || ''
		},
		alias: {
			$components: 'src/lib/components',
			$utils: 'src/lib/utils',
			$i18n: 'src/lib/i18n'
		}
	}
};

export default config;
