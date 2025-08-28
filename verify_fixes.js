/**
 * Quick verification script for critical fixes
 */

const puppeteer = require('puppeteer');

async function verifyFixes() {
    console.log('🔍 Verifying Critical Fixes...\n');
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Test locally first
    console.log('Testing local version...');
    await page.goto('file://' + __dirname + '/index.html', { waitUntil: 'domcontentloaded' });
    
    // 1. CHECK SECURITY: rel="noopener noreferrer"
    const securityCheck = await page.evaluate(() => {
        const externalLinks = document.querySelectorAll('a[href^="http"]');
        let secured = 0;
        let unsecured = [];
        
        externalLinks.forEach(link => {
            if (link.rel && link.rel.includes('noopener')) {
                secured++;
            } else {
                unsecured.push(link.href);
            }
        });
        
        return { secured, unsecured, total: externalLinks.length };
    });
    
    console.log('✅ SECURITY CHECK:');
    console.log(`   Secured links: ${securityCheck.secured}/${securityCheck.total}`);
    if (securityCheck.unsecured.length > 0) {
        console.log('   ❌ Unsecured:', securityCheck.unsecured);
    } else {
        console.log('   ✅ All external links secured!');
    }
    
    // 2. CHECK HOVER EFFECTS: All cards should have transitions
    const hoverCheck = await page.evaluate(() => {
        const cards = document.querySelectorAll('.project-card');
        const results = [];
        
        cards.forEach((card, i) => {
            const style = getComputedStyle(card);
            results.push({
                index: i,
                hasTransition: style.transition.includes('all') || style.transition.includes('transform'),
                transition: style.transition
            });
        });
        
        return results;
    });
    
    console.log('\n✅ HOVER EFFECTS CHECK:');
    hoverCheck.forEach(card => {
        const status = card.hasTransition ? '✅' : '❌';
        console.log(`   Card ${card.index}: ${status} ${card.transition}`);
    });
    
    // 3. CHECK MOBILE OVERFLOW: Test at 390px width
    await page.setViewport({ width: 390, height: 844 });
    
    const overflowCheck = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        
        return {
            bodyOverflowX: getComputedStyle(body).overflowX,
            htmlOverflowX: getComputedStyle(html).overflowX,
            hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth
        };
    });
    
    console.log('\n✅ MOBILE OVERFLOW CHECK (390px):');
    console.log(`   Body overflow-x: ${overflowCheck.bodyOverflowX}`);
    console.log(`   HTML overflow-x: ${overflowCheck.htmlOverflowX}`);
    console.log(`   Horizontal scroll: ${overflowCheck.hasHorizontalScroll ? '❌ YES' : '✅ NO'}`);
    if (overflowCheck.hasHorizontalScroll) {
        console.log(`   Scroll width: ${overflowCheck.scrollWidth}px vs Client: ${overflowCheck.clientWidth}px`);
    }
    
    // 4. CHECK CSS LOADED
    const cssCheck = await page.evaluate(() => {
        const styles = Array.from(document.styleSheets);
        return {
            stylesheets: styles.length,
            hasOverflowFix: styles.some(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    return rules.some(rule => rule.cssText && rule.cssText.includes('overflow-x'));
                } catch(e) {
                    return false;
                }
            })
        };
    });
    
    console.log('\n✅ CSS CHECK:');
    console.log(`   Stylesheets loaded: ${cssCheck.stylesheets}`);
    console.log(`   Overflow fix applied: ${cssCheck.hasOverflowFix ? '✅' : '⚠️'}`);
    
    await browser.close();
    
    console.log('\n================================');
    console.log('📋 SUMMARY:');
    const allSecured = securityCheck.unsecured.length === 0;
    const allHovers = hoverCheck.every(c => c.hasTransition);
    const noScroll = !overflowCheck.hasHorizontalScroll;
    
    console.log(`Security (noopener): ${allSecured ? '✅ FIXED' : '❌ NEEDS FIX'}`);
    console.log(`Hover animations: ${allHovers ? '✅ FIXED' : '❌ NEEDS FIX'}`);
    console.log(`Mobile scroll: ${noScroll ? '✅ FIXED' : '❌ NEEDS FIX'}`);
    
    if (allSecured && allHovers && noScroll) {
        console.log('\n🎉 ALL CRITICAL FIXES VERIFIED!');
    } else {
        console.log('\n⚠️ Some fixes may need attention');
    }
}

verifyFixes().catch(console.error);