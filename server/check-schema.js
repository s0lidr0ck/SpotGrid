import { query } from './database.js';

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // Check estimates table columns
    console.log('\n=== ESTIMATES TABLE ===');
    const estimatesColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'estimates' 
      ORDER BY ordinal_position
    `);
    
    console.table(estimatesColumns.rows);
    
    // Check brands table columns
    console.log('\n=== BRANDS TABLE ===');
    const brandsColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'brands' 
      ORDER BY ordinal_position
    `);
    
    console.table(brandsColumns.rows);
    
    // Check media_assets table columns
    console.log('\n=== MEDIA_ASSETS TABLE ===');
    const mediaColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'media_assets' 
      ORDER BY ordinal_position
    `);
    
    console.table(mediaColumns.rows);
    
    // Count records in each table
    console.log('\n=== RECORD COUNTS ===');
    const estimatesCount = await query('SELECT COUNT(*) as count FROM estimates');
    const brandsCount = await query('SELECT COUNT(*) as count FROM brands');
    const mediaCount = await query('SELECT COUNT(*) as count FROM media_assets');
    
    console.log('Estimates:', estimatesCount.rows[0].count);
    console.log('Brands:', brandsCount.rows[0].count);
    console.log('Media Assets:', mediaCount.rows[0].count);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkSchema(); 