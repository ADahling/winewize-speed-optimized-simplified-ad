
-- Create wine style definitions table with proper Wine Wize categories
CREATE TABLE public.ww_wine_style_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_name TEXT NOT NULL UNIQUE,
  wine_color TEXT NOT NULL CHECK (wine_color IN ('Red', 'White', 'Rosé', 'Sparkling')),
  description TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 6 Wine Wize style definitions
INSERT INTO public.ww_wine_style_definitions (style_name, wine_color, description, keywords) VALUES
('Fresh & Crisp', 'White', 'Light, acidic white wines with bright, clean flavors', ARRAY['sauvignon blanc', 'pinot grigio', 'albariño', 'crisp', 'fresh', 'light', 'acidic', 'clean', 'bright']),
('Funky & Floral', 'White', 'Aromatic, unique white wines with floral and funky characteristics', ARRAY['gewürztraminer', 'orange wines', 'natural wines', 'floral', 'aromatic', 'funky', 'unique', 'petrichor']),
('Rich & Creamy', 'White', 'Full-bodied, oak-aged white wines with rich, creamy textures', ARRAY['chardonnay', 'white rioja', 'viognier', 'rich', 'creamy', 'oak', 'full-bodied', 'buttery']),
('Fresh & Fruity', 'Red', 'Light, fruit-forward red wines with bright fruit flavors', ARRAY['pinot noir', 'beaujolais', 'light sangiovese', 'fresh', 'fruity', 'light', 'bright', 'cherry', 'raspberry']),
('Dry & Dirty', 'Red', 'Medium-bodied, earthy red wines with mineral and earthy notes', ARRAY['malbec', 'tempranillo', 'chianti', 'dry', 'dirty', 'earthy', 'mineral', 'medium-bodied', 'rustic']),
('Packed with a Punch', 'Red', 'Full-bodied, intense red wines with bold flavors and tannins', ARRAY['cabernet sauvignon', 'syrah', 'barolo', 'full-bodied', 'intense', 'bold', 'punch', 'tannins', 'powerful']);

-- Create wine varietal definitions for better type detection
CREATE TABLE public.wine_varietal_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  varietal_name TEXT NOT NULL UNIQUE,
  wine_color TEXT NOT NULL CHECK (wine_color IN ('Red', 'White', 'Rosé', 'Sparkling')),
  common_names TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert common wine varietals for type detection
INSERT INTO public.wine_varietal_definitions (varietal_name, wine_color, common_names) VALUES
-- Red wines
('Cabernet Sauvignon', 'Red', ARRAY['cabernet sauvignon', 'cab sauv', 'cabernet']),
('Pinot Noir', 'Red', ARRAY['pinot noir', 'pinot nero', 'spätburgunder']),
('Merlot', 'Red', ARRAY['merlot']),
('Syrah', 'Red', ARRAY['syrah', 'shiraz']),
('Malbec', 'Red', ARRAY['malbec']),
('Tempranillo', 'Red', ARRAY['tempranillo', 'tinta del país', 'cencibel']),
('Sangiovese', 'Red', ARRAY['sangiovese', 'brunello', 'chianti']),
('Grenache', 'Red', ARRAY['grenache', 'garnacha', 'cannonau']),
('Zinfandel', 'Red', ARRAY['zinfandel', 'primitivo']),
('Nebbiolo', 'Red', ARRAY['nebbiolo', 'barolo', 'barbaresco']),

-- White wines
('Chardonnay', 'White', ARRAY['chardonnay']),
('Sauvignon Blanc', 'White', ARRAY['sauvignon blanc', 'sauv blanc']),
('Pinot Grigio', 'White', ARRAY['pinot grigio', 'pinot gris']),
('Riesling', 'White', ARRAY['riesling']),
('Gewürztraminer', 'White', ARRAY['gewürztraminer', 'gewurztraminer']),
('Viognier', 'White', ARRAY['viognier']),
('Albariño', 'White', ARRAY['albariño', 'albarino']),
('Chenin Blanc', 'White', ARRAY['chenin blanc']),
('Vermentino', 'White', ARRAY['vermentino']),
('Grüner Veltliner', 'White', ARRAY['grüner veltliner', 'gruner veltliner']);

-- Fix existing misclassified wines in user_wine_library
-- First, let's identify and fix red wines incorrectly marked as white wine styles
UPDATE user_wine_library 
SET wine_style = CASE 
  -- Pinot Noir should be Fresh & Fruity (Red)
  WHEN LOWER(wine_name) LIKE '%pinot noir%' THEN 'Fresh & Fruity'
  -- Other light reds
  WHEN LOWER(wine_name) LIKE '%beaujolais%' OR LOWER(wine_name) LIKE '%gamay%' THEN 'Fresh & Fruity'
  -- Medium-bodied reds
  WHEN LOWER(wine_name) LIKE '%malbec%' OR LOWER(wine_name) LIKE '%tempranillo%' OR LOWER(wine_name) LIKE '%chianti%' THEN 'Dry & Dirty'
  -- Full-bodied reds
  WHEN LOWER(wine_name) LIKE '%cabernet%' OR LOWER(wine_name) LIKE '%syrah%' OR LOWER(wine_name) LIKE '%shiraz%' OR LOWER(wine_name) LIKE '%barolo%' THEN 'Packed with a Punch'
  -- Keep existing style if it's already correct
  ELSE wine_style
END
WHERE (
  -- Target wines that are likely red but have white wine styles
  (LOWER(wine_name) LIKE '%pinot noir%' OR 
   LOWER(wine_name) LIKE '%cabernet%' OR 
   LOWER(wine_name) LIKE '%merlot%' OR 
   LOWER(wine_name) LIKE '%syrah%' OR 
   LOWER(wine_name) LIKE '%malbec%' OR 
   LOWER(wine_name) LIKE '%tempranillo%' OR 
   LOWER(wine_name) LIKE '%sangiovese%' OR 
   LOWER(wine_name) LIKE '%chianti%' OR 
   LOWER(wine_name) LIKE '%barolo%' OR 
   LOWER(wine_name) LIKE '%beaujolais%' OR 
   LOWER(wine_name) LIKE '%gamay%' OR 
   LOWER(wine_name) LIKE '%shiraz%')
  AND wine_style IN ('Fresh & Crisp', 'Funky & Floral', 'Rich & Creamy')
);

-- Similarly, fix white wines that might be incorrectly categorized as red styles
UPDATE user_wine_library 
SET wine_style = CASE 
  -- Light, crisp whites
  WHEN LOWER(wine_name) LIKE '%sauvignon blanc%' OR LOWER(wine_name) LIKE '%pinot grigio%' OR LOWER(wine_name) LIKE '%albariño%' THEN 'Fresh & Crisp'
  -- Aromatic whites
  WHEN LOWER(wine_name) LIKE '%gewürztraminer%' OR LOWER(wine_name) LIKE '%riesling%' THEN 'Funky & Floral'
  -- Rich whites
  WHEN LOWER(wine_name) LIKE '%chardonnay%' OR LOWER(wine_name) LIKE '%viognier%' THEN 'Rich & Creamy'
  -- Keep existing style if it's already correct
  ELSE wine_style
END
WHERE (
  -- Target wines that are likely white but have red wine styles
  (LOWER(wine_name) LIKE '%chardonnay%' OR 
   LOWER(wine_name) LIKE '%sauvignon blanc%' OR 
   LOWER(wine_name) LIKE '%pinot grigio%' OR 
   LOWER(wine_name) LIKE '%riesling%' OR 
   LOWER(wine_name) LIKE '%gewürztraminer%' OR 
   LOWER(wine_name) LIKE '%viognier%' OR 
   LOWER(wine_name) LIKE '%albariño%')
  AND wine_style IN ('Fresh & Fruity', 'Dry & Dirty', 'Packed with a Punch')
);

-- Create indexes for better performance (only new ones)
CREATE INDEX idx_ww_wine_style_definitions_style_name ON public.ww_wine_style_definitions(style_name);
CREATE INDEX idx_wine_varietal_definitions_varietal_name ON public.wine_varietal_definitions(varietal_name);
