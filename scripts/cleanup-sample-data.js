#!/usr/bin/env node

/**
 * Script to clean up sample tournament data from the database
 * Run this script to remove all test/demo data and start with a clean database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
const supabaseServiceKey = process.env.SERVER_AUTH || process.env.DATABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing database environment variables');
  console.error('Make sure NEXT_PUBLIC_DATABASE_URL and SERVER_AUTH are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupSampleData() {
  console.log('🧹 Starting cleanup of sample tournament data...\n');

  try {
    // Read the cleanup SQL file
    const cleanupSqlPath = path.join(__dirname, '..', 'supabase', 'cleanup_sample_data.sql');
    const cleanupSql = fs.readFileSync(cleanupSqlPath, 'utf8');

    // Split the SQL into individual statements
    const statements = cleanupSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('SELECT'));

    console.log(`📝 Found ${statements.length} cleanup statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });

        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    // Verify cleanup by counting remaining records
    console.log('\n📊 Verifying cleanup results...\n');

    const tables = [
      'tournaments',
      'tournament_participants', 
      'tournament_results',
      'tournament_matches',
      'tournament_files',
      'user_profiles'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Error counting ${table}:`, error.message);
      } else {
        console.log(`📋 ${table}: ${count} records remaining`);
      }
    }

    console.log('\n✅ Sample data cleanup completed successfully!');
    console.log('🎉 Your database is now clean and ready for production use.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupSampleData();