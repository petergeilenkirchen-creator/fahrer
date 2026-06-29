-- Add group_id column to rides table for grouping related rides
ALTER TABLE rides ADD COLUMN IF NOT EXISTS group_id UUID;

-- Create index for better query performance on grouped rides
CREATE INDEX IF NOT EXISTS idx_rides_group_id ON rides(group_id);
