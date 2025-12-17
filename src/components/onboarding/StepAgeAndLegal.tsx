import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";

interface StepProps {
  data: { dateOfBirth?: Date; agreedToTerms: boolean };
  onComplete: (data: { dateOfBirth: Date; agreedToTerms: boolean }) => void;
}

const StepAgeAndLegal = ({ data, onComplete }: StepProps) => {
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(data.dateOfBirth);
  const [agreedToTerms, setAgreedToTerms] = useState(data.agreedToTerms);

  const age = dateOfBirth ? differenceInYears(new Date(), dateOfBirth) : null;
  const isValid = dateOfBirth && agreedToTerms && age !== null && age >= 18;

  const handleContinue = () => {
    if (isValid && dateOfBirth) {
      onComplete({ dateOfBirth, agreedToTerms });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Verity</h2>
        <p className="text-muted-foreground">Let's get to know you</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base mb-3 block">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !dateOfBirth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick your date of birth</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={setDateOfBirth}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={1940}
                toYear={new Date().getFullYear()}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {age !== null && (
            <p className="mt-2 text-sm text-muted-foreground">
              You are {age} years old
            </p>
          )}
        </div>

        <div className="flex items-start space-x-3 p-4 rounded-lg bg-secondary/50">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-normal cursor-pointer"
            >
              I am 18 or over and I agree to the{" "}
              <a href="#" className="text-primary hover:underline">Terms</a>,{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>, and{" "}
              <a href="#" className="text-primary hover:underline">Community Guidelines</a>.
            </Label>
          </div>
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

export default StepAgeAndLegal;
