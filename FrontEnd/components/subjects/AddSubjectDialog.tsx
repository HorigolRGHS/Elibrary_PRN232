"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadSection } from "@/components/subjects/ImageUploadSection";
import { SubjectService } from "@/services/subject/Subject";
import { SubjectCreateDTO } from "@/models/dtos/subjectDTO";
import { toast } from "react-toastify";
// FIX: Import service upload ảnh và icon loading
import { uploadToImageKit } from "@/services/Common/fileService";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export default function AddSubjectDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  
  // FIX: Thêm state để quản lý file ảnh được chọn
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  
  // Reset form khi dialog đóng
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setNewImageFile(null);
    }
  }, [open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.warn("Please enter subject name");
      return;
    }

    setSaving(true);
    let finalImageUrl: string | undefined = undefined;

    try {
      // FIX: Chỉ upload khi có file được chọn
      if (newImageFile) {
        try {
          toast.info("Uploading image...");
          finalImageUrl = await uploadToImageKit(newImageFile);
        } catch (uploadError) {
          throw new Error("Image upload failed. Please try again.");
        }
      }
      
      const payload: SubjectCreateDTO = {
        subjectName: name,
        imageUrl: finalImageUrl,
        description,
      };

      await SubjectService.createSubject(payload);
      toast.success("Subject created successfully!");
      onCreated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create subject");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add New Subject
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subject name"
              required
            />
          </div>
          {/* Image */}
          <div>
            <ImageUploadSection
              // Không có ảnh ban đầu
              initialImageUrl={null}
              // Cập nhật state file mới
              onFileChange={(file) => setNewImageFile(file)}
              shouldReset={!open}
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Enter subject description..."
              className="resize-none"
            />
          </div>
          {/* Footer */}
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}