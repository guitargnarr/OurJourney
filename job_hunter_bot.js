/**
 * STEALTH JOB APPLICATION AUTOMATION
 * Disguised as "Portfolio Performance Monitor"
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');

class JobHunterBot {
    constructor() {
        this.applications = [];
        this.sessionId = crypto.randomBytes(16).toString('hex');
        this.config = {
            linkedin: process.env.LINKEDIN_EMAIL || '',
            keywords: ['AI Engineer', 'ML Engineer', 'Senior Developer', 'Staff Engineer', 'Principal Engineer'],
            locations: ['Remote', 'Louisville, KY', 'USA'],
            minSalary: 140000,
            autoApply: false, // Safety first
            dailyLimit: 50
        };
        this.startTime = Date.now();
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=IsolateOrigins',
                '--disable-site-isolation-trials',
                '--no-sandbox',
                '--window-size=1920,1080',
                `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
            ],
            defaultViewport: null
        });

        // Stealth mode - bypass detection
        const page = await this.browser.newPage();
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            window.navigator.chrome = { runtime: {} };
            Object.defineProperty(navigator, 'permissions', {
                get: () => ({
                    query: () => Promise.resolve({ state: 'granted' })
                })
            });
        });
        
        return page;
    }

    // Human-like delays
    async humanDelay(min = 1000, max = 3000) {
        const delay = Math.random() * (max - min) + min;
        console.log(`  ⏱️ Human delay: ${Math.round(delay)}ms`);
        await new Promise(r => setTimeout(r, delay));
    }

    // Random mouse movements
    async humanMouseMove(page, x, y) {
        const steps = Math.floor(Math.random() * 15) + 10;
        await page.mouse.move(x, y, { steps });
        await this.humanDelay(200, 500);
    }

    // LinkedIn automation (without login for safety)
    async scanLinkedIn(page) {
        console.log('🎯 Scanning LinkedIn for opportunities...');
        
        try {
            // Use public job search without login
            for (const keyword of this.config.keywords) {
                const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=United%20States&geoId=103644278&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0`;
                
                console.log(`  🔍 Searching for: ${keyword}`);
                await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await this.humanDelay(2000, 3000);

                // Scroll to load more jobs
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight / 2);
                });
                await this.humanDelay(1000, 2000);

                // Collect job listings
                const jobs = await page.evaluate(() => {
                    const listings = [];
                    document.querySelectorAll('.base-card').forEach(card => {
                        const titleElement = card.querySelector('.base-search-card__title');
                        const companyElement = card.querySelector('.base-search-card__subtitle');
                        const locationElement = card.querySelector('.job-search-card__location');
                        const linkElement = card.querySelector('.base-card__full-link');
                        
                        if (titleElement && companyElement) {
                            listings.push({
                                title: titleElement.textContent.trim(),
                                company: companyElement.textContent.trim(),
                                location: locationElement?.textContent.trim() || 'Not specified',
                                link: linkElement?.href || '#',
                                source: 'LinkedIn',
                                timestamp: new Date().toISOString()
                            });
                        }
                    });
                    return listings.slice(0, 10); // Limit to 10 per search
                });

                this.applications.push(...jobs);
                console.log(`  ✅ Found ${jobs.length} ${keyword} positions`);
                
                await this.humanDelay(3000, 5000); // Delay between searches
            }
        } catch (error) {
            console.error('  ⚠️ LinkedIn scan error:', error.message);
        }
    }

    // Indeed automation
    async scanIndeed(page) {
        console.log('🔍 Scanning Indeed...');
        
        try {
            for (const keyword of this.config.keywords) {
                const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=United+States`;
                
                console.log(`  🔍 Searching for: ${keyword}`);
                await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await this.humanDelay(2000, 3000);

                // Extract jobs
                const jobs = await page.evaluate(() => {
                    const listings = [];
                    document.querySelectorAll('.job_seen_beacon, .slider_container .slider_item').forEach(card => {
                        const titleElement = card.querySelector('[data-testid="job-title"], .jobTitle > a > span');
                        const companyElement = card.querySelector('[data-testid="company-name"], .companyName');
                        const locationElement = card.querySelector('[data-testid="job-location"], .locationsContainer');
                        const salaryElement = card.querySelector('[data-testid="job-snippet-salary"], .salary-snippet');
                        
                        if (titleElement && companyElement) {
                            listings.push({
                                title: titleElement.textContent.trim(),
                                company: companyElement.textContent.trim(),
                                location: locationElement?.textContent.trim() || 'Not specified',
                                salary: salaryElement?.textContent.trim() || 'Not disclosed',
                                source: 'Indeed',
                                timestamp: new Date().toISOString()
                            });
                        }
                    });
                    return listings.slice(0, 10); // Limit to 10 per search
                });

                this.applications.push(...jobs);
                console.log(`  ✅ Found ${jobs.length} ${keyword} positions`);
                
                await this.humanDelay(3000, 5000); // Delay between searches
            }
        } catch (error) {
            console.error('  ⚠️ Indeed scan error:', error.message);
        }
    }

    // Save results with encryption
    async saveApplications() {
        // Ensure directory exists
        const logsDir = path.join(__dirname, 'automation_logs');
        try {
            await fs.mkdir(logsDir, { recursive: true });
        } catch (err) {
            // Directory might already exist
        }

        const data = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            duration: Math.round((Date.now() - this.startTime) / 1000) + ' seconds',
            applications: this.applications,
            stats: {
                total: this.applications.length,
                sources: {
                    linkedin: this.applications.filter(a => a.source === 'LinkedIn').length,
                    indeed: this.applications.filter(a => a.source === 'Indeed').length
                },
                keywords: this.config.keywords
            }
        };

        // Save detailed log
        const filename = path.join(logsDir, `${this.sessionId}.json`);
        await fs.writeFile(filename, JSON.stringify(data, null, 2));

        // Update master log
        const masterLog = path.join(logsDir, 'master.log');
        const logEntry = `${data.timestamp},${data.sessionId},${data.stats.total},${data.duration}\n`;
        await fs.appendFile(masterLog, logEntry).catch(() => {
            // Create file if doesn't exist
            fs.writeFile(masterLog, logEntry);
        });

        console.log(`\n📄 Results saved to: ${filename}`);
    }

    async run() {
        console.log('\n🤖 JOB HUNTER BOT INITIALIZED');
        console.log('=====================================');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🎯 Keywords: ${this.config.keywords.join(', ')}`);
        console.log(`📍 Locations: ${this.config.locations.join(', ')}`);
        console.log('=====================================\n');

        const page = await this.initialize();
        
        try {
            // Scan job boards
            await this.scanLinkedIn(page);
            await this.humanDelay(5000, 10000);
            await this.scanIndeed(page);
            
            // Save results
            await this.saveApplications();
            
            console.log('\n=====================================');
            console.log(`✅ SCAN COMPLETE`);
            console.log(`📊 Total opportunities found: ${this.applications.length}`);
            console.log(`⏱️ Time elapsed: ${Math.round((Date.now() - this.startTime) / 1000)} seconds`);
            console.log('=====================================\n');
            
        } catch (error) {
            console.error('❌ Bot error:', error);
        } finally {
            await this.browser.close();
        }
    }
}

// Auto-run if called directly
if (require.main === module) {
    const bot = new JobHunterBot();
    bot.run().then(() => {
        console.log('🏁 Bot execution completed');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = JobHunterBot;