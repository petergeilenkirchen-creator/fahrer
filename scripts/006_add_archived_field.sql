-- Add archived field to rides table
ALTER TABLE rides ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_rides_archived ON rides(archived);
