# Fund44 Measurement Plan

This file defines the analytics vocabulary for Fund44. Do not rename events, KPI formulas, or required properties in implementation without updating this document and the linked task in [ROADMAP.md](../ROADMAP.md).

## Principles

- Measure the same journey consistently across organic, direct, referral, paid, preview, and live entry points.
- Use the route/content manifest as the source of truth for `route_id`, `page_type`, `content_id`, and canonical URL attribution.
- Do not send PII in analytics events. Names, email addresses, free text, uploaded document names, and raw lender/application IDs must stay out of the event stream unless a privacy-reviewed exception exists.
- Track outcomes, not just clicks. Preview, live, qualified, manual-review, not-fit, submit-success, and submit-fail must all be explicit.
- Treat dashboard definitions as contracts. If the denominator changes, update this file first.

## North Star

`Qualified financing journeys`

Definition:
Unique sessions or users who reach a live eligibility outcome of `qualified` or `manual_review` and continue to the next committed step, such as application submission or verified follow-up request.

Why this is the north star:
It combines qualified demand, funnel clarity, and downstream business usefulness better than raw traffic, raw starts, or raw submissions.

## Supporting KPI Set

| KPI | Definition | Notes |
| --- | --- | --- |
| Crawlable landing coverage | Count of canonical, indexable landing pages generated from the route/content manifest. | Release health KPI. |
| Organic landing sessions | Non-branded organic sessions landing on canonical money or content pages. | Segment by page type and route family. |
| Page-to-CTA rate | Landing sessions with at least one primary CTA click divided by landing sessions. | Report by page type, device, and CTA placement. |
| Eligibility start rate | Sessions with `eligibility_start` divided by sessions with a qualifying CTA click. | Separate preview and live modes. |
| Qualified rate | `eligibility_outcome_view` with `outcome_category=qualified` divided by live starts. | Use live mode only. |
| Manual-review rate | `eligibility_outcome_view` with `outcome_category=manual_review` divided by live starts. | Tracks assisted demand. |
| Not-fit rate | `eligibility_outcome_view` with `outcome_category=not_fit` divided by starts. | Monitor for routing/copy problems. |
| Submission completion rate | `application_submit_result` with `result=success` divided by live application starts. | Exclude preview mode. |
| Trust interaction rate | Sessions with `trust_module_view` or `trust_module_click` before a funnel start. | Useful for brand proof analysis. |
| Event completeness rate | Share of core events carrying all required properties. | Operational KPI. |

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
| `experiment_exposure` | When a user is bucketed into an active experiment. | `experiment_id`, `variant_id`, `surface` |
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
- `content_id` is required for any page rendered from structured content.
- `cta_id` is required for every `cta_click`.
- `outcome_category` is required for every `eligibility_outcome_view`.
- `result` and `integration_target` are required for every `application_submit_result`.
- `experiment_ids` must be present, even if empty, once experimentation begins.
- `consent_state` must be present on every event once consent tooling is added.

## QA Checklist

- Event names match this file exactly.
- Shared required properties exist and are populated correctly.
- No PII is emitted in event payloads.
- `route_id`, `canonical_url`, and `page_type` align with the manifest and rendered page.
- Preview and live modes are distinguishable in the event stream.
- Outcome events fire once and only once per rendered outcome.
- CTA IDs and placements are stable across desktop and mobile.
- Attribution fields survive internal navigation and funnel entry.
- 404, validation-error, and submit-failure paths are covered.
- Dashboard queries use the documented denominators.
- Staging and production have separate environments or filters.

## Dashboard Views

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

Do not commit to numeric KPI targets before step 5 is complete.
