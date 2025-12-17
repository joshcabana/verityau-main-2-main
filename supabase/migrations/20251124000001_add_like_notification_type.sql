-- Add 'like' to notification types
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('match', 'verity_date_request', 'verity_date_accepted', 'message', 'like'));
