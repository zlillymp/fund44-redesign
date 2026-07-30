# F44-GOV-02 Data-Flow Audit — Preview Build

Scope: what the current build actually collects, stores, transmits, and deletes. This is the evidence artifact for [CHECKLIST.md](CHECKLIST.md) Item 3 (live data-flow inventory) and a prerequisite input for Items 4, 5, and 6.

- Audit date: 2026-07-29
- Method: static read of the working tree at `main` (`e56085b`) plus repository validators. No build, deploy, or live traffic was involved.
- `ROADMAP.md` remains the project source of truth. This document does not restate roadmap scope and is not a roadmap or checklist.
- Fund44 is strictly pre-launch. Nothing in this audit should be read as describing an existing LLC, an S corporation, or an accepted election.

## Evidence classification

Every finding below is tagged:

- **[CODE]** — confirmed by reading committed source. True of the build as it stands.
- **[CONFIG]** — behavior depends on an environment variable, host setting, or build input not fixed in the repository. Can change without a code edit.
- **[ABSENT]** — not implemented. No code path exists.

Do not upgrade a **[CONFIG]** or **[ABSENT]** row to a factual claim about production behavior without the corresponding artifact.

## Summary verdict

The preview is unusually contained: it has **no first-party network egress at all**. There is no backend, no API route, no server action, no form POST, and no analytics vendor. Every field a visitor selects stays in the browser tab and is discarded when that tab closes.

The one genuine transmission of visitor data to a third party is **web-font loading** from Fontshare and Google Fonts, which is unconsented and happens on every page view. That is the only privacy exposure that a preview-only launch actually needs to resolve.

The material governance gaps are documentation-side, not data-side. A 2026-07-29 protected-preview follow-up corrected the privacy copy so it now matches the closed-set inputs the preview actually collects. The contact values the owner has confirmed remain intentionally withheld until the complete identity/contact set and its operating ownership are approved.

## A. What the preview collects — [CODE]

Six inputs, all closed-set. There is no free-text field anywhere in the flow.

| Field | Control | Allowed values | Purpose |
| --- | --- | --- | --- |
| `use` | choice buttons | 6 fixed options (`src/lib/eligibility/model.js:25-68`) | Selects the routing bucket and recommended route |
| `amount` | choice buttons | 6 fixed ranges (`model.js:70-77`) | Grounds the sample path copy |
| `tib` | select | 5 fixed bands (`model.js:79-85`) | Feeds `deriveProfileBucket` |
| `revenue` | select | 6 fixed bands (`model.js:87-94`) | Feeds `deriveProfileBucket` |
| `stateCode` | select | 51 fixed codes (`model.js:96-102`) | Operating-state context |
| `previewConsent`, `nextStepConsent` | 2 checkboxes (`src/components/flow.js:433`, `:454`) | boolean | Gates advancement past the consent step |

Field registry: `model.js:104-113`. Outcome derivation is a pure function of `tib` and `revenue` only (`model.js:582-601`).

**No identity or contact data is collected.** The only `<input>` elements in the entire flow are the two consent checkboxes above. There is no name, email, phone, address, business name, EIN, SSN, document upload, or free-text field. Grep for `type="email"`, `type="tel"`, `<textarea>`, and `<form>` across `src/` returns nothing.

A `contact_capture` step is *defined* (`model.js:20`, `:434-440`) but is unreachable — see Section I.

## B. What the preview transmits

**First-party egress: none. [CODE]**

A repository-wide grep across `src/` and `index.html` for `fetch`, `sendBeacon`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `new Image`, `dataLayer`, and `gtag` returns **zero matches**. There is no `/api` directory, no serverless function, no server action, and no form `action` attribute. The build is a static Vite SPA with a prerender step (`package.json:8`).

Consequence: the six fields in Section A are never sent anywhere. The disclosure at `src/lib/legal.js:107-110` ("does not send your information to a lender or server in the current build") is **accurate as written**.

**Third-party egress: web fonts only. [CODE]**

`index.html:27-31` loads stylesheets from two third-party origins on every page view:

- `api.fontshare.com` (Switzer, Satoshi) — preconnect + stylesheet
- `fonts.googleapis.com` / `fonts.gstatic.com` (IBM Plex Mono) — preconnect + stylesheet

These are browser-initiated requests. Each necessarily discloses the visitor's **IP address, User-Agent, and Referer** (the Fund44 URL being viewed) to those operators. No consent gate, no cookie banner, and no self-hosting fallback exists. This is the **only** runtime path by which visitor data leaves the browser, and it is unrelated to anything the visitor types.

This matters disproportionately for a public preview: hosted Google Fonts loading has been found to constitute unconsented personal-data transfer under GDPR in EU litigation. Fund44's stated audience is U.S. small-business owners, which reduces but does not eliminate exposure, and it is cheap to remove now.

## C. Browser storage and cookies — [CODE]

**Cookies: none.** No `document.cookie` write anywhere in `src/`. No cookie is set by application code.

**`localStorage`: none.** Not used. The theme toggle deliberately avoids it (`src/main.js:102`, comment: "system default, no localStorage").

**`sessionStorage`: three keys.** All are tab-scoped and are dropped by the browser when the tab closes.

| Key | Contents | Written by |
| --- | --- | --- |
| `fund44:eligibility-flow:v1` | Sanitized flow state: the six fields, step position, entry-route context | `src/lib/eligibility/storage.js:13`, `:108-113` |
| `fund44:analytics-session:v1` | Random session id, `crypto.randomUUID()` | `src/lib/analytics.js:12`, `:237-249` |
| `fund44:analytics-attribution:v1` | `utm_source`, `utm_medium`, `utm_campaign`, `referrer_domain`, derived `entry_channel` | `analytics.js:13`, `:298-307` |

Two observations worth recording:

- The persisted flow state is **allowlist-sanitized on both write and read** (`storage.js:64-76` for values, `:30-62` for context, `:78-90` for step id). Unrecognized keys are dropped rather than round-tripped, and the record is stamped `piiDropped: true` (`storage.js:101-105`). This is a deliberate, defensible design.
- The attribution record captures UTM parameters and the referring **domain only** — `parseReferrerDomain` extracts `hostname` and discards the full referring URL (`analytics.js:289-296`). The session id is random and is not derived from any visitor attribute, so it is not a fingerprint.

**History state:** the flag `fund44:eligibility-flow:history:v1` is pushed into `window.history.state` to make the dialog back-button-safe (`storage.js:152-174`). It is a boolean, holds no visitor data, and is not persistent storage.

## D. Analytics and telemetry — [CODE]

Analytics is fully instrumented (24 events, validated by `npm run validate:analytics`) but **connected to no destination**.

`sinkEvent` (`analytics.js:462-481`) does exactly four things: pushes the record onto an in-page array `window.__FUND44_ANALYTICS_QUEUE__`; calls an optional test-sink function if a test installed one; dispatches a DOM `CustomEvent`; and `console.info`s the record only when `window.__FUND44_ANALYTICS_DEBUG__ === true`. There is no vendor SDK, no script tag, and no transport. The queue is plain memory and dies with the page.

Two guardrails are already in place and should be preserved when a vendor is eventually chosen:

- A PII key-shape blocklist of 21 patterns — `email`, `phone`, `name`, `company`, `address`, `ssn`, `ein`, `dob`, `document`, `message`, `notes`, `free_text`, and more (`analytics.js:141-163`) — enforced on every emit via `assertNoPiiShapedKeys` (`:401-403`) inside `validateAnalyticsPayload` (`:451-456`). A payload with a disallowed key **throws** rather than silently sending.
- Every event carries a `consent_state` property, currently derived from the indexing policy and reporting `staging_preview_only` while indexing is off (`analytics.js:253-255`, `:380`).

`js_error` monitoring (`src/lib/monitoring.js:14-35`) hooks `window.error` and `unhandledrejection` but records **only `error_name`** — never the message, stack, or URL. It cannot leak field values. Note this also means it currently reports nowhere, since it routes through the same inert sink.

**Experiments:** the assignment harness is a pure FNV-1a hash of experiment id + session id with no storage write (`src/lib/experiments.js:58-82`). No experiment is registered anywhere in `src/` or `content/`, so no variant is being assigned.

## E. Logging — [CODE]

No server exists, therefore no application request log, access log, or error log is produced by this repository. The only logging is the gated `console.info` in Section D. Any access logging at the hosting layer is **[CONFIG]** and outside the repository — see Section G.

## F. Third-party services — [CODE]

Complete inventory of third parties reachable from the built site:

| Party | Trigger | Data disclosed | Consent gate |
| --- | --- | --- | --- |
| Fontshare (`api.fontshare.com`) | every page view | IP, User-Agent, Referer | none |
| Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | every page view | IP, User-Agent, Referer | none |

That is the entire list. There is no tag manager, session recorder, heatmap, chat widget, CDN script, A/B vendor, CRM, or lender/provider integration. `schema.org` URLs in `src/lib/seo.js` are JSON-LD vocabulary identifiers, not network requests.

## G. Hosting and runtime configuration

- **Host config is minimal. [CODE]** `vercel.json` contains only `cleanUrls` and `trailingSlash`. There is **no `headers` block**: no Content-Security-Policy, no HSTS, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`, and no `X-Robots-Tag`. A repo-wide grep for `Content-Security-Policy` and `Strict-Transport` finds no configuration anywhere. Header hardening is owned by `F44-SEC-01`, which the roadmap lists as blocked.
- **Indexing is env-driven and currently off. [CONFIG]** `src/lib/legal.js:4-26` computes `allowIndexing` as `legalEnv === 'production' && productionIndexingApproved`. Both inputs come from environment: `VITE_FUND44_ENV` and `VITE_FUND44_PRODUCTION_INDEXING_APPROVED`, the latter defaulting to `'false'` (`legal.js:5-9`). Verified current state: `env=staging`, `allowIndexing=false`, meta robots `noindex,nofollow`.
- **Robots coupling is a live risk. [CONFIG]** `renderRobotsTxt` (`src/lib/crawl.js:70-84`) flips *every* agent block from `Disallow: /` to `Allow: /` off the same single flag — including `GPTBot`, `PerplexityBot`, `ClaudeBot`, and `Google-Extended`. There is no separate control for AI/LLM crawlers. Turning on search indexing therefore simultaneously opts the site into AI training crawls. Verified current output: `public/robots.txt` is `Disallow: /` for all agents.
- **Cosmetic inconsistency. [CODE]** The generated comment "AI / LLM crawlers explicitly welcomed for accurate representation" (`crawl.js:72`) sits directly above `Disallow: /` lines in the current output. The behavior is correct and safe; the comment reads as contradicting it and should be conditioned on the policy.
- **`sitemap.xml` publishes 30 URLs** while robots disallows all crawling. Not a data exposure, and harmless, but the two artifacts assert different intents to anyone reading them.

## H. Retention and deletion

- **Server-side retention: [ABSENT].** No server, database, queue, or file sink exists, so there is nothing to retain and no retention period to define for first-party storage.
- **Client-side deletion: [CODE].** Flow state is removed explicitly by `clearEligibilityState` (`storage.js:115-119`) and implicitly by the browser when the tab closes, because all three keys are `sessionStorage`. A corrupt record is discarded and cleared on read failure (`storage.js:146-149`).
- **Analytics retention: [ABSENT] in effect.** The in-page queue is memory-only and unrecoverable after unload. Once a vendor is connected, vendor-side retention becomes a **[CONFIG]** decision that does not exist yet.
- **Third-party log retention: [CONFIG], not controlled by Fund44.** Fontshare and Google retain their own request logs (including visitor IPs) under their own policies. Fund44 cannot set, audit, or honor a deletion request against those logs while the fonts are hot-linked. Self-hosting removes this category entirely.
- **No documented retention policy exists yet.** Checklist Item 6 remains correctly unchecked. The `disclosures` object carries no retention language, and `liveDisclosuresBlocked.privacyConsent` (`legal.js:136-137`) states outright that retention language is unapproved.

## I. Not yet implemented — [ABSENT]

- **Live mode is hard-gated in code.** `liveEligibilityGate.enabled = false` (`legal.js:123-133`). With the gate false, `getModeSequence` returns `LIVE_BLOCKED_SEQUENCE` (`model.js:151-158`, `:256-266`), which terminates at `live_unavailable` and never reaches `contact_capture`. Selecting live mode routes the visitor to a dead-end explanation step.
- **Contact capture is doubly unreachable.** Beyond the gate, `sanitizeStepId` (`storage.js:78-90`) omits `contact_capture` from its allowlist, so even a hand-edited `sessionStorage` record claiming that step is coerced back to `mode_select`. Defense in depth worth preserving.
- **Lender/provider sharing does not exist.** No provider integration, credential, endpoint, or handoff code is present anywhere in the repository. Checklist Item 3's "trigger and method for sharing data with lenders/providers" has no answer because there is no mechanism to describe.
- **`trackContactRequestSubmit` is not a form submission.** Despite the name, it fires when a visitor *clicks a link* to `/contact` from the outcome step (`flow.js:954-958`). It transmits nothing and collects nothing. The name invites misreading in a privacy review.
- **The `/contact` page is display-only.** It explains what is available in the protected preview, lists the remaining public-launch requirements, and offers preview navigation. There is no contact form, `mailto:` link, or `tel:` link because no complete approved contact set is wired in.

## J. Discrepancies and follow-up status

These are the audit's actionable defects. All three are documentation/config issues, not data leaks.

1. **Resolved 2026-07-29 — the privacy page overstated collection.** The protected-preview follow-up replaced the inaccurate "business and contact inputs" statement with an exact inventory of the closed-set business profile selections and explicit statements that the preview collects no name, email address, phone number, business name, free-text response, or uploaded document. Regression coverage now blocks the retired phrase.

2. **Owner-confirmed contact values are not wired into the site.** `CHECKLIST.md:30-37` records `support@fund44.com`, `privacy@fund44.com`, `512-547-1547`, and `5900 Balcones Drive, STE 100, Austin, TX 78731` as confirmed. `src/lib/legal.js` still keeps the public identity/contact fields unresolved, and `/contact` now withholds the values cleanly instead of rendering bracket placeholders. The values should remain unpublished until the complete set and its monitoring responsibilities are approved.

3. **The legal validator will block that wiring.** `scripts/validate-legal.mjs:49-51` asserts `unresolvedIdentityFields.length !== 4` is a failure — it actively requires all four identity fields to stay TBD. Populating even one will fail `npm run validate:legal` until that assertion is relaxed to a target count. Anyone wiring in confirmed values must change the validator in the same commit. **`legal.js` also has no field for a privacy-request email at all**, so `privacy@fund44.com` cannot be published without adding one (`verifiedEntity`, `unresolvedIdentityLabels`, `placeholderValueFor`).

Also confirmed clean: the forbidden phone `469-209-9975` and "Eagle Postal" appear **only** in `CHECKLIST.md` as explicit do-not-publish notes, never in `src/`, `public/`, `content/`, or `index.html`.

## K. Minimum decisions for a preview-only public launch

The standing recommendation is unchanged: **stay preview-only until backend, lender-sharing, consent, and retention systems are approved.** Nothing in this audit contradicts that. Given the containment found above, the decision set needed to put the *current* build in front of the public is small — six items, five of which are "keep the safe default."

| # | Decision | Recommended safe default | Rationale |
| --- | --- | --- | --- |
| 1 | Web fonts: hot-link or self-host? | **Self-host all three families and remove the four third-party `<link>`/preconnect tags.** | Eliminates the only visitor-data transmission in the build. Removes the need for a cookie/consent banner, removes an uncontrollable third-party log retention category, and lets the privacy page say "no visitor data leaves your browser" without qualification. This is the one change with real privacy value. |
| 2 | Production indexing | **Leave `VITE_FUND44_PRODUCTION_INDEXING_APPROVED` unset/`false`.** Publish reachable-but-`noindex`. | Entity identity, `sameAs`, and legal copy are unapproved. Indexing a preview creates crawled artifacts asserting an entity that does not yet exist. |
| 3 | AI/LLM crawler policy | **Keep disallowed; decide separately from search indexing.** Split the flag in `crawl.js:70-84` before either is enabled. | Today one env var opens search *and* AI training simultaneously. That coupling should not be discovered at launch. |
| 4 | Live mode | **Keep `liveEligibilityGate.enabled = false`.** | No backend, no approved consent copy, no provider handoff, no retention policy. Unchanged from the roadmap position. |
| 5 | Privacy page accuracy | **Fix the Section J.1 sentence before public exposure.** | A privacy notice that misdescribes collection undermines every other disclosure on the page, even when the error is conservative. |
| 6 | Contact publishing | **Either wire all four confirmed values plus a privacy email and update the validator together, or publish none and keep the TBD placeholders.** | A half-wired state is the bad outcome: it would show a real support email beside `[mailing address pending verification]`, implying an operating entity while filings are still pending. Wiring is also gated on Item 2's untested inbound channels (`CHECKLIST.md:36`, `:38-39`) — publishing an untested phone number is worse than publishing none. |

Two decisions explicitly **not** required for preview launch, to prevent scope creep: security response headers (owned by `F44-SEC-01`; nothing to protect while there is no submission path or session) and a cookie-consent banner (unnecessary once decision 1 is taken, since no cookies exist and no third party is contacted).

## L. Verification run — 2026-07-29

Run from the working tree with no dev dependencies installed. Exit codes captured.

| Check | Result |
| --- | --- |
| `npm test` (`node --test`) | **pass** — 94/94, 0 fail |
| `npm run validate:legal` | **pass** — `env=staging`, `allowIndexing=false`, `unresolvedIdentityFields=4`, `verifiedSameAs=0` |
| `npm run validate:content` | pass |
| `npm run validate:crawl` | pass — 30 sitemap entries, 27 llms entries, `allowIndexing=false` |
| `npm run validate:routes` | pass |
| `npm run validate:analytics` | pass — 24 events, 31 routes |
| `npm run validate:citations` | pass |
| `npm run validate:freshness` | pass — 0 stale, 0 expired |
| `npm run validate:design` | pass |
| `npm run validate:links` | **not satisfiable here** — requires `dist/` artifacts from `npm run build`; `vite` is not installed in this environment. Pre-existing environmental limitation, unrelated to this audit. |

Not run, deliberately: `npm run build`, `npm run qa:release`, `npm run test:a11y` (require dependency install / browser download). No deploy, no publish, no indexing change, no submission enablement.

## Governance accuracy notes

Reaffirmed for anyone extending this document:

- Fund44 is strictly pre-launch as of 2026-07-29. Do not describe it as an existing LLC or S corporation until filings and elections are accepted.
- Intended future entity: a separate Texas single-member Fund44 LLC directly owned by Matt Lilly, no outside owners initially, intending S-corp taxation, maintaining separate records, accounts, contracts, and insurance, and potentially sold independently.
- `support@fund44.com` and `privacy@fund44.com` exist. The sole public phone is `512-547-1547`. `469-209-9975` must never be published.
- Registered-agent provider branding is Texan Registered Agent; the filing draft says legal name Registered Agents Inc., which still requires exact confirmation.
- Public mailing/registered-office address is 5900 Balcones Drive, STE 100, Austin, TX 78731. Eagle Postal Center must not be used.
- Texas formation, EIN, operating agreement, Form 2553/IRS acceptance, and contact/mail notification testing are Matt-owned and must not be marked complete without evidence.
- Nothing in this audit is counsel-reviewed. This is an engineering evidence artifact, not a legal opinion, and the drafts it describes are not counsel-approved absent an approval artifact.
