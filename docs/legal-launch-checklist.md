# Fund44 Legal Launch Checklist

Governance checklist for roadmap task `F44-GOV-02`. Updated on `2026-07-26`.

This checklist reflects the achievable portion implemented in this branch: centralized legal/entity configuration, explicit staging-versus-production indexing policy, conservative public disclosure wording approved by business, and controlled placeholder handling for unresolved identity and contact values. It is not evidence that launch approvals are complete.

## Current implementation state

- Central legal/entity/indexing configuration exists in `src/lib/legal.js`.
- Staging and preview are explicitly non-indexable by configuration.
- Production indexing is configuration-gated and must not be enabled until unresolved approvals are complete.
- Verified `sameAs` entries are omitted entirely until verified.
- Legal business name, mailing address, support email, and support phone remain visibly controlled as TBD values and cannot masquerade as final production data.
- Business-approved conservative drafts are reused for:
  - curated lender-network story
  - fit-over-fees explanation
  - faster-process and workflow-availability explanation
- Formal counsel review remains recommended before broad production launch.

## Still required before launch

### Identity and contact

- [ ] Confirm legal business name for public/legal use.
- [ ] Confirm mailing address for legal/privacy/contact use.
- [ ] Confirm support email for privacy, legal, and customer-support workflows.
- [ ] Confirm support phone for support/contact workflows.
- [ ] Replace all TBD identity placeholders with verified values only after approval.

### Privacy, consent, and user rights

- [ ] Approve final privacy notice language.
- [ ] Approve live consent language and the exact lender-sharing disclosure.
- [ ] Approve data-retention periods and disposal rules.
- [ ] Approve user-rights intake process for access, correction, deletion, and communication preferences.
- [ ] Confirm jurisdiction-specific privacy handling, if any.

### Security and operations

- [ ] Approve launch-ready security claims, if any.
- [ ] Confirm the retention/security owner for user-submitted documents and application data.
- [ ] Confirm incident/support routing for privacy and security requests.

### SEO and entity references

- [ ] Verify the final production indexing rule with legal and SEO.
- [ ] Verify any `sameAs` profiles before adding them.
- [ ] Confirm final entity description for schema and legal surfaces.

## Rules implemented in code

- Never fabricate:
  - legal business name
  - mailing address
  - support email
  - support phone
  - sameAs profiles
- Do not switch staging/preview to indexable mode until the remaining approvals are complete.
- Do not reintroduce blocked wording such as:
  - `75+ lender integrations`
  - public `Lendflow` naming
  - exact process-time promises
  - unsupported ranking, compensation, or security claims

## Evidence for this branch

- `src/lib/legal.js` centralizes identity, disclosure, and indexing state.
- `src/pages/legal.js`, `src/components/shell.js`, `src/pages/about.js`, `src/pages/how-it-works.js`, `src/pages/home.js`, `src/pages/resources.js`, `public/llms.txt`, and `public/humans.txt` now use the approved conservative wording or the controlled-TBD state.
- `scripts/validate-legal.mjs` and `tests/legal.test.mjs` enforce the key governance rules repository-locally.
