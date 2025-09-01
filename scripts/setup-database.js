#!/usr/bin/env node

/**
 * Database Setup Script for Tournament Management System
 * This script sets up the database schema and seed data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filePath) {
  console.log(`📄 Running migration: ${path.basename(filePath)}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Migration completed: ${path.basename(filePath)}`);
    return true;
  } catch (err) {
    console.error(`❌ Error reading migration file: ${err.message}`);
    return false;
  }
}

async function runSeedData() {
  console.log('🌱 Running seed data...');
  
  try {
    const seedPath = path.join(__dirname, '../supabase/seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ Seed data failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Seed data completed');
    return true;
  } catch (err) {
    console.error(`❌ Error running seed data: ${err.message}`);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up Tournament Management System database...\n');
  
  // Run migrations
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (migrationFiles.length === 0) {
    console.log('⚠️  No migration files found');
  } else {
    for (const file of migrationFiles) {
      const success = await runMigration(path.join(migrationsDir, file));
      if (!success) {
        console.error('❌ Database setup failed during migrations');
        process.exit(1);
      }
    }
  }
  
  // Run seed data
  const seedSuccess = await runSeedData();
  if (!seedSuccess) {
    console.error('❌ Database setup failed during seeding');
    process.exit(1);
  }
  
  console.log('\n🎉 Database setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Start your Next.js development server: npm run dev');
  console.log('2. Visit http://localhost:3000 to see your application');
  console.log('3. Create a user account and test the tournament features');
}

// Run the setup
setupDatabase().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});