-- Agregar columna pokemon_league_url a la tabla user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS pokemon_league_url TEXT;

-- Agregar comentario para documentar la columna
COMMENT ON COLUMN user_profiles.pokemon_league_url IS 'URL oficial de la liga o tienda Pokémon del organizador';