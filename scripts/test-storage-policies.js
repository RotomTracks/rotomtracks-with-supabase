require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.DATABASE_SERVICE_TOKEN || process.env.API_SECRET || process.env.DATABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStoragePolicies() {
  try {
    console.log('Testing storage policies...\n');
    
    // Test 1: Verificar que el bucket existe
    console.log('1. Checking if profile-images bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    const profileBucket = buckets.find(b => b.name === 'profile-images');
    if (!profileBucket) {
      console.log('❌ profile-images bucket not found');
      return;
    }
    console.log('✅ profile-images bucket exists');
    
    // Test 2: Verificar políticas (intentar listar archivos)
    console.log('\n2. Testing read policies...');
    const { data: files, error: listError } = await supabase.storage
      .from('profile-images')
      .list('', { limit: 5 });
    
    if (listError) {
      console.log('❌ Error listing files (this might be expected):', listError.message);
    } else {
      console.log(`✅ Can list files in bucket (${files.length} files found)`);
    }
    
    // Test 3: Verificar que se pueden generar URLs públicas
    console.log('\n3. Testing public URL generation...');
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl('test-file.jpg');
    
    if (publicUrl) {
      console.log('✅ Can generate public URLs:', publicUrl);
    } else {
      console.log('❌ Cannot generate public URLs');
    }
    
    // Test 4: Verificar configuración del bucket
    console.log('\n4. Checking bucket configuration...');
    console.log('Bucket details:', profileBucket);
    
    console.log('\n🎉 Storage tests completed!');
    console.log('\nNext steps:');
    console.log('1. Test the profile form in your browser');
    console.log('2. Try uploading a profile image');
    console.log('3. Check if images display correctly');
    
  } catch (error) {
    console.error('Error testing storage policies:', error);
  }
}

testStoragePolicies();