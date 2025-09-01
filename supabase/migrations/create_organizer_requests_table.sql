-- Create organizer_requests table
CREATE TABLE IF NOT EXISTS organizer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    business_email TEXT,
    phone_number TEXT,
    address TEXT,
    pokemon_league_url TEXT,
    experience_description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    admin_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizer_requests_user_id ON organizer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_requests_status ON organizer_requests(status);
CREATE INDEX IF NOT EXISTS idx_organizer_requests_requested_at ON organizer_requests(requested_at);

-- Enable RLS (Row Level Security)
ALTER TABLE organizer_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own requests
CREATE POLICY "Users can view their own organizer requests" ON organizer_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can create organizer requests" ON organizer_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update their own pending requests" ON organizer_requests
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organizer_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizer_requests_updated_at
    BEFORE UPDATE ON organizer_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_organizer_requests_updated_at();