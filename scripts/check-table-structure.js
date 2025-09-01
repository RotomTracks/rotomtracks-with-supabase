require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('Checking user_profiles table structure...');
    
    // Consultar la estructura de la tabla
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' });
    
    if (error) {
      console.log('Could not get table structure via RPC, trying direct query...');
      
      // Intentar con una consulta directa
      const { data: sampleData, error: sampleError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Error querying table:', sampleError);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log('Table columns (from sample data):');
        console.log(Object.keys(sampleData[0]));
      } else {
        console.log('Table exists but has no data');
      }
    } else {
      console.log('Table structure:', data);
    }
    
    // Intentar hacer una consulta que incluya pokemon_league_url para ver si existe
    console.log('\nTesting pokemon_league_url column...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('pokemon_league_url')
      .limit(1);
    
    if (testError) {
      console.log('❌ pokemon_league_url column does NOT exist');
      console.log('Error:', testError.message);
    } else {
      console.log('✅ pokemon_league_url column exists');
    }
    
  } catch (error) {
    console.error('Error checking table structure:', error);
  }
}

checkTableStructure();