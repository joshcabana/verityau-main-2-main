import { Button } from "@/components/ui/button";
import { ShieldCheck, Ban, Camera, AlertCircle, Eye } from "lucide-react";

interface StepProps {
  onComplete: (data: {}) => void;
}

const guidelines = [
  {
    icon: ShieldCheck,
    text: "Be respectful and kind to everyone you meet",
  },
  {
    icon: Ban,
    text: "No nudity, sexual content, or inappropriate behavior",
  },
  {
    icon: AlertCircle,
    text: "No hate speech, harassment, or bullying of any kind",
  },
  {
    icon: Eye,
    text: "You must be 18 or over to use Verity",
  },
  {
    icon: Camera,
    text: "No recording or screenshotting video calls without consent",
  },
];

const StepGuidelines = ({ onComplete }: StepProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Community Guidelines</h2>
        <p className="text-muted-foreground">
          Verity is a safe space for genuine connections
        </p>
      </div>

      <div className="space-y-4">
        {guidelines.map((guideline) => {
          const Icon = guideline.icon;
          return (
            <div
              key={guideline.text}
              className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50"
            >
              <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed">
                {guideline.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm text-foreground text-center">
          Breaking these guidelines will result in immediate account suspension or permanent ban.
          We take safety seriously.
        </p>
      </div>

      <Button
        onClick={() => onComplete({})}
        size="lg"
        className="w-full"
      >
        I understand and agree
      </Button>
    </div>
  );
};

export default StepGuidelines;
