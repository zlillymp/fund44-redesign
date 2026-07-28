import { test, expect } from '@playwright/test';

function isMobileProject(testInfo) {
  return testInfo.project.name.includes('mobile');
}

test.describe('shell accessibility and mobile behavior', () => {
  test('skip link targets rendered app content and primary nav remains literal', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', '#app');

    await page.keyboard.press('Enter');
    await expect(page.locator('#app')).toBeFocused();

    const primaryNav = page.locator('.nav-links[aria-label="Primary"]');
    if (await primaryNav.count()) {
      const navPanel = page.locator('.nav-panel').first();
      if (await navPanel.count()) {
        await expect(navPanel).not.toHaveAttribute('role', /menu/i);
      }
    }
  });

  test('mobile menu traps focus, restores it, and keeps the primary action reachable', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo), 'mobile-specific coverage');

    await page.goto('/');
    const openButton = page.locator('[data-menu-open]');
    await openButton.click();

    const menu = page.locator('#mobileMenu');
    await expect(menu).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('#mobileMenu [data-menu-close]')).toBeFocused();

    const focusLoop = [];
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Tab');
      focusLoop.push(await page.evaluate(() => document.activeElement?.getAttribute('data-menu-close') ?? document.activeElement?.textContent ?? ''));
    }
    expect(focusLoop.some((value) => typeof value === 'string' && value.includes('Preview funding paths'))).toBeTruthy();

    const ctaBox = await page.locator('#mobileMenu .mobile-menu-cta').boundingBox();
    expect(ctaBox).not.toBeNull();
    expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(page.viewportSize().height + 2);

    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-hidden', 'true');
    await expect(openButton).toBeFocused();
  });
});

test.describe('FAQ, motion, and dialog behavior', () => {
  test('faq controls expose aria relationships and toggle from keyboard', async ({ page }) => {
    await page.goto('/financing');

    const faqButton = page.locator('.faq-q').first();
    const answerId = await faqButton.getAttribute('aria-controls');
    expect(answerId).toBeTruthy();
    await expect(page.locator(`#${answerId}`)).toHaveAttribute('role', 'region');

    await faqButton.focus();
    await page.keyboard.press('Enter');
    await expect(faqButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`#${answerId}`)).not.toHaveAttribute('hidden', '');

    await page.keyboard.press('Space');
    await expect(faqButton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(`#${answerId}`)).toHaveAttribute('hidden', '');
  });

  test('reduced-motion project disables staged reveal and count-up waiting', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('reduced-motion'), 'reduced-motion-only coverage');

    await page.goto('/');

    const firstReveal = page.locator('.reveal').first();
    await expect(firstReveal).toHaveClass(/in/);

    const count = page.locator('[data-count]').first();
    await expect(count).toHaveText('4');

    const fitBar = page.locator('[data-fit]').first();
    await expect(fitBar).toHaveCSS('width', /.+/);
  });

  test('eligibility dialog traps focus, restores it, and keeps validation errors announced', async ({ page }, testInfo) => {
    await page.goto('/working-capital');

    const opener = page.getByRole('button', { name: /preview funding paths/i }).first();
    await opener.click();

    const dialog = page.locator('#flowDialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('#flowDialogAnnouncement')).toBeAttached();

    if (isMobileProject(testInfo)) {
      const dialogBox = await dialog.boundingBox();
      expect(dialogBox).not.toBeNull();
      expect(dialogBox.height).toBeLessThanOrEqual(page.viewportSize().height);
    }

    const modeChoice = page.locator('[data-mode-choice="preview"]').first();
    await expect(modeChoice).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-choice="use"]').first()).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await page.getByRole('button', { name: /continue/i }).click();

    const errorText = page.locator('[data-err="use"]');
    await expect(errorText).toBeVisible();

    const activeInfo = await page.evaluate(() => {
      const element = document.activeElement;
      return {
        datasetChoice: element?.getAttribute('data-choice'),
        ariaDescribedBy: element?.getAttribute('aria-describedby') || '',
      };
    });
    expect(activeInfo.datasetChoice).toBe('use');
    expect(activeInfo.ariaDescribedBy).toContain('use-error');

    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      const activeInsideDialog = await page.evaluate(() => Boolean(document.activeElement?.closest('#flowDialog')));
      expect(activeInsideDialog).toBeTruthy();
    }

    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
  });
});
