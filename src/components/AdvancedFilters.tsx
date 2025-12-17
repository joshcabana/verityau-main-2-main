import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdvancedFiltersProps {
  heightRange: [number, number];
  interests: string[];
  values: string[];
  onHeightChange: (range: [number, number]) => void;
  onInterestsChange: (interests: string[]) => void;
  onValuesChange: (values: string[]) => void;
}

const COMMON_INTERESTS = [
  "Travel",
  "Fitness",
  "Music",
  "Art",
  "Food",
  "Gaming",
  "Reading",
  "Sports",
  "Photography",
  "Cooking",
];

const COMMON_VALUES = [
  "Family",
  "Career",
  "Adventure",
  "Stability",
  "Growth",
  "Creativity",
  "Health",
  "Community",
];

export function AdvancedFilters({
  heightRange,
  interests,
  values,
  onHeightChange,
  onInterestsChange,
  onValuesChange,
}: AdvancedFiltersProps) {
  const [customInterest, setCustomInterest] = useState("");
  const [customValue, setCustomValue] = useState("");

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      onInterestsChange(interests.filter((i) => i !== interest));
    } else {
      onInterestsChange([...interests, interest]);
    }
  };

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onValuesChange(values.filter((v) => v !== value));
    } else {
      onValuesChange([...values, value]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      onInterestsChange([...interests, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  const addCustomValue = () => {
    if (customValue.trim() && !values.includes(customValue.trim())) {
      onValuesChange([...values, customValue.trim()]);
      setCustomValue("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-foreground">
          Height Range: {heightRange[0]}cm - {heightRange[1]}cm
        </Label>
        <Slider
          value={heightRange}
          onValueChange={(v) => onHeightChange(v as [number, number])}
          min={140}
          max={220}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-foreground">Interests</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_INTERESTS.map((interest) => (
            <Badge
              key={interest}
              variant={interests.includes(interest) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
        {interests.filter((i) => !COMMON_INTERESTS.includes(i)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interests
              .filter((i) => !COMMON_INTERESTS.includes(i))
              .map((interest) => (
                <Badge
                  key={interest}
                  variant="default"
                  className="cursor-pointer"
                >
                  {interest}
                  <X
                    className="ml-1 h-3 w-3"
                    onClick={() => toggleInterest(interest)}
                  />
                </Badge>
              ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom interest..."
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-foreground">Values</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_VALUES.map((value) => (
            <Badge
              key={value}
              variant={values.includes(value) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleValue(value)}
            >
              {value}
            </Badge>
          ))}
        </div>
        {values.filter((v) => !COMMON_VALUES.includes(v)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values
              .filter((v) => !COMMON_VALUES.includes(v))
              .map((value) => (
                <Badge key={value} variant="default" className="cursor-pointer">
                  {value}
                  <X
                    className="ml-1 h-3 w-3"
                    onClick={() => toggleValue(value)}
                  />
                </Badge>
              ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom value..."
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomValue()}
          />
        </div>
      </div>
    </div>
  );
}
