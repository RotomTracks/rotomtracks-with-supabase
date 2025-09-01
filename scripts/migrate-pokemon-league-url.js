require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVER_AUTH || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPokemonLeagueUrlColumn() {
  try {
    console.log('Adding pokemon_league_url column to user_profiles table...');
    
    // Ejecutar la migración
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS pokemon_league_url TEXT;
        
        COMMENT ON COLUMN user_profiles.pokemon_league_url IS 'URL oficial de la liga o tienda Pokémon del organizador';
      `
    });
    
    if (error) {
      console.error('Error executing migration:', error);
      console.log('\nPlease run this SQL manually in your Supabase dashboard:');
      console.log('ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pokemon_league_url TEXT;');
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verificar que la columna se agregó
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('pokemon_league_url')
      .limit(1);
    
    if (testError) {
      console.log('❌ Column verification failed:', testError.message);
    } else {
      console.log('✅ Column pokemon_league_url verified successfully!');
    }
    
  } catch (error) {
    console.error('Error running migration:', error);
    console.log('\nPlease run this SQL manually in your Supabase dashboard:');
    console.log('ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pokemon_league_url TEXT;');
  }
}

addPokemonLeagueUrlColumn();