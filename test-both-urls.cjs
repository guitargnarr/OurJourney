const { chromium } = require('playwright');

async function testApp(url, name) {
  console.log(`\n🧪 Testing ${name}: ${url}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });

    // Get title
    const title = await page.title();
    console.log(`✅ Title: ${title}`);

    // Check if login page exists
    const hasLoginForm = await page.locator('input[type="password"]').count() > 0;
    console.log(`${hasLoginForm ? '✅' : '❌'} Login form: ${hasLoginForm ? 'Present' : 'Missing'}`);

    // Check for privacy link
    const privacyLinks = await page.locator('text=Privacy').count();
    console.log(`${privacyLinks > 0 ? '✅' : '❌'} Privacy link: ${privacyLinks} found`);

    // Check header text
    const headerText = await page.locator('h1').first().textContent().catch(() => 'None');
    console.log(`📝 Main header: "${headerText}"`);

    // Try login
    if (hasLoginForm) {
      await page.fill('input[type="password"]', 'welcometothespacejam');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Check if logged in (look for Ideas/Calendar/Notes nav)
      const hasNav = await page.locator('text=Ideas').count() > 0;
      console.log(`${hasNav ? '✅' : '❌'} Login successful: ${hasNav}`);

      if (hasNav) {
        // Check for generic branding
        const hasPartner = await page.locator('text=Partner').count() > 0;
        const hasPartner = await page.locator('text=Partner').count() > 0;
        console.log(`${hasPartner ? '✅' : '❌'} Generic branding (Partner 1/2): ${hasPartner}`);
        console.log(`${hasPartner ? '⚠️' : '✅'} Old names (Partner/Matt): ${hasPartner ? 'Still present' : 'Removed'}`);
      }
    }

    // Take screenshot
    await page.screenshot({ path: `/tmp/${name}-screenshot.png`, fullPage: false });
    console.log(`📸 Screenshot saved: /tmp/${name}-screenshot.png`);

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  await testApp('https://ourjourney-app.vercel.app', 'custom-domain');
  await testApp('https://frontend-mdxqx87fg-matthew-scotts-projects-1dc9743e.vercel.app', 'latest-deployment');

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('ourjourney-app.vercel.app = OLD deployment (Sept 2)');
  console.log('frontend-mdxqx87fg = NEW deployment (Nov 25, all fixes)');
  console.log('='.repeat(60) + '\n');
}

main();
