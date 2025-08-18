#!/usr/bin/env node
import fetch from 'node-fetch';

console.log('🧪 Testing OurJourney Deployment\n');
console.log('=====================================\n');

// Test Frontend
async function testFrontend() {
  console.log('📱 Testing Frontend (Netlify)...');
  try {
    const response = await fetch('https://musical-caramel-01f843.netlify.app');
    if (response.ok) {
      console.log('✅ Frontend is live at: https://musical-caramel-01f843.netlify.app');
      console.log(`   Status: ${response.status}`);
      const html = await response.text();
      if (html.includes('OurJourney')) {
        console.log('   App loaded successfully');
      }
    } else {
      console.log(`❌ Frontend returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Frontend error: ${error.message}`);
  }
}

// Test Backend
async function testBackend() {
  console.log('\n🔧 Testing Backend (Render)...');
  console.log('   Note: Free tier may take 30-50 seconds to wake up');
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch('https://ourjourney-api.onrender.com/api/health', {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Backend is responding');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${data}`);
    } else {
      console.log(`⚠️  Backend returned status: ${response.status}`);
      if (response.status === 502) {
        console.log('   Backend may still be deploying. Check Render dashboard.');
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('❌ Backend timeout after 60 seconds');
      console.log('   This suggests the backend is not deployed or crashed');
    } else {
      console.log(`❌ Backend error: ${error.message}`);
    }
  }
}

// Test API Connection
async function testAPIConnection() {
  console.log('\n🔗 Testing Frontend-Backend Connection...');
  try {
    const response = await fetch('https://musical-caramel-01f843.netlify.app');
    const html = await response.text();
    
    if (html.includes('https://ourjourney-api.onrender.com')) {
      console.log('✅ Frontend is configured with correct backend URL');
    } else {
      console.log('⚠️  Frontend may not have the correct backend URL configured');
    }
  } catch (error) {
    console.log(`❌ Connection test error: ${error.message}`);
  }
}

// Run all tests
async function runTests() {
  await testFrontend();
  await testBackend();
  await testAPIConnection();
  
  console.log('\n=====================================');
  console.log('📊 Test Summary:');
  console.log('- Frontend URL: https://musical-caramel-01f843.netlify.app');
  console.log('- Backend URL: https://ourjourney-api.onrender.com');
  console.log('- Password: sage2025');
  console.log('\n💡 If backend is not responding:');
  console.log('   1. Check Render dashboard for deployment status');
  console.log('   2. View Render logs for any errors');
  console.log('   3. Backend may need 5-10 minutes for first deployment');
}

runTests().catch(console.error);