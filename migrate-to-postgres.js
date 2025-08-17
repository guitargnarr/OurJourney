#!/usr/bin/env node

import { openDb } from './database.js';
import { initializeDatabase, migrateFromSQLite } from './database.postgres.js';
import dotenv from 'dotenv';

dotenv.config();

async function exportFromSQLite() {
  console.log('📤 Exporting data from SQLite...');
  
  const db = await openDb();
  
  // Get all entries
  const entries = await db.all('SELECT * FROM entries');
  
  // Get all rituals
  const rituals = await db.all('SELECT * FROM rituals');
  
  // Get all insights (if any)
  const insights = await db.all('SELECT * FROM insights');
  
  console.log(`Found ${entries.length} entries, ${rituals.length} rituals, ${insights.length} insights`);
  
  return {
    entries,
    rituals,
    insights
  };
}

async function runMigration() {
  try {
    console.log('🚀 Starting migration from SQLite to PostgreSQL...\n');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set!');
      console.log('\n📝 Instructions:');
      console.log('1. Create a free Supabase account at https://supabase.com');
      console.log('2. Create a new project');
      console.log('3. Go to Settings > Database');
      console.log('4. Copy the connection string (URI)');
      console.log('5. Create a .env file with:');
      console.log('   DATABASE_URL=your_connection_string_here');
      process.exit(1);
    }
    
    // Export from SQLite
    const sqliteData = await exportFromSQLite();
    
    // Initialize PostgreSQL schema
    console.log('\n📊 Initializing PostgreSQL database...');
    await initializeDatabase();
    
    // Migrate data
    console.log('\n📥 Migrating data to PostgreSQL...');
    const result = await migrateFromSQLite(sqliteData);
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`   - ${result.entriesMigrated} entries migrated`);
    console.log(`   - ${result.ritualsMigrated} rituals migrated`);
    
    console.log('\n🎉 Your data is now in PostgreSQL!');
    console.log('   Next steps:');
    console.log('   1. Update server.js to use database.postgres.js');
    console.log('   2. Test locally with npm start');
    console.log('   3. Deploy to production');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Check your DATABASE_URL is correct');
    console.error('   - Ensure PostgreSQL server is accessible');
    console.error('   - Verify your Supabase project is active');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { exportFromSQLite, runMigration };