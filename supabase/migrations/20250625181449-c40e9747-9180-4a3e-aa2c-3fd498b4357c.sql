
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  subscription_tier TEXT DEFAULT 'trial',
  trial_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  cuisine_type TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wine_pairings table
CREATE TABLE public.wine_pairings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants,
  dish_name TEXT NOT NULL,
  wine_name TEXT NOT NULL,
  wine_type TEXT,
  confidence_score INTEGER,
  budget TEXT,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wine_tips table
CREATE TABLE public.wine_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_text TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  wine_style TEXT,
  budget_range TEXT,
  flavor_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for restaurants
CREATE POLICY "Anyone can view restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create restaurants" ON public.restaurants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for menu_items
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);

-- Create RLS policies for wine_pairings
CREATE POLICY "Users can view own pairings" ON public.wine_pairings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pairings" ON public.wine_pairings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pairings" ON public.wine_pairings FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for wine_tips
CREATE POLICY "Anyone can view active tips" ON public.wine_tips FOR SELECT USING (is_active = true);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Insert some sample wine tips
INSERT INTO public.wine_tips (tip_text, category, display_order) VALUES 
('Red wines pair well with red meats and bold flavors', 'pairing', 1),
('White wines complement fish and light dishes', 'pairing', 2),
('Sparkling wines are perfect for celebrations and appetizers', 'pairing', 3);
