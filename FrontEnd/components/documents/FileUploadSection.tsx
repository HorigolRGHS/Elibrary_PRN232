"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StorageService } from "@/services/storage/Storage";
import { useEffect } from "react";

interface FileUploadSectionProps {
  onFileUpload: (fileName: string) => void;
  disabled?: boolean;
  error?: string;
  shouldReset?: boolean;
}

export function FileUploadSection({
  onFileUpload,
  disabled = false,
  error,
  shouldReset = false,
}: FileUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset when shouldReset prop changes
  useEffect(() => {
    if (shouldReset) {
      setSelectedFile(null);
      setUploadProgress(0);
      setUploading(false);
    }
  }, [shouldReset]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    // Only accept PDF files
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 300);

      // Upload file
      const fileName = await StorageService.uploadFile(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success("File uploaded successfully!");

      // Call parent callback with the fileName
      onFileUpload(fileName);

      // Keep file state visible - don't reset after upload
      setUploading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      toast.error(errorMessage);
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold text-foreground">
        Upload Document File *
      </Label>

      {!selectedFile ? (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors p-8">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <p className="text-center text-foreground font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-center text-sm text-muted-foreground">
              PDF files only, max 50MB
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
            />
          </label>
        </Card>
      ) : (
        <Card className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-4">
          <div className="space-y-3">
            {/* File Preview */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {!uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                  <p className="text-sm font-medium text-foreground">
                    {Math.round(uploadProgress)}%
                  </p>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Button */}
            {!uploading && uploadProgress === 0 && (
              <Button
                type="button"
                onClick={handleUploadFile}
                disabled={disabled}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Upload File
              </Button>
            )}

            {/* Success State - File uploaded and ready to use */}
            {uploadProgress === 100 && !uploading && (
              <div className="flex items-center justify-between gap-2 bg-green-100/50 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-md p-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium text-sm">Ready to use</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>✗</span> {error}
        </p>
      )}
    </div>
  );
}
