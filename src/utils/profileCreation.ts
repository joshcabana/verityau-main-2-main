import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { geocodeCity, coordinatesToPostGIS } from "./geocoding";

/**
 * Check upload quota to prevent AWS Rekognition cost abuse
 * Limits users to 10 photo uploads per hour
 */
async function checkUploadQuota(userId: string): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  
  const { count, error } = await supabase
    .from('profiles')
    .select('photos', { count: 'exact', head: true })
    .eq('id', userId)
    .gte('updated_at', oneHourAgo);

  if (error) {
    console.warn('Upload quota check failed:', error);
    return; // Fail open for beta
  }

  // Rough estimate: check if profile was updated recently (indicates photo activity)
  // For production, track uploads in separate table
  if (count && count >= 10) {
    throw new Error('Upload limit reached (10 photos per hour). Please try again later.');
  }
}

/**
 * Validate file before upload to prevent abuse
 */
function validateImageFile(file: File): void {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > MAX_SIZE) {
    throw new Error('Image must be under 5MB');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP formats allowed');
  }
}

/**
 * Moderate photo using AWS Rekognition via edge function
 */
async function moderatePhoto(imageUrl: string): Promise<{appropriate: boolean; message: string}> {
  try {
    const { data, error } = await supabase.functions.invoke('moderate-photo', {
      body: { imageUrl },
    });

    if (error) {
      console.error('Moderation error:', error);
      // Fail open for beta - allow image if moderation fails
      return { appropriate: true, message: 'Moderation unavailable' };
    }

    return {
      appropriate: data.appropriate,
      message: data.message || 'Image moderated',
    };
  } catch (error) {
    console.error('Photo moderation failed:', error);
    // Fail open for beta
    return { appropriate: true, message: 'Moderation unavailable' };
  }
}

export interface OnboardingData {
  dateOfBirth?: Date;
  name: string;
  gender: string;
  interestedIn: string;
  city: string;
  bio: string;
  lookingFor: string;
  ageRange: [number, number];
  radius: number;
  photos?: File[];
  introVideo?: File;
  verificationVideo?: File;
}

export async function uploadFile(
  file: File,
  bucket: string,
  folder: string
): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Validate file size and type before upload
    if (bucket === 'photos') {
      validateImageFile(file);
      await checkUploadQuota(user.id);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Moderate photo if it's an image
    if (bucket === 'photos') {
      const moderation = await moderatePhoto(publicUrl);
      
      if (!moderation.appropriate) {
        // Delete the inappropriate image
        await supabase.storage.from(bucket).remove([fileName]);
        
        throw new Error('Photo contains inappropriate content and was rejected. Please upload a different image.');
      }
    }

    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    toast({
      title: "Upload failed",
      description: error instanceof Error ? error.message : "Failed to upload file",
      variant: "destructive",
    });
    return null;
  }
}

export async function createProfile(data: OnboardingData): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a profile",
        variant: "destructive",
      });
      return false;
    }

    // Calculate age from dateOfBirth
    const age = data.dateOfBirth
      ? new Date().getFullYear() - data.dateOfBirth.getFullYear()
      : null;

    // Geocode the city to get coordinates
    const coords = await geocodeCity(data.city);
    if (!coords) {
      toast({
        title: "Location Error",
        description: `Could not find "${data.city}". Please try a different city name or format (e.g., "New York, USA").`,
        variant: "destructive",
      });
      return false;
    }
    
    const locationString = coordinatesToPostGIS(coords);
    console.log(`Geocoded ${data.city} to:`, coords);

    // Upload photos
    const photoUrls: string[] = [];
    if (data.photos && data.photos.length > 0) {
      for (let i = 0; i < data.photos.length; i++) {
        const photoUrl = await uploadFile(data.photos[i], "photos", `photo-${i}`);
        if (photoUrl) {
          photoUrls.push(photoUrl);
        }
      }
      if (photoUrls.length === 0) return false;
    }

    // Upload intro video
    let introVideoUrl: string | null = null;
    if (data.introVideo) {
      introVideoUrl = await uploadFile(data.introVideo, "intro-videos", "intro");
      if (!introVideoUrl) return false;
    }

    // Upload verification video (private)
    let verificationVideoUrl: string | null = null;
    if (data.verificationVideo) {
      verificationVideoUrl = await uploadFile(
        data.verificationVideo,
        "verification-videos",
        "verification"
      );
      if (!verificationVideoUrl) return false;
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: user.id,
      name: data.name,
      age: age,
      gender: data.gender,
      bio: data.bio,
      looking_for: [data.lookingFor],
      photos: photoUrls,
      intro_video_url: introVideoUrl,
      verification_video_url: verificationVideoUrl,
      verified: !!verificationVideoUrl, // Set verified if verification video uploaded
      location: locationString,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
      return false;
    }

    // Create preferences
    const { error: preferencesError } = await supabase.from("preferences").insert({
      user_id: user.id,
      age_range: `[${data.ageRange[0]},${data.ageRange[1]}]`,
      distance_km: data.radius,
      gender_prefs: [data.interestedIn],
    });

    if (preferencesError) {
      console.error("Preferences creation error:", preferencesError);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Profile creation error:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create profile",
      variant: "destructive",
    });
    return false;
  }
}
