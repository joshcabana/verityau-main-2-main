import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { geocodeCity } from "@/utils/geocoding";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: 18,
    gender: "",
    city: "",
    bio: "",
    interestedIn: "",
    ageRange: [18, 99] as [number, number],
    radius: 50,
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: preferences } = await supabase
      .from("preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      // Parse age_range from PostgreSQL int4range format
      let minAge = 18;
      let maxAge = 99;
      
      if (preferences?.age_range && typeof preferences.age_range === 'string') {
        const matches = preferences.age_range.match(/\[(\d+),(\d+)\)/);
        if (matches) {
          minAge = parseInt(matches[1]);
          maxAge = parseInt(matches[2]) - 1; // PostgreSQL ranges are exclusive on upper bound
        }
      }

      setFormData({
        name: profile.name || "",
        age: profile.age || 18,
        gender: profile.gender || "",
        city: "", // We don't store city as text, would need to reverse geocode
        bio: profile.bio || "",
        interestedIn: preferences?.gender_prefs?.[0] === "men" ? "men" : 
                      preferences?.gender_prefs?.[0] === "women" ? "women" : "everyone",
        ageRange: [minAge, maxAge],
        radius: preferences?.distance_km || 50,
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          bio: formData.bio,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Update location if city changed
      if (formData.city) {
        const coordinates = await geocodeCity(formData.city);
        if (coordinates) {
          await supabase
            .from("profiles")
            .update({
              location: `POINT(${coordinates.longitude} ${coordinates.latitude})`,
            })
            .eq("user_id", user.id);
        }
      }

      // Update preferences
      const genderPrefs = formData.interestedIn === "everyone" 
        ? ["men", "women", "non-binary"]
        : [formData.interestedIn];

      const { error: prefsError } = await supabase
        .from("preferences")
        .update({
          age_range: `[${formData.ageRange[0]},${formData.ageRange[1]}]`,
          distance_km: formData.radius,
          gender_prefs: genderPrefs,
        })
        .eq("user_id", user.id);

      if (prefsError) throw prefsError;

      toast.success("Profile updated successfully!");
      navigate("/main");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md px-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-center text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-enter">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Edit Profile</h1>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="icon"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={99}
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="man">Man</SelectItem>
                  <SelectItem value="woman">Woman</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">City (optional - to update location)</Label>
              <Input
                id="city"
                placeholder="e.g., New York, NY"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                maxLength={500}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.bio.length}/500
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="interestedIn">Interested In</Label>
              <Select
                value={formData.interestedIn}
                onValueChange={(value) =>
                  setFormData({ ...formData, interestedIn: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="everyone">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Age Range: {formData.ageRange[0]} - {formData.ageRange[1]}</Label>
              <Slider
                min={18}
                max={99}
                step={1}
                value={formData.ageRange}
                onValueChange={(value) =>
                  setFormData({ ...formData, ageRange: value as [number, number] })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label>Distance: {formData.radius} km</Label>
              <Slider
                min={1}
                max={500}
                step={1}
                value={[formData.radius]}
                onValueChange={(value) =>
                  setFormData({ ...formData, radius: value[0] })
                }
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
