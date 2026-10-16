"use client";

import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  className?: string;
  label?: string;
  helperText?: string;
}

/**
 * Generic Image Upload component for any form
 * Can be used in seller dashboard or any non-react-admin form
 */
export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  folder = "uploads",
  className,
  label,
  helperText,
}: ImageUploadProps) {
  const fileInputId = useId();
  const [uploading, setUploading] = useState(false);

  // Normalize value to array
  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files
    if (multiple && images.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const newImages = multiple ? [...images, ...data.urls] : data.urls;
      onChange(multiple ? newImages : newImages[0]);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages.length > 0 ? (multiple ? newImages : newImages[0]) : null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="size-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            {multiple ? "No images uploaded" : "No image uploaded"}
          </p>
        </div>
      )}

      {/* Upload Button */}
      {(multiple || images.length === 0) && (
        <div>
          <input
            type="file"
            id={fileInputId}
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="w-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const input = document.getElementById(fileInputId) as HTMLInputElement;
              input?.click();
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="size-4 mr-2" />
                {images.length > 0 ? "Add More Images" : "Upload Images"}
              </>
            )}
          </Button>
          {helperText && (
            <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
          )}
          {multiple && !helperText && (
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxFiles} images (JPEG, PNG, WebP, GIF - up to 5MB each)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
