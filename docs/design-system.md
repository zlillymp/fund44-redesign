# Fund44 Design System

This document is the implementation contract for `F44-DSGN-01`. It defines which design tokens are primitives versus semantic roles, how CTA hierarchy works, which components own shared visual patterns, and which release checks must pass before new public UI ships.

## Principles

- Preserve the Fund44 signal color and brand. The system takes inspiration from disciplined B2B product design, but it is not a literal copy of any outside brand.
- Separate palette primitives from semantic roles. Components should consume semantic role tokens, not direct palette variables or raw hex values.
- Default to hairline depth. Most public surfaces should use borders and subtle elevation, not heavy shadows.
- Keep CTA meaning stable across templates. Intent and hierarchy matter more than local page preference.
- Treat shared components as owned system assets. Page templates should compose them instead of forking visual rules inline.

## Token Layers

### Primitive tokens

Primitive tokens define the visual source material and should change rarely.

- Color primitives live in `src/styles.css` under the light/dark theme blocks:
  - `--bg`, `--bg-2`
  - `--surface`, `--surface-2`
  - `--ink`, `--ink-2`
  - `--muted`, `--faint`
  - `--line`, `--line-strong`
  - `--accent`, `--accent-deep`, `--accent-ink`
  - `--dark-bg`, `--dark-surface`, `--on-dark`, `--on-dark-muted`, `--on-dark-line`
- Type primitives:
  - `--font-display`, `--font-body`, `--font-mono`
  - `--text-xs` through `--text-hero`
- Layout primitives:
  - `--space-*`
  - `--radius-*`
  - `--content-*`
- Motion/elevation primitives:
  - `--transition`, `--ease-out`
  - `--elevation-*`

### Semantic role tokens

Semantic roles are the only tokens public components should reference for color/elevation intent.

- Surface roles:
  - `--role-canvas`
  - `--role-canvas-muted`
  - `--role-surface-base`
  - `--role-surface-subtle`
  - `--role-surface-inverse`
- Text roles:
  - `--role-text-primary`
  - `--role-text-secondary`
  - `--role-text-muted`
  - `--role-text-faint`
  - `--role-text-inverse`
  - `--role-text-inverse-muted`
- Line roles:
  - `--role-line-subtle`
  - `--role-line-strong`
  - `--role-line-inverse`
- Accent/status roles:
  - `--role-accent-fill`
  - `--role-accent-fill-strong`
  - `--role-accent-text`
  - `--role-accent-ink`
  - `--role-status-info-*`
  - `--role-status-neutral-*`
  - `--role-status-error-*`
- Focus roles:
  - `--role-focus-ring`
  - `--role-focus-ring-strong`

## CTA Hierarchy

CTA intent is fixed at the system level.

- Primary CTA:
  - Class: `btn btn-primary`
  - Meaning: start or continue the preview flow or the top conversion action on a surface
  - Allowed copy themes: preview, continue, primary next step
- Secondary CTA:
  - Class: `btn btn-on-dark` on inverse surfaces, `btn btn-ghost` on default surfaces
  - Meaning: adjacent, non-primary navigation or learn-more path
- Tertiary/action links:
  - Class: `btn-link`, `accent-text`
  - Meaning: supporting navigation inside cards, tables, related-links modules, or resource lists

Do not introduce new CTA semantics by inventing one-off button classes. Extend the system first if a new intent is genuinely required.

## Surface, Text, Status, and Error Roles

### Surface usage

- Default cards, panels, and dialogs:
  - use `--role-surface-base`
  - border with `--role-line-subtle`
- Subtle supporting surfaces:
  - use `--role-surface-subtle`
- Inverse sections and banners:
  - use `--role-surface-inverse`
  - pair with inverse text roles

### Text usage

- Headings and key labels:
  - `--role-text-primary`
- Body/supporting copy:
  - `--role-text-secondary`
- Metadata, hints, disclosures, and helper text:
  - `--role-text-muted`
- Inverse sections:
  - `--role-text-inverse`
  - `--role-text-inverse-muted`

### Status and error usage

- Info or governed disclosure treatments:
  - use `--role-status-info-*`
- Neutral blocked/live-unavailable surfaces:
  - use `--role-status-neutral-*`
- Validation errors:
  - use `--role-status-error-*`

Do not use ad hoc error hex values in component or page markup. The prior one-off error color has been centralized into the role token layer.

## Spacing and Typography

- Use the spacing scale only through `--space-*` tokens or classes built from them.
- Hero, page-head, and feature-gap spacing is centralized through:
  - `--section-hero-top`
  - `--section-page-top`
  - `--section-gap-feature`
- Typography usage:
  - Display/headlines: `--font-display`
  - Body copy: `--font-body`
  - Metadata/eyebrows/status labels: `--font-mono`
- Preferred helper classes:
  - `text-body-sm`, `text-body-base`, `text-body-lg`
  - `title-lg`, `title-xl`
  - `max-measure-*`

## Component Ownership

### System-owned shared components

These components define shared public visual language and should be extended centrally.

- `src/components/ui.js`
  - shared CTA banner
  - answer block
  - related-links module
  - product visualizations
- `src/components/shell.js`
  - header
  - nav/dropdowns
  - mobile menu
  - footer and footer banner
- `src/components/flow.js`
  - eligibility dialog states
  - consent/review/outcome shells
- `src/lib/svg.js`
  - wordmark/logo lockup

### Page-template responsibilities

Pages may compose system-owned classes and components, but should not recreate:

- CTA hierarchy
- card and panel styling
- disclosure framing
- related-link list styling
- legal metadata rows
- common list/icon layouts

If a page needs a new repeated visual pattern, add it to the shared layer first.

## Trust and Disclosure Slots

`F44-TRUST-01` is still a separate task, but `F44-DSGN-01` standardizes the slots those modules should use later.

- Trust modules should fit the same card/panel/disclosure roles already defined here.
- Disclosure bars remain a shared component pattern, not page-local variations.
- Verified proof modules should attach to the system’s spacing, surface, and text roles instead of introducing new colors or shadow behavior.

## Release Rules

Before new shared public UI ships:

1. Components must use semantic role tokens for color/elevation intent.
2. No raw hex/rgb/rgba color literals may appear in `src/components/**`, `src/pages/**`, or `src/lib/svg.js`.
3. Static inline presentation styles are disallowed in the public layer.
   Allowed exception: dynamic inline custom-property values or numeric positions/widths required by current visualizations and progress UI.
4. Default public surfaces should prefer hairline depth or subtle elevation, not legacy heavy shadows.
5. New shared patterns must be documented here or reuse an existing documented pattern.

## Validation Gate

The automated gate for this task is `npm run validate:design`.

It currently checks:

- raw color drift in the public component/page layer
- static inline presentation drift in `src/components/**`, `src/pages/**`, and `src/lib/svg.js`
- presence of semantic role tokens and core CTA classes in the system styles

## Current Shared Inventory

- Tokens and utilities: `src/styles.css`
- Product/detail surfaces and dialog patterns: `src/product.css`
- Shared public UI: `src/components/ui.js`
- Global shell/navigation/footer: `src/components/shell.js`
- Eligibility flow shell: `src/components/flow.js`
- Brand mark/wordmark: `src/lib/svg.js`

## Extending the System

- Add or rename semantic roles only when multiple surfaces share the same intent.
- If a new token is truly primitive, define it in the primitive layer first and then map it into a semantic role.
- Do not bypass the semantic layer from templates for convenience.
