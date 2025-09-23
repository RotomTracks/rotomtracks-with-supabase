-- Migration: Ensure 'admin' value exists on user_role enum (or adjust check constraint)
-- IMPORTANT: This file must run BEFORE any migration/policy that references 'admin'
-- Date: 2024-12-23

DO $$
DECLARE
  enum_type_name text;
  is_enum boolean := false;
BEGIN
  -- Detect the underlying type of user_profiles.user_role
  SELECT t.typname, (t.typtype = 'e') AS is_enum_type
  INTO enum_type_name, is_enum
  FROM pg_type t
  JOIN pg_attribute a ON a.atttypid = t.oid
  WHERE a.attrelid = 'public.user_profiles'::regclass AND a.attname = 'user_role'
  LIMIT 1;

  IF is_enum THEN
    -- If it's an ENUM, add value 'admin' if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type tt ON e.enumtypid = tt.oid
      WHERE tt.typname = enum_type_name AND e.enumlabel = 'admin'
    ) THEN
      EXECUTE 'ALTER TYPE ' || quote_ident(enum_type_name) || ' ADD VALUE ''admin''';
    END IF;
  ELSE
    -- If it's not an ENUM, ensure the CHECK constraint includes 'admin'
    BEGIN
      EXECUTE 'ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_role_check';
      EXECUTE 'ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_role_check CHECK (user_role IN (''player'',''organizer'',''admin''))';
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;


