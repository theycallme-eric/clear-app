-- Add status enum type
CREATE TYPE section_status AS ENUM ('not_started', 'completed', 'skipped');

-- Add status column with default
ALTER TABLE workout_sections 
ADD COLUMN status section_status DEFAULT 'not_started';

-- Update existing completed sections (if completed_at is set)
UPDATE workout_sections 
SET status = 'completed' 
WHERE completed_at IS NOT NULL;
