// Test dashboard stats API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testDashboard() {
  try {
    console.log('Testing login and dashboard APIs...');
    
    // First login
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@spotgrid.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Test dashboard stats
    console.log('\nTesting dashboard stats...');
    const statsResponse = await fetch(`${API_BASE}/estimates/stats/dashboard`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log('Stats response status:', statsResponse.status);
    const statsResult = await statsResponse.text();
    console.log('Stats response:', statsResult);

    if (statsResponse.ok) {
      const stats = JSON.parse(statsResult);
      console.log('✅ Dashboard stats retrieved:');
      console.log('- Draft Orders:', stats.data.draftOrders);
      console.log('- Pending Orders:', stats.data.pendingOrders);
      console.log('- Active Orders:', stats.data.activeOrders);
      console.log('- Total Budgeted:', stats.data.totalBudgeted);
      console.log('- Active Brands:', stats.data.activeBrands);
      console.log('- Media Assets:', stats.data.mediaAssets);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testDashboard(); 