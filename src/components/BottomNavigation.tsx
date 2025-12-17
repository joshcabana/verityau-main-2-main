import { Home, Heart, MessageCircle, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-around gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/main")}
            className={cn(
              "flex-col h-auto py-2 px-3 gap-1",
              isActive("/main") && "text-primary"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Discover</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/matches")}
            className={cn(
              "flex-col h-auto py-2 px-3 gap-1",
              isActive("/matches") && "text-primary"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Matches</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/verity-plus")}
            className={cn(
              "flex-col h-auto py-2 px-3 gap-1",
              isActive("/verity-plus") && "text-primary"
            )}
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs">Verity+</span>
          </Button>

          <div className="flex flex-col items-center gap-1">
            <NotificationBell />
            <span className="text-xs text-muted-foreground">Alerts</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
            className={cn(
              "flex-col h-auto py-2 px-3 gap-1",
              (isActive("/profile") || isActive("/profile/edit")) && "text-primary"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
