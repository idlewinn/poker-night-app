#!/usr/bin/env node

/**
 * Production Deployment Verification Script
 * 
 * This script helps verify that your production deployment is configured correctly
 * Run this after deploying to production to check all endpoints and configurations
 */

const https = require('https');
const http = require('http');

// Configuration - Update these with your production URLs
const PRODUCTION_CONFIG = {
  frontend: process.env.FRONTEND_URL || 'https://yourdomain.com',
  backend: process.env.BACKEND_URL || 'https://api.yourdomain.com',
  apiPath: '/api'
};

console.log('🚀 Poker Night Production Verification');
console.log('=====================================');
console.log(`Frontend URL: ${PRODUCTION_CONFIG.frontend}`);
console.log(`Backend URL: ${PRODUCTION_CONFIG.backend}${PRODUCTION_CONFIG.apiPath}`);
console.log('');

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing API Health Check...');
  try {
    const response = await makeRequest(`${PRODUCTION_CONFIG.backend}${PRODUCTION_CONFIG.apiPath}/health`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('✅ Health check passed');
      console.log(`   Status: ${data.status}`);
      console.log(`   Timestamp: ${data.timestamp}`);
      return true;
    } else {
      console.log(`❌ Health check failed: HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return false;
  }
}

async function testCORS() {
  console.log('🔍 Testing CORS Configuration...');
  try {
    const response = await makeRequest(`${PRODUCTION_CONFIG.backend}${PRODUCTION_CONFIG.apiPath}/health`);
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials']
    };
    
    console.log('✅ CORS headers found:');
    console.log(`   Origin: ${corsHeaders['access-control-allow-origin']}`);
    console.log(`   Credentials: ${corsHeaders['access-control-allow-credentials']}`);
    
    return true;
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
    return false;
  }
}

async function testFrontend() {
  console.log('🔍 Testing Frontend Accessibility...');
  try {
    const response = await makeRequest(PRODUCTION_CONFIG.frontend);
    
    if (response.statusCode === 200) {
      console.log('✅ Frontend is accessible');
      
      // Check if it's a React app
      if (response.body.includes('root') && response.body.includes('script')) {
        console.log('✅ React app detected');
      }
      
      return true;
    } else {
      console.log(`❌ Frontend test failed: HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend test failed: ${error.message}`);
    return false;
  }
}

async function testGoogleOAuth() {
  console.log('🔍 Testing Google OAuth Configuration...');
  try {
    const response = await makeRequest(`${PRODUCTION_CONFIG.backend}${PRODUCTION_CONFIG.apiPath}/auth/google`);
    
    // OAuth should redirect, so we expect a 302 or similar
    if (response.statusCode >= 300 && response.statusCode < 400) {
      console.log('✅ Google OAuth endpoint is responding');
      
      const location = response.headers.location;
      if (location && location.includes('accounts.google.com')) {
        console.log('✅ Redirecting to Google OAuth correctly');
        return true;
      } else {
        console.log('⚠️  OAuth redirect may not be configured correctly');
        return false;
      }
    } else {
      console.log(`❌ OAuth test failed: HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ OAuth test failed: ${error.message}`);
    return false;
  }
}

// Main verification function
async function runVerification() {
  console.log('Starting verification tests...\n');
  
  const results = {
    health: await testHealthCheck(),
    cors: await testCORS(),
    frontend: await testFrontend(),
    oauth: await testGoogleOAuth()
  };
  
  console.log('\n📊 Verification Results:');
  console.log('========================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your production deployment looks good.');
  } else {
    console.log('⚠️  Some tests failed. Please check your configuration.');
    console.log('\n💡 Common fixes:');
    console.log('   - Verify environment variables are set correctly');
    console.log('   - Check Google OAuth redirect URIs');
    console.log('   - Ensure CORS is configured for your frontend domain');
    console.log('   - Verify both frontend and backend are deployed and accessible');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run the verification
runVerification().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});
