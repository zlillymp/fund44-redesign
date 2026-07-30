# F44-GOV-02 Approval Workspace

This is the working approval and evidence checklist for `F44-GOV-02`. `ROADMAP.md` remains the project's source of truth. A box is checked only after the value or policy is documented, verified, approved by the named owner, implemented where applicable, and supported by evidence.

## Checklist

- [ ] 1. Legal business identity
  - Exact registered legal business name, including entity suffix
  - Jurisdiction of formation and entity type
  - Relationship between the legal entity and the public brand name “Fund44”
  - Evidence reviewed (for example, formation record or official registration)
  - Business/operations owner approval recorded

- [ ] 2. Public and privacy contact channels
  - Publishable mailing address
  - Monitored support email
  - Monitored support phone
  - Privacy-request channel and responsible operator
  - Each channel tested and operations approval recorded

  Candidate address services identified near 75077 on 2026-07-29:
  - Eagle Postal Center, 1301 Justin Road, Suite 201, Lewisville, TX 75077 — considered, then rejected after consolidating services with Texan Registered Agent.
  - Surrey Ranch Executive Suites, 1011 Surrey Lane, Building 200, Flower Mound, TX 75022 — nearby virtual office with mail/parcel handling and physical office context; candidate where a more substantive office relationship is needed.
  - Spaces Flower Mound — nearby virtual-office service advertising mail handling and phone services; exact location, contract terms, and filing permissions still require confirmation.
  - Separate Texas commercial registered agent remains required unless the selected address provider expressly serves as and consents to be Fund44's registered agent.

  Working selections and confirmed values:
  - [x] Eagle Postal Center removed from the plan; no Fund44 address or service will use it.
  - [x] Registered-agent provider selected: Texan Registered Agent / `texasregisteredagent.net` (provider site identifies the business as Texan Registered Agent LLC).
  - [x] Registered-agent/public-form address supplied by business owner: `5900 Balcones Drive, STE 100, Austin, TX 78731`.
  - [ ] Retain provider consent/service confirmation and confirm the exact registered-agent legal name that must appear on the Texas filing.
  - [x] Public support email established: `support@fund44.com`.
  - [x] Privacy-request email established: `privacy@fund44.com`.
  - [x] Former Google Voice number `469-209-9975` removed from the Fund44 contact plan and must not be published.
  - [x] Sole Fund44 public/corporate phone: `512-547-1547`, supplied through `texasregisteredagent.net`.
  - [ ] Configure `512-547-1547` for inbound calls and routing, then test it.
  - [x] Public mailing and registered-office address consolidated through Texan Registered Agent: `5900 Balcones Drive, STE 100, Austin, TX 78731`.
  - [ ] Assign the person responsible for monitoring support email, privacy email, phone, physical mail, and registered-agent notices.
  - [ ] Test inbound delivery and response workflow for both emails, the phone number, physical mail, and registered-agent notices.

- [ ] 3. Live data-flow inventory
  - Every field collected from a visitor
  - Collection purpose for each field
  - Backend, vendors, analytics tools, and providers receiving data
  - Trigger and method for sharing data with lenders/providers
  - Data locations and responsible internal owner

  Preview-build audit completed 2026-07-29: [DATA-FLOW-AUDIT.md](DATA-FLOW-AUDIT.md) records the code-confirmed
  collection, storage, transmission, and deletion behavior of the current build, with each finding tagged
  code-confirmed, configuration-dependent, or not implemented.

  - [x] Every field collected in the preview is inventoried: six closed-set inputs (`use`, `amount`, `tib`, `revenue`, `stateCode`, and two consent checkboxes). No free-text, identity, or contact field exists in the flow.
  - [x] Collection purpose documented per field.
  - [x] First-party transmission confirmed absent: no backend, API route, server action, form POST, or analytics vendor. Analytics events terminate in an in-page queue.
  - [x] Browser storage inventoried: no cookies, no `localStorage`, and three tab-scoped `sessionStorage` keys that the browser drops when the tab closes.
  - [x] Third-party recipients inventoried: hot-linked Fontshare and Google Fonts stylesheets disclose visitor IP, User-Agent, and Referer on every page view. This is the only egress of visitor data in the build.
  - [ ] Decide whether to self-host the three font families and remove the third-party font requests. Recommended default is to self-host, which removes the only visitor-data transmission and the only uncontrollable third-party log-retention category.
  - [ ] Assign the responsible internal owner for data locations and for any future vendor relationship.
  - [ ] Live inventory remains blocked and unanswerable while no backend or provider handoff exists: lender/provider sharing has no trigger, method, or recipient to document. Complete this only when a reviewed live submission target is chosen.

  Defects the audit opened for follow-up:
  - [x] Corrected the privacy page so it describes only the closed-set business profile selections the preview actually collects; added legal-page and release-browser regression coverage.
  - [ ] Wire the confirmed Item 2 contact values into `src/lib/legal.js` only as a complete set, and add a privacy-request email field, which does not exist in `verifiedEntity` today.
  - [ ] Relax the `scripts/validate-legal.mjs:49` assertion in the same change, because it currently requires all four identity fields to stay TBD and will fail once any verified value is published.
  - [ ] Split the AI/LLM crawler policy from the search-indexing flag in `src/lib/crawl.js:70-84`, which today opens search crawling and AI training crawling from the same environment variable.

- [ ] 4. Privacy policy
  - Collection, use, disclosure/sharing, cookies/analytics, security, user rights, request procedure, policy changes, effective date, and contact language drafted
  - Policy matches the actual live data-flow inventory
  - Legal/privacy approval artifact recorded

- [ ] 5. Consent and provider handoff
  - Exact pre-submission disclosure and affirmative action defined
  - Recipient categories and what happens next explained
  - Required service consent separated from optional marketing consent
  - Consent record, withdrawal, failure, and provider-handoff behavior defined
  - Legal, privacy, product, and operations approval recorded

- [ ] 6. Retention and deletion
  - Retention period or defensible criterion for each data category
  - Consent/application logs, analytics, support records, and backups covered
  - Deletion, legal-hold, and legally required retention exceptions defined
  - Owner and operational deletion procedure confirmed
  - Legal/privacy/security approval recorded

- [ ] 7. Terms and marketplace disclosures
  - Terms of Use, effective date, entity/contact wording, marketplace/not-a-lender role, provider responsibility, no-guarantee language, prohibited use, liability, dispute, and governing-law terms finalized
  - Live claims reconciled with the claims register
  - Legal approval artifact recorded

- [ ] 8. Verified `sameAs` references
  - Official public profile URLs inventoried
  - Ownership and entity match verified for every URL
  - Only approved URLs selected for structured data
  - Brand/SEO approval recorded

- [ ] 9. Staging and production indexing policy
  - [x] Staging remains `noindex,nofollow`
  - Production indexing scope and approval authority documented
  - Routes excluded from indexing identified
  - SEO/legal launch approval recorded before enabling production indexing

- [ ] 10. Implementation and release evidence
  - Approved values and copy replace controlled placeholders
  - Live submission stays disabled until its backend and approved consent/data handling exist
  - [x] `npm run validate:legal` passes
  - [x] `npm run qa:release` passes
  - Approval artifact or named reviewers are linked in the roadmap changelog
  - `F44-GOV-02` is marked complete in `ROADMAP.md` only after all acceptance criteria are satisfied

## Current item

Item 1 — Legal business identity.

### Facts confirmed by business owner

- Existing entity: SBA Tools (exact registered punctuation and suffix still to verify)
- Legal structure: single-member Texas LLC
- Federal tax treatment: S corporation election

### Working structure selected

- Intended legal name: Fund44 LLC
- Formation jurisdiction: Texas
- Fund44 will be formed as its own single-member LLC.
- The LLC is intended to elect S corporation taxation.
- It will have no outside investors or co-owners at launch.
- It will maintain separate banking, bookkeeping, contracts, insurance, accounts, and operational records.
- It may later be sold independently.
- Launch status: strictly pre-launch as of 2026-07-29; no services have been marketed or provided to customers across state lines.
- Because an S corporation generally cannot have a corporation as a shareholder, the working premise is that the individual owner—not SBA Tools LLC—will directly own Fund44. A CPA and Texas business attorney must confirm this before filing the S election.

### Still required to complete Item 1

- Confirm Texas name availability for Fund44 LLC.
- Check trademark risk separately; state name acceptance does not establish trademark rights.
- File the certificate of formation and retain the accepted formation evidence.
- Obtain an EIN and retain IRS acceptance of Form 2553 before describing the entity as taxed as an S corporation.
- Record business/operations approval and counsel/CPA confirmation.

### Preliminary name review — 2026-07-29

- General open-web and USPTO-indexed searches did not surface an obvious exact U.S. match for “Fund44.” This is not trademark clearance.
- A foreign entity using “Fund44” as part of a longer name appeared in Japan; relevance to U.S. rights has not been established.
- Texas requires the entity name to be distinguishable in the Secretary of State's records. A preliminary determination may be requested from the Corporations Section, but the final determination occurs when the formation filing is processed.
- Required next evidence: Texas preliminary name response or accepted certificate of formation, plus a federal/common-law similarity search covering Fund44, Fund 44, Forty Four Fund, and similar marks for financing and marketplace services.

### Name status reported by business owner

- [x] Business owner reports that a conflict search found no conflicting name.
- [x] Business owner reports that “Fund44 LLC” has been reserved in Texas for 120 days.
- [x] SOSDirect session ID recorded: `072926KW3244`.
- [x] Reservation period reported as 120 days from 2026-07-29; calculated expiration date: 2026-11-26. Confirm against the state confirmation if it displays a different date.
- [x] Search performed by business owner Matt Lilly using Texas SOSDirect on 2026-07-29.
- [x] Search scope confirmed as Texas entity names only.
- [x] Search classified as owner-performed preliminary entity-name review, not a trademark attorney's clearance opinion.
- [x] USPTO exact wordmark search for `fund44` performed by Matt Lilly on 2026-07-29; submitted screenshot shows zero live and zero dead results.
- [ ] Complete federal and common-law trademark clearance for identical and confusingly similar marks in relevant financing and marketplace services.

### Remaining trademark search variants

- [x] `fund 44` searched; screenshot shows 7,657 results, so the result set still requires narrowing and review.
- [x] `fund forty four` searched; screenshot shows 13,060 results, so the result set still requires narrowing and review.
- [x] `fundfortyfour` searched; screenshot shows zero live and zero dead results.
- [x] `44fund` searched with live-status and Class 42 filtering; screenshot shows zero live results.
- [x] `forty four fund` searched; screenshot shows 13,060 results, so the result set still requires narrowing and review.
- [ ] Review similar results for related financial, financing-referral, marketplace, and software services, including likely International Classes 36, 35, and 42; do not rely on class numbers alone.
- [ ] Search common-law sources, including general web results, relevant state business records, domains, app stores, and major business/social platforms.

Screenshot evidence reviewed on 2026-07-29 from the business owner's iCloud folder `Fund44 LLC/fund44 wordmark search`. Two supplied files captured the same `fund forty four` result page. The screenshots establish search counts, not clearance of the broad result sets.

Two additional screenshots reviewed on 2026-07-29 show zero live results for simple Wordmark searches `fund44` and `44fund` with Class 42 selected. These support the preliminary review but are not Combined Mark Expert searches and do not complete review of financing and marketplace services in Classes 35 and 36.

### Agent-operated USPTO review — 2026-07-29

- [x] `CM:"fund 44"` returned no results.
- [x] `CM:"44 fund"` returned no results.
- [x] `CM:(/.*fund.*/ AND /.*forty.*four.*/)` returned no results.
- [x] `CM:(/.*fund.*/ AND /.*44.*/)` returned one Class 36 record: serial `87021929`, a dead/abandoned retirement-planning chart design whose literal text happens to contain “fund” and a year ending in 44. It is not an apparent competing Fund44 brand.
- [x] Repository-local screenshots captured at [exact search evidence](evidence/uspto-exact-fund-44-search-2026-07-29.png) and [expanded spelled search evidence](evidence/uspto-expanded-spelled-search-2026-07-29.png).
- [x] Preliminary web-index searches for Fund44/Fund 44/Fund Forty Four/44 Fund with financing-related terms did not surface an apparent U.S. competing small-business financing marketplace. Results were unrelated numeric references, foreign entities/funds, and the business owner's own `fund44.com` presence.
- [ ] A comprehensive common-law search and legal likelihood-of-confusion opinion remain outside this owner/agent preliminary review; obtain them from trademark counsel if formal clearance is required.

### Trademark filing basis

- [x] Current status supports an intent-to-use application premise under Section 1(b), not a claim of current use in commerce.
- [ ] If an application is filed, finalize the precise goods/services descriptions and classes with trademark counsel.
- [ ] After bona fide interstate use begins, retain acceptable specimens and accurate first-use dates, then file the required allegation/statement of use before registration.
