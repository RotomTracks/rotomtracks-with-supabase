require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVER_AUTH || process.env.DATABASE_SERVICE_TOKEN || process.env.API_SECRET || process.env.DATABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageAccess() {
  try {
    console.log('Testing image access and policies...\n');
    
    // Test 1: Listar archivos existentes
    console.log('1. Listing existing files...');
    const { data: files, error: listError } = await supabase.storage
      .from('profile-images')
      .list('', { 
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }
    
    console.log(`✅ Found ${files.length} files:`);
    files.forEach(file => {
      console.log(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`);
    });
    
    // Test 2: Probar URLs públicas de archivos existentes
    if (files.length > 0) {
      console.log('\n2. Testing public URLs...');
      
      for (const file of files.slice(0, 3)) { // Solo probar los primeros 3
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(file.name);
        
        console.log(`Testing URL: ${publicUrl}`);
        
        try {
          const response = await fetch(publicUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log(`✅ ${file.name} - Accessible (${response.status})`);
          } else {
            console.log(`❌ ${file.name} - Not accessible (${response.status})`);
          }
        } catch (fetchError) {
          console.log(`❌ ${file.name} - Network error:`, fetchError.message);
        }
      }
    }
    
    // Test 3: Verificar estructura de carpetas por usuario
    console.log('\n3. Checking user folder structure...');
    const { data: folders, error: foldersError } = await supabase.storage
      .from('profile-images')
      .list('', { 
        limit: 10,
        search: ''
      });
    
    if (foldersError) {
      console.error('❌ Error checking folders:', foldersError);
    } else {
      const userFolders = folders.filter(item => 
        item.name && item.name.length > 10 && !item.name.includes('.')
      );
      console.log(`✅ Found ${userFolders.length} user folders`);
      userFolders.forEach(folder => {
        console.log(`  - User folder: ${folder.name}`);
      });
    }
    
    console.log('\n🎉 Image access test completed!');
    
  } catch (error) {
    console.error('Error testing image access:', error);
  }
}

testImageAccess();