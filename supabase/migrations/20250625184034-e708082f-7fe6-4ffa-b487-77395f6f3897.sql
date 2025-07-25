
-- Create missing tables that the application expects

-- Create quick_vino_tips table (renamed from wine_tips for consistency with code)
CREATE TABLE public.quick_vino_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_text TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wine_preferences table (separate from user_preferences)
CREATE TABLE public.wine_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  wine_style TEXT,
  budget INTEGER DEFAULT 50,
  flavor_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'trial',
  subscription_tier TEXT DEFAULT 'trial',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wine_interactions table for user wine interactions
CREATE TABLE public.wine_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  wine_name TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  rating INTEGER,
  notes TEXT,
  restaurant_id UUID REFERENCES public.restaurants,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_wine_library table for saved wines
CREATE TABLE public.user_wine_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  wine_name TEXT NOT NULL,
  wine_type TEXT,
  price TEXT,
  rating INTEGER,
  notes TEXT,
  restaurant_name TEXT,
  dish_paired_with TEXT,
  date_tried TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create favorite_wines table
CREATE TABLE public.favorite_wines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  wine_name TEXT NOT NULL,
  wine_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create restaurant_menus table for stored menu data
CREATE TABLE public.restaurant_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  category TEXT,
  ingredients TEXT[],
  dish_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create restaurant_wines table for stored wine data
CREATE TABLE public.restaurant_wines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants ON DELETE CASCADE,
  wine_name TEXT NOT NULL,
  wine_type TEXT,
  price TEXT,
  description TEXT,
  vintage TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create master_wine_library table for comprehensive wine database
CREATE TABLE public.master_wine_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wine_name TEXT NOT NULL,
  wine_type TEXT,
  region TEXT,
  vintage TEXT,
  producer TEXT,
  description TEXT,
  price_range TEXT,
  flavor_profile JSONB,
  food_pairings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wine_rating_reminders table
CREATE TABLE public.wine_rating_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  wine_name TEXT NOT NULL,
  restaurant_name TEXT,
  dish_name TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.quick_vino_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wine_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_wine_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_rating_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quick_vino_tips
CREATE POLICY "Anyone can view active tips" ON public.quick_vino_tips FOR SELECT USING (is_active = true);

-- Create RLS policies for wine_preferences
CREATE POLICY "Users can view own wine preferences" ON public.wine_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own wine preferences" ON public.wine_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wine preferences" ON public.wine_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for subscribers
CREATE POLICY "Users can view own subscription" ON public.subscribers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscription" ON public.subscribers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.subscribers FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for wine_interactions
CREATE POLICY "Users can view own interactions" ON public.wine_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own interactions" ON public.wine_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_wine_library
CREATE POLICY "Users can view own wine library" ON public.user_wine_library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own wine library entries" ON public.user_wine_library FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wine library entries" ON public.user_wine_library FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wine library entries" ON public.user_wine_library FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for favorite_wines
CREATE POLICY "Users can view own favorites" ON public.favorite_wines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own favorites" ON public.favorite_wines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorite_wines FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for restaurant data
CREATE POLICY "Anyone can view restaurant menus" ON public.restaurant_menus FOR SELECT USING (true);
CREATE POLICY "Anyone can view restaurant wines" ON public.restaurant_wines FOR SELECT USING (true);

-- Create RLS policies for master wine library
CREATE POLICY "Anyone can view master wine library" ON public.master_wine_library FOR SELECT USING (true);

-- Create RLS policies for wine_rating_reminders
CREATE POLICY "Users can view own reminders" ON public.wine_rating_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reminders" ON public.wine_rating_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.wine_rating_reminders FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample data for quick_vino_tips
INSERT INTO public.quick_vino_tips (tip_text, category, display_order) VALUES 
('Red wines pair well with red meats and bold flavors', 'pairing', 1),
('White wines complement fish and light dishes', 'pairing', 2),
('Sparkling wines are perfect for celebrations and appetizers', 'pairing', 3),
('Tannins in red wine cut through rich, fatty foods', 'pairing', 4),
('Sweet wines balance spicy dishes beautifully', 'pairing', 5);
