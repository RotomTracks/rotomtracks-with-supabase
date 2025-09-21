-- Migration to remove profile_image_url column from user_profiles table
-- This script safely removes the profile image functionality from the database

-- Check if the column exists before attempting to drop it
DO $$ 
BEGIN
    -- Check if profile_image_url column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'profile_image_url'
    ) THEN
        -- Drop the profile_image_url column
        ALTER TABLE user_profiles DROP COLUMN profile_image_url;
        RAISE NOTICE 'Successfully removed profile_image_url column from user_profiles table';
    ELSE
        RAISE NOTICE 'Column profile_image_url does not exist in user_profiles table';
    END IF;
END $$;

-- Verify the column has been removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;