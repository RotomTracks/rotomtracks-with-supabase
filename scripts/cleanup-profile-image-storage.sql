-- Script to clean up profile image storage bucket and policies
-- This removes all profile image related storage infrastructure

-- Remove storage policies for profile images
DO $$ 
BEGIN
    -- Drop profile image storage policies if they exist
    DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
    
    RAISE NOTICE 'Removed all profile image storage policies';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not have existed: %', SQLERRM;
END $$;

-- Remove the profile-images bucket if it exists
DO $$ 
BEGIN
    -- Delete the profile-images bucket
    DELETE FROM storage.buckets WHERE id = 'profile-images';
    RAISE NOTICE 'Removed profile-images bucket';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Profile-images bucket may not have existed: %', SQLERRM;
END $$;

-- Verify cleanup
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'profile-images';

-- This should return no rows if cleanup was successful