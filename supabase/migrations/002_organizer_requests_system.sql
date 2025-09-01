-- Migration: Organizer Request System
-- Description: Implements approval system for organizer role requests
-- Date: 2025-01-27

-- Create organizer requests table
CREATE TABLE IF NOT EXISTS organizer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name VARCHAR(255) NOT NULL,
  business_email VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  pokemon_league_url VARCHAR(500),
  experience_description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Only one active request per user
);

-- Add indexes for organizer requests
CREATE INDEX IF NOT EXISTS idx_organizer_requests_user ON organizer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_requests_status ON organizer_requests(status);
CREATE INDEX IF NOT EXISTS idx_organizer_requests_requested_at ON organizer_requests(requested_at);

-- Add trigger for updated_at
CREATE TRIGGER update_organizer_requests_updated_at 
    BEFORE UPDATE ON organizer_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on organizer requests
ALTER TABLE organizer_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizer requests
CREATE POLICY "Users can view their own requests" ON organizer_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" ON organizer_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending requests" ON organizer_requests
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        status = 'pending'
    );

-- Note: Admin policies will be added later when we create the admin system

-- Create function to automatically approve organizer role when request is approved
CREATE OR REPLACE FUNCTION handle_organizer_request_approval()
RETURNS TRIGGER AS $
BEGIN
    -- If request is approved, update user profile to organizer role
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE user_profiles 
        SET 
            user_role = 'organizer',
            organization_name = NEW.organization_name,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Set reviewed timestamp
        NEW.reviewed_at = NOW();
    END IF;
    
    -- If request is rejected or under review, ensure user remains as player
    IF NEW.status IN ('rejected', 'under_review') AND OLD.status != NEW.status THEN
        UPDATE user_profiles 
        SET 
            user_role = 'player',
            organization_name = NULL,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Set reviewed timestamp
        NEW.reviewed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$ language 'plpgsql';

-- Create trigger for organizer request approval
CREATE TRIGGER handle_organizer_approval_trigger
    BEFORE UPDATE ON organizer_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_organizer_request_approval();

-- Create function to check if user can create tournaments (must be approved organizer)
CREATE OR REPLACE FUNCTION user_can_create_tournaments(user_uuid UUID)
RETURNS BOOLEAN AS $
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = user_uuid 
        AND user_role = 'organizer'
        AND EXISTS (
            SELECT 1 FROM organizer_requests 
            WHERE user_id = user_uuid 
            AND status = 'approved'
        )
    );
END;
$ language 'plpgsql';

-- Update tournament creation policy to use the new function
DROP POLICY IF EXISTS "Organizers can create tournaments" ON tournaments;
CREATE POLICY "Approved organizers can create tournaments" ON tournaments
    FOR INSERT WITH CHECK (
        auth.uid() = organizer_id AND
        user_can_create_tournaments(auth.uid())
    );

-- Update tournament update policy
DROP POLICY IF EXISTS "Organizers can update their own tournaments" ON tournaments;
CREATE POLICY "Approved organizers can update their own tournaments" ON tournaments
    FOR UPDATE USING (
        auth.uid() = organizer_id AND
        user_can_create_tournaments(auth.uid())
    );

-- Update tournament delete policy
DROP POLICY IF EXISTS "Organizers can delete their own tournaments" ON tournaments;
CREATE POLICY "Approved organizers can delete their own tournaments" ON tournaments
    FOR DELETE USING (
        auth.uid() = organizer_id AND
        user_can_create_tournaments(auth.uid())
    );

-- Add comments for documentation
COMMENT ON TABLE organizer_requests IS 'Stores requests from users who want to become tournament organizers';
COMMENT ON COLUMN organizer_requests.status IS 'Request status: pending, approved, rejected, under_review';
COMMENT ON COLUMN organizer_requests.experience_description IS 'User description of their tournament organizing experience';
COMMENT ON COLUMN organizer_requests.admin_notes IS 'Internal notes from admin reviewing the request';

-- Create view for organizer request statistics (for future admin dashboard)
CREATE OR REPLACE VIEW organizer_request_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(reviewed_at, NOW()) - requested_at))/86400) as avg_review_days
FROM organizer_requests 
GROUP BY status;

COMMENT ON VIEW organizer_request_stats IS 'Statistics about organizer requests for admin dashboard';