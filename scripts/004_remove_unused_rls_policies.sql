-- Remove unused RLS policies that were automatically created
-- Since we're using simple password protection without Supabase auth,
-- we don't need RLS policies. This resolves the security warning.

-- Drop all RLS policies on drivers table
DROP POLICY IF EXISTS "Allow authenticated users to view drivers" ON drivers;
DROP POLICY IF EXISTS "Allow authenticated users to insert drivers" ON drivers;
DROP POLICY IF EXISTS "Allow authenticated users to update drivers" ON drivers;
DROP POLICY IF EXISTS "Allow authenticated users to delete drivers" ON drivers;

-- Drop all RLS policies on rides table (if any exist)
DROP POLICY IF EXISTS "Allow authenticated users to view rides" ON rides;
DROP POLICY IF EXISTS "Allow authenticated users to insert rides" ON rides;
DROP POLICY IF EXISTS "Allow authenticated users to update rides" ON rides;
DROP POLICY IF EXISTS "Allow authenticated users to delete rides" ON rides;

-- Confirm RLS is disabled (should already be disabled from script 002)
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE rides DISABLE ROW LEVEL SECURITY;

-- Ensure grants are still in place
GRANT ALL ON drivers TO anon;
GRANT ALL ON rides TO anon;
GRANT ALL ON drivers TO authenticated;
GRANT ALL ON rides TO authenticated;
