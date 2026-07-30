# Codebase Requirements Analysis: Texas Metro Expansion (F44-CONT-07)

**Task ID**: F44-CONT-07  
**Working Directory**: `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_metro`  
**Project Root**: `/Users/mattlilly/Documents/Projects/fund44-redesign`  
**Author**: Explorer 1  
**Date**: 2026-07-30  

---

## 1. Executive Summary & Problem Statement

Task **F44-CONT-07** expands Fund44's organic search footprint into 10 key Texas metropolitan markets: **Houston, San Antonio, Dallas, Austin, Fort Worth, El Paso, Arlington, Corpus Christi, Plano, and Laredo**.

This report investigates the exact codebase mechanics required to integrate these 10 metro pages into Fund44's architecture without violating any governance, content quality, citation, routing, prerendering, link graph, or accessibility gates.

### Core Objective
Determine:
1. How state/industry/use-case pages are structured and validated.
2. How metro content JSON files should be structured (`content/metros/*.json` or `content/metros/texas/*.json`).
3. How Texas SBA District Offices and regional SBDC networks must be registered in `content/citations.mjs`.
4. How routing, content loading, link graph generation, funnel context, rendering, and static site prerendering pick up metro pages.
5. A step-by-step implementation specification for the implementer agent.

---

## 2. Codebase Architecture & Key Files Inspected

### 2.1 Content Schema & Templates
- **`content/schema/content-model.mjs`**: Defines `baseRequiredFields` (30 fields including `id`, `routeId`, `slug`, `pageType`, `templateId`, `hero`, `quickAnswer`, `whoItFits`, `whenItMayNotFit`, `typicalDocuments`, `howFund44Fits`, `commonQuestions`, `relatedIds`, `contributors`, `freshness`, `claimIds`, `claimReview`, `citationIds`, `disclosureIds`, `indexability`, `intent`, `measurement`) and `templateRequiredFields`.
- **`content/schema/scalable-page-contract.mjs`**: Defines `standardSectionKeys` (`quickAnswer`, `whoItFits`, `whenItMayNotFit`, `typicalDocuments`, `howFund44Fits`, `commonQuestions`), `scalableEvidenceFieldKeys`, `scalableTemplateFieldRequirements` (defines section requirements per template), and `scalableTemplateContracts`.
- **`content/templates/scalable-page-templates.mjs`**: Contains scalable page template definitions for `financing_hub`, `product_page`, `use_case_page`, `industry_page`, and `state_page`.

### 2.2 Routing & Manifest System
- **`content/manifest.mjs`**: Single source of truth for site routes (`routeManifest.routes`), primary navigation (`navigation.primary`), mobile navigation (`navigation.mobile`), and footer navigation (`navigation.footer`).
- **`src/lib/routes.js`**: Consumes `content/manifest.mjs`. Builds lookup maps (`routeById`, `routeByPath`, `routeByContentId`, `routeBySlug`). Exported helpers include `getRoute`, `getCanonicalRoutes`, `getRouteByPath`, `getBreadcrumbs`, `getPrimaryNavigation`, `getMobileNavigation`, `getFooterNavigation`.
- **`src/lib/content.js`**: Loads all content JSON files statically using ESM JSON imports (`import ... from '...' with { type: 'json' }`). Exposes getters: `getAllContent`, `getContentById`, `getContentByRouteId`, `getContentBySlug`, `getStatePages`, etc.
- **`src/pages/index.js`**: Maps route `pageKey` properties to page rendering functions in `pageRenderers`. Implements `renderRouteToHtml(pathname)`.

### 2.3 Evidence & Citations Infrastructure
- **`content/citations.mjs`**: Exports `citationRegistry` (array of citation objects) and `getCitationById`. Each citation object defines `id`, `citationType` (`internal_approved`, `external_primary`, `external_reference`), `title`, `sourceLabel`, `url` (or `documentPath`), `reviewedDate`, `expiresDate`, `approvalStatus`, `freshness` (roles, window, triggers), `allowedScopes`, and `claimIds`.
- **`docs/claims-register.md`**: Master claims register containing `F44-PROD-01` through `F44-PROD-07` and marketing claims.
- **`scripts/validate-citations.mjs`**: Gating script asserting that every claim-bearing content record references valid, non-expired citations covering its evidence scopes and claim IDs.

### 2.4 Internal Link Graph & Crawl Files
- **`src/lib/link-graph.js`**: Constructs the internal link graph across indexable canonical routes (`getLinkGraph()`, `getLinkModuleForRoute(routeId)`). Enforces hub links, contextual links, and next-step links while validating against minimum requirements and prohibiting orphan routes or cycles.
- **`scripts/build-link-graph.mjs`**: Generates `docs/link-graph.md`.
- **`src/lib/crawl.js`**: Generates `sitemap.xml`, `robots.txt`, `llms.txt`, and `route-attribution.json`.
- **`src/lib/route-inventory.js`**: Exposes `getIndexableRoutes`, `getSitemapEntries`, `getLlmsEntries`, `getRouteInventory`.
- **`scripts/prerender.mjs`**: Iterates over `getCanonicalRoutes()` from `src/lib/routes.js`, renders HTML via `renderRouteToHtml()`, updates head metadata, and writes output files to `dist/<path>/index.html`.

### 2.5 Validation & Release Scripts
- **`scripts/validate-content.mjs`**: Validates content model, scalable contracts, relationships, indexability, measurement, and link graph integrity.
- **`scripts/validate-routes.mjs`**: Validates route manifest uniqueness, navigation bindings, sitemap/llms URLs, and content indexability alignment.
- **`scripts/report-freshness.mjs` & `scripts/validate-freshness.mjs`**: Audits content/citation freshness against policies.
- **`scripts/run-release-gates.mjs`**: Orchestrates all release validation gates before build.

---

## 3. Detailed Requirements for the 10 Texas Metros

### 3.1 Targeted Texas Metros Inventory

| # | Metro Name | Route ID | Path | Slug | Content ID | SBA District Office Coverage | Regional SBDC Network |
|---|---|---|---|---|---|---|---|
| 1 | Houston | `houston_sba_loans` | `/metros/texas/houston-sba-loans` | `houston-sba-loans` | `metro_houston_sba_loans` | SBA Houston District Office | Texas Gulf Coast SBDC (UH) |
| 2 | San Antonio | `san_antonio_sba_loans` | `/metros/texas/san-antonio-sba-loans` | `san-antonio-sba-loans` | `metro_san_antonio_sba_loans` | SBA San Antonio District Office | South-West Texas Border SBDC (UTSA) |
| 3 | Dallas | `dallas_sba_loans` | `/metros/texas/dallas-sba-loans` | `dallas-sba-loans` | `metro_dallas_sba_loans` | SBA Dallas/Fort Worth District Office | North Texas SBDC (Dallas College) |
| 4 | Austin | `austin_sba_loans` | `/metros/texas/austin-sba-loans` | `austin-sba-loans` | `metro_austin_sba_loans` | SBA San Antonio District Office | Texas State University SBDC |
| 5 | Fort Worth | `fort_worth_sba_loans` | `/metros/texas/fort-worth-sba-loans` | `fort-worth-sba-loans` | `metro_fort_worth_sba_loans` | SBA Dallas/Fort Worth District Office | Tarrant County College SBDC |
| 6 | El Paso | `el_paso_sba_loans` | `/metros/texas/el-paso-sba-loans` | `el-paso-sba-loans` | `metro_el_paso_sba_loans` | SBA El Paso District Office | El Paso Community College SBDC |
| 7 | Arlington | `arlington_sba_loans` | `/metros/texas/arlington-sba-loans` | `arlington-sba-loans` | `metro_arlington_sba_loans` | SBA Dallas/Fort Worth District Office | UT Arlington SBDC |
| 8 | Corpus Christi | `corpus_christi_sba_loans` | `/metros/texas/corpus-christi-sba-loans` | `corpus-christi-sba-loans` | `metro_corpus_christi_sba_loans` | SBA San Antonio District Office | Del Mar College SBDC |
| 9 | Plano | `plano_sba_loans` | `/metros/texas/plano-sba-loans` | `plano-sba-loans` | `metro_plano_sba_loans` | SBA Dallas/Fort Worth District Office | Collin SBDC |
| 10 | Laredo | `laredo_sba_loans` | `/metros/texas/laredo-sba-loans` | `laredo-sba-loans` | `metro_laredo_sba_loans` | SBA San Antonio District Office | TAMIU SBDC |

*Note on Path Structure*: Following state page conventions (`/states/california-sba-loans`), metro paths are structured as `/metros/texas/<slug>` (e.g. `/metros/texas/houston-sba-loans`).

---

### 3.2 Texas SBA District Offices & SBDC Citations Registration Format

To satisfy `scripts/validate-citations.mjs` and `content/schema/content-model.mjs`, all external primary sources for Texas SBA District Offices and regional SBDCs must be registered in `content/citations.mjs`:

```javascript
// External primary citations for Texas SBA Districts and SBDCs in content/citations.mjs
{
  id: 'external_sba_houston_district_2026_07_30',
  citationType: 'external_primary',
  title: 'Houston District Office',
  sourceLabel: 'U.S. Small Business Administration',
  url: 'https://www.sba.gov/district/houston',
  reviewedDate: '2026-07-30',
  expiresDate: '2027-07-30',
  approvalStatus: 'current_reviewed',
  freshness: EXTERNAL_CITATION_FRESHNESS,
  allowedScopes: ['educational_editorial', 'document_guidance'],
  claimIds: ['F44-PROD-07'],
},
{
  id: 'external_sba_dallas_fort_worth_district_2026_07_30',
  citationType: 'external_primary',
  title: 'Dallas/Fort Worth District Office',
  sourceLabel: 'U.S. Small Business Administration',
  url: 'https://www.sba.gov/district/dallas-fort-worth',
  reviewedDate: '2026-07-30',
  expiresDate: '2027-07-30',
  approvalStatus: 'current_reviewed',
  freshness: EXTERNAL_CITATION_FRESHNESS,
  allowedScopes: ['educational_editorial', 'document_guidance'],
  claimIds: ['F44-PROD-07'],
},
{
  id: 'external_sba_san_antonio_district_2026_07_30',
  citationType: 'external_primary',
  title: 'San Antonio District Office',
  sourceLabel: 'U.S. Small Business Administration',
  url: 'https://www.sba.gov/district/san-antonio',
  reviewedDate: '2026-07-30',
  expiresDate: '2027-07-30',
  approvalStatus: 'current_reviewed',
  freshness: EXTERNAL_CITATION_FRESHNESS,
  allowedScopes: ['educational_editorial', 'document_guidance'],
  claimIds: ['F44-PROD-07'],
},
{
  id: 'external_sba_el_paso_district_2026_07_30',
  citationType: 'external_primary',
  title: 'El Paso District Office',
  sourceLabel: 'U.S. Small Business Administration',
  url: 'https://www.sba.gov/district/el-paso',
  reviewedDate: '2026-07-30',
  expiresDate: '2027-07-30',
  approvalStatus: 'current_reviewed',
  freshness: EXTERNAL_CITATION_FRESHNESS,
  allowedScopes: ['educational_editorial', 'document_guidance'],
  claimIds: ['F44-PROD-07'],
},
{
  id: 'external_texas_sbdc_gulf_coast_2026_07_30',
  citationType: 'external_primary',
  title: 'Texas Gulf Coast SBDC Network',
  sourceLabel: 'University of Houston SBDC',
  url: 'https://www.sbdc.uh.edu/',
  reviewedDate: '2026-07-30',
  expiresDate: '2027-07-30',
  approvalStatus: 'current_reviewed',
  freshness: EXTERNAL_CITATION_FRESHNESS,
  allowedScopes: ['educational_editorial', 'document_guidance'],
  claimIds: ['F44-PROD-07'],
},
{
  id: 'external_texas_sbdc_north_texas_2026_07_30',
  citationType: 'external_primary',
  title: 'North Texas SBDC Network',
  sourceLabel: 'Dallas College SBDC',
  url: 'https://www.northtexassbdc.org/',
  reviewedDate: '2026-07-30',
  expiresDate: '2027-07-30',
  approvalStatus: 'current_reviewed',
  freshness: EXTERNAL_CITATION_FRESHNESS,
  allowedScopes: ['educational_editorial', 'document_guidance'],
  claimIds: ['F44-PROD-07'],
},
{
  id: 'external_texas_sbdc_south_west_border_2026_07_30',
  citationType: 'external_primary',
  title: 'South-West Texas Border SBDC Network',
  sourceLabel: 'UTSA SBDC',
  url: 'https://txsbdc.org/',
  reviewedDate: '2026-07-30',
  expiresDate: '2027-07-30',
  approvalStatus: 'current_reviewed',
  freshness: EXTERNAL_CITATION_FRESHNESS,
  allowedScopes: ['educational_editorial', 'document_guidance'],
  claimIds: ['F44-PROD-07'],
},
{
  id: 'external_texas_governor_small_business_2026_07_30',
  citationType: 'external_primary',
  title: 'Texas Governor\'s Office of Small Business Assistance',
  sourceLabel: 'State of Texas Office of the Governor',
  url: 'https://gov.texas.gov/business/page/small-business',
  reviewedDate: '2026-07-30',
  expiresDate: '2027-07-30',
  approvalStatus: 'current_reviewed',
  freshness: EXTERNAL_CITATION_FRESHNESS,
  allowedScopes: ['educational_editorial', 'document_guidance'],
  claimIds: ['F44-PROD-07'],
}
```

---

### 3.3 Metro Content JSON Structure (`content/metros/texas/*.json`)

Every metro page JSON file must conform to `baseRequiredFields` and the `metro_page` (or `state_page`) scalable template contract.

Below is the complete canonical JSON schema for Houston (`content/metros/texas/houston.json`):

```json
{
  "id": "metro_houston_sba_loans",
  "routeId": "houston_sba_loans",
  "slug": "texas/houston-sba-loans",
  "pageType": "metro",
  "templateId": "metro_page",
  "title": "Houston SBA loan resources",
  "metaTitle": "Houston SBA loan resources & local advisory guide",
  "metaDescription": "Houston small businesses comparing SBA 7(a), 504, acquisition, or working capital financing can confirm their SBA district office and local Texas Gulf Coast SBDC partners before starting lender comparisons.",
  "summary": "The Houston metro page connects Harris County and Greater Houston small businesses with the SBA Houston District Office, Texas Gulf Coast SBDC Network, and Fund44's national financing explainers.",
  "contentVersion": "2026-07-30",
  "shortLabel": "Houston SBA loan resources",
  "metroName": "Houston",
  "stateCode": "TX",
  "hero": {
    "eyebrow": "Metro resources: Greater Houston, TX",
    "title": "Houston SBA loan guidance starts with the Houston District Office and local SBDC advising.",
    "lead": "Houston-area business owners in Harris, Fort Bend, and surrounding counties can verify their official SBA district contacts and SBDC counseling resources before comparing 7(a), 504, or acquisition financing options."
  },
  "quickAnswer": {
    "term": "Houston SBA loan resources",
    "definition": "help small business owners in Greater Houston locate the SBA Houston District Office and Texas Gulf Coast SBDC Network advisors before selecting an SBA 7(a), SBA 504, acquisition, or working capital program."
  },
  "whoItFitsHeading": "When this Houston page fits best",
  "whoItFits": {
    "heading": "When Houston SBA loan resource pages tend to fit",
    "items": [
      "You operate a business in Greater Houston (Harris, Fort Bend, Montgomery, or Galveston counties) and want local SBA district office details.",
      "You want free local advisory support from the Texas Gulf Coast SBDC before submitting financial documentation to lenders.",
      "You are organizing a Houston commercial real estate, acquisition, or expansion project and need official regional support starting points.",
      "You want to connect local Houston advisory contacts with Fund44's clean national program explainers."
    ]
  },
  "whenItMayNotFit": {
    "heading": "When this path may not fit as well",
    "items": [
      "If you already know your exact loan structure (e.g. SBA 504 vs 7(a)), starting directly on national product pages is faster.",
      "If your business is located in North Texas (Dallas/Fort Worth) or South Texas (San Antonio), review those specific metro resource pages instead.",
      "If you require city-specific municipal permit or tax advice, consult the City of Houston or Harris County clerk directly."
    ]
  },
  "bestFitHeading": "Common financing explainers Houston borrowers review after finding local support",
  "bestFitProducts": [
    {
      "routeId": "sba_7a",
      "title": "SBA 7(a) loans",
      "description": "General working capital, debt refinance, and business growth up to $5 million.",
      "iconKey": "building"
    },
    {
      "routeId": "sba_504",
      "title": "SBA 504 loans",
      "description": "Long-term fixed-rate financing for owner-occupied real estate and heavy machinery in Houston.",
      "iconKey": "layers"
    },
    {
      "routeId": "business_acquisition",
      "title": "Business acquisition financing",
      "description": "Acquisition and partner buyout structure explainers for Texas buy-side transactions.",
      "iconKey": "route"
    }
  ],
  "localSupportHeading": "Official Houston support resources to open first",
  "localSupportCards": [
    {
      "id": "houston_sba_district",
      "title": "SBA Houston District Office",
      "description": "Serves 32 counties in Southeast Texas. Provides local program guidance, district events, and certified lender directory access.",
      "resourceLabel": "Review Houston SBA District details",
      "resourceUrl": "https://www.sba.gov/district/houston",
      "iconKey": "building",
      "relatedRouteId": "sba_7a"
    },
    {
      "id": "houston_gulf_coast_sbdc",
      "title": "Texas Gulf Coast SBDC Network",
      "description": "Headquartered at the University of Houston, offering no-cost business consulting and loan application prep across Southeast Texas.",
      "resourceLabel": "Find a Houston SBDC center",
      "resourceUrl": "https://www.sbdc.uh.edu/",
      "iconKey": "route",
      "relatedRouteId": "resource_preparing_documents"
    },
    {
      "id": "texas_governor_small_biz",
      "title": "Texas Governor's Small Business Assistance",
      "description": "Statewide small-business portal providing Texas business permits, financing guides, and resource directories.",
      "resourceLabel": "Open Texas Governor's Portal",
      "resourceUrl": "https://gov.texas.gov/business/page/small-business",
      "iconKey": "cash",
      "relatedRouteId": "financing"
    }
  ],
  "metroContextHeading": "Houston-specific context before financing comparisons",
  "metroContextCards": [
    {
      "id": "houston_district_coverage",
      "title": "Houston District covers 32 Southeast Texas counties",
      "description": "The Houston SBA District Office handles Harris, Fort Bend, Montgomery, Galveston, and surrounding counties.",
      "iconKey": "building",
      "relatedRouteId": "sba_7a"
    },
    {
      "id": "houston_uh_sbdc_hub",
      "title": "UH SBDC Network provides localized counseling",
      "description": "The University of Houston SBDC network operates multiple regional centers to help borrowers organize financial statements.",
      "iconKey": "file",
      "relatedRouteId": "resource_preparing_documents"
    },
    {
      "id": "houston_key_industries",
      "title": "Energy, healthcare, trade, and construction focus",
      "description": "Houston's economy features major industrial, medical, and port infrastructure projects that often utilize SBA 504 or equipment financing.",
      "iconKey": "layers",
      "relatedRouteId": "sba_504"
    }
  ],
  "typicalDocuments": {
    "heading": "Common Houston-starting document examples",
    "items": [
      "3 years of business and personal tax returns",
      "Year-to-date balance sheet and profit & loss statement",
      "Houston business entity registration (Texas Secretary of State / Harris County assumed name certificate)",
      "Detailed use of funds schedule for equipment, property, or working capital"
    ]
  },
  "howFund44Fits": {
    "heading": "How Fund44 fits",
    "summary": "Fund44 connects Houston business owners with official local advisory contacts and provides clean, objective national financing comparisons.",
    "bullets": [
      "Points borrowers directly to the SBA Houston District Office and UH SBDC network.",
      "Compares national 7(a), 504, and acquisition explainers without imposing state or local markup.",
      "Leaves lender selection, credit approval, and loan terms to certified SBA lenders and third-party providers."
    ]
  },
  "alternativePathsHeading": "Compare these next if your Houston project shifts focus",
  "alternativePaths": [
    {
      "routeId": "owner_occupied_real_estate",
      "title": "Owner-occupied real estate",
      "description": "Review property acquisition and construction financing paths.",
      "iconKey": "building"
    },
    {
      "routeId": "working_capital",
      "title": "Working capital & lines",
      "description": "Review cash-flow and operating credit line options.",
      "iconKey": "cash"
    },
    {
      "routeId": "resource_preparing_documents",
      "title": "Preparing your documents",
      "description": "Organize your loan package before contacting lenders.",
      "iconKey": "file"
    }
  ],
  "sectionDisclosureHtml": "<strong>Fund44 is not a lender.</strong> Houston resource details are educational entry points. SBA office coverage, counseling availability, eligibility, and lender terms vary by business profile and provider.",
  "ctaBanner": {
    "heading": "Ready to compare Houston SBA financing options?",
    "subheading": "Preview the national financing paths that match your business profile after gathering local support."
  },
  "commonQuestions": [
    {
      "id": "houston_faq_district",
      "question": "Which SBA district office covers Houston?",
      "answer": "The SBA Houston District Office serves Houston and 32 surrounding Southeast Texas counties."
    },
    {
      "id": "houston_faq_sbdc",
      "question": "Where can I get free SBA loan application help in Houston?",
      "answer": "The Texas Gulf Coast SBDC Network, led by the University of Houston, provides free business consulting and loan prep assistance."
    },
    {
      "id": "houston_faq_7a_504",
      "question": "What is the difference between SBA 7(a) and 504 loans for Houston businesses?",
      "answer": "SBA 7(a) offers flexible capital up to $5M for general working capital, debt refinance, or acquisitions. SBA 504 is specialized for owner-occupied real estate and heavy machinery."
    },
    {
      "id": "houston_faq_fund44",
      "question": "Does Fund44 issue SBA loans directly in Houston?",
      "answer": "No. Fund44 is an educational technology marketplace, not a lender. Loans are issued by third-party SBA participating lenders."
    }
  ],
  "relatedIds": [
    "page_financing",
    "page_sba_7a",
    "page_sba_504",
    "page_business_acquisition",
    "article_preparing_your_documents",
    "state_california_sba_loans"
  ],
  "contributors": {
    "authorId": null,
    "reviewerId": null,
    "authorPlaceholder": "TBD under F44-GOV-02",
    "reviewerPlaceholder": "TBD under F44-GOV-02"
  },
  "publishedDate": null,
  "reviewedDate": null,
  "claimIds": [
    "F44-PROD-02",
    "F44-PROD-03",
    "F44-PROD-06",
    "F44-PROD-07"
  ],
  "claimReview": {
    "requiresEvidence": true,
    "evidenceScopes": [
      "product_overview",
      "program_detail",
      "educational_editorial",
      "document_guidance"
    ]
  },
  "citationIds": [
    "external_sba_7a_loans_2026_07_26",
    "external_sba_504_loans_2026_07_26",
    "external_sba_houston_district_2026_07_30",
    "external_texas_sbdc_gulf_coast_2026_07_30",
    "external_texas_governor_small_business_2026_07_30"
  ],
  "disclosureIds": [
    "F44-DISC-04",
    "F44-DISC-09"
  ],
  "indexability": {
    "canonical": true,
    "indexable": true,
    "sitemap": true,
    "llms": true,
    "landing": true
  },
  "intent": {
    "primaryTopic": "houston_sba_loan_resources",
    "contentGroup": "metro",
    "audienceStage": "consideration",
    "funnelRole": "entry"
  },
  "measurement": {
    "routeFamily": "metro",
    "ctaIds": [
      "preview_funding_paths",
      "metro_best_fit_link",
      "metro_alternative_link",
      "cta_banner_preview_funding_paths"
    ],
    "faqGroup": "houston_sba_resources_faq",
    "freshnessState": "review_pending"
  }
}
```

---

### 3.4 Route Manifest Additions (`content/manifest.mjs`)

Add 10 route objects to `routeManifest.routes`:

```javascript
// Add to routeManifest.routes in content/manifest.mjs
{
  routeId: 'houston_sba_loans',
  analyticsRouteId: 'houston_sba_loans',
  pageKey: 'houstonMetroPage',
  path: '/metros/texas/houston-sba-loans',
  pageType: 'metro',
  templateId: 'metro_page',
  routeFamily: 'metro',
  contentId: 'metro_houston_sba_loans',
  title: 'Houston SBA loan resources',
  breadcrumbLabel: 'Houston',
  footerLabel: 'Houston SBA loans',
  panelLabel: 'Houston SBA loans',
  panelDescription: 'Houston District Office & Texas Gulf Coast SBDC resources',
  parentRouteId: 'financing',
  slug: 'texas/houston-sba-loans',
  crawl: { canonical: true, indexable: true, sitemap: true, llms: true, landing: true, changefreq: 'monthly', priority: '0.7' },
  legacyHashes: [],
},
// [Repeat for San Antonio, Dallas, Austin, Fort Worth, El Paso, Arlington, Corpus Christi, Plano, Laredo]
```

Also add all 10 route IDs (`houston_sba_loans`, `san_antonio_sba_loans`, `dallas_sba_loans`, `austin_sba_loans`, `fort_worth_sba_loans`, `el_paso_sba_loans`, `arlington_sba_loans`, `corpus_christi_sba_loans`, `plano_sba_loans`, `laredo_sba_loans`) to:
- `navigation.primary[0].panel`
- `navigation.mobile`
- `navigation.footer[0].items`

---

### 3.5 Schema & Template Modifications

1. **`content/schema/content-model.mjs`**:
   Add `metro_page` to `templateRequiredFields`:
   ```javascript
   export const templateRequiredFields = {
     // ...
     metro_page: [
       'shortLabel',
       'metroName',
       'stateCode',
       'whoItFitsHeading',
       'bestFitHeading',
       'bestFitProducts',
       'localSupportHeading',
       'localSupportCards',
       'metroContextHeading',
       'metroContextCards',
       'alternativePathsHeading',
       'alternativePaths',
       'sectionDisclosureHtml',
       'ctaBanner',
     ],
   };
   ```

2. **`content/schema/scalable-page-contract.mjs`**:
   Add `metro_page` to `scalableTemplateFieldRequirements` and add contract definition to `scalableTemplateContracts`:
   ```javascript
   export const scalableTemplateFieldRequirements = {
     // ...
     metro_page: [
       'shortLabel',
       'metroName',
       'stateCode',
       'whoItFitsHeading',
       'bestFitHeading',
       'bestFitProducts',
       'localSupportHeading',
       'localSupportCards',
       'metroContextHeading',
       'metroContextCards',
       'alternativePathsHeading',
       'alternativePaths',
       'sectionDisclosureHtml',
       'ctaBanner',
     ],
   };

   // Add to scalableTemplateContracts array:
   {
     templateId: 'metro_page',
     pageType: 'metro',
     routeFamilies: ['metro'],
     clusterId: 'metro',
     launchTask: 'F44-CONT-07',
     currentRouteIds: [
       'houston_sba_loans',
       'san_antonio_sba_loans',
       'dallas_sba_loans',
       'austin_sba_loans',
       'fort_worth_sba_loans',
       'el_paso_sba_loans',
       'arlington_sba_loans',
       'corpus_christi_sba_loans',
       'plano_sba_loans',
       'laredo_sba_loans',
     ],
     standardSections: standardSectionKeys,
     requiredFields: scalableTemplateFieldRequirements.metro_page,
     evidenceFields: scalableEvidenceFieldKeys,
     notes: 'Metro pages extend state page patterns down to metropolitan statistical areas.',
   }
   ```

3. **`content/templates/scalable-page-templates.mjs`**:
   Register `metro_page` in `scalablePageTemplates`.

---

### 3.6 Route & Content Loader Updates

1. **`src/lib/content.js`**:
   Import all 10 metro JSON files:
   ```javascript
   import houstonMetroPage from '../../content/metros/texas/houston.json' with { type: 'json' };
   import sanAntonioMetroPage from '../../content/metros/texas/san-antonio.json' with { type: 'json' };
   import dallasMetroPage from '../../content/metros/texas/dallas.json' with { type: 'json' };
   import austinMetroPage from '../../content/metros/texas/austin.json' with { type: 'json' };
   import fortWorthMetroPage from '../../content/metros/texas/fort-worth.json' with { type: 'json' };
   import elPasoMetroPage from '../../content/metros/texas/el-paso.json' with { type: 'json' };
   import arlingtonMetroPage from '../../content/metros/texas/arlington.json' with { type: 'json' };
   import corpusChristiMetroPage from '../../content/metros/texas/corpus-christi.json' with { type: 'json' };
   import planoMetroPage from '../../content/metros/texas/plano.json' with { type: 'json' };
   import laredoMetroPage from '../../content/metros/texas/laredo.json' with { type: 'json' };
   ```
   Add them to `rawRecords` array and export `getMetroPages()`:
   ```javascript
   export function getMetroPages() {
     return records.filter((record) => record.templateId === 'metro_page');
   }
   ```

2. **`src/pages/metros.js`** (new page component):
   Create dedicated renderer for metro pages, structured similarly to `src/pages/states.js`:
   ```javascript
   import { icon } from '../lib/svg.js';
   import { setMeta, ld } from '../lib/seo.js';
   import {
     pageHero,
     ctaBanner,
     faqBlock,
     disclosure,
     eyebrow,
     answerBlock,
     relatedLinksModule,
     sectionListCard,
     sectionSummaryCard,
     featItem,
   } from '../components/ui.js';
   import { getBreadcrumbs, hrefForContentId, hrefForRoute } from '../lib/routes.js';
   import { getContentByRouteId } from '../lib/content.js';
   import { getLinkModuleForRoute } from '../lib/link-graph.js';
   import { FUNNEL_CONTEXT_KINDS, getContextProofCopy } from '../lib/eligibility/model.js';

   function renderMetro(routeId) {
     const content = getContentByRouteId(routeId);
     const crumbs = getBreadcrumbs(routeId);
     const faqItems = content.commonQuestions.map((item) => ({ id: item.id, q: item.question, a: item.answer }));
     const linkModule = getLinkModuleForRoute(routeId);

     setMeta({
       title: content.metaTitle,
       description: content.metaDescription,
       path: hrefForContentId(content.id),
       jsonld: [ld.breadcrumb(crumbs), ld.faq(faqItems)],
     });

     return `...HTML template for metro page...`;
   }

   export function houstonMetroPage() { return renderMetro('houston_sba_loans'); }
   export function sanAntonioMetroPage() { return renderMetro('san_antonio_sba_loans'); }
   export function dallasMetroPage() { return renderMetro('dallas_sba_loans'); }
   export function austinMetroPage() { return renderMetro('austin_sba_loans'); }
   export function fortWorthMetroPage() { return renderMetro('fort_worth_sba_loans'); }
   export function elPasoMetroPage() { return renderMetro('el_paso_sba_loans'); }
   export function arlingtonMetroPage() { return renderMetro('arlington_sba_loans'); }
   export function corpusChristiMetroPage() { return renderMetro('corpus_christi_sba_loans'); }
   export function planoMetroPage() { return renderMetro('plano_sba_loans'); }
   export function laredoMetroPage() { return renderMetro('laredo_sba_loans'); }
   ```

3. **`src/pages/index.js`**:
   Import exported functions from `./metros.js` and add to `pageRenderers`.

4. **`src/lib/link-graph.js`**:
   Update helper functions to recognize `metro_page` / `metro` family:
   - `getHubRouteId`: `if (route.templateId === 'metro_page') return 'financing';`
   - `getNextStepRouteId`: `if (route.templateId === 'metro_page') return 'how_it_works';`
   - `getMinimumRequirements`:
     ```javascript
     if (route.templateId === 'metro_page') {
       return { hub: 1, contextual: 6, next: 1 };
     }
     ```
   - `getStructuredContextualRouteIds`: Add `record.localSupportCards?.forEach(...)` and `record.metroContextCards?.forEach(...)`.
   - `sectionHeading`: `if (route.templateId === 'metro_page') return 'Compare related paths';`

5. **`src/lib/eligibility/model.js`**:
   Add `metro: 'metro'` to `FUNNEL_CONTEXT_KINDS`, `ROUTE_FAMILY_TO_CONTEXT_KIND`, `getContextKindLabel`, `getContextProofCopy`, and `getContextNextStepCopy`:
   ```javascript
   export const FUNNEL_CONTEXT_KINDS = Object.freeze({
     generic: 'generic',
     program: 'program',
     useCase: 'use_case',
     industry: 'industry',
     state: 'state',
     metro: 'metro',
   });
   ```

---

## 4. Validation & Release Pipeline Integration

When implementation of F44-CONT-07 is done, running the project's standard release gates will validate all 10 Texas metro pages:

1. `npm run validate:content`
   - Verifies all 10 metro JSON files pass `baseRequiredFields` and `metro_page` scalable contract checks.
   - Verifies unique IDs, valid slugs, matching routes, and link graph compliance.

2. `npm run validate:routes`
   - Verifies route manifest entries, navigation links, sitemap/llms URLs, and content indexability alignment.

3. `npm run validate:citations`
   - Verifies all Texas SBA district and SBDC citations exist, are non-expired, and cover all evidence scopes/claims.

4. `npm run build:link-graph`
   - Regenerates `docs/link-graph.md`, ensuring 0 orphan routes and valid hub/contextual link counts.

5. `npm run report:freshness`
   - Confirms freshness policy is attached and review status is tracked.

6. `npm test`
   - Runs the test suite (including `tests/template-variants.test.mjs`), asserting section contract coverage, reading order, funnel context parameters, unique FAQ IDs, and zero template leakage across all 10 metro pages.

7. `npm run build` & `npm run validate:prerender`
   - Generates static build output in `dist/` and verifies every canonical metro route emits prerendered HTML with valid `<title>`, canonical URL, breadcrumb schema, and FAQ schema.

---

## 5. Step-by-Step Implementation Plan for F44-CONT-07

The implementer agent should follow these exact steps:

1. **Step 1: Register Texas Citations (`content/citations.mjs`)**
   - Add external primary citations for Houston, Dallas/Fort Worth, San Antonio, and El Paso SBA District Offices.
   - Add external primary citations for UH SBDC, Dallas College SBDC, UTSA SBDC, Texas State SBDC, TCC SBDC, EPCC SBDC, UTA SBDC, Del Mar SBDC, Collin SBDC, TAMIU SBDC, and Texas Governor's Office of Small Business Assistance.

2. **Step 2: Update Schema Contracts (`content/schema/`)**
   - In `content/schema/content-model.mjs`: Add `metro_page` requirements to `templateRequiredFields`.
   - In `content/schema/scalable-page-contract.mjs`: Add `metro_page` to `scalableTemplateFieldRequirements` and `scalableTemplateContracts`.

3. **Step 3: Create 10 Texas Metro JSON Content Files (`content/metros/texas/`)**
   - Create directory `content/metros/texas/`.
   - Create `houston.json`, `san-antonio.json`, `dallas.json`, `austin.json`, `fort-worth.json`, `el-paso.json`, `arlington.json`, `corpus-christi.json`, `plano.json`, and `laredo.json`.

4. **Step 4: Update Route Manifest (`content/manifest.mjs`)**
   - Add 10 route objects to `routeManifest.routes`.
   - Add route IDs to `navigation.primary[0].panel`, `navigation.mobile`, and `navigation.footer[0].items`.

5. **Step 5: Wire Content & Route Loaders (`src/lib/`)**
   - In `src/lib/content.js`: Import 10 metro JSON files, include in `rawRecords`, export `getMetroPages()`.
   - In `src/lib/eligibility/model.js`: Add `metro` context kind and copy definitions.
   - In `src/lib/link-graph.js`: Add `metro_page` handling for hub, next-step, minimum requirements, contextual link extraction, and section headings.

6. **Step 6: Build Metro Component & Register Page Renderers (`src/pages/`)**
   - Create `src/pages/metros.js` with `renderMetro(routeId)` and page function exports.
   - Update `src/pages/index.js` to register metro page functions in `pageRenderers`.

7. **Step 7: Update Test Matrix & Helpers (`tests/`)**
   - Update `tests/helpers/route-matrix.mjs` to include `metro` route family.
   - Update `tests/template-variants.test.mjs` to include `metro` / `metro_page` in scalable template test loops.

8. **Step 8: Execute Verification Suite**
   - Run `npm run validate:content`, `npm run validate:routes`, `npm run validate:citations`, `npm run build:link-graph`, `npm run report:freshness`, `npm test`, `npm run build`, `npm run validate:prerender`.
