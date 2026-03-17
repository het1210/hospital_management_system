-- Migration script to update appointments table schema
-- Run this script on your database to update the appointments table

-- Step 1: Check if old column exists and add new columns
DO $$ 
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='appointments' AND column_name='appointment_start') THEN
        ALTER TABLE appointments ADD COLUMN appointment_start TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='appointments' AND column_name='appointment_end') THEN
        ALTER TABLE appointments ADD COLUMN appointment_end TIMESTAMP;
    END IF;
END $$;

-- Step 2: Migrate existing data if appointment_date column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='appointments' AND column_name='appointment_date') THEN
        -- Copy data from old column to new columns (assuming 30-minute appointments)
        UPDATE appointments 
        SET appointment_start = appointment_date,
            appointment_end = appointment_date + INTERVAL '30 minutes'
        WHERE appointment_date IS NOT NULL 
          AND appointment_start IS NULL;
        
        -- Drop old column
        ALTER TABLE appointments DROP COLUMN appointment_date;
    END IF;
END $$;

-- Step 3: Make new columns NOT NULL
ALTER TABLE appointments 
ALTER COLUMN appointment_start SET NOT NULL,
ALTER COLUMN appointment_end SET NOT NULL;

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_time 
ON appointments(doctor_id, appointment_start, appointment_end);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_time 
ON appointments(patient_id, appointment_start, appointment_end);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;
