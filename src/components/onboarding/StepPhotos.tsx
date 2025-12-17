import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface StepProps {
  data: {
    photos?: File[];
  };
  onComplete: (data: { photos?: File[] }) => void;
}

const StepPhotos = ({ data, onComplete }: StepProps) => {
  const [photos, setPhotos] = useState<File[]>(data.photos || []);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 6) {
      alert("You can upload a maximum of 6 photos");
      return;
    }

    const newPhotos = [...photos, ...files].slice(0, 6);
    setPhotos(newPhotos);

    // Generate previews
    const newPreviews = [...previews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (photos.length < 3) {
      alert("Please upload at least 3 photos");
      return;
    }
    onComplete({ photos });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Add Your Photos</h2>
        <p className="text-muted-foreground">
          Upload 3-6 photos that show your personality ({photos.length}/6)
        </p>
      </div>

      <div className="space-y-4">
        <Label>Profile Photos</Label>
        
        {/* Photo Grid */}
        <div className="grid grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={`photo-${index}-${preview.slice(-20)}`} className="relative aspect-square">
              <img
                src={preview}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => handleRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {/* Upload Button */}
          {photos.length < 6 && (
            <label
              htmlFor="photos"
              className="aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center"
            >
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center px-2">
                Add Photo
              </p>
              <input
                id="photos"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                multiple
              />
            </label>
          )}
        </div>

        {photos.length < 3 && (
          <p className="text-sm text-destructive">
            Please upload at least 3 photos to continue
          </p>
        )}
      </div>

      <Button
        onClick={handleContinue}
        className="w-full"
        size="lg"
        disabled={photos.length < 3}
      >
        Continue
      </Button>
    </div>
  );
};

export default StepPhotos;
