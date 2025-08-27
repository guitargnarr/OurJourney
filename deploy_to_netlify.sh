#!/bin/bash

echo "🚀 Deploying Portfolio to jaspermatters.com"
echo "=========================================="

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify (if needed)
echo "🔐 Checking Netlify authentication..."
netlify status

# Deploy to production
echo "🌐 Deploying to jaspermatters.com..."
netlify deploy --prod --dir=. --message="Replace OurJourney with professional portfolio"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your portfolio should be live at: https://jaspermatters.com"
echo ""
echo "⏱️  Note: DNS changes may take 5-10 minutes to propagate"
echo ""
echo "📊 Verify deployment:"
echo "  1. Visit https://jaspermatters.com"
echo "  2. Check Netlify dashboard: https://app.netlify.com"
echo "  3. Test with: curl -I https://jaspermatters.com"