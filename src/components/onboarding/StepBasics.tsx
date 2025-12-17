import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { profileSchema } from "@/lib/validations";

interface StepProps {
  data: {
    name: string;
    gender: string;
    interestedIn: string;
    city: string;
    bio: string;
    lookingFor: string;
  };
  onComplete: (data: Partial<StepProps["data"]>) => void;
}

const StepBasics = ({ data, onComplete }: StepProps) => {
  const [name, setName] = useState(data.name);
  const [gender, setGender] = useState(data.gender);
  const [interestedIn, setInterestedIn] = useState(data.interestedIn);
  const [city, setCity] = useState(data.city);
  const [bio, setBio] = useState(data.bio);
  const [lookingFor, setLookingFor] = useState(data.lookingFor);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValid = name.trim() && gender && interestedIn && city.trim();

  const handleContinue = () => {
    if (!isValid) return;

    // Validate with Zod schema
    const result = profileSchema.safeParse({
      name,
      age: 25, // Will be set in age step, using placeholder
      gender: gender as "man" | "woman" | "non-binary",
      interestedIn: interestedIn as "men" | "women" | "everyone",
      city,
      bio,
      lookingFor,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const errorMap: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, value]) => {
        if (value && value.length > 0) {
          errorMap[key] = value[0];
        }
      });
      setErrors(errorMap);
      return;
    }

    setErrors({});
    onComplete({ name, gender, interestedIn, city, bio, lookingFor });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Tell us about yourself</h2>
        <p className="text-muted-foreground">Help others get to know you</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-base mb-3 block">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name"
            maxLength={100}
            className={errors.name ? "h-12 border-destructive" : "h-12"}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label className="text-base mb-3 block">Gender *</Label>
          <RadioGroup value={gender} onValueChange={setGender}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="woman" id="woman" />
              <Label htmlFor="woman" className="font-normal cursor-pointer">Woman</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="man" id="man" />
              <Label htmlFor="man" className="font-normal cursor-pointer">Man</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-binary" id="gender-non-binary" />
              <Label htmlFor="gender-non-binary" className="font-normal cursor-pointer">Non-binary</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base mb-3 block">Show me *</Label>
          <RadioGroup value={interestedIn} onValueChange={setInterestedIn}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="women" id="women" />
              <Label htmlFor="women" className="font-normal cursor-pointer">Women</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="men" id="men" />
              <Label htmlFor="men" className="font-normal cursor-pointer">Men</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="everyone" id="everyone" />
              <Label htmlFor="everyone" className="font-normal cursor-pointer">Everyone</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="city" className="text-base mb-3 block">City *</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Where are you based?"
            maxLength={100}
            className={errors.city ? "h-12 border-destructive" : "h-12"}
          />
          {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
        </div>

        <div>
          <Label htmlFor="bio" className="text-base mb-3 block">Bio (optional)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself..."
            maxLength={500}
            className={errors.bio ? "min-h-24 resize-none border-destructive" : "min-h-24 resize-none"}
          />
          <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 characters</p>
          {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio}</p>}
        </div>

        <div>
          <Label htmlFor="lookingFor" className="text-base mb-3 block">What you're looking for (optional)</Label>
          <Input
            id="lookingFor"
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="e.g., Something serious, New friends, etc."
            maxLength={200}
            className={errors.lookingFor ? "h-12 border-destructive" : "h-12"}
          />
          {errors.lookingFor && <p className="text-xs text-destructive mt-1">{errors.lookingFor}</p>}
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!isValid}
        size="lg"
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
};

export default StepBasics;
