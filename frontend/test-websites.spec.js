import { test, expect } from '@playwright/test';

test.describe('OurJourney App Testing', () => {
  test('Test ourjourney-app.vercel.app (custom domain)', async ({ page }) => {
    console.log('\n🧪 Testing: https://ourjourney-app.vercel.app');

    await page.goto('https://ourjourney-app.vercel.app');

    // Get title
    const title = await page.title();
    console.log(`  Title: ${title}`);

    // Check for login form
    const passwordInput = await page.locator('input[type="password"]').count();
    console.log(`  Login form: ${passwordInput > 0 ? 'Present' : 'Missing'}`);

    // Check header text
    const headers = await page.locator('h1').allTextContents();
    console.log(`  Headers: ${headers.join(', ')}`);

    // Check for privacy link
    const privacyLinks = await page.locator('text=Privacy').count();
    console.log(`  Privacy links: ${privacyLinks}`);

    // Try to login
    if (passwordInput > 0) {
      await page.fill('input[type="password"]', 'welcometothespacejam');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Check if logged in
      const ideasTab = await page.locator('text=Ideas').count();
      const calendarTab = await page.locator('text=Calendar').count();
      const notesTab = await page.locator('text=Notes').count();

      console.log(`  After login - Ideas tab: ${ideasTab > 0}`);
      console.log(`  After login - Calendar tab: ${calendarTab > 0}`);
      console.log(`  After login - Notes tab: ${notesTab > 0}`);

      // Check for Partner vs Partner/Matt
      const partnerText = await page.locator('text=Partner').count();
      const partnerText = await page.locator('text=Partner').count();
      const mattText = await page.locator('text=Matt').count();

      console.log(`  Generic branding (Partner): ${partnerText} occurrences`);
      console.log(`  Hardcoded names (Partner): ${partnerText} occurrences`);
      console.log(`  Hardcoded names (Matt): ${mattText} occurrences`);
    }

    await page.screenshot({ path: 'ourjourney-app-screenshot.png', fullPage: true });
    console.log(`  Screenshot: ourjourney-app-screenshot.png`);
  });

  test('Test frontend-mdxqx87fg (latest deployment)', async ({ page }) => {
    console.log('\n🧪 Testing: https://frontend-mdxqx87fg-matthew-scotts-projects-1dc9743e.vercel.app');

    await page.goto('https://frontend-mdxqx87fg-matthew-scotts-projects-1dc9743e.vercel.app');

    // Get title
    const title = await page.title();
    console.log(`  Title: ${title}`);

    // Check for login form
    const passwordInput = await page.locator('input[type="password"]').count();
    console.log(`  Login form: ${passwordInput > 0 ? 'Present' : 'Missing'}`);

    // Check header text
    const headers = await page.locator('h1').allTextContents();
    console.log(`  Headers: ${headers.join(', ')}`);

    // Check for privacy link
    const privacyLinks = await page.locator('text=Privacy').count();
    console.log(`  Privacy links: ${privacyLinks}`);

    // Try to login
    if (passwordInput > 0) {
      await page.fill('input[type="password"]', 'welcometothespacejam');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Check if logged in
      const ideasTab = await page.locator('text=Ideas').count();
      const calendarTab = await page.locator('text=Calendar').count();
      const notesTab = await page.locator('text=Notes').count();

      console.log(`  After login - Ideas tab: ${ideasTab > 0}`);
      console.log(`  After login - Calendar tab: ${calendarTab > 0}`);
      console.log(`  After login - Notes tab: ${notesTab > 0}`);

      // Check for Partner vs Partner/Matt
      const partnerText = await page.locator('text=Partner').count();
      const partnerText = await page.locator('text=Partner').count();
      const mattText = await page.locator('text=Matt').count();

      console.log(`  Generic branding (Partner): ${partnerText} occurrences`);
      console.log(`  Hardcoded names (Partner): ${partnerText} occurrences`);
      console.log(`  Hardcoded names (Matt): ${mattText} occurrences`);

      // Test creating a note
      await page.click('text=Notes');
      await page.waitForTimeout(1000);

      const noteTextarea = await page.locator('textarea').count();
      console.log(`  Notes tab - textarea present: ${noteTextarea > 0}`);

      // Check for delete buttons
      const deleteButtons = await page.locator('button[title="Delete note"]').count();
      console.log(`  Delete buttons: ${deleteButtons} found`);
    }

    await page.screenshot({ path: 'frontend-latest-screenshot.png', fullPage: true });
    console.log(`  Screenshot: frontend-latest-screenshot.png`);
  });
});
