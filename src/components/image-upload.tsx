"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { compressImage, fileToBase64 } from "@/lib/image-compression";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  className?: string;
}

export function ImageUpload({ label, value, onChange, className }: ImageUploadProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsCompressing(true);
    try {
      const compressedFile = await compressImage(file);
      const base64 = await fileToBase64(compressedFile);
      onChange(base64);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="relative">
        {value ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-purple-500/30 bg-black/40">
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute right-2 top-2 bg-red-600/80 hover:bg-red-700/80 text-white p-2 rounded-md transition-colors"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-500/30 bg-black/40 transition-colors hover:border-purple-500/50 hover:bg-black/50",
              isCompressing && "opacity-50"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mb-2 h-8 w-8 text-purple-400" />
            <p className="text-sm text-gray-300">
              {isCompressing ? "Compressing..." : "Click to upload"}
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isCompressing}
        />
      </div>
    </div>
  );
}

