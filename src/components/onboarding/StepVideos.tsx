import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Video, X, VideoIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StepProps {
  data: {
    introVideo?: File;
    verificationVideo?: File;
  };
  onComplete: (data: { introVideo?: File; verificationVideo?: File }) => void;
}

const StepVideos = ({ data, onComplete }: StepProps) => {
  const [introVideo, setIntroVideo] = useState<File | undefined>(data.introVideo);
  const [verificationVideo, setVerificationVideo] = useState<File | undefined>(data.verificationVideo);
  const [recordingIntro, setRecordingIntro] = useState(false);
  const [recordingVerification, setRecordingVerification] = useState(false);
  const [introPreview, setIntroPreview] = useState<string | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleIntroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIntroVideo(file);
      setIntroPreview(URL.createObjectURL(file));
    }
  };

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVerificationVideo(file);
      setVerificationPreview(URL.createObjectURL(file));
    }
  };

  const startRecording = async (type: "intro" | "verification") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const file = new File([blob], `${type}-video.webm`, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        if (type === "intro") {
          setIntroVideo(file);
          setIntroPreview(url);
        } else {
          setVerificationVideo(file);
          setVerificationPreview(url);
        }

        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      if (type === "intro") {
        setRecordingIntro(true);
      } else {
        setRecordingVerification(true);
      }

      toast({
        title: "Recording started",
        description: `Recording ${type} video...`,
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Failed to access camera. Please grant camera permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = (type: "intro" | "verification") => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (type === "intro") {
        setRecordingIntro(false);
      } else {
        setRecordingVerification(false);
      }
    }
  };

  const handleContinue = () => {
    onComplete({ introVideo, verificationVideo });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Add Your Videos</h2>
        <p className="text-muted-foreground">
          Record a short intro and verification video
        </p>
      </div>

      <div className="space-y-6">
        {/* Camera Preview */}
        {(recordingIntro || recordingVerification) && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Intro Video */}
        <div className="space-y-2">
          <Label htmlFor="intro">Intro Video (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Tell others about yourself in 30 seconds
          </p>
          
          {introVideo ? (
            <div className="space-y-2">
              {introPreview && (
                <video src={introPreview} controls className="w-full rounded-lg" />
              )}
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <Video className="h-5 w-5" />
                <span className="flex-1 text-sm">{introVideo.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIntroVideo(undefined);
                    setIntroPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  recordingIntro ? stopRecording("intro") : startRecording("intro")
                }
                disabled={recordingVerification}
              >
                <VideoIcon className="w-4 h-4 mr-2" />
                {recordingIntro ? "Stop Recording" : "Record Video"}
              </Button>
              <label
                htmlFor="intro"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Or upload video</p>
                <input
                  id="intro"
                  type="file"
                  className="hidden"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleIntroChange}
                />
              </label>
            </div>
          )}
        </div>

        {/* Verification Video */}
        <div className="space-y-2">
          <Label htmlFor="verification">Verification Video (Recommended)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Get verified by recording a quick video
          </p>
          
          {verificationVideo ? (
            <div className="space-y-2">
              {verificationPreview && (
                <video src={verificationPreview} controls className="w-full rounded-lg" />
              )}
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <Video className="h-5 w-5" />
                <span className="flex-1 text-sm">{verificationVideo.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setVerificationVideo(undefined);
                    setVerificationPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  recordingVerification
                    ? stopRecording("verification")
                    : startRecording("verification")
                }
                disabled={recordingIntro}
              >
                <VideoIcon className="w-4 h-4 mr-2" />
                {recordingVerification ? "Stop Recording" : "Record Video"}
              </Button>
              <label
                htmlFor="verification"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Or upload video</p>
                <input
                  id="verification"
                  type="file"
                  className="hidden"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVerificationChange}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );
};

export default StepVideos;
