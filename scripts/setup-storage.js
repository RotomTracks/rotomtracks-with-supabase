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

    // Verificar si el bucket profile-images existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    console.log('Existing buckets:', buckets.map(b => b.name));

    const profileImagesBucket = buckets.find(bucket => bucket.name === 'profile-images');

    if (!profileImagesBucket) {
      console.log('Creating profile-images bucket...');
      
      const { data, error } = await supabase.storage.createBucket('profile-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        console.error('Error creating bucket:', error);
        return;
      }

      console.log('Bucket created successfully:', data);
    } else {
      console.log('profile-images bucket already exists');
    }

    // Verificar políticas de acceso
    console.log('Checking storage policies...');
    
    // Esta consulta requiere permisos de administrador
    const { data: policies, error: policiesError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'profile-images');

    if (policiesError) {
      console.log('Could not check policies (this is normal if you don\'t have admin access)');
    } else {
      console.log('Current policies:', policies);
    }

    console.log('Storage setup completed!');

  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

setupStorage();