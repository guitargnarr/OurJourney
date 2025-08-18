#!/bin/bash

echo "🔍 OurJourney Deployment Status Check"
echo "====================================="
echo ""

# Check Frontend
echo "📱 Frontend (Netlify):"
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" https://musical-caramel-01f843.netlify.app)
if [ "$frontend_status" = "200" ]; then
    echo "   ✅ Status: Live (HTTP $frontend_status)"
    echo "   🔗 URL: https://musical-caramel-01f843.netlify.app"
else
    echo "   ❌ Status: Down (HTTP $frontend_status)"
fi

echo ""
echo "🔧 Backend (Render):"
echo "   ⏳ Checking (may take up to 60 seconds if sleeping)..."
backend_status=$(curl -s -m 60 -o /dev/null -w "%{http_code}" https://ourjourney-api.onrender.com/api/health 2>/dev/null)
if [ "$backend_status" = "200" ]; then
    echo "   ✅ Status: Live (HTTP $backend_status)"
    echo "   🔗 URL: https://ourjourney-api.onrender.com"
    health=$(curl -s https://ourjourney-api.onrender.com/api/health 2>/dev/null)
    echo "   📊 Health: $health"
elif [ "$backend_status" = "502" ]; then
    echo "   ⚠️  Status: Bad Gateway (502) - Still deploying or crashed"
    echo "   💡 Check Render dashboard for logs"
elif [ -z "$backend_status" ]; then
    echo "   ❌ Status: Timeout - Backend not responding"
    echo "   💡 Likely still deploying. Check Render dashboard"
else
    echo "   ⚠️  Status: HTTP $backend_status"
fi

echo ""
echo "📋 Next Steps:"
echo "1. If backend shows 502 or timeout:"
echo "   - Check Render dashboard at https://dashboard.render.com"
echo "   - View deployment logs for errors"
echo "   - Backend may need 5-10 minutes for initial deploy"
echo ""
echo "2. If both are live:"
echo "   - Test login at: https://musical-caramel-01f843.netlify.app"
echo "   - Password: sage2025"
echo ""
echo "3. To connect jaspermatters.com:"
echo "   - Go to Netlify > Domain Management"
echo "   - Add custom domain"
echo ""

# Show latest commits
echo "📝 Latest Deployment Commits:"
git log --oneline -5