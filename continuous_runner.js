const JobHunterBot = require('./job_hunter_bot');

console.log('🔄 CONTINUOUS AUTOMATION ACTIVE');
console.log('================================');
console.log('Running every 6 hours...');
console.log('Press Ctrl+C to stop');

// Initial run
const runBot = async () => {
    const bot = new JobHunterBot();
    await bot.run();
};

// Run immediately
runBot();

// Schedule every 6 hours
setInterval(() => {
    console.log('\n⏰ Scheduled run starting...');
    runBot();
}, 6 * 60 * 60 * 1000);

// Keep process alive
process.stdin.resume();
