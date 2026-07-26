import { defineConfig } from 'vite';

const legalEnv = (process.env.VITE_FUND44_ENV || process.env.MODE || 'staging').toLowerCase();
const defaultRobots = legalEnv === 'production' ? 'index,follow' : 'noindex,nofollow';

export default defineConfig({
  base: '/',
  define: {
    __FUND44_LEGAL_ENV__: JSON.stringify(legalEnv),
  },
  build: { target: 'es2020', outDir: 'dist' },
  html: {
    cspNonce: undefined,
  },
  plugins: [
    {
      name: 'fund44-indexing-policy',
      transformIndexHtml(html) {
        return html.replaceAll('__FUND44_DEFAULT_ROBOTS__', defaultRobots);
      },
    },
  ],
});
