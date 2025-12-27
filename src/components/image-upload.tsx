"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { compressImage, fileToBase64 } from "@/lib/image-compression";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  className?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  className,
}: ImageUploadProps) {
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
    <div className={cn("space-y-2 sm:space-y-3", className)}>
      <label className="block text-sm sm:text-base font-medium text-white">
        {label}
      </label>
      <div className="relative">
        {value ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[rgba(100,200,255,0.4)] bg-[rgba(26,26,58,0.7)] backdrop-blur-md transition-all duration-300 hover:border-[rgba(100,200,255,0.6)]">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized={value.startsWith("data:")}
            />
            <button
              type="button"
              className="absolute right-2 top-2 h-11 w-11 sm:h-10 sm:w-10 flex items-center justify-center bg-red-600/80 hover:bg-red-700/80 text-white rounded-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] z-10"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <X className="h-5 w-5 sm:h-5 sm:w-5" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300",
              "border-[rgba(100,200,255,0.4)] bg-[rgba(26,26,58,0.6)]",
              "hover:border-[rgba(100,200,255,0.7)] hover:bg-[rgba(26,26,58,0.8)] hover:shadow-[0_0_20px_rgba(100,200,255,0.3)]",
              "focus-within:border-[rgba(100,200,255,0.8)] focus-within:ring-2 focus-within:ring-[rgba(100,200,255,0.3)]",
              "p-4 sm:p-6 md:p-8",
              isCompressing && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !isCompressing && fileInputRef.current?.click()}
          >
            {isCompressing ? (
              <>
                <Loader2 className="mb-3 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-[rgba(100,200,255,0.6)] animate-spin" />
                <p className="text-sm sm:text-base text-[#9ca3af] font-medium">
                  Compressing...
                </p>
              </>
            ) : (
              <>
                <Upload className="mb-3 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-[rgba(100,200,255,0.6)]" />
                <p className="text-sm sm:text-base text-[#9ca3af] font-medium">
                  Click to upload
                </p>
              </>
            )}
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
