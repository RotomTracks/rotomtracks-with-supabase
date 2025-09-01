# Database Setup Guide

This guide explains how to set up the database schema for the Tournament Management System.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with the following environment variables in your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Node.js Dependencies**: Make sure you have installed all dependencies:
   ```bash
   npm install
   ```

## Database Schema Overview

The tournament management system creates the following tables:

### Core Tables
- **tournaments**: Stores tournament information (name, type, location, dates)
- **tournament_participants**: Links users to tournaments they're participating in
- **tournament_results**: Stores final results and standings for each participant
- **tournament_matches**: Stores individual match data (rounds, outcomes)
- **tournament_files**: Stores uploaded tournament files (TDF, HTML reports)

### Extended Tables
- **user_profiles**: Extended with role management (player/organizer)

## Setup Methods

### Method 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
node scripts/setup-database.js
```

This script will:
1. Run all database migrations
2. Create all necessary tables and indexes
3. Set up Row Level Security (RLS) policies
4. Insert sample data for testing

### Method 2: Manual Setup

If you prefer to set up manually or need to run individual migrations:

1. **Run the main migration**:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_tournament_schema.sql
   -- into your Supabase SQL editor
   ```

2. **Add sample data** (optional):
   ```sql
   -- Copy and paste the contents of supabase/seed.sql
   -- into your Supabase SQL editor
   ```

### Method 3: Supabase CLI (Advanced)

If you're using the Supabase CLI:

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Reset database with seed data
supabase db reset
```

## Database Features

### Row Level Security (RLS)
All tables have RLS enabled with the following policies:

- **Tournaments**: Public read, organizers can create/update their own
- **Participants**: Public read, users can register themselves, organizers can manage
- **Results**: Public read, only organizers can update
- **Matches**: Public read, only organizers can manage
- **Files**: Restricted read/write based on tournament participation

### Automatic Features
- **Player Count Updates**: Automatically updates `current_players` when participants are added/removed
- **Updated At Timestamps**: Automatically updates `updated_at` fields
- **Full-Text Search**: Search index on tournament names and locations

### Data Validation
- **Tournament Types**: Enforced enum values for tournament types
- **User Roles**: Enforced enum values for user roles (player/organizer)
- **Match Outcomes**: Enforced enum values matching Python logic (1,2,3,4,5)
- **Player ID Format**: 1-7 digits, range 1-9999999 (e.g., 1234567)
- **Tournament ID Format**: YY-MM-XXXXXX (e.g., 25-02-000001)

## Sample Data

The seed data includes:

### Clean Database
- No sample data is included by default
- Database is ready for production use
- Use the cleanup script if you need to remove any test data

## Verification

After setup, verify the installation:

1. **Check Tables**: Ensure all tables are created in your Supabase dashboard
2. **Check Policies**: Try querying data with different user roles
3. **Check Indexes**: Verify indexes are created for performance
4. **Clean Data**: Run cleanup script if needed to remove any test data

## Troubleshooting

### Common Issues

1. **Permission Errors**: Make sure you're using the service role key for setup
2. **Migration Failures**: Check for existing tables that might conflict
3. **RLS Issues**: Ensure your user has proper authentication

### Reset Database

If you need to start over:

```sql
-- Drop all tournament tables (be careful!)
DROP TABLE IF EXISTS tournament_files CASCADE;
DROP TABLE IF EXISTS tournament_matches CASCADE;
DROP TABLE IF EXISTS tournament_results CASCADE;
DROP TABLE IF EXISTS tournament_participants CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- Remove added columns from user_profiles
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS user_role,
DROP COLUMN IF EXISTS organization_name,
DROP COLUMN IF EXISTS organizer_license;
```

Then run the setup script again.

## Next Steps

After database setup:

1. **Start Development Server**: `npm run dev`
2. **Test Authentication**: Create a user account
3. **Test Tournament Features**: Create tournaments, register participants
4. **Upload Tournament Files**: Test the file processing system

## Support

If you encounter issues:

1. Check the Supabase dashboard for error logs
2. Verify your environment variables
3. Check the browser console for client-side errors
4. Review the database logs in Supabase