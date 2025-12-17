import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Upload, X, Plus, AlertTriangle } from "lucide-react";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { toast } from "sonner";
import { geocodeCity } from "@/utils/geocoding";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { spring, duration, easing } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProfileData {
  name: string;
  age: number;
  gender: string;
  bio: string;
  looking_for: string[];
  photos: string[];
  city: string;
}

interface PreferencesData {
  age_range: string;
  distance_km: number;
  gender_prefs: string[];
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    age: 18,
    gender: "",
    bio: "",
    looking_for: [],
    photos: [],
    city: "",
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    age_range: "[18,99)",
    distance_km: 50,
    gender_prefs: [],
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      const { data: prefs, error: prefsError } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (prefsError && prefsError.code !== "PGRST116") {
        throw prefsError;
      }

      if (profile) {
        setProfileData({
          name: profile.name || "",
          age: profile.age || 18,
          gender: profile.gender || "",
          bio: profile.bio || "",
          looking_for: profile.looking_for || [],
          photos: profile.photos || [],
          city: "",
        });
      }

      if (prefs) {
        setPreferences({
          age_range: (prefs.age_range as string) || "[18,99)",
          distance_km: prefs.distance_km || 50,
          gender_prefs: prefs.gender_prefs || [],
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Max 6 photos
    if (profileData.photos.length >= 6) {
      toast.error("Maximum 6 photos allowed");
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      setProfileData({
        ...profileData,
        photos: [...profileData.photos, data.publicUrl],
      });

      toast.success("Photo uploaded!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoUrl: string, index: number) => {
    if (!user) return;

    try {
      // Extract file path from URL
      const urlParts = photoUrl.split("/");
      const fileName = urlParts.slice(-2).join("/"); // user_id/timestamp.ext

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("photos")
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Remove from local state
      const newPhotos = profileData.photos.filter((_, i) => i !== index);
      setProfileData({ ...profileData, photos: newPhotos });

      toast.success("Photo deleted");
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (profileData.age < 18 || profileData.age > 99) {
      toast.error("Age must be between 18 and 99");
      return;
    }

    if (!profileData.gender) {
      toast.error("Gender is required");
      return;
    }

    setSaving(true);

    try {
      // Update or insert profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          name: profileData.name,
          age: profileData.age,
          gender: profileData.gender,
          bio: profileData.bio,
          looking_for: profileData.looking_for,
          photos: profileData.photos,
        });

      if (profileError) throw profileError;

      // Update location if city provided
      if (profileData.city.trim()) {
        const coordinates = await geocodeCity(profileData.city);
        if (coordinates) {
          await supabase
            .from("profiles")
            .update({
              location: `POINT(${coordinates.longitude} ${coordinates.latitude})`,
            })
            .eq("user_id", user.id);
        }
      }

      // Update or insert preferences
      const { error: prefsError } = await supabase
        .from("preferences")
        .upsert({
          user_id: user.id,
          age_range: preferences.age_range,
          distance_km: preferences.distance_km,
          gender_prefs: preferences.gender_prefs,
        });

      if (prefsError) throw prefsError;

      toast.success("Updated!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleLookingFor = (value: string) => {
    const current = profileData.looking_for || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setProfileData({ ...profileData, looking_for: updated });
  };

  const toggleGenderPref = (value: string) => {
    const current = preferences.gender_prefs || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setPreferences({ ...preferences, gender_prefs: updated });
  };

  const parseAgeRange = () => {
    const match = preferences.age_range.match(/\[(\d+),(\d+)\)?/);
    if (match) {
      return {
        min: parseInt(match[1]),
        max: parseInt(match[2]) - 1,
      };
    }
    return { min: 18, max: 99 };
  };

  const setAgeRange = (min: number, max: number) => {
    setPreferences({
      ...preferences,
      age_range: `[${min},${max + 1})`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ageRange = parseAgeRange();

  return (
    <FadeIn className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-10 bg-card border-b border-border"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0.05 } : { duration: duration.normal, ease: easing.easeOut }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <h1 className="text-xl font-semibold">Edit Profile</h1>
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            transition={spring.default}
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-premium"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <StaggerContainer className="container mx-auto px-4 py-6 max-w-3xl space-y-6" staggerDelay="fast" initialDelay={0.1}>
        {/* Photos Section */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {profileData.photos.map((photo, index) => (
                  <motion.div 
                    key={`photo-${index}-${photo.slice(-20)}`} 
                    className="relative aspect-square"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                    transition={spring.gentle}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <motion.div
                      whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                    >
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => handleDeletePhoto(photo, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </motion.div>
                ))}

              {profileData.photos.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Add up to 6 photos. First photo will be your primary photo.
            </p>
          </CardContent>
        </Card>
        </StaggerItem>

        {/* Basic Information */}
        <StaggerItem>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                placeholder="Your name"
              />
            </div>

            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={99}
                value={profileData.age}
                onChange={(e) =>
                  setProfileData({ ...profileData, age: parseInt(e.target.value) || 18 })
                }
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={profileData.gender}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, gender: value })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="man">Man</SelectItem>
                  <SelectItem value="woman">Woman</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">City (update location)</Label>
              <Input
                id="city"
                value={profileData.city}
                onChange={(e) =>
                  setProfileData({ ...profileData, city: e.target.value })
                }
                placeholder="e.g., New York, NY"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter city to update your location for matching
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                maxLength={500}
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                placeholder="Tell others about yourself..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                {profileData.bio.length}/500
              </p>
            </div>

            <div>
              <Label>Looking For</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Relationship", "Casual", "Friends", "Not sure"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={
                      profileData.looking_for?.includes(option)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => toggleLookingFor(option)}
                    className="rounded-full"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>

        {/* Preferences */}
        <StaggerItem>
        <Card>
          <CardHeader>
            <CardTitle>Match Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Interested In</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["men", "women", "non-binary"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={
                      preferences.gender_prefs?.includes(option)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => toggleGenderPref(option)}
                    className="rounded-full capitalize"
                  >
                    {option === "non-binary" ? "Non-binary" : option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>
                Age Range: {ageRange.min} - {ageRange.max}
              </Label>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min Age</Label>
                  <Input
                    type="range"
                    min={18}
                    max={ageRange.max}
                    value={ageRange.min}
                    onChange={(e) =>
                      setAgeRange(parseInt(e.target.value), ageRange.max)
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Age</Label>
                  <Input
                    type="range"
                    min={ageRange.min}
                    max={99}
                    value={ageRange.max}
                    onChange={(e) =>
                      setAgeRange(ageRange.min, parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Distance: {preferences.distance_km} km</Label>
              <Input
                type="range"
                min={1}
                max={500}
                value={preferences.distance_km}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    distance_km: parseInt(e.target.value),
                  })
                }
                className="w-full mt-2"
              />
            </div>
          </CardContent>
        </Card>
        </StaggerItem>

        {/* Danger Zone */}
        <StaggerItem>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </FadeIn>
  );
}
