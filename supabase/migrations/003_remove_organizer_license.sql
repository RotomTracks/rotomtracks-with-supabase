-- Migration: Remove organizer license field
-- Description: Removes the organizer_license field as it's not needed
-- Date: 2025-01-27

-- Remove organizer_license from user_profiles table
ALTER TABLE user_profiles DROP COLUMN IF EXISTS organizer_license;

-- Remove organizer_license from organizer_requests table
ALTER TABLE organizer_requests DROP COLUMN IF EXISTS organizer_license;

-- Update comments to reflect the changes
COMMENT ON TABLE organizer_requests IS 'Stores requests from users who want to become tournament organizers for their leagues or stores';
COMMENT ON COLUMN organizer_requests.organization_name IS 'Name of the league or store where tournaments will be organized';