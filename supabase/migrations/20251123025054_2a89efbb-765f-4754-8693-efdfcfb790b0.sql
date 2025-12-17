-- Fix likes RLS policy to allow viewing received likes
-- This is critical for mutual like detection to work

CREATE POLICY "Users can view likes they received"
ON public.likes
FOR SELECT
TO authenticated
USING (auth.uid() = to_user);