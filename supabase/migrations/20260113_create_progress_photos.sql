-- Create progress_photos table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  label TEXT CHECK (label IN ('front', 'side', 'back', 'other')),
  recorded_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON public.progress_photos(user_id, recorded_at DESC);

-- Enable RLS
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users manage own progress photos" ON public.progress_photos;
CREATE POLICY "Users manage own progress photos" ON public.progress_photos FOR ALL USING (auth.uid() = user_id);
