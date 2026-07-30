import { test, expect } from '@playwright/test';

function analyticsQueue(page) {
  return page.evaluate(() => window.__FUND44_ANALYTICS_QUEUE__ || []);
}

test.describe('release browser smoke', () => {
  test('home route prerenders metadata, routes cleanly, and emits nav/cta analytics without console errors', async ({ page }, testInfo) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        const text = message.text();
        if (!text.includes('ERR_CONNECTION_REFUSED') && !text.includes('googletagmanager')) {
          consoleErrors.push(text);
        }
      }
    });
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Fund44/);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', 'https://fund44.com/');
    await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute('content', /Fund44/);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(4);
    await expect(page.locator('[data-trust-module-id="home_hero_proof"]')).toBeVisible();
    await page.locator('[data-trust-module-id="home_hero_proof"]').scrollIntoViewIfNeeded();
    await page.locator('[data-disclosure-id="footer_marketplace_disclosure"]').scrollIntoViewIfNeeded();

    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'trust_module_view' && entry.payload.trust_module_id === 'home_hero_proof');
    }).toBe(true);
    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'disclosure_view' && entry.payload.disclosure_id === 'footer_marketplace_disclosure');
    }).toBe(true);

    if (testInfo.project.name.includes('mobile')) {
      await page.locator('[data-menu-open]').click();
      await page.locator('#mobileMenu a[data-nav-section="mobile"][data-destination-route-id="financing"]').click();
    } else {
      await page.locator('a[data-nav-route="financing"]').click();
    }
    await expect(page).toHaveURL(/\/financing$/);
    await expect(page).toHaveTitle(/Small-business financing options/);

    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'nav_click');
    }).toBe(true);
    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'page_view' && entry.payload.route_id === 'financing');
    }).toBe(true);

    await page.locator('a[data-analytics-cta-id="decision_helper_link"]').first().click();
    await expect(page).toHaveURL(/\/use-cases\/buy-a-business|\/use-cases\/owner-occupied-real-estate|\/use-cases\/cash-flow-needs|\/use-cases\/equipment-purchase/);

    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'cta_click');
    }).toBe(true);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('eligibility preview flow emits step, validation, outcome, disclosure, and trust analytics', async ({ page }) => {
    await page.goto('/working-capital');

    await page.getByRole('button', { name: /preview funding paths/i }).first().click();
    await expect(page.locator('#flowDialog')).toBeVisible();

    // Preview auto-starts at use-of-funds; continue without a choice to emit validation analytics.
    await page.getByRole('button', { name: /^Continue/ }).click();
    await page.locator('[data-choice="use"][data-val="working"]').click();
    await page.getByRole('button', { name: /^Continue/ }).click();

    await page.selectOption('[data-field="amount"]', '$150k-$350k');
    await page.getByRole('button', { name: /^Continue/ }).click();

    await page.selectOption('[data-field="tib"]', 'Under 1 year');
    await page.selectOption('[data-field="revenue"]', '$250k-$500k');
    await page.selectOption('[data-field="stateCode"]', 'TX');
    await page.getByRole('button', { name: /^Continue/ }).click();

    await page.check('[data-field="previewConsent"]');
    await page.check('[data-field="nextStepConsent"]');
    await page.getByRole('button', { name: /See my preview/i }).click();

    await expect(page.locator('#flowDialogTitle')).toContainText(/needs more context/i);
    await expect(page.locator('.outcome-actions a')).toHaveCount(4);

    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'eligibility_start');
    }).toBe(true);
    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.filter((entry) => entry.event_name === 'eligibility_step_view').length;
    }).toBeGreaterThanOrEqual(4);
    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'eligibility_validation_error' && entry.payload.step_id === 'use_of_funds');
    }).toBe(true);
    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'eligibility_step_complete');
    }).toBe(true);
    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'eligibility_outcome_view' && entry.payload.outcome_category === 'manual_review');
    }).toBe(true);
  });

  test('faq interactions, direct clean loads, and real 404 handling stay intact', async ({ page }, testInfo) => {
    await page.goto('/resources/preparing-your-documents');
    await expect(page).toHaveTitle(/document checklist/i);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', 'https://fund44.com/resources/preparing-your-documents');

    const faqButton = page.locator('.faq-q').first();
    await faqButton.click();
    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === 'faq_expand');
    }).toBe(true);

    if (testInfo.project.name.includes('mobile')) {
      const primaryAction = page.locator('button[data-analytics-cta-id="cta_banner_preview_funding_paths"]').first();
      await expect(primaryAction).toBeVisible();
      const box = await primaryAction.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThan(40);
      expect(box.height).toBeGreaterThan(40);
    }

    await page.goto('/states/california-sba-loans');
    await expect(page).toHaveTitle(/California SBA loan resources/i);
    await expect(page.locator('main')).toContainText(/Official California support resources to open first/i);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', 'https://fund44.com/states/california-sba-loans');

    await page.goto('/does-not-exist');
    await expect(page).toHaveTitle(/Page not found/i);
    await expect(page.locator('main')).toContainText("This path doesn't lead anywhere.");
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', 'https://fund44.com/404');

    await expect.poll(async () => {
      const queue = await analyticsQueue(page);
      return queue.some((entry) => entry.event_name === '404_view');
    }).toBe(true);
  });
});
