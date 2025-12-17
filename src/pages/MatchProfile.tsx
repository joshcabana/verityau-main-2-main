import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Calendar } from "lucide-react";

const MatchProfile = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();

  // Mock match data - in production this would fetch from backend based on matchId
  const match = {
    id: matchId,
    name: "Sarah",
    age: 28,
    city: "London",
    photo: null,
    bio: "Love exploring new cafes and weekend hikes. Always up for a good conversation.",
    lookingFor: "Something genuine",
    matchedDate: "21 November 2025"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/matches")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
          {/* Photo Section */}
          <div className="bg-muted p-12 flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-5xl bg-primary/10 text-primary">
                {match.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info Section */}
          <div className="p-8 space-y-6">
            {/* Name & Location */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold text-foreground">
                {match.name}, {match.age}
              </h1>
              
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{match.city}</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-muted-foreground pt-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Matched on {match.matchedDate}</span>
              </div>
            </div>

            {/* Bio */}
            {match.bio && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  About
                </h3>
                <p className="text-foreground">{match.bio}</p>
              </div>
            )}

            {/* Looking For */}
            {match.lookingFor && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Looking for
                </h3>
                <p className="text-foreground">{match.lookingFor}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-6 space-y-3">
              <Button
                size="lg"
                className="w-full h-12"
                onClick={() => navigate("/matches")}
              >
                Send a message
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-12"
                onClick={() => navigate("/main")}
              >
                Back to main
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchProfile;
