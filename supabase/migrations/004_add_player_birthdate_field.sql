-- Migration: Add player birthdate field
-- Description: Add player_birthdate field to tournament_participants table
-- Date: 2024-12-23
-- This field is required as TDF always provides birthdate information

ALTER TABLE tournament_participants 
ADD COLUMN IF NOT EXISTS player_birthdate DATE NOT NULL DEFAULT '1990-01-01';

-- Remove the default after adding the column (for new records, birthdate will be required)
ALTER TABLE tournament_participants 
ALTER COLUMN player_birthdate DROP DEFAULT;

-- Add comment to document the requirement
COMMENT ON COLUMN tournament_participants.player_birthdate IS 'Player birthdate - always required as TDF provides this data';
COMMENT ON COLUMN tournament_participants.player_id IS 'Player ID - always required as TDF provides this data';
COMMENT ON COLUMN tournament_participants.user_id IS 'User ID - always required as only users with accounts can participate';