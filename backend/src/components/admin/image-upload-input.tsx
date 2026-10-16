"use client";

import { useState, useId } from "react";
import { useInput, useResourceContext, FieldTitle } from "ra-core";
import type { InputProps } from "ra-core";
import { FormControl, FormField, FormLabel, FormError } from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadInputProps extends InputProps {
  source: string;
  label?: string | false;
  helperText?: string;
  multiple?: boolean;
  folder?: string;
  maxFiles?: number;
  className?: string;
}

/**
 * Image Upload Input for react-admin forms
 * Uploads images to S3 and stores URLs in the form
 */
export const ImageUploadInput = (props: ImageUploadInputProps) => {
  const {
    source,
    label,
    helperText,
    multiple = false,
    folder = "uploads",
    maxFiles = 5,
    className,
  } = props;

  const fileInputId = useId();
  const resource = useResourceContext(props);
  const { field, id, isRequired } = useInput({
    source,
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(() => {
    const value = field.value;
    if (!value) return [];
    
    // Handle JSON string (for products)
    if (typeof value === "string" && value.startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    
    // Handle array
    if (Array.isArray(value)) return value;
    
    // Handle single URL
    return value ? [value] : [];
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files
    if (multiple && previewUrls.length + files.length > maxFiles) {
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

      const newUrls = multiple ? [...previewUrls, ...data.urls] : data.urls;
      setPreviewUrls(newUrls);

      // Update form value
      if (multiple) {
        field.onChange(JSON.stringify(newUrls));
      } else {
        field.onChange(newUrls[0]);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);

    // Update form value
    if (multiple) {
      field.onChange(newUrls.length > 0 ? JSON.stringify(newUrls) : null);
    } else {
      field.onChange(null);
    }
  };

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        <div className={cn("space-y-3")}>
          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
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

          {/* Upload Button */}
          {(multiple || previewUrls.length === 0) && (
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
                    {previewUrls.length > 0
                      ? "Add More Images"
                      : "Upload Images"}
                  </>
                )}
              </Button>
              {multiple && (
                <p className="text-xs text-muted-foreground mt-1">
                  Max {maxFiles} images (JPEG, PNG, WebP, GIF - up to 5MB each)
                </p>
              )}
            </div>
          )}

          {/* Hidden input for form value */}
          <input type="hidden" {...field} />
        </div>
      </FormControl>
      {helperText && <InputHelperText helperText={helperText} />}
      <FormError />
    </FormField>
  );
};
