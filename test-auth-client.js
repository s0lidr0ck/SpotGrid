// Simple test client for authentication API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@spotgrid.com',
        password: 'admin123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    const result = await response.text();
    console.log('Response body:', result);

    if (response.ok) {
      const data = JSON.parse(result);
      console.log('✅ Login successful!');
      console.log('Token:', data.token?.substring(0, 20) + '...');
      console.log('User:', data.user);
      
      // Test the /me endpoint
      console.log('\nTesting /me endpoint...');
      const meResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      const meResult = await meResponse.text();
      console.log('Me response:', meResult);
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLogin(); 