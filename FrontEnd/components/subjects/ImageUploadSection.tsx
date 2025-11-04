"use client";

import { useState, useEffect } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface ImageUploadSectionProps {
  initialImageUrl?: string | null;
  // FIX: Prop mới sẽ trả về File object hoặc null
  onFileChange: (file: File | null) => void; 
  shouldReset?: boolean;
}

export function ImageUploadSection({
  initialImageUrl,
  onFileChange,
  shouldReset = false,
}: ImageUploadSectionProps) {
  // State này chỉ dùng để hiển thị preview cho người dùng
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Set preview từ URL ban đầu
  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  // Reset khi form đóng/mở
  useEffect(() => {
    if (shouldReset) {
      setPreviewUrl(null);
      onFileChange(null);
    }
  }, [shouldReset]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Các bước kiểm tra file giữ nguyên
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    // Tạo preview URL cục bộ
    setPreviewUrl(URL.createObjectURL(file));
    // FIX: Gửi File object về cho component cha
    onFileChange(file);
  };

  const handleRemoveFile = () => {
    setPreviewUrl(null);
    // FIX: Báo cho cha biết file đã bị xóa
    onFileChange(null); 
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Image</Label>
      {!previewUrl ? (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 p-6 transition-colors">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-10 w-10 text-muted-foreground/60 mb-2" />
            <p className="text-center text-foreground font-medium">
              Click to upload image
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Max 10MB
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </Card>
      ) : (
        <Card className="p-4 border space-y-3">
          <div className="relative w-full h-48">
             <Image
              src={previewUrl}
              alt="Preview"
              layout="fill"
              objectFit="contain"
              className="rounded-md"
            />
          </div>
          <div className="flex items-center justify-between gap-2 bg-green-100/50 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-md p-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium text-sm">Image selected</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}