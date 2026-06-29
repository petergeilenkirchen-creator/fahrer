-- Clear all existing pickup times
-- This sets all pickup_time values to NULL so they can be filled manually

UPDATE rides
SET pickup_time = NULL
WHERE pickup_time IS NOT NULL;
