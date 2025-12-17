import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { preferencesSchema } from "@/lib/validations";

interface StepProps {
  data: {
    ageRange: [number, number];
    radius: number;
  };
  onComplete: (data: { ageRange: [number, number]; radius: number }) => void;
}

const radiusOptions = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 25, label: "25km" },
  { value: 50, label: "50km" },
  { value: 999, label: "Anywhere" },
];

const StepPreferences = ({ data, onComplete }: StepProps) => {
  const [ageRange, setAgeRange] = useState<[number, number]>(data.ageRange);
  const [radius, setRadius] = useState(data.radius);

  const handleContinue = () => {
    // Validate with Zod schema
    const result = preferencesSchema.safeParse({ ageRange, radius });
    
    if (!result.success) {
      console.error("Validation failed:", result.error);
      return;
    }

    onComplete({ ageRange, radius });
  };

  const getRadiusLabel = (value: number) => {
    const option = radiusOptions.find((opt) => opt.value === value);
    return option?.label || `${value}km`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Set your preferences</h2>
        <p className="text-muted-foreground">You can change these anytime</p>
      </div>

      <div className="space-y-8">
        <div>
          <Label className="text-base mb-4 block">Age range</Label>
          <div className="px-2">
            <Slider
              value={ageRange}
              onValueChange={(value) => setAgeRange(value as [number, number])}
              min={18}
              max={80}
              step={1}
              minStepsBetweenThumbs={1}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{ageRange[0]} years</span>
              <span>{ageRange[1]} years</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base mb-4 block">Distance</Label>
          <div className="px-2">
            <Slider
              value={[radiusOptions.findIndex((opt) => opt.value === radius)]}
              onValueChange={(value) => setRadius(radiusOptions[value[0]].value)}
              min={0}
              max={radiusOptions.length - 1}
              step={1}
              className="mb-4"
            />
            <div className="flex justify-center">
              <span className="text-lg font-medium text-foreground">
                {getRadiusLabel(radius)}
              </span>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {radiusOptions.map((option) => (
                <span key={option.value}>{option.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleContinue}
        size="lg"
        className="w-full"
      >
        Save preferences
      </Button>
    </div>
  );
};

export default StepPreferences;
