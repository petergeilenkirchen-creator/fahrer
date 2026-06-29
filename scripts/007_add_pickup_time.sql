-- Add pickup_time column to rides table
ALTER TABLE rides ADD COLUMN IF NOT EXISTS pickup_time TEXT;

-- Update existing rides to use their current time as pickup_time
UPDATE rides SET pickup_time = time WHERE pickup_time IS NULL;
