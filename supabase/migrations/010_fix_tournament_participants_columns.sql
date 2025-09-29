-- Fix tournament_participants table columns
-- Ensure all required columns exist for proper functionality

-- Add player_birthdate column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournament_participants' 
        AND column_name = 'player_birthdate'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournament_participants 
        ADD COLUMN player_birthdate DATE;
        
        COMMENT ON COLUMN tournament_participants.player_birthdate IS 'Player birthdate - always required as TDF provides this data';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournament_participants' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournament_participants 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        COMMENT ON COLUMN tournament_participants.created_at IS 'Timestamp when the participant was registered';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournament_participants' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournament_participants 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        COMMENT ON COLUMN tournament_participants.updated_at IS 'Timestamp when the participant record was last updated';
    END IF;
END $$;
