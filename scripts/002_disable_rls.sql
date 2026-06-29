-- Disable Row Level Security for drivers and rides tables
-- Since we're using simple password protection without user authentication,
-- we need to allow all operations on these tables

ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE rides DISABLE ROW LEVEL SECURITY;

-- Grant full access to the anon role (used by the Supabase client)
GRANT ALL ON drivers TO anon;
GRANT ALL ON rides TO anon;
GRANT ALL ON drivers TO authenticated;
GRANT ALL ON rides TO authenticated;
