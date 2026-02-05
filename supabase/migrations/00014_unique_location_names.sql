-- Migration: Enforce unique location names per user
-- This prevents duplicate locations (like two "Building Gym" entries)

-- Step 1: Clean up existing duplicates
-- For each user, keep only the oldest location with each name
-- Delete newer duplicates
DELETE FROM public.locations
WHERE id IN (
    SELECT id FROM (
        SELECT
            id,
            ROW_NUMBER() OVER (
                PARTITION BY user_id, name
                ORDER BY created_at ASC
            ) as row_num
        FROM public.locations
    ) ranked
    WHERE row_num > 1
);

-- Step 2: Update default_location_id references that might point to deleted locations
-- Set to the remaining location with the same name for that user
UPDATE public.profiles p
SET default_location_id = (
    SELECT l.id
    FROM public.locations l
    WHERE l.user_id = p.id
    ORDER BY l.created_at ASC
    LIMIT 1
)
WHERE p.default_location_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.locations l WHERE l.id = p.default_location_id
);

-- Step 3: Add unique constraint to prevent future duplicates
ALTER TABLE public.locations
ADD CONSTRAINT locations_user_id_name_unique UNIQUE (user_id, name);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT locations_user_id_name_unique ON public.locations IS
    'Each user can only have one location with a given name. This prevents duplicate entries from bugs like navigation loops during onboarding.';
