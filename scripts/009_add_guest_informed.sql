-- Add guest_informed field to track if guest has been notified
ALTER TABLE rides ADD COLUMN IF NOT EXISTS guest_informed BOOLEAN DEFAULT FALSE;
