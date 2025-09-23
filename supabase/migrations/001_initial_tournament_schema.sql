-- Initial Tournament Management System Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add role management to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_role VARCHAR(20) DEFAULT 'player' CHECK (user_role IN ('player', 'organizer')),
ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS organizer_license VARCHAR(100);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  official_tournament_id VARCHAR(11) UNIQUE NOT NULL CHECK (official_tournament_id ~ '^[0-9]{2}-[0-9]{2}-[0-9]{6}$'),
  name VARCHAR(255) NOT NULL,
  tournament_type VARCHAR(50) NOT NULL CHECK (tournament_type IN (
    'TCG Prerelease',
    'TCG League Challenge', 
    'TCG League Cup',
    'VGC Premier Event',
    'GO Premier Event'
  )),
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100), -- For US, Mexico, Canada
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_players INTEGER,
  current_players INTEGER DEFAULT 0,
  registration_open BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name VARCHAR(255) NOT NULL,
  player_id VARCHAR(7) NOT NULL CHECK (player_id ~ '^[1-9][0-9]{0,6}$'),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'dropped')),
  UNIQUE(tournament_id, user_id)
);

-- Create tournament results table
CREATE TABLE IF NOT EXISTS tournament_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES tournament_participants(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  byes INTEGER DEFAULT 0,
  final_standing INTEGER,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, participant_id)
);

-- Create tournament matches table
CREATE TABLE IF NOT EXISTS tournament_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  table_number INTEGER,
  player1_id UUID REFERENCES tournament_participants(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES tournament_participants(id) ON DELETE CASCADE,
  outcome VARCHAR(20) CHECK (outcome IN ('1', '2', '3', '4', '5')), -- Same as Python logic
  match_status VARCHAR(20) DEFAULT 'pending' CHECK (match_status IN ('pending', 'ongoing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament files table
CREATE TABLE IF NOT EXISTS tournament_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('tdf', 'html', 'xml')),
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON tournaments(tournament_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_city ON tournaments(city);
CREATE INDEX IF NOT EXISTS idx_tournaments_country ON tournaments(country);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_search ON tournaments USING gin(to_tsvector('english', name || ' ' || city || ' ' || country));

CREATE INDEX IF NOT EXISTS idx_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON tournament_participants(status);

CREATE INDEX IF NOT EXISTS idx_results_tournament ON tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_results_participant ON tournament_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_results_standing ON tournament_results(final_standing);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_round ON tournament_matches(round_number);
CREATE INDEX IF NOT EXISTS idx_matches_status ON tournament_matches(match_status);

CREATE INDEX IF NOT EXISTS idx_files_tournament ON tournament_files(tournament_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON tournament_files(file_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tournaments table
CREATE TRIGGER update_tournaments_updated_at 
    BEFORE UPDATE ON tournaments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update current_players count
CREATE OR REPLACE FUNCTION update_tournament_player_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tournaments 
        SET current_players = (
            SELECT COUNT(*) 
            FROM tournament_participants 
            WHERE tournament_id = NEW.tournament_id 
            AND status = 'registered'
        )
        WHERE id = NEW.tournament_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE tournaments 
        SET current_players = (
            SELECT COUNT(*) 
            FROM tournament_participants 
            WHERE tournament_id = NEW.tournament_id 
            AND status = 'registered'
        )
        WHERE id = NEW.tournament_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tournaments 
        SET current_players = (
            SELECT COUNT(*) 
            FROM tournament_participants 
            WHERE tournament_id = OLD.tournament_id 
            AND status = 'registered'
        )
        WHERE id = OLD.tournament_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for participant count updates
CREATE TRIGGER update_participant_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tournament_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_tournament_player_count();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tournaments
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments
    FOR SELECT USING (true);

CREATE POLICY "Organizers can create tournaments" ON tournaments
    FOR INSERT WITH CHECK (
        auth.uid() = organizer_id AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND user_role = 'organizer'
        )
    );

CREATE POLICY "Organizers can update their own tournaments" ON tournaments
    FOR UPDATE USING (
        auth.uid() = organizer_id AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND user_role = 'organizer'
        )
    );

CREATE POLICY "Organizers can delete their own tournaments" ON tournaments
    FOR DELETE USING (
        auth.uid() = organizer_id AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND user_role = 'organizer'
        )
    );

-- Create RLS policies for tournament participants
CREATE POLICY "Participants are viewable by everyone" ON tournament_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can register themselves for tournaments" ON tournament_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON tournament_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Organizers can manage participants in their tournaments" ON tournament_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE id = tournament_id 
            AND organizer_id = auth.uid()
        )
    );

-- Create RLS policies for tournament results
CREATE POLICY "Results are viewable by everyone" ON tournament_results
    FOR SELECT USING (true);

CREATE POLICY "Only organizers can manage results" ON tournament_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE id = tournament_id 
            AND organizer_id = auth.uid()
        )
    );

-- Create RLS policies for tournament matches
CREATE POLICY "Matches are viewable by everyone" ON tournament_matches
    FOR SELECT USING (true);

CREATE POLICY "Only organizers can manage matches" ON tournament_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE id = tournament_id 
            AND organizer_id = auth.uid()
        )
    );

-- Create RLS policies for tournament files
CREATE POLICY "Files are viewable by tournament participants and organizers" ON tournament_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE id = tournament_id 
            AND (organizer_id = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM tournament_participants 
                     WHERE tournament_id = tournaments.id 
                     AND user_id = auth.uid()
                 ))
        )
    );

CREATE POLICY "Only organizers can upload files" ON tournament_files
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by AND
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE id = tournament_id 
            AND organizer_id = auth.uid()
        )
    );

-- Insert some sample tournament types for reference
COMMENT ON TABLE tournaments IS 'Stores tournament information with support for TCG, VGC, and GO tournament types';
COMMENT ON COLUMN tournaments.tournament_type IS 'Supported types: TCG Prerelease, TCG League Challenge, TCG League Cup, VGC Premier Event, GO Premier Event';
COMMENT ON COLUMN tournaments.official_tournament_id IS 'Format: YY-MM-XXXXXX where YY=year, MM=month, XXXXXX=sequence (e.g., 25-02-000001)';
COMMENT ON COLUMN tournament_participants.player_id IS 'Player ID: 1-7 digits, range 1-9999999 (e.g., 1234567)';
COMMENT ON COLUMN tournament_matches.outcome IS 'Match outcomes: 1=Player1 wins, 2=Player2 wins, 3=Draw, 4=Double loss, 5=Bye';