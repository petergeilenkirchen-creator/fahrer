-- Add guest column to rides table
ALTER TABLE rides ADD COLUMN IF NOT EXISTS guest TEXT;
