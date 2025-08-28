/**
 * 🚀 ULTRATHINK DEVELOPER ANALYSIS - STAR OCEAN MODE
 * Deep dive into portfolio with human-like interaction simulation
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class UltrathinkAnalyzer {
    constructor() {
        this.results = {
            performance: {},
            accessibility: {},
            seo: {},
            ux: {},
            security: {},
            visual: {},
            interactions: {},
            network: {},
            console: [],
            errors: []
        };
        this.screenshots = [];
    }

    // Human-like delay simulation
    async humanDelay(min = 800, max = 2000) {
        const delay = Math.random() * (max - min) + min;
        console.log(`🕐 Human delay: ${delay.toFixed(0)}ms`);
        await new Promise(r => setTimeout(r, delay));
    }

    // Mouse movement simulation
    async humanMouseMove(page, x, y) {
        const steps = Math.floor(Math.random() * 10) + 5;
        await page.mouse.move(x, y, { steps });
        await this.humanDelay(200, 500);
    }

    async analyzePortfolio() {
        console.log('🚀 ULTRATHINK ANALYSIS INITIATED - STAR OCEAN MODE');
        console.log('==========================================\n');
        
        // Launch Chrome in incognito mode
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                '--incognito',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1920,1080'
            ],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });

        // Browser already in incognito mode from launch args
        const page = await browser.newPage();
        
        // Set up console monitoring
        page.on('console', msg => {
            this.results.console.push({
                type: msg.type(),
                text: msg.text(),
                location: msg.location()
            });
        });

        // Monitor errors
        page.on('pageerror', error => {
            this.results.errors.push(error.toString());
        });

        // Monitor network requests
        await page.setRequestInterception(true);
        const networkRequests = [];
        page.on('request', request => {
            networkRequests.push({
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType()
            });
            request.continue();
        });

        console.log('🌐 Navigating to portfolio (incognito mode)...');
        await this.humanDelay();
        
        const startTime = Date.now();
        await page.goto('https://poetic-halva-844a3a.netlify.app', {
            waitUntil: 'networkidle2'
        });
        const loadTime = Date.now() - startTime;
        
        console.log(`✅ Page loaded in ${loadTime}ms\n`);
        
        // Capture initial state
        await this.captureScreenshot(page, 'initial_load');
        
        // 1. PERFORMANCE ANALYSIS
        console.log('⚡ Analyzing Performance Metrics...');
        await this.humanDelay(500, 1000);
        
        const performanceMetrics = await page.evaluate(() => {
            const timing = performance.timing;
            const paint = performance.getEntriesByType('paint');
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                domElements: document.querySelectorAll('*').length,
                images: document.images.length,
                scripts: document.scripts.length,
                stylesheets: document.styleSheets.length
            };
        });
        
        this.results.performance = performanceMetrics;
        console.log('  DOM Load:', performanceMetrics.domContentLoaded + 'ms');
        console.log('  FCP:', performanceMetrics.firstContentfulPaint?.toFixed(0) + 'ms');
        console.log('  Total Elements:', performanceMetrics.domElements);
        
        // 2. VISUAL ANALYSIS
        console.log('\n🎨 Analyzing Visual Design...');
        await this.humanDelay();
        
        const visualAnalysis = await page.evaluate(() => {
            const computedStyles = getComputedStyle(document.body);
            const hero = document.querySelector('.hero, #home');
            const nav = document.querySelector('nav, .navbar');
            
            // Color palette extraction
            const extractColors = (element) => {
                if (!element) return {};
                const style = getComputedStyle(element);
                return {
                    background: style.backgroundColor,
                    text: style.color,
                    border: style.borderColor
                };
            };
            
            // Typography analysis
            const fonts = new Set();
            document.querySelectorAll('*').forEach(el => {
                const font = getComputedStyle(el).fontFamily;
                if (font) fonts.add(font);
            });
            
            return {
                primaryColors: extractColors(hero),
                navColors: extractColors(nav),
                fonts: Array.from(fonts),
                bodyFont: computedStyles.fontFamily,
                animations: document.querySelectorAll('[class*="animate"], [class*="transition"]').length,
                gradients: Array.from(document.querySelectorAll('*')).filter(el => {
                    const bg = getComputedStyle(el).background;
                    return bg.includes('gradient');
                }).length
            };
        });
        
        this.results.visual = visualAnalysis;
        console.log('  Fonts used:', visualAnalysis.fonts.length);
        console.log('  Animated elements:', visualAnalysis.animations);
        console.log('  Gradients:', visualAnalysis.gradients);
        
        // 3. INTERACTION SIMULATION (Human-like)
        console.log('\n🖱️ Simulating Human Interactions...');
        
        // Scroll like a human reading
        console.log('  📜 Scrolling through content...');
        await this.humanDelay();
        
        // Smooth scroll to projects
        await page.evaluate(() => {
            document.querySelector('a[href="#projects"], [href*="projects"]')?.click();
        });
        await this.humanDelay(1500, 2500);
        await this.captureScreenshot(page, 'projects_section');
        
        // Hover over project cards
        console.log('  🎯 Hovering over project cards...');
        const projectCards = await page.$$('.project-card, [class*="project"]');
        
        for (let i = 0; i < Math.min(3, projectCards.length); i++) {
            const card = projectCards[i];
            const box = await card.boundingBox();
            if (box) {
                await this.humanMouseMove(page, box.x + box.width/2, box.y + box.height/2);
                await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
                await this.humanDelay(800, 1200);
                
                // Check hover effects
                const hoverState = await card.evaluate(el => {
                    const style = getComputedStyle(el);
                    return {
                        transform: style.transform,
                        boxShadow: style.boxShadow,
                        backgroundColor: style.backgroundColor
                    };
                });
                this.results.interactions[`card_${i}_hover`] = hoverState;
            }
        }
        
        // 4. RESPONSIVE TESTING
        console.log('\n📱 Testing Responsive Design...');
        
        const viewports = [
            { name: 'Desktop', width: 1920, height: 1080 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 390, height: 844 }
        ];
        
        for (const viewport of viewports) {
            console.log(`  Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
            await page.setViewport(viewport);
            await this.humanDelay(1000, 1500);
            
            const responsive = await page.evaluate(() => {
                const nav = document.querySelector('nav, .navbar');
                const hero = document.querySelector('.hero, #home');
                return {
                    navVisible: nav ? nav.offsetHeight > 0 : false,
                    heroVisible: hero ? hero.offsetHeight > 0 : false,
                    horizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
                    overflow: getComputedStyle(document.body).overflowX
                };
            });
            
            this.results.ux[viewport.name] = responsive;
            await this.captureScreenshot(page, `responsive_${viewport.name.toLowerCase()}`);
        }
        
        // Reset to desktop
        await page.setViewport({ width: 1920, height: 1080 });
        
        // 5. ACCESSIBILITY ANALYSIS
        console.log('\n♿ Analyzing Accessibility...');
        await this.humanDelay();
        
        const accessibilityChecks = await page.evaluate(() => {
            const images = Array.from(document.images);
            const buttons = Array.from(document.querySelectorAll('button, a.btn, [role="button"]'));
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            
            return {
                imagesWithoutAlt: images.filter(img => !img.alt).length,
                totalImages: images.length,
                buttonsWithoutText: buttons.filter(btn => !btn.textContent.trim()).length,
                totalButtons: buttons.length,
                headingStructure: headings.map(h => ({
                    tag: h.tagName,
                    text: h.textContent.substring(0, 50)
                })),
                tabIndex: document.querySelectorAll('[tabindex]').length,
                ariaLabels: document.querySelectorAll('[aria-label]').length,
                contrast: [] // Would need axe-core for proper contrast checking
            };
        });
        
        this.results.accessibility = accessibilityChecks;
        console.log('  Images without alt:', accessibilityChecks.imagesWithoutAlt + '/' + accessibilityChecks.totalImages);
        console.log('  ARIA labels:', accessibilityChecks.ariaLabels);
        
        // 6. SEO ANALYSIS
        console.log('\n🔍 Analyzing SEO...');
        await this.humanDelay();
        
        const seoAnalysis = await page.evaluate(() => {
            const getMeta = (name) => {
                const tag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
                return tag ? tag.content : null;
            };
            
            return {
                title: document.title,
                description: getMeta('description'),
                ogTitle: getMeta('og:title'),
                ogDescription: getMeta('og:description'),
                ogImage: getMeta('og:image'),
                canonical: document.querySelector('link[rel="canonical"]')?.href,
                h1Count: document.querySelectorAll('h1').length,
                structuredData: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).length
            };
        });
        
        this.results.seo = seoAnalysis;
        console.log('  Title:', seoAnalysis.title);
        console.log('  Meta Description:', seoAnalysis.description ? '✅' : '❌');
        console.log('  Open Graph:', seoAnalysis.ogTitle ? '✅' : '❌');
        
        // 7. SECURITY ANALYSIS
        console.log('\n🔒 Analyzing Security...');
        await this.humanDelay();
        
        const securityChecks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href]'));
            const forms = Array.from(document.forms);
            
            return {
                externalLinks: links.filter(a => a.href.startsWith('http') && !a.href.includes(location.hostname)),
                externalLinksWithoutNoopener: links.filter(a => 
                    a.href.startsWith('http') && 
                    !a.href.includes(location.hostname) && 
                    !a.rel?.includes('noopener')
                ).length,
                forms: forms.length,
                httpsLinks: links.filter(a => a.href.startsWith('https')).length,
                httpLinks: links.filter(a => a.href.startsWith('http:') && !a.href.startsWith('https')).length
            };
        });
        
        this.results.security = securityChecks;
        console.log('  External links without noopener:', securityChecks.externalLinksWithoutNoopener);
        console.log('  HTTP links:', securityChecks.httpLinks);
        
        // 8. USER FLOW TESTING
        console.log('\n🚶 Testing User Flows...');
        
        // Test resume download
        console.log('  📄 Testing resume download...');
        await page.goto('https://poetic-halva-844a3a.netlify.app');
        await this.humanDelay();
        
        const resumeLink = await page.$('a[href*="resume"], a[download]');
        if (resumeLink) {
            const href = await resumeLink.evaluate(el => el.href);
            console.log('    Resume link found:', href);
        }
        
        // Test contact buttons
        console.log('  📧 Testing contact buttons...');
        const contactLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]')).map(a => ({
                type: a.href.startsWith('mailto') ? 'email' : 'phone',
                href: a.href,
                text: a.textContent
            }));
        });
        
        this.results.ux.contactLinks = contactLinks;
        console.log('    Contact methods found:', contactLinks.length);
        
        // Final screenshot
        await page.goto('https://poetic-halva-844a3a.netlify.app');
        await this.humanDelay(2000, 3000);
        await this.captureScreenshot(page, 'final_state');
        
        // Generate report
        await this.generateReport();
        
        console.log('\n✅ ULTRATHINK ANALYSIS COMPLETE!');
        console.log('📊 Results saved to: ultrathink_analysis_results.json');
        console.log('🖼️ Screenshots saved to: ultrathink_screenshots/');
        
        await browser.close();
    }

    async captureScreenshot(page, name) {
        const timestamp = new Date().getTime();
        const filename = `ultrathink_screenshots/${name}_${timestamp}.png`;
        
        await page.screenshot({
            path: filename,
            fullPage: false
        });
        
        this.screenshots.push(filename);
        console.log(`    📸 Screenshot: ${name}`);
    }

    async generateReport() {
        // Save detailed JSON results
        await fs.writeFile(
            'ultrathink_analysis_results.json',
            JSON.stringify(this.results, null, 2)
        );
        
        // Generate HTML report
        const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>ULTRATHINK Developer Analysis Report</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 40px; background: #0a0e27; color: #fff; }
        h1 { color: #60a5fa; border-bottom: 2px solid #60a5fa; padding-bottom: 10px; }
        h2 { color: #a78bfa; margin-top: 30px; }
        .metric { background: #1e293b; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .good { color: #10b981; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        pre { background: #1e293b; padding: 15px; border-radius: 8px; overflow-x: auto; }
        .screenshot { margin: 20px 0; }
        .screenshot img { max-width: 100%; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    </style>
</head>
<body>
    <h1>🚀 ULTRATHINK Developer Analysis Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <h2>⚡ Performance</h2>
    <div class="metric">
        <p>DOM Content Loaded: <span class="good">${this.results.performance.domContentLoaded}ms</span></p>
        <p>First Contentful Paint: <span class="good">${this.results.performance.firstContentfulPaint?.toFixed(0)}ms</span></p>
        <p>Total DOM Elements: ${this.results.performance.domElements}</p>
    </div>
    
    <h2>🎨 Visual Design</h2>
    <div class="metric">
        <p>Fonts Used: ${this.results.visual.fonts?.length || 0}</p>
        <p>Animated Elements: ${this.results.visual.animations || 0}</p>
        <p>Gradient Elements: ${this.results.visual.gradients || 0}</p>
    </div>
    
    <h2>♿ Accessibility</h2>
    <div class="metric">
        <p>Images without Alt Text: ${this.results.accessibility.imagesWithoutAlt || 0}/${this.results.accessibility.totalImages || 0}</p>
        <p>ARIA Labels: ${this.results.accessibility.ariaLabels || 0}</p>
    </div>
    
    <h2>🔍 SEO</h2>
    <div class="metric">
        <p>Title: ${this.results.seo.title || 'Missing'}</p>
        <p>Meta Description: ${this.results.seo.description ? '✅' : '❌'}</p>
        <p>Open Graph: ${this.results.seo.ogTitle ? '✅' : '❌'}</p>
    </div>
    
    <h2>🔒 Security</h2>
    <div class="metric">
        <p>External Links without noopener: ${this.results.security.externalLinksWithoutNoopener || 0}</p>
        <p>HTTP Links: ${this.results.security.httpLinks || 0}</p>
    </div>
    
    <h2>📱 Responsive Design</h2>
    <pre>${JSON.stringify(this.results.ux, null, 2)}</pre>
    
    <h2>🖼️ Screenshots</h2>
    ${this.screenshots.map(s => `
    <div class="screenshot">
        <p>${s}</p>
        <img src="${s}" alt="${s}">
    </div>
    `).join('')}
</body>
</html>
        `;
        
        await fs.writeFile('ultrathink_report.html', htmlReport);
    }
}

// Create screenshots directory
(async () => {
    try {
        await fs.mkdir('ultrathink_screenshots', { recursive: true });
    } catch {}
    
    const analyzer = new UltrathinkAnalyzer();
    await analyzer.analyzePortfolio();
})();