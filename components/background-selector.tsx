import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface BackgroundSelectorProps {
  backgrounds: { name: string; url: string }[];
  selectedBackground: string | null;
  onBackgroundSelect: (url: string) => void;
  onBackgroundUpload: (file: File) => Promise<void>;
}

export function BackgroundSelector({
  backgrounds,
  selectedBackground,
  onBackgroundSelect,
  onBackgroundUpload,
}: BackgroundSelectorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onBackgroundUpload(file);
    } catch (error) {
      console.error("Error uploading background:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Background Image</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="background-upload"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("background-upload")?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {backgrounds.map((bg) => (
          <Card
            key={bg.url}
            className={`relative aspect-square cursor-pointer overflow-hidden transition-all ${
              selectedBackground === bg.url
                ? "ring-2 ring-purple-500"
                : "hover:ring-2 hover:ring-purple-300"
            }`}
            onClick={() => onBackgroundSelect(bg.url)}
          >
            <Image
              src={bg.url}
              alt={bg.name}
              fill
              className="object-cover"
            />
          </Card>
        ))}
      </div>
    </div>
  );
} 