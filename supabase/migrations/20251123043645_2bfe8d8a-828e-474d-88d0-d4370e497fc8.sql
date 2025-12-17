-- Fix search_path for the new function
CREATE OR REPLACE FUNCTION get_mutual_connections(
  user_a UUID,
  user_b UUID
)
RETURNS TABLE(mutual_friend_id UUID, mutual_friend_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.user_id, p.name
  FROM connections c1
  JOIN connections c2 ON c1.user2 = c2.user2
  JOIN profiles p ON p.user_id = c1.user2
  WHERE c1.user1 = user_a 
    AND c2.user1 = user_b
    AND c1.status = 'accepted'
    AND c2.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;