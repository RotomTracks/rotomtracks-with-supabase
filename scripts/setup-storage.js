#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVER_AUTH || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment variables:');
console.log('DATABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Using key:', supabaseKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  try {
    console.log('Setting up Supabase Storage...');

    // Verificar buckets existentes (excluyendo profile-images que ya no se usa)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    console.log('Existing buckets:', buckets.map(b => b.name));

    // Note: profile-images bucket has been removed as part of UI cleanup
    console.log('Profile images functionality has been removed from the application');

    // Setup other required buckets (tournament-files, tournament-reports)
    const requiredBuckets = [
      { name: 'tournament-files', public: false },
      { name: 'tournament-reports', public: true }
    ];

    for (const bucketConfig of requiredBuckets) {
      const existingBucket = buckets.find(bucket => bucket.name === bucketConfig.name);
      
      if (!existingBucket) {
        console.log(`Creating ${bucketConfig.name} bucket...`);
        
        const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
          public: bucketConfig.public,
          fileSizeLimit: 10485760 // 10MB
        });

        if (error) {
          console.error(`Error creating ${bucketConfig.name} bucket:`, error);
        } else {
          console.log(`${bucketConfig.name} bucket created successfully:`, data);
        }
      } else {
        console.log(`${bucketConfig.name} bucket already exists`);
      }
    }

    console.log('Storage setup completed!');

  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

setupStorage();