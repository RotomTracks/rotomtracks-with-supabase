-- Migration: Add email field to user_profiles table
-- Description: Adds email field to user_profiles to avoid admin queries for organizer information
-- Date: 2024-12-23

-- Add email field to user_profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN email VARCHAR(255);
        
        -- Add comment for documentation
        COMMENT ON COLUMN user_profiles.email IS 'User email address - synced from auth.users';
    END IF;
END $$;

-- Create a function to sync email from auth.users to user_profiles
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user_profiles when auth.users email changes
    UPDATE user_profiles 
    SET email = NEW.email, updated_at = NOW()
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync email changes
DROP TRIGGER IF EXISTS sync_user_email_trigger ON auth.users;
CREATE TRIGGER sync_user_email_trigger
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email();

-- Sync existing emails from auth.users to user_profiles
UPDATE user_profiles 
SET email = au.email, updated_at = NOW()
FROM auth.users au
WHERE user_profiles.user_id = au.id
AND user_profiles.email IS NULL;
