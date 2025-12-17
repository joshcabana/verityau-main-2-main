-- Add new columns to waitlist table
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Canberra',
ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_waitlist_city ON waitlist(city);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist(referral_code);