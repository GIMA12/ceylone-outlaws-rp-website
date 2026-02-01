-- Create storage bucket for bot result images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bot-images', 'bot-images', true);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Public can view bot images"
ON storage.objects FOR SELECT
USING (bucket_id = 'bot-images');

-- Only admins can upload/update/delete images
CREATE POLICY "Admins can upload bot images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bot-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update bot images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'bot-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete bot images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bot-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create table to store bot settings persistently
CREATE TABLE public.bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for edge functions)
CREATE POLICY "Anyone can read bot settings"
ON public.bot_settings FOR SELECT
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can manage bot settings"
ON public.bot_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);