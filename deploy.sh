#!/bin/bash
# Deploy portfolio to jaspermatters.com
# Requires proper hosting configuration

echo "🚀 Portfolio Deployment Script"
echo "=============================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if all required files exist
echo -e "${BLUE}Checking portfolio files...${NC}"

REQUIRED_FILES=(
    "index.html"
    "styles.css"
    "script.js"
    "assets/favicon.ico"
    "assets/hero_background.png"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found: $file${NC}"
    else
        echo -e "${YELLOW}⚠️ Missing: $file${NC}"
    fi
done

# Create deployment bundle
echo -e "\n${BLUE}Creating deployment bundle...${NC}"
DEPLOY_DIR="portfolio_deploy_$(date +%Y%m%d_%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy all files
cp -r index.html styles.css script.js assets/ $DEPLOY_DIR/

# Create README for deployment
cat > $DEPLOY_DIR/README.md << 'EOF'
# Portfolio Deployment Instructions

## Option 1: GitHub Pages
1. Create a new repository named `[username].github.io`
2. Upload all files to the repository
3. Enable GitHub Pages in Settings > Pages
4. Your site will be available at `https://[username].github.io`

## Option 2: Netlify
1. Visit https://netlify.com
2. Drag and drop this folder to deploy
3. Configure custom domain to jaspermatters.com

## Option 3: Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in this directory
3. Follow prompts to deploy
4. Add custom domain in Vercel dashboard

## Option 4: Traditional Hosting
1. Upload all files via FTP/SFTP
2. Ensure index.html is in the root directory
3. Configure DNS to point jaspermatters.com to your server

## Files Included
- `index.html` - Main portfolio page
- `styles.css` - Styling
- `script.js` - Interactive features
- `assets/` - Images and visual assets
EOF

# Create package.json for easy deployment
cat > $DEPLOY_DIR/package.json << 'EOF'
{
  "name": "matthew-scott-portfolio",
  "version": "1.0.0",
  "description": "Professional portfolio for Matthew Scott - AI/ML Engineer",
  "scripts": {
    "serve": "python3 -m http.server 8080",
    "deploy-netlify": "netlify deploy --prod --dir=.",
    "deploy-vercel": "vercel --prod"
  },
  "keywords": ["portfolio", "AI", "ML", "engineer"],
  "author": "Matthew Scott",
  "license": "MIT"
}
EOF

# Create a simple server script for local testing
cat > $DEPLOY_DIR/serve.py << 'EOF'
#!/usr/bin/env python3
"""Simple server for testing the portfolio locally"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print(f"🌐 Starting portfolio server on http://localhost:{PORT}")
print("📁 Serving files from:", DIRECTORY)
print("Press Ctrl+C to stop the server\n")

# Open in browser
webbrowser.open(f'http://localhost:{PORT}')

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    httpd.serve_forever()
EOF

chmod +x $DEPLOY_DIR/serve.py

# Zip for easy transfer
echo -e "\n${BLUE}Creating deployment archive...${NC}"
zip -r "${DEPLOY_DIR}.zip" $DEPLOY_DIR

echo -e "\n${GREEN}✨ Deployment bundle created successfully!${NC}"
echo -e "📦 Bundle location: ${PWD}/${DEPLOY_DIR}"
echo -e "📦 Archive: ${PWD}/${DEPLOY_DIR}.zip"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Test locally: cd $DEPLOY_DIR && python3 serve.py"
echo "2. Deploy to GitHub Pages, Netlify, or Vercel"
echo "3. Configure DNS for jaspermatters.com"
echo ""
echo -e "${GREEN}Quick Deploy Options:${NC}"
echo "• Netlify: Visit https://app.netlify.com/drop and drag the folder"
echo "• GitHub Pages: Push to username.github.io repository"
echo "• Vercel: Run 'npx vercel' in the $DEPLOY_DIR directory"