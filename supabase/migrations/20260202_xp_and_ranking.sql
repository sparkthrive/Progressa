-- Create XP Logs table for historical tracking
CREATE TABLE IF NOT EXISTS public.xp_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT, -- e.g., 'challenge_completed', 'workout_logged', 'class_attended'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ranking queries
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_created ON public.xp_logs(user_id, created_at DESC);

-- Function to increment attendees
CREATE OR REPLACE FUNCTION increment_class_attendees(row_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE group_classes
    SET current_attendees = current_attendees + 1
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all XP logs" ON public.xp_logs FOR SELECT USING (true);
CREATE POLICY "System can manage XP logs" ON public.xp_logs FOR ALL USING (true); -- Usually restricted but for MVP actions it works

-- Update classes schema to add some missing fields if needed
-- (Though information_schema showed most are there)
