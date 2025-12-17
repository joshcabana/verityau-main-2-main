import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import StepAgeAndLegal from "@/components/onboarding/StepAgeAndLegal";
import StepBasics from "@/components/onboarding/StepBasics";
import StepPhotos from "@/components/onboarding/StepPhotos";
import StepCameraAndMic from "@/components/onboarding/StepCameraAndMic";
import StepVideos from "@/components/onboarding/StepVideos";
import StepPreferences from "@/components/onboarding/StepPreferences";
import StepGuidelines from "@/components/onboarding/StepGuidelines";
import { createProfile } from "@/utils/profileCreation";
import { toast } from "@/hooks/use-toast";
import { FadeIn } from "@/components/motion";
import { duration, easing, spring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    dateOfBirth: undefined as Date | undefined,
    agreedToTerms: false,
    name: "",
    gender: "",
    interestedIn: "",
    city: "",
    photos: [] as File[],
    cameraPermission: false,
    introVideo: undefined as File | undefined,
    verificationVideo: undefined as File | undefined,
    bio: "",
    lookingFor: "",
    ageRange: [18, 50] as [number, number],
    radius: 25,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 8;
  const prefersReducedMotion = useReducedMotion();
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Step transition variants
  const stepVariants = {
    enter: (direction: number) => ({
      x: prefersReducedMotion ? 0 : direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: prefersReducedMotion ? 0 : direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  const handleStepComplete = async (data: Partial<typeof formData>) => {
    setDirection(1); // Moving forward
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step - create profile
      setIsSubmitting(true);
      
      const success = await createProfile({
        dateOfBirth: updatedData.dateOfBirth,
        name: updatedData.name,
        gender: updatedData.gender,
        interestedIn: updatedData.interestedIn,
        city: updatedData.city,
        bio: updatedData.bio,
        lookingFor: updatedData.lookingFor,
        ageRange: updatedData.ageRange,
        radius: updatedData.radius,
        photos: updatedData.photos,
        introVideo: updatedData.introVideo,
        verificationVideo: updatedData.verificationVideo,
      });
      
      setIsSubmitting(false);
      
      if (success) {
        toast({
          title: `Welcome ${updatedData.name}!`,
          description: "Your profile has been created successfully",
        });
        navigate("/main");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center px-4 py-8">
      <FadeIn className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ 
                duration: prefersReducedMotion ? 0 : duration.normal, 
                ease: easing.easeOut 
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: prefersReducedMotion ? 0.05 : duration.normal,
                ease: easing.easeOut,
              }}
            >
              {currentStep === 1 && (
                <StepAgeAndLegal
                  data={formData}
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 2 && (
                <StepBasics
                  data={formData}
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 3 && (
                <StepPhotos
                  data={formData}
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 4 && (
                <StepCameraAndMic
                  data={formData}
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 5 && (
                <StepVideos
                  data={formData}
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 6 && (
                <StepPreferences
                  data={formData}
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 7 && (
                <StepGuidelines
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 8 && (
                <div className="space-y-6 text-center">
                  <motion.h2 
                    className="text-3xl font-bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Complete Your Profile
                  </motion.h2>
                  <motion.p 
                    className="text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Review your information and create your profile
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={() => handleStepComplete({})}
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating Profile..." : "Complete & Start Matching"}
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </FadeIn>
    </div>
  );
};

export default Onboarding;
