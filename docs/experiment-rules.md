# Experiment rules — F44-EXP-01

Operating rules for every experiment run through `src/lib/experiments.js`. These rules are
binding; an experiment that cannot satisfy them does not run. Companion contracts:
`docs/measurement-plan.md` (event taxonomy), `docs/dashboard-spec.md` (KPI definitions),
`docs/disclosures.md` / `docs/claims-register.md` (approved copy).

## 1. How the harness works

- **Registry-driven.** Experiments are declared in the frozen registry in
  `src/lib/experiments.js`. The registry ships **empty**; adding an entry is a reviewed
  code change that must pass `validateExperimentDefinition` (snake_case ids, a declared
  surface, explicit `enabled` boolean, ≥ 2 variants with non-negative integer weights and
  positive total, ≥ 1 named guardrail metric).
- **Deterministic assignment.** `assignVariant` buckets by a stable hash of
  `experimentId:sessionId`. The same session always sees the same variant; nothing about
  the assignment is stored, transmitted, or derived from user attributes. No PII enters
  the hash — the session id is the existing anonymous analytics session id.
- **Exposure tracking.** Call `trackExperimentExposure({ experimentId, variantId, surface })`
  from `src/lib/analytics.js` at the moment the variant becomes user-visible — not at
  assignment time. It emits the `experiment_exposure` event
  (`experiment_id`, `variant_id`, `surface` per `docs/measurement-plan.md`) and refuses to
  emit for inactive or killed experiments.
- **`experiment_ids` on every event.** `sharedFields()` injects the active experiment ids
  for the session into all analytics events, so any KPI can be segmented by experiment
  without new properties. With an empty registry this is `[]`, which the measurement plan
  requires ("must be present, even if empty").

## 2. Kill switches

Two independent switches, both effective immediately on the next event:

| Switch | Scope | How |
| --- | --- | --- |
| Registry flag | one experiment, permanent | Set `enabled: false` (or remove the entry) and ship the change |
| Runtime override | one experiment, immediate | `globalThis.__FUND44_EXPERIMENT_KILLSWITCH__ = ['<experiment_id>']` |
| Runtime override | all experiments, immediate | `globalThis.__FUND44_EXPERIMENTS_DISABLED__ = true` |

A killed experiment: is excluded from `experiment_ids`, stops emitting
`experiment_exposure` (enforced inside `trackExperimentExposure`), and every surface must
render its control variant. Kill first, investigate second — any guardrail breach or
rendering defect is sufficient cause.

## 3. Guardrail metrics

Each registry entry names at least one guardrail from the KPI contract in
`docs/dashboard-spec.md` (e.g. error-free session rate, funnel start rate, outcome reach
rate). Guardrails are computed from existing events segmented by `experiment_ids` — an
experiment may not invent new events or properties for its own measurement. If a guardrail
degrades materially for a treatment, the experiment is killed via section 2.

## 4. What an experiment may never do

- **Never touch consent or disclosure surfaces.** The `consent_review` step in
  `src/lib/eligibility/model.js` may not be removed, reordered, shortened, or reworded by
  any variant. No variant may remove, hide, or reorder any `[data-disclosure-id]` or
  `[data-trust-module-id]` element — visibility tracking and the release gate assert them
  (`scripts/validate-analytics.mjs`).
- **Never bypass copy governance.** Variant copy is subject to the same rules as base
  copy: claims must trace to `docs/claims-register.md`, disclosure text comes only from
  `src/lib/legal.js` / `docs/disclosures.md`, and `npm run validate:legal` must pass with
  every variant's copy present in the source tree.
- **Never bypass design governance.** Variant styling uses a `data-experiment-variant`
  attribute plus semantic-token rules in `src/styles.css`. No inline styles, no raw
  colors — `npm run validate:design` enforces this on the public layer.
- **Never emit PII.** Experiment and variant ids are snake_case enums; the analytics PII
  guards scan every id in `experiment_ids` individually.
- **Never run a production experiment before consent tooling exists.** Until `F44-GOV-02`
  approves consent language and production indexing, experiments are limited to
  staging/preview environments (`consent_state: staging_preview_only`); enabling one for
  production traffic requires the same stop-and-ask as any consent-affecting change.

## 5. Launch checklist for one experiment

1. Registry entry passes `validateExperimentDefinition` (unit-tested).
2. Variants reviewed against sections 4's copy/design rules; `npm run qa:release` green
   with the variant code in place and the experiment still `enabled: false`.
3. Exposure call sites reviewed: fire on visibility, once per surface render.
4. Guardrails and kill criteria written into the PR description; owner named.
5. Flip `enabled: true` in its own commit so the activation is independently revertable.
6. Verify `experiment_exposure` events and `experiment_ids` segmentation in the QA
   checklist flow of `docs/measurement-plan.md`; record evidence in the `ROADMAP.md`
   changelog per `F44-EXP-01`.
