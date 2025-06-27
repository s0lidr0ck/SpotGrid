import { query } from './database.js';
import bcrypt from 'bcryptjs';

async function testAndSetupDb() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const testResult = await query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', testResult.rows[0].current_time);
    
    // Check if admin user exists
    console.log('\nChecking for admin user...');
    const userCheck = await query('SELECT id, email, role FROM users WHERE email = $1', ['admin@spotgrid.com']);
    
    if (userCheck.rows.length === 0) {
      console.log('❌ Admin user not found. Creating admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create admin user
      const createUser = await query(`
        INSERT INTO users (email, password_hash, role, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id, email, role
      `, ['admin@spotgrid.com', hashedPassword, 'traffic_admin']);
      
      console.log('✅ Admin user created:', createUser.rows[0]);
    } else {
      console.log('✅ Admin user exists:', userCheck.rows[0]);
    }
    
    // List all users
    console.log('\nAll users in database:');
    const allUsers = await query('SELECT id, email, role, created_at FROM users ORDER BY created_at');
    console.table(allUsers.rows);
    
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
  
  process.exit(0);
}

testAndSetupDb(); 