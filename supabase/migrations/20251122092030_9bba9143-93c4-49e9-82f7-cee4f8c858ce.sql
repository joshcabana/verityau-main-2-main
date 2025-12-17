-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public waitlist)
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow admins to view waitlist (for future use)
CREATE POLICY "Service role can view waitlist" 
ON public.waitlist 
FOR SELECT 
USING (true);

-- Create index on email for faster lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Create index on timestamp for sorting
CREATE INDEX idx_waitlist_timestamp ON public.waitlist(timestamp DESC);