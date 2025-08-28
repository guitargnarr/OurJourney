/**
 * Deep Developer Tools Inspection with Incognito Mode
 * Analyzes HTML/CSS issues, console errors, performance, and more
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class DevToolsInspector {
    constructor() {
        this.issues = {
            console: [],
            css: [],
            html: [],
            performance: [],
            accessibility: [],
            network: []
        };
    }

    async inspect() {
        console.log('🔧 DEVELOPER TOOLS DEEP INSPECTION');
        console.log('=====================================\n');
        
        const browser = await puppeteer.launch({
            headless: false,
            devtools: true,  // Opens Chrome DevTools
            args: [
                '--incognito',
                '--auto-open-devtools-for-tabs',
                '--disable-web-security',
                '--disable-features=IsolateOrigins',
                '--disable-site-isolation-trials',
                '--window-size=1920,1080'
            ],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });

        const page = await browser.newPage();
        
        // Enable detailed console logging
        page.on('console', async msg => {
            const type = msg.type();
            const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => 'Complex object')));
            
            this.issues.console.push({
                type,
                text: msg.text(),
                args,
                location: msg.location(),
                timestamp: new Date().toISOString()
            });
            
            // Real-time console output
            const icon = {
                'error': '❌',
                'warning': '⚠️',
                'info': 'ℹ️',
                'log': '📝',
                'debug': '🔍'
            }[type] || '📌';
            
            console.log(`${icon} Console [${type}]:`, msg.text());
        });

        // Monitor page errors
        page.on('pageerror', error => {
            this.issues.console.push({
                type: 'pageerror',
                text: error.toString(),
                stack: error.stack
            });
            console.log('❌ Page Error:', error.message);
        });

        // Monitor failed requests
        page.on('requestfailed', request => {
            this.issues.network.push({
                url: request.url(),
                failure: request.failure(),
                method: request.method()
            });
            console.log('❌ Request Failed:', request.url());
        });

        // Enable CSS and JS coverage
        await page.coverage.startCSSCoverage();
        await page.coverage.startJSCoverage();

        console.log('🌐 Navigating to portfolio (incognito + devtools)...\n');
        
        // Navigate with network monitoring
        const startTime = Date.now();
        await page.goto('https://poetic-halva-844a3a.netlify.app', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        const loadTime = Date.now() - startTime;
        
        console.log(`✅ Page loaded in ${loadTime}ms\n`);

        // Wait for DevTools to fully open
        await new Promise(r => setTimeout(r, 2000));

        // 1. CSS ANALYSIS
        console.log('🎨 ANALYZING CSS...');
        const cssIssues = await page.evaluate(() => {
            const issues = [];
            
            // Check for duplicate CSS rules
            const stylesheets = Array.from(document.styleSheets);
            const rules = new Map();
            
            stylesheets.forEach(sheet => {
                try {
                    Array.from(sheet.cssRules || []).forEach(rule => {
                        if (rule.selectorText) {
                            if (rules.has(rule.selectorText)) {
                                rules.get(rule.selectorText).count++;
                            } else {
                                rules.set(rule.selectorText, { 
                                    selector: rule.selectorText, 
                                    count: 1,
                                    properties: rule.style.cssText
                                });
                            }
                        }
                    });
                } catch (e) {}
            });
            
            // Find duplicates
            rules.forEach((value, key) => {
                if (value.count > 1) {
                    issues.push({
                        type: 'duplicate',
                        selector: key,
                        count: value.count
                    });
                }
            });
            
            // Check for inefficient selectors
            const inefficientSelectors = Array.from(document.querySelectorAll('*')).filter(el => {
                const id = el.id;
                const classes = el.className;
                return (id && classes && typeof classes === 'string' && classes.split(' ').length > 3);
            });
            
            if (inefficientSelectors.length > 0) {
                issues.push({
                    type: 'inefficient',
                    count: inefficientSelectors.length,
                    message: 'Elements with both ID and multiple classes'
                });
            }
            
            // Check for !important usage
            let importantCount = 0;
            stylesheets.forEach(sheet => {
                try {
                    Array.from(sheet.cssRules || []).forEach(rule => {
                        if (rule.style && rule.style.cssText.includes('!important')) {
                            importantCount++;
                        }
                    });
                } catch (e) {}
            });
            
            if (importantCount > 0) {
                issues.push({
                    type: '!important',
                    count: importantCount,
                    severity: importantCount > 5 ? 'high' : 'low'
                });
            }
            
            return issues;
        });
        
        this.issues.css = cssIssues;
        console.log(`  CSS Issues found: ${cssIssues.length}`);
        cssIssues.forEach(issue => {
            console.log(`    - ${issue.type}: ${issue.count || issue.selector}`);
        });

        // 2. HTML VALIDATION
        console.log('\n📄 ANALYZING HTML...');
        const htmlIssues = await page.evaluate(() => {
            const issues = [];
            
            // Check for missing meta tags
            const requiredMeta = ['viewport', 'description', 'charset'];
            requiredMeta.forEach(name => {
                const meta = document.querySelector(`meta[name="${name}"], meta[charset]`);
                if (!meta && name !== 'charset') {
                    issues.push({
                        type: 'missing-meta',
                        name
                    });
                }
            });
            
            // Check for multiple h1 tags
            const h1Count = document.querySelectorAll('h1').length;
            if (h1Count > 1) {
                issues.push({
                    type: 'multiple-h1',
                    count: h1Count
                });
            }
            
            // Check for empty alt attributes
            const imagesWithEmptyAlt = Array.from(document.images).filter(img => img.alt === '');
            if (imagesWithEmptyAlt.length > 0) {
                issues.push({
                    type: 'empty-alt',
                    count: imagesWithEmptyAlt.length
                });
            }
            
            // Check for inline styles
            const elementsWithInlineStyles = document.querySelectorAll('[style]');
            if (elementsWithInlineStyles.length > 0) {
                issues.push({
                    type: 'inline-styles',
                    count: elementsWithInlineStyles.length,
                    elements: Array.from(elementsWithInlineStyles).slice(0, 5).map(el => ({
                        tag: el.tagName,
                        style: el.getAttribute('style')
                    }))
                });
            }
            
            // Check for deprecated tags
            const deprecatedTags = ['font', 'center', 'big', 'strike'];
            deprecatedTags.forEach(tag => {
                const elements = document.getElementsByTagName(tag);
                if (elements.length > 0) {
                    issues.push({
                        type: 'deprecated-tag',
                        tag,
                        count: elements.length
                    });
                }
            });
            
            // Check heading hierarchy
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            let lastLevel = 0;
            let hierarchyIssues = 0;
            
            headings.forEach(h => {
                const level = parseInt(h.tagName[1]);
                if (level > lastLevel + 1 && lastLevel !== 0) {
                    hierarchyIssues++;
                }
                lastLevel = level;
            });
            
            if (hierarchyIssues > 0) {
                issues.push({
                    type: 'heading-hierarchy',
                    count: hierarchyIssues,
                    message: 'Skipped heading levels detected'
                });
            }
            
            return issues;
        });
        
        this.issues.html = htmlIssues;
        console.log(`  HTML Issues found: ${htmlIssues.length}`);
        htmlIssues.forEach(issue => {
            console.log(`    - ${issue.type}: ${issue.count || issue.message || issue.name}`);
        });

        // 3. CSS COVERAGE ANALYSIS
        console.log('\n📊 CSS COVERAGE ANALYSIS...');
        const cssCoverage = await page.coverage.stopCSSCoverage();
        
        let totalBytes = 0;
        let usedBytes = 0;
        
        cssCoverage.forEach(entry => {
            totalBytes += entry.text.length;
            entry.ranges.forEach(range => {
                usedBytes += range.end - range.start;
            });
        });
        
        const cssUsage = ((usedBytes / totalBytes) * 100).toFixed(2);
        console.log(`  CSS Usage: ${cssUsage}% (${usedBytes}/${totalBytes} bytes)`);
        console.log(`  Unused CSS: ${(100 - cssUsage).toFixed(2)}%`);
        
        // 4. PERFORMANCE METRICS
        console.log('\n⚡ PERFORMANCE METRICS...');
        const performanceMetrics = await page.evaluate(() => {
            const paint = performance.getEntriesByType('paint');
            const navigation = performance.getEntriesByType('navigation')[0];
            const resources = performance.getEntriesByType('resource');
            
            return {
                paints: paint.map(p => ({ name: p.name, time: p.startTime })),
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                resources: {
                    total: resources.length,
                    images: resources.filter(r => r.initiatorType === 'img').length,
                    scripts: resources.filter(r => r.initiatorType === 'script').length,
                    stylesheets: resources.filter(r => r.initiatorType === 'link').length,
                    slowest: resources.sort((a, b) => b.duration - a.duration).slice(0, 3).map(r => ({
                        name: r.name.split('/').pop(),
                        duration: r.duration.toFixed(2) + 'ms'
                    }))
                }
            };
        });
        
        console.log(`  First Paint: ${performanceMetrics.paints[0]?.time.toFixed(2)}ms`);
        console.log(`  First Contentful Paint: ${performanceMetrics.paints[1]?.time.toFixed(2)}ms`);
        console.log(`  DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
        console.log(`  Total Resources: ${performanceMetrics.resources.total}`);
        console.log('  Slowest Resources:');
        performanceMetrics.resources.slowest.forEach(r => {
            console.log(`    - ${r.name}: ${r.duration}`);
        });

        // 5. ACCESSIBILITY CHECKS
        console.log('\n♿ ACCESSIBILITY CHECKS...');
        const a11yIssues = await page.evaluate(() => {
            const issues = [];
            
            // Check color contrast (simplified)
            const elements = document.querySelectorAll('*');
            let lowContrastCount = 0;
            
            elements.forEach(el => {
                const style = getComputedStyle(el);
                const bg = style.backgroundColor;
                const color = style.color;
                
                // Simple check for very light text on white
                if (color.includes('rgb') && bg.includes('rgb')) {
                    const colorValues = color.match(/\d+/g);
                    const bgValues = bg.match(/\d+/g);
                    
                    if (colorValues && bgValues) {
                        const colorBrightness = (parseInt(colorValues[0]) + parseInt(colorValues[1]) + parseInt(colorValues[2])) / 3;
                        const bgBrightness = (parseInt(bgValues[0]) + parseInt(bgValues[1]) + parseInt(bgValues[2])) / 3;
                        
                        if (Math.abs(colorBrightness - bgBrightness) < 50) {
                            lowContrastCount++;
                        }
                    }
                }
            });
            
            if (lowContrastCount > 0) {
                issues.push({
                    type: 'low-contrast',
                    count: lowContrastCount,
                    severity: 'warning'
                });
            }
            
            // Check for form labels
            const inputs = document.querySelectorAll('input, select, textarea');
            const unlabeledInputs = Array.from(inputs).filter(input => {
                const id = input.id;
                const label = id ? document.querySelector(`label[for="${id}"]`) : null;
                return !label && !input.getAttribute('aria-label');
            });
            
            if (unlabeledInputs.length > 0) {
                issues.push({
                    type: 'unlabeled-inputs',
                    count: unlabeledInputs.length
                });
            }
            
            // Check focus indicators
            const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
            let missingFocusIndicators = 0;
            
            focusableElements.forEach(el => {
                el.focus();
                const focusStyle = getComputedStyle(el);
                const outline = focusStyle.outline;
                const boxShadow = focusStyle.boxShadow;
                
                if (outline === 'none' && boxShadow === 'none') {
                    missingFocusIndicators++;
                }
            });
            
            if (missingFocusIndicators > 0) {
                issues.push({
                    type: 'missing-focus-indicators',
                    count: missingFocusIndicators,
                    total: focusableElements.length
                });
            }
            
            return issues;
        });
        
        this.issues.accessibility = a11yIssues;
        console.log(`  Accessibility Issues: ${a11yIssues.length}`);
        a11yIssues.forEach(issue => {
            console.log(`    - ${issue.type}: ${issue.count}`);
        });

        // 6. NETWORK WATERFALL
        console.log('\n🌊 NETWORK ANALYSIS...');
        const networkData = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource');
            return resources.map(r => ({
                name: r.name.split('/').pop() || r.name,
                type: r.initiatorType,
                duration: r.duration,
                size: r.transferSize,
                startTime: r.startTime
            })).sort((a, b) => a.startTime - b.startTime);
        });
        
        console.log(`  Total Requests: ${networkData.length}`);
        const byType = {};
        networkData.forEach(r => {
            byType[r.type] = (byType[r.type] || 0) + 1;
        });
        Object.entries(byType).forEach(([type, count]) => {
            console.log(`    - ${type}: ${count}`);
        });

        // Generate summary
        console.log('\n' + '='.repeat(50));
        console.log('📋 DEVTOOLS INSPECTION SUMMARY');
        console.log('='.repeat(50));
        
        const summary = {
            console: {
                errors: this.issues.console.filter(c => c.type === 'error').length,
                warnings: this.issues.console.filter(c => c.type === 'warning').length,
                total: this.issues.console.length
            },
            css: {
                issues: this.issues.css.length,
                usage: cssUsage + '%'
            },
            html: {
                issues: this.issues.html.length
            },
            accessibility: {
                issues: this.issues.accessibility.length
            },
            performance: {
                loadTime: loadTime + 'ms',
                resources: networkData.length
            }
        };
        
        console.log('\n🔴 Critical Issues:');
        if (summary.console.errors > 0) {
            console.log(`  ❌ ${summary.console.errors} Console Errors`);
        }
        if (htmlIssues.find(i => i.type === 'inline-styles')) {
            console.log(`  ⚠️ ${htmlIssues.find(i => i.type === 'inline-styles').count} Inline Styles Found`);
        }
        if (parseFloat(cssUsage) < 50) {
            console.log(`  ⚠️ Low CSS Usage: ${cssUsage}%`);
        }
        
        console.log('\n✅ Strengths:');
        if (summary.console.errors === 0) {
            console.log('  ✓ No Console Errors');
        }
        if (summary.html.issues === 0 || summary.html.issues === 1) {
            console.log('  ✓ Clean HTML Structure');
        }
        if (performanceMetrics.paints[1]?.time < 1500) {
            console.log(`  ✓ Fast First Paint: ${performanceMetrics.paints[1]?.time.toFixed(0)}ms`);
        }
        
        // Save detailed report
        await fs.writeFile('devtools_inspection_report.json', JSON.stringify({
            timestamp: new Date().toISOString(),
            summary,
            issues: this.issues,
            performance: performanceMetrics,
            network: networkData
        }, null, 2));
        
        console.log('\n📁 Detailed report saved to: devtools_inspection_report.json');
        console.log('🔍 Chrome DevTools is open for manual inspection');
        console.log('⏸️ Browser will close in 10 seconds...\n');
        
        // Keep browser open for manual inspection
        await new Promise(r => setTimeout(r, 10000)); // Keep open for 10 seconds
        
        await browser.close();
    }
}

// Run inspection
const inspector = new DevToolsInspector();
inspector.inspect().catch(console.error);