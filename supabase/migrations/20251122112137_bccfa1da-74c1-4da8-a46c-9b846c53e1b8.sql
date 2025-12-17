-- Update the default city value from 'Canberra' to 'Australia'
ALTER TABLE public.waitlist 
ALTER COLUMN city SET DEFAULT 'Australia';