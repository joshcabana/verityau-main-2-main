-- Phase 2: Add chat_unlocked field to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS chat_unlocked BOOLEAN DEFAULT false;

-- Update existing matches to have chat unlocked (temporary for existing users)
UPDATE matches SET chat_unlocked = false WHERE chat_unlocked IS NULL;