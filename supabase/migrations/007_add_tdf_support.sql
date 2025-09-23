-- Add TDF support
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS tdf_metadata JSONB,
ADD COLUMN IF NOT EXISTS original_tdf_file_path VARCHAR(500);

-- TDF fields for participants
ALTER TABLE tournament_participants 
ADD COLUMN IF NOT EXISTS player_birthdate DATE,
ADD COLUMN IF NOT EXISTS tdf_userid VARCHAR(20),
ADD COLUMN IF NOT EXISTS registration_source VARCHAR(20) DEFAULT 'web';

-- TDF user ID index
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tdf_userid 
ON tournament_participants(tdf_userid) 
WHERE tdf_userid IS NOT NULL;

-- TDF metadata index
CREATE INDEX IF NOT EXISTS idx_tournaments_tdf_metadata 
ON tournaments USING GIN (tdf_metadata) 
WHERE tdf_metadata IS NOT NULL;

-- Create storage bucket for tournament files if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tournament-files',
  'tournament-files',
  false,
  10485760, -- 10MB
  ARRAY['application/xml', 'text/xml', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for tournament files bucket
CREATE POLICY IF NOT EXISTS "Organizers can upload tournament files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tournament-files' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND user_role = 'organizer'
  )
);

CREATE POLICY IF NOT EXISTS "Organizers can view their tournament files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'tournament-files' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN user_profiles up ON t.organizer_id = up.id
    WHERE up.id = auth.uid() 
    AND up.user_role = 'organizer'
    AND storage.objects.name LIKE t.official_tournament_id || '%'
  )
);

CREATE POLICY IF NOT EXISTS "Organizers can update their tournament files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'tournament-files' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN user_profiles up ON t.organizer_id = up.id
    WHERE up.id = auth.uid() 
    AND up.user_role = 'organizer'
    AND storage.objects.name LIKE t.official_tournament_id || '%'
  )
);

CREATE POLICY IF NOT EXISTS "Organizers can delete their tournament files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tournament-files' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN user_profiles up ON t.organizer_id = up.id
    WHERE up.id = auth.uid() 
    AND up.user_role = 'organizer'
    AND storage.objects.name LIKE t.official_tournament_id || '%'
  )
);

-- Add comment to document the TDF metadata structure
COMMENT ON COLUMN tournaments.tdf_metadata IS 'JSON metadata from original TDF file including: original_filename, file_path, gametype, mode, roundtime, finalsroundtime, organizer, version, uploaded_at';

COMMENT ON COLUMN tournament_participants.tdf_userid IS 'Original user ID from TDF file for players imported from TDF';

COMMENT ON COLUMN tournament_participants.registration_source IS 'Source of registration: web, tdf, manual, etc.';