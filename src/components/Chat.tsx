import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  match_id: string;
}

interface PresenceState {
  user_id: string;
  typing: boolean;
}

interface ChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  matchName: string;
  matchPhoto?: string;
  currentUserId: string;
  chatUnlocked: boolean;
}

export const Chat = ({ open, onOpenChange, matchId, matchName, matchPhoto, currentUserId, chatUnlocked }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages
  useEffect(() => {
    if (!open || !matchId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [open, matchId]);

  // Subscribe to real-time messages and typing indicators
  useEffect(() => {
    if (!open || !matchId) return;

    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.match_id === matchId) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<PresenceState>();
        const otherUsersPresence = Object.values(presenceState).flat();
        const otherUser = otherUsersPresence.find(
          (presence) => presence?.user_id !== currentUserId
        );
        setIsTyping(otherUser?.typing || false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, matchId, currentUserId]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!open || !matchId || !currentUserId) return;

    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        (msg) => msg.sender_id !== currentUserId && !msg.read
      );

      if (unreadMessages.length > 0) {
        const { error } = await supabase
          .from("messages")
          .update({ read: true })
          .eq("match_id", matchId)
          .eq("sender_id", unreadMessages[0].sender_id)
          .eq("read", false);

        if (error) {
          console.error("Error marking messages as read:", error);
        }
      }
    };

    markAsRead();
  }, [open, matchId, currentUserId, messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleTyping = () => {
    const channel = supabase.channel(`chat:${matchId}`);
    
    channel.track({
      user_id: currentUserId,
      typing: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      channel.track({
        user_id: currentUserId,
        typing: false,
      });
    }, 2000);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: currentUserId,
        content: message.trim(),
      });

      if (error) throw error;

      // Create notification for the recipient
      const { data: matchData } = await supabase
        .from("matches")
        .select("user1, user2")
        .eq("id", matchId)
        .single();

      if (matchData) {
        const recipientId = matchData.user1 === currentUserId ? matchData.user2 : matchData.user1;
        
        const { createNotification } = await import("@/utils/notifications");
        await createNotification({
          userId: recipientId,
          type: "message",
          title: `New message from ${matchName}`,
          message: message.trim().substring(0, 100),
          relatedId: matchId,
        });
      }

      setMessage("");
      
      // Stop typing indicator
      const channel = supabase.channel(`chat:${matchId}`);
      channel.track({
        user_id: currentUserId,
        typing: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
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
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {!chatUnlocked ? (
            <div className="text-center text-muted-foreground space-y-4 py-8">
              <div className="text-4xl">🔒</div>
              <div>
                <p className="font-semibold mb-2">Chat Locked</p>
                <p className="text-sm">
                  Complete a Verity Date where you both say "yes" to unlock chat!
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No messages yet. Say hi! 👋
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender_id === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {msg.sender_id === currentUserId && (
                        <span className="opacity-70">
                          {msg.read ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4 flex-shrink-0">
          {chatUnlocked ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                size="icon"
                disabled={!message.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Complete a Verity Date to unlock messaging
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
