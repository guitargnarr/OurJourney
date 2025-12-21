import { test, expect, devices } from '@playwright/test';

test.describe('OurJourney App - Core Functionality', () => {
  test('Page loads successfully', async ({ page }) => {
    const response = await page.goto('https://ourjourney-app.vercel.app');
    expect(response.status()).toBe(200);
  });

  test('Title contains OurJourney', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    const title = await page.title();
    expect(title).toContain('OurJourney');
  });

  test('Login form is visible', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('Demo button is visible', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    const demoButton = page.locator('text=Try Demo');
    await expect(demoButton).toBeVisible();
  });

  test('Privacy link is present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    const privacyLink = page.locator('text=Privacy');
    await expect(privacyLink).toBeVisible();
  });
});

test.describe('OurJourney App - Demo Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.click('text=Try Demo');
    await page.waitForTimeout(2000);
  });

  test('Demo mode loads dashboard', async ({ page }) => {
    const ideasTab = page.locator('button:has-text("Ideas")');
    await expect(ideasTab).toBeVisible();
  });

  test('Ideas tab is functional', async ({ page }) => {
    await page.click('text=Ideas');
    await page.waitForTimeout(500);

    const ideasBank = page.locator('text=Ideas Bank');
    await expect(ideasBank).toBeVisible();
  });

  test('Calendar tab is functional', async ({ page }) => {
    await page.click('text=Calendar');
    await page.waitForTimeout(500);

    // Calendar shows day headers
    const sunHeader = page.locator('text=Sun');
    await expect(sunHeader).toBeVisible();
  });

  test('Notes tab is functional', async ({ page }) => {
    await page.click('text=Notes');
    await page.waitForTimeout(500);

    const loveNotes = page.locator('text=Love Notes');
    await expect(loveNotes).toBeVisible();
  });

  test('Logout button is present', async ({ page }) => {
    const logoutButton = page.locator('text=Logout');
    await expect(logoutButton).toBeVisible();
  });
});

test.describe('OurJourney App - Mobile Responsiveness', () => {
  test('No horizontal overflow on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();

    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.click('text=Try Demo');
    await page.waitForTimeout(2000);

    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    await context.close();
  });

  test('Touch targets meet 44px minimum', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();

    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.click('text=Try Demo');
    await page.waitForTimeout(2000);

    const smallTargets = await page.evaluate(() => {
      const elements = [...document.querySelectorAll('a, button')];
      return elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      }).map(el => ({
        text: el.textContent?.slice(0, 20),
        width: Math.round(el.getBoundingClientRect().width),
        height: Math.round(el.getBoundingClientRect().height)
      }));
    });

    expect(smallTargets).toHaveLength(0);

    await context.close();
  });

  test('Ideas tab accessible on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();

    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.click('text=Try Demo');
    await page.waitForTimeout(2000);

    await page.click('text=Ideas');
    await page.waitForTimeout(500);

    const ideasBank = page.locator('text=Ideas Bank');
    await expect(ideasBank).toBeVisible();

    await context.close();
  });

  test('Calendar tab accessible on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();

    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.click('text=Try Demo');
    await page.waitForTimeout(2000);

    await page.click('text=Calendar');
    await page.waitForTimeout(500);

    const sunHeader = page.locator('text=Sun');
    await expect(sunHeader).toBeVisible();

    await context.close();
  });

  test('Notes tab accessible on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();

    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.click('text=Try Demo');
    await page.waitForTimeout(2000);

    await page.click('text=Notes');
    await page.waitForTimeout(500);

    const loveNotes = page.locator('text=Love Notes');
    await expect(loveNotes).toBeVisible();

    await context.close();
  });
});

test.describe('OurJourney App - SEO & Meta Tags', () => {
  test('Meta description is present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');

    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toBeAttached();
  });

  test('Viewport meta is present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeAttached();
  });

  test('Page has proper heading hierarchy', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1');
    await expect(h1.first()).toContainText('OurJourney');
  });
});

test.describe('OurJourney App - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.click('text=Try Demo');
    await page.waitForTimeout(2000);
  });

  test('Buttons are focusable', async ({ page }) => {
    const ideasButton = page.locator('button:has-text("Ideas")');
    await ideasButton.focus();

    const isFocused = await ideasButton.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('Form inputs have proper structure', async ({ page }) => {
    await page.click('text=Ideas');
    await page.waitForTimeout(500);

    const titleInput = page.locator('input[placeholder*="idea"]');
    await expect(titleInput).toBeVisible();
  });

  test('Interactive elements are keyboard accessible', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
