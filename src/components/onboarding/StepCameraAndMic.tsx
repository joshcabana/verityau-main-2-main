import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Mic } from "lucide-react";

interface StepProps {
  data: {
    cameraPermission: boolean;
  };
  onComplete: (data: { cameraPermission: boolean }) => void;
}

const StepCameraAndMic = ({ data, onComplete }: StepProps) => {
  const [permissionGranted, setPermissionGranted] = useState(data.cameraPermission);
  const [testing, setTesting] = useState(false);

  const handleTestPermissions = async () => {
    setTesting(true);
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera and microphone access. Please use a modern browser like Chrome, Firefox, or Safari.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      // Permission granted - stop the stream
      stream.getTracks().forEach((track) => track.stop());
      setPermissionGranted(true);
    } catch (error) {
      console.error("Permission error:", error);
      
      let errorMessage = "Camera and microphone access is required for video calls.";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          errorMessage = "Permission denied. Please allow camera and microphone access in your browser settings.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera or microphone found. Please connect a device and try again.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera or microphone is already in use by another application.";
        } else if (error.message.includes("browser")) {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setTesting(false);
    }
  };

  const handleContinue = () => {
    onComplete({ cameraPermission: permissionGranted });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Camera & microphone</h2>
        <p className="text-muted-foreground">
          Verity is video-first. You'll meet people via short live calls.
        </p>
      </div>

      <div className="space-y-6">
        {/* Camera Preview Placeholder */}
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {permissionGranted ? (
            <div className="text-center">
              <Video className="h-16 w-16 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Camera preview</p>
              <p className="text-xs text-muted-foreground mt-1">Ready for video calls</p>
            </div>
          ) : (
            <div className="text-center">
              <Video className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No camera access yet</p>
            </div>
          )}
        </div>

        {/* Permission Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Camera access</span>
            </div>
            <span className={`text-sm font-medium ${permissionGranted ? "text-primary" : "text-muted-foreground"}`}>
              {permissionGranted ? "Granted" : "Not granted"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Microphone access</span>
            </div>
            <span className={`text-sm font-medium ${permissionGranted ? "text-primary" : "text-muted-foreground"}`}>
              {permissionGranted ? "Granted" : "Not granted"}
            </span>
          </div>
        </div>

        {!permissionGranted && (
          <Button
            onClick={handleTestPermissions}
            disabled={testing}
            variant="outline"
            size="lg"
            className="w-full"
          >
            {testing ? "Testing..." : "Test camera & mic"}
          </Button>
        )}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!permissionGranted}
        size="lg"
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
};

export default StepCameraAndMic;
