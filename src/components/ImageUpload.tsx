import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageChange: (base64: string) => void;
  image?: string;
}

export function ImageUpload({ onImageChange, image }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG or PNG)');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreview('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Medical Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Upload Image (JPG/PNG)</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!preview ? (
            <div 
              onClick={handleUploadClick}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload medical image
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG (max 10MB)
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Medical image preview"
                className="w-full max-w-md mx-auto rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {!preview && (
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}