/**
 * ULTRATHINK Optimization Verification Script
 * Tests all fixes implemented for DevTools issues
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function testOptimizations() {
    console.log('🚀 ULTRATHINK OPTIMIZATION TESTING');
    console.log('=====================================\n');
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable CSS coverage
    await page.coverage.startCSSCoverage();
    
    // Test local version
    console.log('Testing local optimized version...');
    await page.goto('file://' + __dirname + '/index.html', { 
        waitUntil: 'networkidle2' 
    });
    
    // Wait for animations
    await new Promise(r => setTimeout(r, 2000));
    
    // 1. CHECK: No inline styles from JavaScript
    console.log('\n📝 CHECKING INLINE STYLES...');
    const inlineStyleCheck = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const withInlineStyles = elements.filter(el => {
            const style = el.getAttribute('style');
            return style && style.length > 0;
        });
        
        return {
            total: elements.length,
            withInlineStyles: withInlineStyles.length,
            examples: withInlineStyles.slice(0, 3).map(el => ({
                tag: el.tagName,
                class: el.className,
                style: el.getAttribute('style')
            }))
        };
    });
    
    console.log(`  Inline styles: ${inlineStyleCheck.withInlineStyles}/${inlineStyleCheck.total} elements`);
    if (inlineStyleCheck.withInlineStyles === 0) {
        console.log('  ✅ NO INLINE STYLES FOUND!');
    } else {
        console.log('  ⚠️ Still has inline styles:');
        inlineStyleCheck.examples.forEach(ex => {
            console.log(`    - ${ex.tag}.${ex.class}: ${ex.style}`);
        });
    }
    
    // 2. CHECK: CSS classes are being used
    console.log('\n🎨 CHECKING CSS CLASSES...');
    const cssClassCheck = await page.evaluate(() => {
        const fadeElements = document.querySelectorAll('.fade-in-up');
        const visibleElements = document.querySelectorAll('.visible');
        const navbarScrolled = document.querySelector('.navbar-scrolled');
        
        // Trigger scroll to test navbar
        window.scrollTo(0, 100);
        const navbarAfterScroll = document.querySelector('.navbar-scrolled');
        
        return {
            fadeInUp: fadeElements.length,
            visible: visibleElements.length,
            navbarScrolled: !!navbarAfterScroll,
            projectImages: {
                ziggy: !!document.querySelector('.project-image-ziggy'),
                mirador: !!document.querySelector('.project-image-mirador'),
                security: !!document.querySelector('.project-image-security'),
                legalstream: !!document.querySelector('.project-image-legalstream')
            }
        };
    });
    
    console.log(`  Fade animations: ${cssClassCheck.fadeInUp} elements`);
    console.log(`  Visible elements: ${cssClassCheck.visible} animated`);
    console.log(`  Navbar scroll class: ${cssClassCheck.navbarScrolled ? '✅' : '❌'}`);
    console.log(`  Project images using CSS classes:`);
    Object.entries(cssClassCheck.projectImages).forEach(([name, exists]) => {
        console.log(`    - ${name}: ${exists ? '✅' : '❌'}`);
    });
    
    // 3. CHECK: CSS Usage improvement
    console.log('\n📊 CSS USAGE ANALYSIS...');
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    let totalBytes = 0;
    let usedBytes = 0;
    
    cssCoverage.forEach(entry => {
        if (entry.url.includes('styles_optimized.css')) {
            totalBytes += entry.text.length;
            entry.ranges.forEach(range => {
                usedBytes += range.end - range.start;
            });
        }
    });
    
    const cssUsage = totalBytes > 0 ? ((usedBytes / totalBytes) * 100).toFixed(2) : 0;
    console.log(`  Optimized CSS Usage: ${cssUsage}%`);
    console.log(`  Used: ${usedBytes} bytes`);
    console.log(`  Total: ${totalBytes} bytes`);
    console.log(`  ${cssUsage > 31.61 ? '✅ IMPROVED' : '⚠️ No improvement'} from previous 31.61%`);
    
    // 4. CHECK: No duplicate CSS rules
    console.log('\n🔍 CHECKING FOR DUPLICATES...');
    const duplicateCheck = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        const selectors = new Map();
        let duplicates = 0;
        
        stylesheets.forEach(sheet => {
            try {
                Array.from(sheet.cssRules || []).forEach(rule => {
                    if (rule.selectorText) {
                        if (selectors.has(rule.selectorText)) {
                            selectors.get(rule.selectorText).count++;
                            duplicates++;
                        } else {
                            selectors.set(rule.selectorText, { count: 1 });
                        }
                    }
                });
            } catch (e) {}
        });
        
        return {
            total: selectors.size,
            duplicates: duplicates
        };
    });
    
    console.log(`  Total selectors: ${duplicateCheck.total}`);
    console.log(`  Duplicate rules: ${duplicateCheck.duplicates}`);
    console.log(`  ${duplicateCheck.duplicates === 0 ? '✅ NO DUPLICATES' : '⚠️ Still has duplicates'}`);
    
    // 5. CHECK: Performance metrics
    console.log('\n⚡ PERFORMANCE CHECK...');
    const performanceMetrics = await page.evaluate(() => {
        const paint = performance.getEntriesByType('paint');
        return {
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
        };
    });
    
    console.log(`  First Paint: ${performanceMetrics.firstPaint?.toFixed(0)}ms`);
    console.log(`  First Contentful Paint: ${performanceMetrics.firstContentfulPaint?.toFixed(0)}ms`);
    
    // 6. CHECK: Mobile overflow still fixed
    console.log('\n📱 MOBILE CHECK...');
    await page.setViewport({ width: 390, height: 844 });
    
    const mobileCheck = await page.evaluate(() => {
        return {
            hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            bodyOverflow: getComputedStyle(document.body).overflowX,
            htmlOverflow: getComputedStyle(document.documentElement).overflowX
        };
    });
    
    console.log(`  Horizontal scroll: ${mobileCheck.hasHorizontalScroll ? '❌ Present' : '✅ Fixed'}`);
    console.log(`  Body overflow-x: ${mobileCheck.bodyOverflow}`);
    
    // Generate summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 OPTIMIZATION SUMMARY');
    console.log('='.repeat(50));
    
    const allOptimized = 
        inlineStyleCheck.withInlineStyles === 0 &&
        cssClassCheck.fadeInUp > 0 &&
        duplicateCheck.duplicates === 0 &&
        !mobileCheck.hasHorizontalScroll;
    
    console.log('\n✅ SUCCESSES:');
    if (inlineStyleCheck.withInlineStyles === 0) console.log('  ✓ All inline styles removed');
    if (cssClassCheck.fadeInUp > 0) console.log('  ✓ CSS classes implemented');
    if (duplicateCheck.duplicates === 0) console.log('  ✓ No duplicate CSS rules');
    if (!mobileCheck.hasHorizontalScroll) console.log('  ✓ Mobile scroll still fixed');
    
    if (inlineStyleCheck.withInlineStyles > 0 || duplicateCheck.duplicates > 0) {
        console.log('\n⚠️ REMAINING ISSUES:');
        if (inlineStyleCheck.withInlineStyles > 0) {
            console.log(`  - ${inlineStyleCheck.withInlineStyles} elements still have inline styles`);
        }
        if (duplicateCheck.duplicates > 0) {
            console.log(`  - ${duplicateCheck.duplicates} duplicate CSS rules remain`);
        }
    }
    
    console.log(`\n${allOptimized ? '🎉 ALL OPTIMIZATIONS SUCCESSFUL!' : '⚠️ Some optimizations need attention'}`);
    
    await browser.close();
    
    return allOptimized;
}

// Run tests
testOptimizations()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });