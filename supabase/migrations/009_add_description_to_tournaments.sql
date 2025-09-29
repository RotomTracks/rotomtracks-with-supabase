-- Add description field to tournaments table
-- This field was missing from the initial schema but is needed for tournament creation

-- Add description column to tournaments table if it doesn't exist
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        -- Add the description column
        ALTER TABLE tournaments 
        ADD COLUMN description TEXT;
        
        -- Add a comment explaining the field
        COMMENT ON COLUMN tournaments.description IS 'Optional description of the tournament';
    END IF;
END $$;
