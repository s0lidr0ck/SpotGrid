import { query } from './database.js';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  try {
    console.log('Checking admin user...');
    
    // Get admin user
    const result = await query('SELECT id, email, password_hash, role FROM users WHERE email = $1', ['admin@spotgrid.com']);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ Admin user found:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Password hash length:', user.password_hash?.length);
    console.log('- Password hash starts with:', user.password_hash?.substring(0, 10));
    
    // Test password comparison
    console.log('\nTesting password comparison...');
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log('Password "admin123" is valid:', isValid);
    
    // If invalid, let's create a new hash
    if (!isValid) {
      console.log('\n❌ Password hash is invalid. Creating new hash...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash:', newHash.substring(0, 20) + '...');
      
      // Update the user
      await query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, 'admin@spotgrid.com']);
      console.log('✅ Password hash updated!');
      
      // Test again
      const retest = await bcrypt.compare(testPassword, newHash);
      console.log('New password verification:', retest);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkAdmin(); 