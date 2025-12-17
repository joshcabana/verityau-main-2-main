import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Video, X, Lock, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Match } from "@/utils/matchHelpers";
import { VerifiedBadge } from "./VerifiedBadge";
import { getAvatarUrl } from "@/utils/imageOptimization";

interface MatchCardProps {
  match: Match;
  onOpenChat: () => void;
  onAcceptVerityDate?: () => void;
  onUnmatch: () => void;
}

export const MatchCard = ({ 
  match, 
  onOpenChat, 
  onAcceptVerityDate,
  onUnmatch 
}: MatchCardProps) => {
  const { profile, verity_date, last_message, created_at, chat_unlocked } = match;
  const hasPendingVerityDate = verity_date && !verity_date.scheduled_at;

  // Format distance
  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    const km = Math.round(meters / 1000);
    return km < 1 ? "< 1 km away" : `${km} km`;
  };

  // Format last active
  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return null;
    const date = new Date(lastActive);
    const minutesAgo = Math.floor((Date.now() - date.getTime()) / 60000);
    
    if (minutesAgo < 5) return "Active now";
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="w-16 h-16 border-2 border-primary/20">
          <AvatarImage 
            src={profile.photos?.[0] ? getAvatarUrl(profile.photos[0]) : undefined} 
            alt={profile.name}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
            {profile.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {profile.name}, {profile.age}
                </h3>
                {profile.verified && <VerifiedBadge size="sm" />}
              </div>
              
              {/* Distance and Last Active */}
              <div className="flex items-center gap-3 mt-1">
                {profile.distance_meters && formatDistance(profile.distance_meters) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {formatDistance(profile.distance_meters)}
                  </div>
                )}
                {profile.last_active && formatLastActive(profile.last_active) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatLastActive(profile.last_active)}
                  </div>
                )}
              </div>
              
              {hasPendingVerityDate && (
                <Badge variant="default" className="mt-2">
                  <Video className="w-3 h-3 mr-1" />
                  Verity Date Pending
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUnmatch}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Last Message Preview */}
          {last_message && (
            <p className="text-sm text-muted-foreground truncate mb-3">
              {last_message.content}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onOpenChat}
              size="sm"
              variant={chat_unlocked ? "outline" : "secondary"}
              className="flex-1"
            >
              {chat_unlocked ? (
                <MessageCircle className="w-4 h-4 mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {chat_unlocked ? "Message" : "Locked"}
            </Button>

            {hasPendingVerityDate && onAcceptVerityDate && (
              <Button
                onClick={onAcceptVerityDate}
                size="sm"
                className="flex-1 btn-premium"
              >
                <Video className="w-4 h-4 mr-2" />
                Accept Date
              </Button>
            )}
          </div>

          {/* Match Time */}
          <p className="text-xs text-muted-foreground mt-2">
            Matched {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  );
};
