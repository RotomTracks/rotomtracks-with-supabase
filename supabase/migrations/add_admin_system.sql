-- Add ADMIN role to user_profiles table
-- First, drop the existing constraint if it exists
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_role_check;

-- Add the new constraint with ADMIN role
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_role_check 
CHECK (user_role IN ('player', 'organizer', 'admin'));

-- Add admin-specific fields to organizer_requests table
ALTER TABLE organizer_requests 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'under_review', 'notes_added', 'status_changed', 'request_viewed')),
  request_id UUID NOT NULL REFERENCES organizer_requests(id),
  organization_name TEXT NOT NULL,
  notes TEXT,
  previous_status TEXT,
  new_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_request_id ON admin_activity_log(request_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_organizer_requests_reviewed_by ON organizer_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_organizer_requests_reviewed_at ON organizer_requests(reviewed_at DESC);

-- Enable RLS on admin_activity_log table
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access to organizer_requests
-- Admin users can view all organizer requests
CREATE POLICY "Admins can view all organizer requests" ON organizer_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND user_role = 'admin'
    )
  );

-- Admin users can update organizer requests
CREATE POLICY "Admins can update organizer requests" ON organizer_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND user_role = 'admin'
    )
  );

-- RLS Policies for admin_activity_log
-- Admins can view admin activity log
CREATE POLICY "Admins can view admin activity log" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND user_role = 'admin'
    )
  );

-- Admins can insert admin activity log
CREATE POLICY "Admins can insert admin activity log" ON admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND user_role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE admin_activity_log IS 'Tracks all administrative actions performed on organizer requests for audit purposes';
COMMENT ON COLUMN admin_activity_log.action IS 'Type of action performed: approved, rejected, under_review, notes_added, status_changed, request_viewed';
COMMENT ON COLUMN admin_activity_log.admin_id IS 'ID of the admin user who performed the action';
COMMENT ON COLUMN admin_activity_log.request_id IS 'ID of the organizer request that was acted upon';
COMMENT ON COLUMN admin_activity_log.previous_status IS 'Previous status of the request before the action';
COMMENT ON COLUMN admin_activity_log.new_status IS 'New status of the request after the action';

COMMENT ON COLUMN organizer_requests.admin_notes IS 'Notes added by administrators during the review process';
COMMENT ON COLUMN organizer_requests.reviewed_by IS 'ID of the admin user who last reviewed this request';
COMMENT ON COLUMN organizer_requests.reviewed_at IS 'Timestamp when the request was last reviewed by an admin';