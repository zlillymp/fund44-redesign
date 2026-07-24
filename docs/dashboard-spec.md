# Fund44 Dashboard Spec

This file translates [docs/measurement-plan.md](measurement-plan.md) into dashboard requirements for Fund44. It is vendor-neutral and intentionally does not include analytics SDK code, warehouse SQL, or numeric performance targets. `F44-MEA-02` must implement the views, formulas, filters, and QA expectations defined here.

## Status and Scope

- Ratified for implementation by roadmap task `F44-MEA-01` on 2026-07-24.
- Source inputs: [docs/measurement-plan.md](measurement-plan.md), [ROADMAP.md](../ROADMAP.md), and the route/content manifest introduced by `F44-ARCH-01`.
- Launch reporting grain: distinct `session_id`.
- Default dashboard scope: `environment=production`.
- Staging data, QA traffic, and vendor-debug views must stay out of production KPI rollups.
- If a KPI formula, denominator, event name, or required property changes, update this file and `docs/measurement-plan.md` in the same change.

## Launch Reporting Conventions

- Use distinct `session_id` as the counting grain for all launch KPI cards and funnel steps unless a metric explicitly comes from the manifest or CI systems.
- Attribute a landing session to the entry `page_view` where `is_entry=true`.
- Attribute funnel progression and outcomes to the first qualifying `eligibility_start` for the selected mode in a session.
- Use the first `eligibility_outcome_view` per session and mode for outcome reporting unless a QA investigation explicitly needs repeats.
- Keep preview and live reporting separate by default. A blended view may exist for diagnostics, but it cannot replace the segmented view.
- Store event timestamps in UTC and label any rendered dashboard timezone explicitly.
- Use canonical clean URLs and manifest IDs only. Fragment URLs, preview URLs, and tracking-parameter variants are never valid reporting dimensions.

## Required Event Inputs

All events in the measurement plan event catalog are implementation requirements for `F44-MEA-02`. The dashboard cannot launch while silently dropping any event used by the views below.

| Area | Required events | Required fields for dashboard use |
| --- | --- | --- |
| Landing and attribution | `page_view`, `content_view`, `nav_click`, `cta_click`, `internal_link_click`, `faq_expand`, `404_view` | Shared fields plus `is_entry`, `http_status`, `route_family`, `content_group`, `primary_topic`, `freshness_state`, `cta_id`, `cta_type`, `cta_placement`, `destination_route_id` |
| Trust and disclosure | `trust_module_view`, `trust_module_click`, `disclosure_view` | Shared fields plus `trust_module_id`, `trust_type`, `evidence_source`, `destination`, `disclosure_id`, `disclosure_context`, `disclosure_version` |
| Funnel progression | `eligibility_mode_view`, `eligibility_start`, `eligibility_step_view`, `eligibility_step_complete`, `eligibility_validation_error`, `eligibility_outcome_view` | Shared fields plus `mode_source`, `eligible_next_actions`, `start_surface`, `start_cta_id`, `step_id`, `step_name`, `step_index`, `step_count`, `field_ids`, `error_type`, `outcome_category`, `outcome_reason_code`, `recommended_next_step` |
| Application and follow-up | `application_start`, `application_submit_attempt`, `application_submit_result`, `contact_request_submit` | Shared fields plus `source_outcome`, `application_mode`, `attempt_number`, `result`, `failure_reason_code`, `integration_target`, `request_type` |
| Experiments and QA ops | `experiment_exposure`, `js_error`, `performance_budget_result`, `a11y_check_result` | Shared fields plus `experiment_id`, `variant_id`, `surface`, `error_name`, `error_source`, `is_fatal`, `budget_name`, `suite_name`, `defect_count`, `result` |

Shared fields required for dashboard use:

- `event_version`
- `session_id`
- `environment`
- `route_id`
- `canonical_url`
- `page_type`
- `template_id`
- `content_id`
- `content_version`
- `eligibility_mode`
- `device_class`
- `entry_channel`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `referrer_domain`
- `experiment_ids`
- `consent_state`

## KPI Contract

| KPI | Numerator | Denominator | Notes |
| --- | --- | --- | --- |
| Qualified financing journeys | Distinct sessions with a live `eligibility_outcome_view` where `outcome_category` is `qualified` or `manual_review`, followed in the same session by `application_start` or `contact_request_submit` from `manual_review`. | None. Absolute count. | Count each session once per reporting window. This is the north star. |
| Crawlable landing coverage | Distinct canonical URLs in the approved route/content manifest where the page is canonical, indexable, and meant to acquire landing traffic. | None. Absolute count. | Manifest-derived, not event-derived. |
| Organic landing sessions | Distinct sessions whose entry `page_view` has `is_entry=true`, `entry_channel=organic`, and a landing `page_type`. | None. Absolute count. | Segment by `page_type`, `route_family`, and `device_class`. |
| Page-to-CTA rate | Distinct landing sessions with at least one `cta_click` where `cta_type=primary` on the landing route. | Distinct landing sessions. | Count at most one conversion per session for the rate. |
| Funnel start rate | Distinct sessions with `eligibility_start`. | Distinct sessions with a qualifying funnel-entry `cta_click`. | Always report preview and live separately. |
| Outcome mix | Distinct started sessions grouped by first `eligibility_outcome_view.outcome_category`. | Distinct started sessions for the same mode. | Required buckets: `qualified`, `manual_review`, `not_fit`. |
| Qualified rate | Distinct live-start sessions whose first live outcome is `qualified`. | Distinct live-start sessions. | Live mode only. |
| Manual-review rate | Distinct live-start sessions whose first live outcome is `manual_review`. | Distinct live-start sessions. | Live mode only. |
| Not-fit rate | Distinct started sessions whose first outcome is `not_fit`. | Distinct started sessions for the same mode. | Never blend preview and live unless clearly labeled as a diagnostic cut. |
| Submission completion rate | Distinct live application sessions with `application_submit_result.result=success`. | Distinct live application sessions with `application_start`. | Exclude preview mode. |
| Trust interaction rate | Distinct sessions with `trust_module_view`, `trust_module_click`, or `disclosure_view` before first funnel start. | Distinct sessions with `eligibility_start`. | Used to evaluate trust/disclosure exposure before conversion. |
| Event completeness rate | Core events carrying every required field. | All emitted core events. | Core events are listed in the measurement plan. |
| Error-free session rate | Distinct sessions with at least one `page_view` and no `js_error`. | Distinct sessions with at least one `page_view`. | Executive and release-health KPI. |
| Critical 404 volume | Count of `404_view` events on canonical traffic surfaces. | None. Absolute count. | Report alongside requested path and referring route patterns. |

## Funnel Definitions

| Funnel | Entry rule | Step sequence | Success condition | Exclusions |
| --- | --- | --- | --- | --- |
| Organic acquisition | Entry `page_view` where `entry_channel=organic` and the page is a landing page. | `page_view` -> primary `cta_click` -> `eligibility_start` -> `eligibility_outcome_view` -> `application_start` or `contact_request_submit` -> successful `application_submit_result` when applicable. | Session reaches the next committed step after qualification, with submission success reported separately. | Exclude non-entry organic page views and repeated CTA clicks from the same session step count. |
| Preview funnel | `eligibility_mode_view` where `eligibility_mode=preview`. | `eligibility_mode_view` -> `eligibility_start` -> repeated `eligibility_step_complete` events -> `eligibility_outcome_view` -> next-step CTA or follow-up action. | Session reaches a preview outcome and then takes a documented next action. | Do not include live-only application events in preview completion. |
| Live qualification funnel | `eligibility_mode_view` where `eligibility_mode=live`. | `eligibility_mode_view` -> `eligibility_start` -> repeated `eligibility_step_complete` events -> `eligibility_outcome_view` -> `application_start` -> `application_submit_result`. | Session reaches `application_start`; submission success is a downstream conversion. | Exclude preview starts and repeated outcome renders after the first live outcome. |
| Content-assist funnel | `content_view` on a structured page. | `content_view` -> `internal_link_click` or `faq_expand` -> `cta_click` -> `eligibility_start`. | Session begins the funnel after consuming content. | Do not count navigation clicks that bypass the documented content interaction step. |

Implementation rules:

- Each funnel step counts a session once per funnel entry.
- When a session restarts the same mode, the default dashboard view uses the first start and first outcome; QA/debug views may expose repeats separately.
- Outcome reporting must preserve `eligibility_mode`, `start_surface`, and entry landing context so route-intent analysis remains possible.

## Dashboard Views

### Executive Overview

Purpose: a launch-health summary for stakeholders who need the conversion and reliability picture without debugging event-level detail.

Required cards:

- Qualified financing journeys
- Organic landing sessions
- Funnel start rate
- Submission completion rate
- Error-free session rate

Required visuals:

- Time-series trend for all executive KPIs
- Outcome-mix trend split by `eligibility_mode`
- Top landing route families contributing to qualified financing journeys

Required filters:

- Date range
- `environment`
- `device_class`
- `entry_channel`

### Organic Acquisition

Purpose: measure which landing pages and content types bring in traffic and move visitors into the funnel.

Required cards:

- Crawlable landing coverage
- Organic landing sessions
- Page-to-CTA rate
- Funnel start rate from organic landings

Required visuals:

- Organic landing sessions by `page_type` and `route_family`
- Page-to-CTA rate by `template_id`
- Internal-link-assisted journeys from `article` and `financing_hub` pages
- Newly added canonical landing pages over time

Required table:

- Top landing routes with `canonical_url`, `route_id`, sessions, CTA rate, funnel start rate, and qualified financing journeys

Required filters:

- Date range
- `page_type`
- `route_family`
- `device_class`
- `entry_channel` fixed or prefiltered to `organic`

### Funnel and Outcomes

Purpose: show where users drop, which outcomes they receive, and whether live application starts and submits are healthy.

Required cards:

- Preview starts
- Live starts
- Qualified rate
- Manual-review rate
- Not-fit rate
- Submission completion rate

Required visuals:

- Step-drop-off funnel for preview and live modes separately
- Outcome mix by `eligibility_mode`
- Validation errors by `step_id` and `error_type`
- Submission failures by `failure_reason_code` and `integration_target`

Required table:

- Route-context summary showing landing route, funnel starts, outcome mix, application starts, and submit success

Required filters:

- Date range
- `eligibility_mode`
- `start_surface`
- `device_class`
- `entry_channel`
- `route_family`

### Trust and Brand

Purpose: verify that trust and disclosure surfaces are visible, interacted with, and associated with better-informed conversion behavior.

Required cards:

- Trust interaction rate
- Disclosure exposure coverage on funnel-entry routes
- CTA rate with trust/disclosure exposure

Required visuals:

- Trust-module views and clicks by `trust_type`
- Disclosure views by `disclosure_context`
- CTA performance segmented by trust/disclosure exposure before funnel start
- Outcome mix segmented by trust/disclosure exposure

Required filters:

- Date range
- `page_type`
- `trust_type`
- `disclosure_context`
- `device_class`

### Operations and QA

Purpose: catch broken instrumentation, routing problems, and release regressions before KPI reporting becomes untrustworthy.

Required cards:

- Event completeness rate
- Error-free session rate
- Critical 404 volume
- Latest performance budget result
- Latest accessibility check result

Required visuals:

- Missing-field counts by event name
- `js_error` trend by `error_source`
- `404_view` trend by requested path pattern and referring route
- Performance-budget and accessibility-check results over time

Required table:

- Core event health with event name, total volume, completeness status, and last-seen timestamp

Required filters:

- Date range
- `environment`
- Event name
- `route_family`

## Dashboard QA Checklist

- Every KPI query matches the formula and denominator in this file and the measurement plan.
- Production views default to `environment=production`.
- Preview and live funnels are separated by default.
- Distinct-session counting is applied consistently across cards, funnels, and tables.
- Repeated CTA clicks, repeated step views, and repeated outcomes do not inflate session-based KPIs.
- Breakdown totals reconcile to filtered totals for the same date range and environment.
- Required manifest dimensions (`route_id`, `canonical_url`, `page_type`, `template_id`) are populated on all dashboard-driving events.
- `404_view`, `eligibility_validation_error`, `application_submit_result` failures, and `js_error` events are visible in QA views.
- Trust and disclosure views can be reconciled against route inventory for required surfaces.
- Dashboard filters never surface fragment URLs as canonical dimensions.
- Saved queries or dashboard definitions are versioned or otherwise reproducible during review.

## Privacy and Access Rules

- Raw dashboards and exports must not contain direct identifiers, hashed PII, free text, uploaded document names, or partner-specific raw IDs.
- User-level drill-downs are for limited QA access only and must still exclude PII-bearing fields.
- Stakeholder-facing dashboards should be aggregated to route, page-type, channel, device, mode, and outcome dimensions.
- If a slice becomes so small that it meaningfully exposes an individual journey, combine or suppress it.
- Staging and vendor-debug data must never appear in stakeholder production views.

## Baseline Then Target Workflow

1. Implement the event taxonomy and dashboard definitions in `F44-MEA-02`.
2. Pass the event QA checklist in the measurement plan and the dashboard QA checklist in this file.
3. Start the baseline window only after major route, canonical, CTA, and funnel-shape changes are stable.
4. Record the baseline artifact with:
   - baseline start date
   - baseline end date
   - environment scope
   - route/content manifest version
   - measurement-plan version
   - dashboard-spec version
   - release annotations and traffic anomalies
   - any data exclusions or caveats
5. Freeze the baseline definitions and notes before discussing numeric goals.
6. Set numeric KPI targets only after the baseline artifact is accepted.
7. Re-baseline when a denominator, route model, consent boundary, or funnel mode changes materially.

Target-setting rule:

- Do not place numeric performance targets in this file until a clean baseline artifact exists.
- Until then, use status labels such as `baseline pending`, `baseline active`, and `baseline frozen` instead of target values.
