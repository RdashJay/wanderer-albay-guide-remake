-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for subcategories
CREATE POLICY "Anyone can view subcategories"
ON public.subcategories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage subcategories"
ON public.subcategories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add district to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS district TEXT;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Insert default categories
INSERT INTO public.categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Food', '🍴'),
  ('Culture', '🎭'),
  ('Beach', '🏖️'),
  ('Adventure', '🧗')
ON CONFLICT DO NOTHING;

-- Insert default subcategories (getting category IDs first)
INSERT INTO public.subcategories (category_id, name, description)
SELECT c.id, sub.name, sub.description
FROM public.categories c
CROSS JOIN (
  VALUES
    ('Nature', 'Waterfalls', 'Beautiful cascading waterfalls'),
    ('Nature', 'Volcanoes', 'Active and dormant volcanoes'),
    ('Nature', 'Lakes', 'Scenic lakes and lagoons'),
    ('Nature', 'Scenic Parks', 'Nature parks and gardens'),
    ('Food', 'Street Food', 'Local street food vendors'),
    ('Food', 'Local Cuisine', 'Traditional Bicolano dishes'),
    ('Food', 'Cafés', 'Coffee shops and cafés'),
    ('Food', 'Night Markets', 'Evening food markets'),
    ('Culture', 'Festivals', 'Local celebrations and festivals'),
    ('Culture', 'Churches', 'Historic churches and cathedrals'),
    ('Culture', 'Museums', 'Cultural and historical museums'),
    ('Culture', 'Crafts', 'Traditional crafts and artisans'),
    ('Beach', 'Island Hopping', 'Visit nearby islands'),
    ('Beach', 'Snorkeling', 'Underwater exploration'),
    ('Beach', 'Resorts', 'Beach resorts and accommodations'),
    ('Beach', 'Sunset Views', 'Best spots for sunsets'),
    ('Adventure', 'Hiking', 'Mountain and trail hiking'),
    ('Adventure', 'ATV Rides', 'All-terrain vehicle adventures'),
    ('Adventure', 'Ziplines', 'Thrilling zipline experiences'),
    ('Adventure', 'Caving', 'Cave exploration')
) AS sub(category_name, name, description)
WHERE c.name = sub.category_name
ON CONFLICT DO NOTHING;