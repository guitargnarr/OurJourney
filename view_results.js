#!/usr/bin/env node

/**
 * AUTOMATION RESULTS VIEWER
 * Quick dashboard to see what the bot found
 */

const fs = require('fs');
const path = require('path');

console.log('\n📊 AUTOMATION RESULTS DASHBOARD');
console.log('=====================================\n');

const logsDir = path.join(__dirname, 'automation_logs');

// Check if logs directory exists
if (!fs.existsSync(logsDir)) {
    console.log('❌ No results yet. Run ./activate.sh first');
    process.exit(1);
}

// Read all JSON files
const files = fs.readdirSync(logsDir)
    .filter(f => f.endsWith('.json'))
    .sort((a, b) => {
        const statA = fs.statSync(path.join(logsDir, a));
        const statB = fs.statSync(path.join(logsDir, b));
        return statB.mtime - statA.mtime; // Most recent first
    });

if (files.length === 0) {
    console.log('❌ No results found. Run the bot first.');
    process.exit(1);
}

// Aggregate stats
let totalJobs = 0;
let linkedinJobs = 0;
let indeedJobs = 0;
const allJobs = [];
const companies = new Set();
const titles = new Set();

// Process each session
files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(logsDir, file), 'utf8'));
    totalJobs += data.applications.length;
    linkedinJobs += data.stats.sources.linkedin;
    indeedJobs += data.stats.sources.indeed;
    
    data.applications.forEach(job => {
        allJobs.push(job);
        companies.add(job.company);
        titles.add(job.title);
    });
});

// Display summary
console.log('📈 SUMMARY');
console.log('----------');
console.log(`Total Opportunities: ${totalJobs}`);
console.log(`Unique Companies: ${companies.size}`);
console.log(`Sessions Run: ${files.length}`);
console.log(`LinkedIn Jobs: ${linkedinJobs}`);
console.log(`Indeed Jobs: ${indeedJobs}`);

// Show most recent jobs
console.log('\n🔥 LATEST OPPORTUNITIES');
console.log('------------------------');
const recent = allJobs.slice(0, 10);
recent.forEach((job, i) => {
    console.log(`\n${i + 1}. ${job.title}`);
    console.log(`   📍 ${job.company} - ${job.location}`);
    if (job.salary && job.salary !== 'Not disclosed') {
        console.log(`   💰 ${job.salary}`);
    }
    console.log(`   🔗 ${job.source}`);
});

// Top companies hiring
console.log('\n🏢 TOP COMPANIES HIRING');
console.log('------------------------');
const companyCount = {};
allJobs.forEach(job => {
    companyCount[job.company] = (companyCount[job.company] || 0) + 1;
});
const topCompanies = Object.entries(companyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

topCompanies.forEach(([company, count]) => {
    console.log(`${company}: ${count} positions`);
});

// Most common job titles
console.log('\n💼 MOST COMMON ROLES');
console.log('--------------------');
const titleCount = {};
allJobs.forEach(job => {
    // Extract base title (remove Senior, Staff, etc.)
    const baseTitle = job.title.replace(/^(Senior|Staff|Principal|Lead)\s+/i, '');
    titleCount[baseTitle] = (titleCount[baseTitle] || 0) + 1;
});
const topTitles = Object.entries(titleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

topTitles.forEach(([title, count]) => {
    console.log(`${title}: ${count} positions`);
});

// Export option
console.log('\n💾 EXPORT OPTIONS');
console.log('-----------------');
console.log(`Raw JSON files: ${logsDir}/`);
console.log(`Master log: ${path.join(logsDir, 'master.log')}`);

// Next run suggestion
console.log('\n⏰ NEXT STEPS');
console.log('-------------');
console.log('Run again: ./activate.sh');
console.log('Continuous mode: ./activate.sh (select Y when prompted)');
console.log('View this report: node view_results.js');

console.log('\n=====================================');
console.log(`Generated: ${new Date().toLocaleString()}`);
console.log('=====================================\n');