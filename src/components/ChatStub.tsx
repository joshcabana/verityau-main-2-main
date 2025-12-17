import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface TypingStatus {
  user_id: string;
  user_name: string;
}

interface ChatStubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  matchName: string;
  matchPhoto?: string;
}

export const ChatStub = ({ open, onOpenChange, matchId, matchName, matchPhoto }: ChatStubProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open || !matchId || !user) return;

    loadMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [open, matchId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typing = Object.values(state)
          .flat()
          .filter((presence: any) => presence.typing && presence.user_id !== user?.id)
          .map((presence: any) => ({
            user_id: presence.user_id,
            user_name: presence.user_name,
          }));
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await channel.track({
            user_id: user.id,
            user_name: user.user_metadata?.name || "Anonymous",
            typing: false,
          });
        }
      });

    channelRef.current = channel;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !user || sending) return;

    setSending(true);
    const messageText = message.trim();
    setMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: user.id,
        content: messageText,
      });

      if (error) throw error;

      // Stop typing indicator
      if (channelRef.current) {
        await channelRef.current.track({
          user_id: user.id,
          user_name: user.user_metadata?.name || "Anonymous",
          typing: false,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = async () => {
    if (!user || !channelRef.current) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    await channelRef.current.track({
      user_id: user.id,
      user_name: user.user_metadata?.name || "Anonymous",
      typing: true,
    });

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      if (channelRef.current && user) {
        await channelRef.current.track({
          user_id: user.id,
          user_name: user.user_metadata?.name || "Anonymous",
          typing: false,
        });
      }
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={matchPhoto} alt={matchName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {matchName?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <DialogTitle>{matchName}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatTimestamp(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-muted-foreground italic">
            {typingUsers[0].user_name} is typing...
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="flex-1"
              disabled={sending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sending}
              className="btn-premium"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
