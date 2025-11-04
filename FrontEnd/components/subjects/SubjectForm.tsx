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
import {
  SubjectDetailDTO,
  SubjectCreateDTO,
  SubjectUpdateDTO,
} from "@/models/dtos/subjectDTO";
import { SubjectService } from "@/services/subject/Subject";
import { toast } from "react-toastify";
import { ImageUploadSection } from "@/components/subjects/ImageUploadSection";
// FIX: Import service upload ảnh của bạn
import { uploadToImageKit } from "@/services/Common/fileService"; 
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SubjectDetailDTO | null;
  onSaved?: () => void;
}

export default function SubjectForm({
  open,
  onOpenChange,
  initial,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  
  // FIX: Tách state cho imageUrl hiện tại và file ảnh mới
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.subjectName ?? "");
      setDescription(initial.description ?? "");
      setCurrentImageUrl(initial.imageUrl ?? null);
    } else {
      // Reset cho form tạo mới
      setName("");
      setDescription("");
      setCurrentImageUrl(null);
    }
    // Reset file đã chọn mỗi khi dialog mở/đóng hoặc đổi subject
    setNewImageFile(null);
  }, [initial, open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
        toast.warn("Subject name is required.");
        return;
    }
    setSaving(true);
    
    // Mặc định dùng ảnh cũ
    let finalImageUrl = currentImageUrl;

    try {
      // FIX: Chỉ upload khi có file mới được chọn
      if (newImageFile) {
        try {
          toast.info("Uploading image...");
          finalImageUrl = await uploadToImageKit(newImageFile);
        } catch (uploadError) {
          throw new Error("Image upload failed. Please try again.");
        }
      }

      const payload = {
        subjectName: name,
        imageUrl: finalImageUrl || undefined, // Gửi undefined nếu không có ảnh
        description: description,
      };

      if (initial && initial.subjectId) {
        await SubjectService.updateSubject(initial.subjectId, payload as SubjectUpdateDTO);
        toast.success("Subject updated successfully!");
      } else {
        await SubjectService.createSubject(payload as SubjectCreateDTO);
        toast.success("Subject created successfully!");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {initial ? "Edit Subject" : "Create Subject"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {/* 🏷️ Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* 🖼️ Image */}
          <div>
            <ImageUploadSection
              // FIX: Truyền URL hiện tại vào
              initialImageUrl={currentImageUrl}
              // FIX: Cập nhật state file mới khi người dùng chọn
              onFileChange={(file) => setNewImageFile(file)}
              shouldReset={!open}
            />
          </div>

          {/* 📝 Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* 🔘 Footer */}
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
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}