/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from "react";
import { Upload, X, FileVideo, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MediaContentType, MediaFolder, MediaFileRecord, AccessStrategy } from "@/types/media";
import { validateMediaUpload } from "@/lib/media/validation";

interface MediaUploadZoneProps {
  onUploadSuccess?: (record: MediaFileRecord, url: string) => void;
  defaultFolder?: MediaFolder;
  defaultContentType?: MediaContentType;
  compact?: boolean;
}

export function MediaUploadZone({
  onUploadSuccess,
  defaultFolder = "system",
  defaultContentType = "asset",
  compact = false,
}: MediaUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({});
  
  const [folder, setFolder] = useState<MediaFolder>(defaultFolder);
  const [contentType, setContentType] = useState<MediaContentType>(defaultContentType);
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [accessStrategy, setAccessStrategy] = useState<AccessStrategy>("public");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<{ record: MediaFileRecord; url: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setErrorMsg(null);
    setSuccessRecord(null);

    // Extract image dimensions if image
    if (selectedFile.type.startsWith("image/")) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(selectedFile);
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = objectUrl;
      setPreviewUrl(objectUrl);
    } else if (selectedFile.type.startsWith("video/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setDimensions({});
    } else {
      setPreviewUrl(null);
      setDimensions({});
    }

    const validation = validateMediaUpload({
      originalName: selectedFile.name,
      mimeType: selectedFile.type,
      sizeBytes: selectedFile.size,
      folder,
      contentType,
    });

    if (!validation.valid) {
      setErrorMsg(validation.error || "File validation failed");
      toast.error(validation.error || "File validation failed");
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setDimensions({});
    setTitle("");
    setAltText("");
    setErrorMsg(null);
    setSuccessRecord(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(15);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("contentType", contentType);
      formData.append("accessStrategy", accessStrategy);
      if (title) formData.append("title", title);
      if (altText) formData.append("altText", altText);
      if (dimensions.width) formData.append("width", dimensions.width.toString());
      if (dimensions.height) formData.append("height", dimensions.height.toString());

      setProgress(45);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      setProgress(85);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setSuccessRecord({ record: data.record, url: data.url });
      toast.success("Media file uploaded successfully!");

      if (onUploadSuccess) {
        onUploadSuccess(data.record, data.url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Success View */}
      {successRecord ? (
        <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-zinc-100 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-lg">Upload Complete</h4>
              <p className="text-sm text-zinc-400">{successRecord.record.original_name}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
            {successRecord.record.mime_type.startsWith("image/") ? (
              <img
                src={successRecord.url}
                alt={successRecord.record.title || "Preview"}
                className="w-16 h-16 object-cover rounded border border-zinc-700"
              />
            ) : (
              <div className="w-16 h-16 bg-zinc-800 rounded flex items-center justify-center">
                <FileVideo className="w-8 h-8 text-amber-400" />
              </div>
            )}

            <div className="text-xs space-y-1 text-zinc-300 overflow-hidden">
              <p className="font-medium text-amber-300 truncate">{successRecord.record.title || "Untitled"}</p>
              <p>Type: <span className="text-zinc-400">{successRecord.record.content_type}</span> | Folder: <span className="text-zinc-400">{successRecord.record.folder}</span></p>
              <p>Size: <span className="text-zinc-400">{(successRecord.record.size_bytes / (1024 * 1024)).toFixed(2)} MB</span></p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetForm} variant="outline" size="sm" className="border-zinc-700 text-zinc-200">
              Upload Another
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-amber-400 bg-amber-500/10 scale-[0.99]"
                : file
                ? "border-zinc-700 bg-zinc-900/80"
                : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-600 hover:bg-zinc-900/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              accept="image/*,video/mp4,video/webm,text/vtt,.srt"
            />

            {file ? (
              <div className="flex flex-col items-center gap-3">
                {previewUrl && file.type.startsWith("image/") ? (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Upload Preview"
                      className="max-h-40 rounded-lg object-contain border border-zinc-700 shadow-md"
                    />
                    {dimensions.width && (
                      <span className="absolute bottom-2 right-2 bg-zinc-950/80 px-2 py-0.5 rounded text-[10px] text-zinc-300 border border-zinc-800">
                        {dimensions.width} &times; {dimensions.height}
                      </span>
                    )}
                  </div>
                ) : previewUrl && file.type.startsWith("video/") ? (
                  <video src={previewUrl} className="max-h-40 rounded-lg border border-zinc-700" controls />
                ) : (
                  <div className="p-4 bg-zinc-900 rounded-full border border-zinc-800">
                    <FileText className="w-8 h-8 text-amber-400" />
                  </div>
                )}

                <div>
                  <p className="font-semibold text-zinc-200 text-sm">{file.name}</p>
                  <p className="text-xs text-zinc-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; {file.type || "Unknown format"}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                  className="text-zinc-400 hover:text-red-400"
                >
                  <X className="w-4 h-4 mr-1" /> Change file
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    <span className="text-amber-400 font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Images (JPG, PNG, WebP, SVG, GIF up to 10MB) &bull; Videos (MP4, WebM up to 500MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Options when file is selected */}
          {file && !compact && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-zinc-300">Asset Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inception Official Poster"
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Folder / Category</label>
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value as MediaFolder)}
                  className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="movie">Movie</option>
                  <option value="series">TV Series</option>
                  <option value="people">People / Cast</option>
                  <option value="advertisements">Advertisements</option>
                  <option value="system">System / Branding</option>
                  <option value="users">Users / Avatars</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Media Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as MediaContentType)}
                  className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="poster">Poster</option>
                  <option value="backdrop">Backdrop</option>
                  <option value="banner">Banner</option>
                  <option value="thumbnail">Thumbnail</option>
                  <option value="profile">Profile</option>
                  <option value="logo">Logo</option>
                  <option value="trailer">Trailer (Video)</option>
                  <option value="ad_creative">Ad Creative</option>
                  <option value="promo">Promotional</option>
                  <option value="asset">Generic Asset</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-zinc-300">Alt Text (SEO & Accessibility)</label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe image for screen readers"
                  className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs"
                />
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Uploading asset...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {file && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={uploading}
                className="border-zinc-800 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !!errorMsg}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Upload Asset
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
