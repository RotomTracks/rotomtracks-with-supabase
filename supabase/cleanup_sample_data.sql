-- Cleanup script to remove all sample tournament data
-- Run this to clean the database of test/demo data

-- Delete sample tournament files
DELETE FROM tournament_files WHERE tournament_id IN (
  SELECT id FROM tournaments WHERE official_tournament_id IN (
    '25-02-000001', '25-02-000002', '25-03-000001', 
    '25-01-000003', '24-12-000015', '24-11-000020'
  )
);

-- Delete sample tournament matches
DELETE FROM tournament_matches WHERE tournament_id IN (
  SELECT id FROM tournaments WHERE official_tournament_id IN (
    '25-02-000001', '25-02-000002', '25-03-000001', 
    '25-01-000003', '24-12-000015', '24-11-000020'
  )
);

-- Delete sample tournament results
DELETE FROM tournament_results WHERE tournament_id IN (
  SELECT id FROM tournaments WHERE official_tournament_id IN (
    '25-02-000001', '25-02-000002', '25-03-000001', 
    '25-01-000003', '24-12-000015', '24-11-000020'
  )
);

-- Delete sample tournament participants
DELETE FROM tournament_participants WHERE tournament_id IN (
  SELECT id FROM tournaments WHERE official_tournament_id IN (
    '25-02-000001', '25-02-000002', '25-03-000001', 
    '25-01-000003', '24-12-000015', '24-11-000020'
  )
);

-- Delete sample tournaments
DELETE FROM tournaments WHERE official_tournament_id IN (
  '25-02-000001', '25-02-000002', '25-03-000001', 
  '25-01-000003', '24-12-000015', '24-11-000020'
);

-- Delete sample user profiles (optional - comment out if you want to keep some test users)
DELETE FROM user_profiles WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006'
);

-- Verify cleanup
SELECT 'Tournaments remaining:' as info, COUNT(*) as count FROM tournaments
UNION ALL
SELECT 'Tournament participants remaining:', COUNT(*) FROM tournament_participants
UNION ALL
SELECT 'Tournament results remaining:', COUNT(*) FROM tournament_results
UNION ALL
SELECT 'Tournament matches remaining:', COUNT(*) FROM tournament_matches
UNION ALL
SELECT 'Tournament files remaining:', COUNT(*) FROM tournament_files
UNION ALL
SELECT 'User profiles remaining:', COUNT(*) FROM user_profiles;