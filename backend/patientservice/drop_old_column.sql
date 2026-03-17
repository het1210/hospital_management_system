-- Drop the old appointment_date column
ALTER TABLE appointments DROP COLUMN IF EXISTS appointment_date;

-- Verify the table structure
DESCRIBE appointments;
