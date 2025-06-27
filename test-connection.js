// Simple test to verify database connection
// Run with: node test-connection.js

const { Pool } = require('pg');

// Your actual EasyPanel connection details - corrected port
const pool = new Pool({
  host: '52.206.24.38',
  port: 7260,
  database: 'spotgrid',
  user: 'spotgrid',
  password: 'Make-Jesus-Known',
  ssl: false
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');
    
    // Test query
    const result = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`✅ Found ${result.rows[0].user_count} users in database`);
    
    // Test admin user
    const adminResult = await client.query('SELECT email, role FROM users WHERE role = $1', ['traffic_admin']);
    if (adminResult.rows.length > 0) {
      console.log(`✅ Admin user found: ${adminResult.rows[0].email}`);
    } else {
      console.log('❌ No admin user found');
    }
    
    client.release();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection(); 