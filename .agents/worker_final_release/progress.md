# Progress Log

Last visited: 2026-07-30T07:33:58Z

- Link graph built and validated: 41 canonical routes, 40 hub links, 297 contextual links, 41 next links, 0 orphans.
- Measured production asset sizes after Texas metro and legal expansion:
  - Largest JS bundle: 473.9 kB (assets/index-*.js)
  - CSS stylesheet: 43.2 kB (assets/index-*.css)
  - Home index.html entry: 71.7 kB
  - Max HTML per page: 81.6 kB (states/texas-sba-loans/index.html)
  - Total assets: 517.1 kB (2 files)
- Updated `scripts/validate-performance-budgets.mjs` with evidence-backed maxBytes ceilings:
  - bundle_js_max_bytes: 500,000 (488.3 kB)
  - bundle_css_max_bytes: 50,000 (48.8 kB)
  - html_entry_max_bytes: 78,000 (76.2 kB)
  - html_per_page_max_bytes: 86,000 (84.0 kB)
  - asset_total_max_bytes: 550,000 (537.1 kB)
- Updated `playwright.config.mjs`, `playwright.release.config.mjs`, and `scripts/run-release-gates.mjs` so `reuseExistingServer` uses `!process.env.CI` and `CI: 'true'` is passed in release gates, preventing server port conflicts across sequential test runs.
- Currently executing `npm run qa:release` (task-72).
