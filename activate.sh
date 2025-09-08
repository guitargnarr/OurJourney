#!/bin/bash

# ULTRATHINK AUTOMATION ACTIVATION SCRIPT
# One command to activate the dormant arsenal

echo "🚀 ULTRATHINK AUTOMATION ACTIVATION"
echo "===================================="
echo ""

# Check current directory
if [[ ! -f "job_hunter_bot.js" ]]; then
    echo "❌ Error: Must run from OurJourney directory"
    exit 1
fi

# Create required directories
echo "📁 Creating directories..."
mkdir -p automation_logs
mkdir -p competitor_tracking
mkdir -p .automation

# Check if Puppeteer is installed
if [[ ! -d "node_modules/puppeteer" ]]; then
    echo "📦 Installing Puppeteer..."
    npm install puppeteer --no-save
fi

# Run the job hunter bot immediately
echo ""
echo "🎯 LAUNCHING JOB HUNTER BOT"
echo "---------------------------"
node job_hunter_bot.js

# Check if we should run continuously
echo ""
read -p "🔄 Run continuously? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⏰ Setting up continuous monitoring..."
    
    # Create a simple scheduler
    cat > continuous_runner.js << 'EOF'
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
EOF

    # Run the continuous scheduler
    node continuous_runner.js
else
    echo "✅ Single run completed"
    echo ""
    echo "📊 Results saved to: automation_logs/"
    echo ""
    echo "To run again: ./activate.sh"
fi