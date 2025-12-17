import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface MutualConnection {
  mutual_friend_id: string;
  mutual_friend_name: string;
}

interface MutualConnectionsProps {
  userId: string;
  otherUserId: string;
}

export function MutualConnections({
  userId,
  otherUserId,
}: MutualConnectionsProps) {
  const [connections, setConnections] = useState<MutualConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMutualConnections();
  }, [userId, otherUserId]);

  const loadMutualConnections = async () => {
    try {
      const { data, error } = await supabase.rpc("get_mutual_connections", {
        user_a: userId,
        user_b: otherUserId,
      });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error("Error loading mutual connections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (connections.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Users className="h-4 w-4" />
      <span>
        {connections.length} mutual{" "}
        {connections.length === 1 ? "connection" : "connections"}
      </span>
      <div className="flex -space-x-2">
        {connections.slice(0, 3).map((conn) => (
          <Avatar key={conn.mutual_friend_id} className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-xs">
              {conn.mutual_friend_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
