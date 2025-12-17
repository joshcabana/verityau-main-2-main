import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { checkRateLimit, clientSideRateLimit } from "@/utils/rateLimit";
import { toast } from "sonner";
import { BlockButton } from "@/components/BlockButton";
import { FadeIn } from "@/components/motion";
import { duration, easing, spring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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

interface MatchInfo {
  id: string;
  user1: string;
  user2: string;
  profile_name: string;
  profile_photo: string;
  other_user_id: string;
}

export default function Chat() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!matchId || !user) return;

    loadMatchInfo();
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
  }, [matchId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMatchInfo = async () => {
    if (!user || !matchId) return;

    try {
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("id, user1, user2")
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      // Get the other user's profile
      const otherUserId = match.user1 === user.id ? match.user2 : match.user1;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, photos")
        .eq("user_id", otherUserId)
        .single();

      if (profileError) throw profileError;

      setMatchInfo({
        id: match.id,
        user1: match.user1,
        user2: match.user2,
        profile_name: profile.name,
        profile_photo: profile.photos?.[0] || "",
        other_user_id: otherUserId,
      });
    } catch (error) {
      console.error("Error loading match info:", error);
    }
  };

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

    // Check rate limit
    if (!clientSideRateLimit('message', 5)) {
      toast.error("You're sending messages too fast! Please wait a minute.");
      return;
    }

    const rateLimitCheck = await checkRateLimit('message');
    if (!rateLimitCheck.allowed) {
      toast.error(rateLimitCheck.error || "Rate limit exceeded");
      return;
    }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  return (
    <FadeIn className="flex flex-col h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="border-b border-border p-4 flex-shrink-0 bg-card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0.05 } : { duration: duration.normal, ease: easing.easeOut }}
      >
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/matches")}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={matchInfo?.profile_photo} alt={matchInfo?.profile_name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {matchInfo?.profile_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-lg font-semibold">{matchInfo?.profile_name}</h1>
          </div>
          {matchInfo && (
            <BlockButton
              userId={matchInfo.other_user_id}
              userName={matchInfo.profile_name}
              variant="ghost"
              size="sm"
              onBlockChange={(blocked) => {
                if (blocked) {
                  // Navigate away when user is blocked
                  toast.success("User blocked. Returning to matches.");
                  navigate("/matches");
                }
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full pt-20">
              <p className="text-muted-foreground">No messages yet. Say hi! 👋</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isOwnMessage = msg.sender_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: isOwnMessage ? 20 : -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={prefersReducedMotion 
                      ? { duration: 0.05 } 
                      : { duration: duration.normal, ease: easing.easeOut, delay: index === messages.length - 1 ? 0 : 0 }
                    }
                  >
                    <motion.div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                      transition={{ duration: duration.fast }}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatTimestamp(msg.created_at)}
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div 
            className="px-4 py-2 text-sm text-muted-foreground italic max-w-4xl mx-auto w-full flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={prefersReducedMotion ? { duration: 0.05 } : { duration: duration.normal, ease: easing.easeOut }}
          >
            <span>{typingUsers[0].user_name} is typing</span>
            <motion.span
              animate={prefersReducedMotion ? {} : { opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <motion.div 
        className="border-t border-border p-4 pb-safe flex-shrink-0 bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0.05 } : { duration: duration.normal, ease: easing.easeOut, delay: 0.1 }}
      >
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <motion.div 
            className="flex-1"
            whileFocus={prefersReducedMotion ? {} : { scale: 1.01 }}
          >
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="flex-1 w-full"
              disabled={sending}
            />
          </motion.div>
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            transition={spring.default}
          >
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sending}
              className="btn-premium"
            >
              <motion.div
                animate={sending ? { rotate: 360 } : {}}
                transition={{ duration: 0.5, ease: "linear", repeat: sending ? Infinity : 0 }}
              >
                <Send className="w-4 h-4" />
              </motion.div>
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </FadeIn>
  );
}
