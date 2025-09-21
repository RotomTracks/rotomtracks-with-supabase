-- Migration: Add search performance indexes
-- Created: 2024-12-21
-- Purpose: Optimize tournament search queries

-- Full-text search index for tournament names and locations
CREATE INDEX IF NOT EXISTS idx_tournaments_search_text 
ON tournaments USING gin(to_tsvector('english', 
  COALESCE(name, '') || ' ' || 
  COALESCE(city, '') || ' ' || 
  COALESCE(country, '') || ' ' ||
  COALESCE(official_tournament_id, '')
));

-- Composite index for status and date filtering (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_tournaments_status_date 
ON tournaments(status, start_date) 
WHERE status IN ('upcoming', 'ongoing');

-- Index for tournament type and location filtering
CREATE INDEX IF NOT EXISTS idx_tournaments_type_location 
ON tournaments(tournament_type, city, country);

-- Index for registration availability queries
CREATE INDEX IF NOT EXISTS idx_tournaments_registration 
ON tournaments(registration_open, status, start_date) 
WHERE registration_open = true AND status IN ('upcoming', 'ongoing');

-- Index for tournaments with available spots
CREATE INDEX IF NOT EXISTS idx_tournaments_availability 
ON tournaments(max_players, current_players, status) 
WHERE max_players IS NOT NULL AND status IN ('upcoming', 'ongoing');

-- Index for organizer-specific queries
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer 
ON tournaments(organizer_id, status, start_date);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_tournaments_date_range 
ON tournaments(start_date, end_date, status);

-- Add search vector column for better full-text search performance
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_tournament_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' || 
    COALESCE(NEW.city, '') || ' ' || 
    COALESCE(NEW.country, '') || ' ' ||
    COALESCE(NEW.official_tournament_id, '') || ' ' ||
    COALESCE(NEW.tournament_type, '') || ' ' ||
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS tournament_search_vector_update ON tournaments;
CREATE TRIGGER tournament_search_vector_update
  BEFORE INSERT OR UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_tournament_search_vector();

-- Update existing records
UPDATE tournaments SET search_vector = to_tsvector('english', 
  COALESCE(name, '') || ' ' || 
  COALESCE(city, '') || ' ' || 
  COALESCE(country, '') || ' ' ||
  COALESCE(official_tournament_id, '') || ' ' ||
  COALESCE(tournament_type, '') || ' ' ||
  COALESCE(description, '')
);

-- Index for the search vector
CREATE INDEX IF NOT EXISTS idx_tournaments_search_vector 
ON tournaments USING gin(search_vector);

-- Add comments for documentation
COMMENT ON INDEX idx_tournaments_search_text IS 'Full-text search index for tournament names and locations';
COMMENT ON INDEX idx_tournaments_status_date IS 'Composite index for status and date filtering';
COMMENT ON INDEX idx_tournaments_type_location IS 'Index for tournament type and location filtering';
COMMENT ON INDEX idx_tournaments_registration IS 'Index for registration availability queries';
COMMENT ON INDEX idx_tournaments_availability IS 'Index for tournaments with available spots';
COMMENT ON INDEX idx_tournaments_organizer IS 'Index for organizer-specific queries';
COMMENT ON INDEX idx_tournaments_date_range IS 'Index for date range queries';
COMMENT ON INDEX idx_tournaments_search_vector IS 'GIN index for full-text search vector';