"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileImage, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  bucket: "flex-posters" | "flex-backdrops" | "flex-people" | "flex-trailers";
  mediaType: "poster" | "backdrop" | "photo" | "trailer";
  contentKind: "movie" | "series" | "person";
  contentId: string;
  onUploadSuccess?: (record: Record<string, unknown>, signedUrl: string) => void;
  aspectRatio?: "poster" | "backdrop" | "square";
}

export function ImageUploader({
  bucket,
  mediaType,
  contentKind,
  contentId,
  onUploadSuccess,
  aspectRatio = "poster",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const aspectClass =
    aspectRatio === "poster"
      ? "aspect-[2/3]"
      : aspectRatio === "backdrop"
      ? "aspect-[16/9]"
      : "aspect-square";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
      setSuccessMessage(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("bucket", bucket);
      formData.append("mediaType", mediaType);
      formData.append("contentKind", contentKind);
      formData.append("contentId", contentId);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setSuccessMessage("File uploaded successfully!");
      if (onUploadSuccess) {
        onUploadSuccess(result.record, result.signedUrl);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload error";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Aspect ratio preview dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative w-full max-w-sm mx-auto rounded-xl border-2 border-dashed border-border-muted bg-surface-base hover:bg-surface-raised cursor-pointer flex flex-col items-center justify-center p-4 transition-all overflow-hidden group",
          aspectClass
        )}
      >
        {previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewUrl}
            alt="Upload Preview"
            className="absolute inset-0 h-full w-full object-cover group-hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-2 p-4">
            <div className="h-12 w-12 rounded-full bg-surface-overlay flex items-center justify-center text-text-muted group-hover:text-red-500 transition-colors">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Click or drag file to upload</p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {mediaType === "trailer" ? "MP4 or WebM (Max 500MB)" : "JPEG, PNG or WEBP (Max 8MB)"}
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={mediaType === "trailer" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-border text-xs">
          <div className="flex items-center gap-2 truncate">
            <FileImage className="h-4 w-4 text-red-500 shrink-0" />
            <span className="truncate text-white font-medium">{selectedFile.name}</span>
            <span className="text-text-muted">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
          </div>

          <Button
            size="sm"
            variant="cinematic"
            onClick={handleUpload}
            disabled={isUploading}
            className="gap-1 shrink-0"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Confirm Upload</span>
            )}
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
