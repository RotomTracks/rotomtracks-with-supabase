-- Migration: Add Pokemon League URL field
-- Description: Adds pokemon_league_url field to user_profiles and organizer_requests tables
-- Date: 2025-01-27

-- Add pokemon_league_url to user_profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'pokemon_league_url'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN pokemon_league_url VARCHAR(500);
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.pokemon_league_url IS 'Official Pokemon league/store URL for organizers';

-- Note: organizer_requests table already has this field from migration 002