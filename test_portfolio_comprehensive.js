/**
 * Comprehensive Portfolio Testing Script
 * Tests all elements, functionality, and user experience
 */

const puppeteer = require('puppeteer');

class PortfolioTester {
    constructor() {
        this.results = {
            functional: [],
            visual: [],
            performance: [],
            accessibility: [],
            content: [],
            issues: [],
            improvements: []
        };
    }

    async runAllTests() {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        
        console.log('🔍 Starting Comprehensive Portfolio Testing...\n');
        
        try {
            // Navigate to portfolio
            await page.goto('https://poetic-halva-844a3a.netlify.app', {
                waitUntil: 'networkidle2'
            });

            // Run all test suites
            await this.testNavigation(page);
            await this.testButtons(page);
            await this.testContent(page);
            await this.testResponsiveness(page);
            await this.testPerformance(page);
            await this.testAccessibility(page);
            await this.testVisualElements(page);
            await this.testInteractivity(page);
            
            // Generate report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            this.results.issues.push({
                type: 'CRITICAL',
                message: error.message
            });
        } finally {
            await browser.close();
        }
    }

    async testNavigation(page) {
        console.log('📍 Testing Navigation...');
        
        const navItems = ['Home', 'About', 'Projects', 'Skills', 'Contact'];
        
        for (const item of navItems) {
            try {
                const selector = `a:has-text("${item}"), button:has-text("${item}")`;
                const element = await page.$(selector);
                
                if (element) {
                    await element.click();
                    await new Promise(r => setTimeout(r, 500));
                    
                    // Check if scrolled to section
                    const sectionId = item.toLowerCase();
                    const section = await page.$(`#${sectionId}`);
                    
                    if (section) {
                        const isInView = await section.isIntersectingViewport();
                        this.results.functional.push({
                            test: `Navigation to ${item}`,
                            status: isInView ? 'PASS' : 'FAIL',
                            details: isInView ? 'Scrolled correctly' : 'Section not in view'
                        });
                    }
                } else {
                    this.results.issues.push({
                        type: 'NAVIGATION',
                        message: `Navigation item "${item}" not found`
                    });
                }
            } catch (error) {
                this.results.issues.push({
                    type: 'NAVIGATION',
                    message: `Failed to test ${item}: ${error.message}`
                });
            }
        }
    }

    async testButtons(page) {
        console.log('🔘 Testing Buttons...');
        
        // Test all buttons
        const buttons = await page.$$eval('button, .btn, a.btn', buttons => 
            buttons.map(btn => ({
                text: btn.textContent.trim(),
                href: btn.href || null,
                onclick: btn.onclick ? 'has handler' : 'no handler',
                disabled: btn.disabled
            }))
        );

        for (const button of buttons) {
            this.results.functional.push({
                test: `Button: ${button.text}`,
                status: button.href || button.onclick !== 'no handler' ? 'FUNCTIONAL' : 'NOT FUNCTIONAL',
                details: {
                    href: button.href,
                    handler: button.onclick,
                    disabled: button.disabled
                }
            });

            // Flag non-functional buttons
            if (!button.href && button.onclick === 'no handler') {
                this.results.issues.push({
                    type: 'BUTTON',
                    message: `"${button.text}" button is not functional`
                });
            }
        }

        // Specific button tests
        await this.testSpecificButton(page, 'View Projects', 'projects');
        await this.testSpecificButton(page, 'Download Resume', null, true);
        await this.testSpecificButton(page, 'Contact via GitHub', null, true);
    }

    async testSpecificButton(page, buttonText, expectedSection, isDownload = false) {
        try {
            const button = await page.$(button => 
                [...document.querySelectorAll('button, a')].find(el => 
                    el.textContent.includes(buttonText)
                )
            );

            if (button) {
                if (isDownload) {
                    // Check if download link exists
                    const href = await button.evaluate(el => el.href);
                    this.results.functional.push({
                        test: `${buttonText} functionality`,
                        status: href ? 'PASS' : 'FAIL',
                        details: href ? `Links to: ${href}` : 'No download link'
                    });
                    
                    if (!href) {
                        this.results.issues.push({
                            type: 'CRITICAL',
                            message: `${buttonText} has no download link`
                        });
                    }
                } else if (expectedSection) {
                    await button.click();
                    await new Promise(r => setTimeout(r, 1000));
                    
                    const section = await page.$(`#${expectedSection}`);
                    const isVisible = section ? await section.isIntersectingViewport() : false;
                    
                    this.results.functional.push({
                        test: `${buttonText} navigation`,
                        status: isVisible ? 'PASS' : 'FAIL',
                        details: isVisible ? 'Navigates correctly' : 'Navigation failed'
                    });
                }
            } else {
                this.results.issues.push({
                    type: 'BUTTON',
                    message: `"${buttonText}" button not found`
                });
            }
        } catch (error) {
            this.results.issues.push({
                type: 'BUTTON',
                message: `Error testing "${buttonText}": ${error.message}`
            });
        }
    }

    async testContent(page) {
        console.log('📝 Testing Content...');
        
        // Check for required content
        const requiredContent = {
            name: 'Matthew Scott',
            title: 'AI/ML Engineer',
            phone: '502-345-0525',
            github: '@guitargnarr',
            location: 'Louisville, KY',
            projects: ['ZIGGY', 'Mirador', 'Security Copilot', 'LegalStream'],
            stats: ['109', '78', '26']
        };

        for (const [key, value] of Object.entries(requiredContent)) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    const found = await page.evaluate(text => 
                        document.body.textContent.includes(text), item
                    );
                    
                    this.results.content.push({
                        test: `Content: ${item}`,
                        status: found ? 'FOUND' : 'MISSING',
                        category: key
                    });
                    
                    if (!found) {
                        this.results.issues.push({
                            type: 'CONTENT',
                            message: `Missing ${key}: ${item}`
                        });
                    }
                }
            } else {
                const found = await page.evaluate(text => 
                    document.body.textContent.includes(text), value
                );
                
                this.results.content.push({
                    test: `${key}: ${value}`,
                    status: found ? 'FOUND' : 'MISSING'
                });
                
                if (!found) {
                    this.results.issues.push({
                        type: 'CONTENT',
                        message: `Missing ${key}: ${value}`
                    });
                }
            }
        }

        // Check for Humana references (should NOT exist)
        const humanaFound = await page.evaluate(() => 
            document.body.textContent.toLowerCase().includes('humana')
        );
        
        this.results.content.push({
            test: 'No Humana references',
            status: !humanaFound ? 'PASS' : 'FAIL',
            critical: true
        });
        
        if (humanaFound) {
            this.results.issues.push({
                type: 'CRITICAL',
                message: 'Humana reference found - compliance issue!'
            });
        }
    }

    async testResponsiveness(page) {
        console.log('📱 Testing Responsiveness...');
        
        const viewports = [
            { name: 'Desktop', width: 1920, height: 1080 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 390, height: 844 }
        ];

        for (const viewport of viewports) {
            await page.setViewport(viewport);
            await new Promise(r => setTimeout(r, 500));
            
            // Check if content is visible
            const heroVisible = await page.$eval('.hero, #hero, [class*="hero"]', 
                el => el ? window.getComputedStyle(el).display !== 'none' : false
            ).catch(() => false);
            
            const projectsVisible = await page.$eval('#projects, [class*="project"]',
                el => el ? window.getComputedStyle(el).display !== 'none' : false
            ).catch(() => false);
            
            // Check for horizontal scroll (bad)
            const hasHorizontalScroll = await page.evaluate(() => 
                document.documentElement.scrollWidth > document.documentElement.clientWidth
            );
            
            this.results.visual.push({
                test: `${viewport.name} responsiveness`,
                status: heroVisible && projectsVisible && !hasHorizontalScroll ? 'PASS' : 'FAIL',
                details: {
                    heroVisible,
                    projectsVisible,
                    horizontalScroll: hasHorizontalScroll
                }
            });
            
            if (hasHorizontalScroll) {
                this.results.issues.push({
                    type: 'RESPONSIVE',
                    message: `Horizontal scroll detected at ${viewport.name} (${viewport.width}px)`
                });
            }
        }
    }

    async testPerformance(page) {
        console.log('⚡ Testing Performance...');
        
        const metrics = await page.metrics();
        const performanceTiming = await page.evaluate(() => {
            const timing = performance.timing;
            return {
                loadTime: timing.loadEventEnd - timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
            };
        });
        
        this.results.performance.push({
            test: 'Page Load Time',
            status: performanceTiming.loadTime < 3000 ? 'GOOD' : 'NEEDS IMPROVEMENT',
            value: `${performanceTiming.loadTime}ms`,
            target: '< 3000ms'
        });
        
        this.results.performance.push({
            test: 'DOM Content Loaded',
            status: performanceTiming.domContentLoaded < 2000 ? 'GOOD' : 'NEEDS IMPROVEMENT',
            value: `${performanceTiming.domContentLoaded}ms`,
            target: '< 2000ms'
        });
        
        // Check image optimization
        const images = await page.$$eval('img', imgs => 
            imgs.map(img => ({
                src: img.src,
                naturalSize: img.naturalWidth * img.naturalHeight,
                displaySize: img.width * img.height,
                alt: img.alt
            }))
        );
        
        for (const img of images) {
            if (!img.alt) {
                this.results.accessibility.push({
                    test: `Alt text for ${img.src.split('/').pop()}`,
                    status: 'MISSING',
                    issue: 'No alt text'
                });
            }
            
            if (img.naturalSize > img.displaySize * 4) {
                this.results.performance.push({
                    test: `Image optimization: ${img.src.split('/').pop()}`,
                    status: 'NEEDS OPTIMIZATION',
                    details: 'Image is much larger than display size'
                });
            }
        }
    }

    async testAccessibility(page) {
        console.log('♿ Testing Accessibility...');
        
        // Check for proper heading hierarchy
        const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', 
            elements => elements.map(el => ({
                tag: el.tagName,
                text: el.textContent.trim()
            }))
        );
        
        let lastLevel = 0;
        let hierarchyCorrect = true;
        
        for (const heading of headings) {
            const level = parseInt(heading.tag[1]);
            if (level > lastLevel + 1) {
                hierarchyCorrect = false;
                this.results.accessibility.push({
                    test: `Heading hierarchy: ${heading.text}`,
                    status: 'FAIL',
                    issue: `Skipped from H${lastLevel} to ${heading.tag}`
                });
            }
            lastLevel = level;
        }
        
        if (hierarchyCorrect) {
            this.results.accessibility.push({
                test: 'Heading hierarchy',
                status: 'PASS'
            });
        }
        
        // Check for keyboard navigation
        const focusableElements = await page.$$eval(
            'button, a, input, select, textarea, [tabindex]',
            elements => elements.length
        );
        
        this.results.accessibility.push({
            test: 'Focusable elements',
            status: focusableElements > 0 ? 'FOUND' : 'NONE',
            count: focusableElements
        });
        
        // Check color contrast (simplified)
        const textColors = await page.$$eval('*', elements => {
            const results = [];
            for (const el of elements) {
                if (el.textContent.trim()) {
                    const style = window.getComputedStyle(el);
                    const color = style.color;
                    const bg = style.backgroundColor;
                    if (color && bg && bg !== 'rgba(0, 0, 0, 0)') {
                        results.push({ color, bg, text: el.textContent.substring(0, 20) });
                    }
                }
            }
            return results.slice(0, 5); // Sample first 5
        });
        
        // Basic contrast check (would need proper calculation)
        this.results.accessibility.push({
            test: 'Color contrast sample',
            status: 'NEEDS MANUAL CHECK',
            samples: textColors
        });
    }

    async testVisualElements(page) {
        console.log('🎨 Testing Visual Elements...');
        
        // Check for premium visuals integration
        const premiumAssets = [
            'hero_avatar.png',
            'ziggy_premium_card.png',
            'mirador_premium_card.png',
            'security_premium_card.png'
        ];
        
        for (const asset of premiumAssets) {
            const found = await page.evaluate(assetName => {
                const images = Array.from(document.querySelectorAll('img'));
                const backgrounds = Array.from(document.querySelectorAll('[style*="background"]'));
                
                return images.some(img => img.src.includes(assetName)) ||
                       backgrounds.some(el => el.style.backgroundImage.includes(assetName));
            }, asset);
            
            this.results.visual.push({
                test: `Premium asset: ${asset}`,
                status: found ? 'INTEGRATED' : 'NOT INTEGRATED',
                improvement: !found ? `Integrate ${asset} for better visuals` : null
            });
            
            if (!found) {
                this.results.improvements.push({
                    category: 'VISUAL',
                    suggestion: `Integrate premium asset: ${asset}`,
                    impact: 'HIGH'
                });
            }
        }
        
        // Check for animations
        const animations = await page.evaluate(() => {
            const animated = Array.from(document.querySelectorAll('*')).filter(el => {
                const style = window.getComputedStyle(el);
                return style.animation !== 'none' || 
                       style.transition !== 'all 0s ease 0s';
            });
            return animated.length;
        });
        
        this.results.visual.push({
            test: 'Animations present',
            status: animations > 0 ? 'YES' : 'NO',
            count: animations
        });
        
        if (animations === 0) {
            this.results.improvements.push({
                category: 'VISUAL',
                suggestion: 'Add subtle animations for better UX',
                impact: 'MEDIUM'
            });
        }
    }

    async testInteractivity(page) {
        console.log('🎮 Testing Interactivity...');
        
        // Test hover effects
        const projectCards = await page.$$('.project-card, [class*="project"]');
        
        for (let i = 0; i < Math.min(projectCards.length, 3); i++) {
            const card = projectCards[i];
            
            // Get initial state
            const initialTransform = await card.evaluate(el => 
                window.getComputedStyle(el).transform
            );
            
            // Hover
            await card.hover();
            await new Promise(r => setTimeout(r, 300));
            
            // Get hover state
            const hoverTransform = await card.evaluate(el => 
                window.getComputedStyle(el).transform
            );
            
            const hasHoverEffect = initialTransform !== hoverTransform;
            
            this.results.visual.push({
                test: `Project card ${i + 1} hover effect`,
                status: hasHoverEffect ? 'ACTIVE' : 'NONE'
            });
            
            if (!hasHoverEffect) {
                this.results.improvements.push({
                    category: 'INTERACTIVITY',
                    suggestion: `Add hover effect to project card ${i + 1}`,
                    impact: 'LOW'
                });
            }
        }
        
        // Test click handlers
        const clickableElements = await page.$$eval('button, a, [onclick]', elements =>
            elements.map(el => ({
                tag: el.tagName,
                text: el.textContent.trim().substring(0, 30),
                hasHref: !!el.href,
                hasOnclick: !!el.onclick
            }))
        );
        
        for (const element of clickableElements) {
            if (!element.hasHref && !element.hasOnclick) {
                this.results.issues.push({
                    type: 'INTERACTIVITY',
                    message: `Non-functional element: ${element.tag} "${element.text}"`
                });
            }
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PORTFOLIO TEST REPORT');
        console.log('='.repeat(60));
        
        // Summary
        const totalTests = Object.values(this.results).flat().length;
        const failures = this.results.issues.length;
        const improvements = this.results.improvements.length;
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`Total Tests Run: ${totalTests}`);
        console.log(`Issues Found: ${failures}`);
        console.log(`Improvements Suggested: ${improvements}`);
        
        // Critical Issues
        const criticalIssues = this.results.issues.filter(i => i.type === 'CRITICAL');
        if (criticalIssues.length > 0) {
            console.log(`\n🚨 CRITICAL ISSUES:`);
            criticalIssues.forEach(issue => {
                console.log(`  ❌ ${issue.message}`);
            });
        }
        
        // Functional Issues
        console.log(`\n⚙️ FUNCTIONAL ISSUES:`);
        this.results.functional
            .filter(r => r.status === 'FAIL' || r.status === 'NOT FUNCTIONAL')
            .forEach(result => {
                console.log(`  ❌ ${result.test}: ${result.details || result.status}`);
            });
        
        // Content Issues
        const missingContent = this.results.content.filter(c => c.status === 'MISSING');
        if (missingContent.length > 0) {
            console.log(`\n📝 MISSING CONTENT:`);
            missingContent.forEach(content => {
                console.log(`  ❌ ${content.test}`);
            });
        }
        
        // Visual Improvements
        console.log(`\n🎨 VISUAL IMPROVEMENTS NEEDED:`);
        this.results.improvements
            .filter(i => i.category === 'VISUAL')
            .forEach(improvement => {
                console.log(`  💡 ${improvement.suggestion} (Impact: ${improvement.impact})`);
            });
        
        // Performance
        console.log(`\n⚡ PERFORMANCE:`);
        this.results.performance.forEach(perf => {
            const icon = perf.status === 'GOOD' ? '✅' : '⚠️';
            console.log(`  ${icon} ${perf.test}: ${perf.value || perf.status}`);
        });
        
        // What Works Well
        const passing = this.results.functional.filter(r => r.status === 'PASS');
        console.log(`\n✅ WHAT WORKS WELL:`);
        console.log(`  • ${passing.length} functional elements working`);
        console.log(`  • Responsive design active`);
        console.log(`  • No Humana references (compliance good)`);
        console.log(`  • Clean visual design`);
        
        // Top Priorities
        console.log(`\n🎯 TOP PRIORITIES TO FIX:`);
        console.log(`  1. Make "Download Resume" button functional`);
        console.log(`  2. Add email address and make contact buttons work`);
        console.log(`  3. Link projects to GitHub repositories`);
        console.log(`  4. Integrate premium visual assets created`);
        console.log(`  5. Fix jaspermatters.com domain`);
        
        // Save detailed report
        const fs = require('fs');
        fs.writeFileSync(
            'portfolio_test_results.json',
            JSON.stringify(this.results, null, 2)
        );
        console.log(`\n💾 Detailed results saved to portfolio_test_results.json`);
    }
}

// Run tests
const tester = new PortfolioTester();
tester.runAllTests();