-- Fix tournament organizer relation
DO $$
BEGIN
    -- Check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tournaments_organizer_id_fkey'
        AND table_name = 'tournaments'
    ) THEN
        -- Add constraint if missing
        ALTER TABLE tournaments 
        ADD CONSTRAINT tournaments_organizer_id_fkey 
        FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create a view or function to get organizer information
-- This will allow us to join tournaments with user_profiles through auth.users
CREATE OR REPLACE VIEW tournament_organizers AS
SELECT 
    t.id as tournament_id,
    t.organizer_id,
    up.first_name,
    up.last_name,
    up.organization_name,
    up.user_role
FROM tournaments t
LEFT JOIN user_profiles up ON t.organizer_id = up.user_id;

-- Add a comment explaining the relationship
COMMENT ON VIEW tournament_organizers IS 'View that joins tournaments with organizer information from user_profiles';
