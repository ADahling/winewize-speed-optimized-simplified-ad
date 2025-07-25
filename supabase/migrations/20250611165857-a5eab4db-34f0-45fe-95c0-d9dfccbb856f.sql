
-- Clean up existing wine_style data in user_wine_library table
-- Map inconsistent wine styles to proper Wine Wize categories
UPDATE user_wine_library 
SET wine_style = CASE 
  WHEN LOWER(wine_style) LIKE '%crisp%' OR LOWER(wine_style) LIKE '%fresh%' AND LOWER(wine_style) LIKE '%white%' THEN 'Fresh & Crisp'
  WHEN LOWER(wine_style) LIKE '%floral%' OR LOWER(wine_style) LIKE '%funky%' THEN 'Funky & Floral'
  WHEN LOWER(wine_style) LIKE '%creamy%' OR LOWER(wine_style) LIKE '%rich%' AND LOWER(wine_style) LIKE '%white%' THEN 'Rich & Creamy'
  WHEN LOWER(wine_style) LIKE '%fruity%' OR LOWER(wine_style) LIKE '%fresh%' AND LOWER(wine_style) LIKE '%red%' THEN 'Fresh & Fruity'
  WHEN LOWER(wine_style) LIKE '%dirty%' OR LOWER(wine_style) LIKE '%dry%' AND LOWER(wine_style) LIKE '%red%' THEN 'Dry & Dirty'
  WHEN LOWER(wine_style) LIKE '%punch%' OR LOWER(wine_style) LIKE '%packed%' THEN 'Packed with a Punch'
  -- Default fallback based on wine type if no clear mapping
  WHEN wine_style LIKE '%red%' OR wine_style LIKE '%Red%' THEN 'Fresh & Fruity'
  WHEN wine_style LIKE '%white%' OR wine_style LIKE '%White%' THEN 'Fresh & Crisp'
  WHEN wine_style LIKE '%rosé%' OR wine_style LIKE '%rose%' THEN 'Fresh & Crisp'
  WHEN wine_style LIKE '%sparkling%' OR wine_style LIKE '%champagne%' THEN 'Fresh & Crisp'
  -- If it's a long description, try to categorize based on common keywords
  WHEN LENGTH(wine_style) > 20 THEN 'Fresh & Crisp'
  ELSE wine_style
END
WHERE wine_style IS NOT NULL;

-- Update any remaining non-standard entries to default values
UPDATE user_wine_library 
SET wine_style = 'Fresh & Crisp'
WHERE wine_style NOT IN ('Fresh & Crisp', 'Funky & Floral', 'Rich & Creamy', 'Fresh & Fruity', 'Dry & Dirty', 'Packed with a Punch')
  AND wine_style IS NOT NULL;
