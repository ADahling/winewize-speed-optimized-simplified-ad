
-- First, let's identify and remove duplicate wine entries
-- Keep the most recent entry for each wine name per restaurant
WITH ranked_wines AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY restaurant_id, LOWER(TRIM(name)) 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM restaurant_wines
  WHERE is_active = true
),
duplicates_to_remove AS (
  SELECT id 
  FROM ranked_wines 
  WHERE rn > 1
)
UPDATE restaurant_wines 
SET is_active = false, updated_at = now()
WHERE id IN (SELECT id FROM duplicates_to_remove);

-- Add a unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_wines_unique_name 
ON restaurant_wines (restaurant_id, LOWER(TRIM(name))) 
WHERE is_active = true;
