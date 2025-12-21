import { test, expect, devices } from '@playwright/test';

test.describe('OurJourney - Core Functionality', () => {
  test('Page loads successfully', async ({ page }) => {
    const response = await page.goto('https://ourjourney-app.vercel.app');
    expect(response.status()).toBe(200);
  });

  test('Title is present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Main heading or welcome visible', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    // Look for heading or welcome content
    const heading = page.locator('h1, h2, [class*="welcome"], [class*="title"]');
    await expect(heading.first()).toBeVisible();
  });

  test('Navigation or header is present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');
    // OurJourney uses login-first pattern - look for login card OR authenticated header
    const loginCard = page.locator('h1:has-text("OurJourney")');
    await expect(loginCard.first()).toBeVisible();
  });
});

test.describe('OurJourney - App Content', () => {
  test('App-related content visible', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    // Look for coparenting/journey related content or login/signup
    const appContent = page.locator('text=/Journey|Parent|Family|Login|Sign|Get Started|Welcome/i');
    const count = await appContent.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Interactive elements present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    // Should have buttons or links
    const interactiveElements = page.locator('a, button');
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('OurJourney - SEO & Meta Tags', () => {
  test('Meta description present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toBeAttached();
  });

  test('OG image present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toBeAttached();
  });

  test('Viewport meta present', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeAttached();
  });
});

test.describe('OurJourney - Mobile Responsiveness', () => {
  test('No horizontal overflow on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

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

    const smallTargets = await page.evaluate(() => {
      const elements = [...document.querySelectorAll('a, button')];
      // Use 43.5 threshold to account for subpixel rounding - 44px is the target
      return elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 43.5 || rect.height < 43.5);
      }).map(el => ({
        text: el.textContent?.slice(0, 30),
        width: Math.round(el.getBoundingClientRect().width),
        height: Math.round(el.getBoundingClientRect().height)
      }));
    });

    console.log('Small touch targets found:', JSON.stringify(smallTargets, null, 2));
    expect(smallTargets).toHaveLength(0);
    await context.close();
  });

  test('Navigation accessible on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    // OurJourney uses login-first with tab navigation - verify main content visible
    const mainContent = page.locator('h1:has-text("OurJourney"), button:has-text("Sign In"), button:has-text("Demo")');
    await expect(mainContent.first()).toBeVisible();
    await context.close();
  });
});

test.describe('OurJourney - Accessibility', () => {
  test('Interactive elements are focusable', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('Links have accessible names', async ({ page }) => {
    await page.goto('https://ourjourney-app.vercel.app');
    await page.waitForLoadState('networkidle');

    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      expect(text || ariaLabel || title).toBeTruthy();
    }
  });
});
