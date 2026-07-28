# Fund44 Measurement Plan

This file defines the canonical analytics vocabulary for Fund44. Together with [docs/dashboard-spec.md](dashboard-spec.md), it is the implementation contract for `F44-MEA-02`. Do not rename events, KPI formulas, or required properties in implementation without updating this document, the dashboard spec, and the linked task in [ROADMAP.md](../ROADMAP.md).

## Principles

- Measure the same journey consistently across organic, direct, referral, paid, preview, and live entry points.
- Use the route/content manifest as the source of truth for `route_id`, `page_type`, `content_id`, and canonical URL attribution.
- Use distinct `session_id` as the launch reporting grain unless and until a privacy-reviewed durable user identifier is approved and documented.
- Do not send PII in analytics events. Names, email addresses, free text, uploaded document names, and raw lender/application IDs must stay out of the event stream unless a privacy-reviewed exception exists.
- Track outcomes, not just clicks. Preview, live, qualified, manual-review, not-fit, submit-success, and submit-fail must all be explicit.
- Treat dashboard definitions as contracts. If the denominator changes, update this file first.

## North Star

`Qualified financing journeys`

Definition:
Distinct `session_id` values that reach a live eligibility outcome of `qualified` or `manual_review` and then continue to the next committed step in the same session.

Launch formula:

- Count one session at most once per reporting window.
- The session must contain `eligibility_outcome_view` with `eligibility_mode=live` and `outcome_category` in `qualified`, `manual_review`.
- The same session must later contain `application_start` or `contact_request_submit` where `source_outcome=manual_review`.
- Attribute the session to the first qualifying live outcome in that session.

Identity rule:
Session-based reporting is the source of truth at launch. If a privacy-reviewed durable `user_id` is introduced later, user-based views may be added as a secondary lens, but they do not replace the session-based north star until the roadmap and this file are updated.

Why this is the north star:
It combines qualified demand, funnel clarity, and downstream business usefulness better than raw traffic, raw starts, or raw submissions.

## Supporting KPI Set

| KPI | Formula | Notes |
| --- | --- | --- |
| Crawlable landing coverage | Count distinct canonical URLs in the route/content manifest where the page is canonical, indexable, and intended to acquire landing traffic. | Release-health KPI; manifest-derived, not event-derived. |
| Organic landing sessions | Distinct `session_id` where the entry `page_view` has `is_entry=true`, `entry_channel=organic`, and a landing `page_type`. | Segment by `page_type`, `route_family`, and `device_class`. |
| Page-to-CTA rate | Distinct landing sessions with at least one `cta_click` where `cta_type=primary` on the landing route, divided by distinct landing sessions. | Attribute to the landing route only; do not double-count multiple clicks in one session. |
| Funnel start rate | Distinct sessions with `eligibility_start` divided by distinct sessions with a qualifying funnel-entry `cta_click`. | Report preview and live separately; this replaces the looser "eligibility start rate" label. |
| Outcome mix | Distribution of distinct started sessions whose first `eligibility_outcome_view` is `qualified`, `manual_review`, or `not_fit`. | Report separately for preview and live; do not blend modes. |
| Qualified rate | Distinct live-start sessions whose first live `eligibility_outcome_view` has `outcome_category=qualified`, divided by distinct live-start sessions. | Use live mode only. |
| Manual-review rate | Distinct live-start sessions whose first live `eligibility_outcome_view` has `outcome_category=manual_review`, divided by distinct live-start sessions. | Tracks assisted demand. |
| Not-fit rate | Distinct started sessions whose first outcome has `outcome_category=not_fit`, divided by distinct started sessions for the same mode. | Always segment by `eligibility_mode`; do not mix preview and live. |
| Submission completion rate | Distinct live application sessions with `application_submit_result` where `result=success`, divided by distinct live application sessions with `application_start`. | Exclude preview mode entirely. |
| Trust interaction rate | Distinct sessions with `trust_module_view`, `trust_module_click`, or `disclosure_view` before the first funnel start, divided by distinct sessions with `eligibility_start`. | Used for trust and disclosure analysis before conversion. |
| Event completeness rate | Core events carrying every required property divided by all emitted core events. | Core events are `page_view`, `cta_click`, `eligibility_start`, `eligibility_outcome_view`, `application_start`, `application_submit_result`, `contact_request_submit`, `trust_module_view`, and `disclosure_view`. |
| Error-free session rate | Distinct sessions with at least one `page_view` and no `js_error`, divided by distinct sessions with at least one `page_view`. | Monitoring KPI for executive and release-health reporting. |

## Event Catalog

### Shared required properties

Every event below must include these properties unless explicitly not applicable:

| Property | Description |
| --- | --- |
| `event_version` | Version string for event schema changes. |
| `route_id` | Stable ID from the route/content manifest. |
| `canonical_url` | Final clean canonical URL for the page or route context. |
| `page_type` | One of: `home`, `financing_hub`, `program_page`, `article`, `use_case`, `industry`, `state`, `legal`, `contact`, `404`, `funnel_step`, `funnel_outcome`. |
| `template_id` | Template family used to render the page. |
| `content_id` | Stable content manifest ID where applicable. |
| `content_version` | Content version or updated-at marker for freshness tracking. |
| `eligibility_mode` | `preview`, `live`, or `none`. |
| `device_class` | `mobile`, `tablet`, or `desktop`. |
| `session_id` | Analytics session identifier. |
| `environment` | Environment name such as `staging` or `production`. |
| `entry_channel` | `organic`, `direct`, `referral`, `paid`, `email`, `other`. |
| `utm_source` | Campaign source when present. |
| `utm_medium` | Campaign medium when present. |
| `utm_campaign` | Campaign name when present. |
| `referrer_domain` | Parsed referrer domain when present. |
| `experiment_ids` | Active experiment IDs, if any. |
| `consent_state` | Analytics consent status at event time. |

### Content and navigation events

| Event | When it fires | Event-specific properties |
| --- | --- | --- |
| `page_view` | On canonical page view after route resolution. | `is_entry`, `http_status`, `route_family` |
| `content_view` | When a structured content page renders. | `content_group`, `primary_topic`, `freshness_state` |
| `nav_click` | On primary or mobile nav click. | `nav_section`, `nav_label`, `destination_route_id` |
| `cta_click` | On primary, secondary, or inline CTA click. | `cta_id`, `cta_label`, `cta_type`, `cta_placement`, `destination_route_id` |
| `internal_link_click` | On internal content/supporting-link click. | `link_context`, `destination_route_id`, `destination_content_id` |
| `trust_module_view` | When a trust block becomes visible. | `trust_module_id`, `trust_type`, `evidence_source` |
| `trust_module_click` | On interaction with a trust block. | `trust_module_id`, `trust_type`, `destination` |
| `disclosure_view` | When a required disclosure block becomes visible. | `disclosure_id`, `disclosure_context`, `disclosure_version` |
| `faq_expand` | When an FAQ item is expanded. | `faq_id`, `faq_group`, `faq_position` |
| `404_view` | On a rendered not-found page. | `requested_path`, `referring_route_id` |

### Funnel and eligibility events

| Event | When it fires | Event-specific properties |
| --- | --- | --- |
| `eligibility_mode_view` | When preview or live mode is shown to the user. | `mode_source`, `eligible_next_actions` |
| `eligibility_start` | When a user starts preview or live eligibility. | `start_surface`, `start_cta_id`, `mode_source` |
| `eligibility_step_view` | When a funnel step is shown. | `step_id`, `step_name`, `step_index`, `step_count` |
| `eligibility_step_complete` | When a step validates and advances. | `step_id`, `step_name`, `step_index` |
| `eligibility_validation_error` | When validation blocks progress. | `step_id`, `field_ids`, `error_type` |
| `eligibility_outcome_view` | When the outcome screen renders. | `outcome_category`, `outcome_reason_code`, `recommended_next_step` |
| `application_start` | When the user enters the live application flow. | `source_outcome`, `application_mode`, `start_surface` |
| `application_submit_attempt` | On submit attempt in live mode. | `step_id`, `attempt_number` |
| `application_submit_result` | On submit success or failure. | `result`, `failure_reason_code`, `integration_target` |
| `contact_request_submit` | When a manual-review or not-fit contact path is submitted. | `request_type`, `source_outcome` |

### Experiment and ops events

| Event | When it fires | Event-specific properties |
| --- | --- | --- |
| `experiment_exposure` | When an active experiment variant becomes visible to the user. | `experiment_id`, `variant_id`, `surface` |
| `js_error` | When a client-side error is captured for monitoring. | `error_name`, `error_source`, `is_fatal` |
| `performance_budget_result` | When automated performance checks run. | `environment`, `budget_name`, `result` |
| `a11y_check_result` | When automated accessibility checks run in CI. | `suite_name`, `result`, `defect_count` |

## Funnel Definitions

### Organic acquisition funnel

1. `page_view` where `entry_channel=organic`
2. `cta_click` on a primary CTA
3. `eligibility_start`
4. `eligibility_outcome_view`
5. `application_start` or `contact_request_submit`
6. `application_submit_result` with `result=success`

### Preview funnel

1. `eligibility_mode_view` with `eligibility_mode=preview`
2. `eligibility_start`
3. `eligibility_step_complete`
4. `eligibility_outcome_view`
5. `cta_click` or next-step action from preview outcome

### Live qualification funnel

1. `eligibility_mode_view` with `eligibility_mode=live`
2. `eligibility_start`
3. `eligibility_step_complete`
4. `eligibility_outcome_view`
5. `application_start`
6. `application_submit_result`

### Content-assist funnel

1. `content_view`
2. `internal_link_click` or `faq_expand`
3. `cta_click`
4. `eligibility_start`

## Page-Type Reporting Rules

- `home`: report separately from all other landing pages.
- `financing_hub`: national financing overview and hub pages.
- `program_page`: SBA/product pages.
- `article`: learning-hub editorial pages.
- `use_case`, `industry`, `state`: manifest-driven scale pages.
- `legal`, `contact`, `404`: operational/supporting page types.

Do not collapse all content into one generic page type. Page-type reporting is required for roadmap tasks tied to organic growth and contextual funnels.

## Required Property Rules

- `route_id`, `page_type`, `template_id`, and `canonical_url` must match the route/content manifest.
- `canonical_url` must be the clean canonical path, never a fragment (`#/`) URL or a tracking-parameter variant.
- `content_id` is required for any page rendered from structured content.
- `cta_id` is required for every `cta_click`.
- `outcome_category` is required for every `eligibility_outcome_view`.
- `result` and `integration_target` are required for every `application_submit_result`.
- `environment` is required on every event so staging and production can be filtered cleanly.
- `session_id` is required on every client-side event used in KPI calculations.
- Shared properties marked conditionally present, such as `utm_*` and `referrer_domain`, must still be included with empty or null values when unavailable if the chosen vendor supports that shape consistently.
- `experiment_ids` must be present, even if empty, once experimentation begins.
- `consent_state` must be present on every event once consent tooling is added.

## Privacy and PII Restrictions

- Never send direct identifiers: name, email, phone, company name, address, SSN, EIN, date of birth, bank-account details, or uploaded document filenames.
- Never send free-text answers, notes, message bodies, or unbounded form fields.
- Never send raw lender IDs, raw application IDs, or partner-reference IDs to third-party analytics tools.
- When business inputs are needed for analysis, emit only controlled enums, boolean flags, or pre-bucketed ranges that are explicitly approved in implementation review.
- Do not hash PII and treat it as anonymous telemetry unless privacy review explicitly approves that approach.
- Dashboard outputs must stay aggregated; do not build low-volume drill-downs that reconstruct individual applicant journeys.

## QA Checklist

- Event names match this file exactly.
- Shared required properties exist and are populated correctly.
- No PII is emitted in event payloads.
- `environment` cleanly separates staging from production data.
- `route_id`, `canonical_url`, and `page_type` align with the manifest and rendered page.
- Preview and live modes are distinguishable in the event stream.
- Outcome events fire once and only once per rendered outcome.
- CTA IDs and placements are stable across desktop and mobile.
- Disclosure and trust events fire on the required routes and surfaces.
- Attribution fields survive internal navigation and funnel entry.
- 404, validation-error, and submit-failure paths are covered.
- `js_error` volume can be reconciled against error-free session reporting.
- Dashboard queries use the documented denominators.
- Staging and production have separate environments or filters.

## Dashboard Views

Detailed implementation requirements for each view live in [docs/dashboard-spec.md](dashboard-spec.md). `F44-MEA-02` must ship all views below without renaming the underlying KPIs.

### Executive overview

- Qualified financing journeys
- Organic landing sessions
- Funnel start rate
- Submission completion rate
- Error-free session rate

### Organic acquisition

- Landing sessions by page type and route family
- Page-to-CTA rate by template
- Internal-link assisted journeys
- New pages added to crawlable coverage

### Funnel and outcomes

- Preview vs live starts
- Step drop-off
- Outcome mix: qualified, manual review, not fit
- Submit success and failure reasons

### Trust and brand

- Trust-module views and clicks
- CTA performance by trust-module exposure
- Disclosure exposure coverage on funnel pages

### Operations and QA

- Event completeness rate
- Critical 404 volume
- CI run health
- Performance and accessibility check results

## Baseline then Target Workflow

1. Implement and QA the event set above.
2. Collect a clean baseline window after routing, canonicals, and major UX changes have stabilized.
3. Annotate releases, traffic anomalies, and major content launches during the baseline window.
4. Freeze baseline definitions in the dashboard spec once data quality is stable.
5. Set numeric targets only after the baseline is trusted.
6. Revisit targets whenever a denominator, route model, or funnel mode changes materially.

Do not commit to numeric KPI targets before step 5 is complete, and do not backfill retrospective targets into earlier reporting periods.
