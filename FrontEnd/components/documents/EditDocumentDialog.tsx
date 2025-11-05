"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, File, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DocumentUserResponseItemDTO } from "@/models/dtos/documentDTO";
import { DocumentService } from "@/services/document/Document";
import { useCategories } from "@/hooks/useCategories";
import { useSubjectsForSelect } from "@/hooks/useSubjectsForSelect";
import { StorageService } from "@/services/storage/Storage";

interface EditDocumentDialogProps {
  isOpen: boolean;
  document: DocumentUserResponseItemDTO | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditDocumentDialog({
  isOpen,
  document,
  onClose,
  onSuccess,
}: EditDocumentDialogProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { subjects, loading: subjectsLoading } = useSubjectsForSelect();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log("[EditDocumentDialog] Subjects state:", {
      subjects,
      subjectsCount: subjects.length,
      subjectsLoading,
      firstSubject: subjects[0],
    });
  }, [subjects, subjectsLoading]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    categoryId: 0,
    subjectId: 0,
  });

  useEffect(() => {
    // Reset form when dialog closes
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        fileUrl: "",
        categoryId: 0,
        subjectId: 0,
      });
      setErrors({});
      setSelectedFile(null);
      setUploadProgress(0);
      return;
    }

    // Populate form when dialog opens and document is available
    if (isOpen && document) {
      // Wait for categories and subjects to be loaded
      if (categoriesLoading || subjectsLoading) {
        return;
      }

      // Find matching category and subject
      const category = categories.find(
        (c) => c.CategoryName === document.categoryName
      );
      const subject = subjects.find(
        (s) => s.SubjectName === document.subjectName
      );

      console.log("[EditDocumentDialog] Populating form:", {
        document,
        categoryFound: category,
        subjectFound: subject,
        allCategories: categories,
        allSubjects: subjects,
      });

      setFormData({
        title: document.title || "",
        description: document.description || "",
        fileUrl: document.fileUrl || "",
        categoryId: category?.CategoryId || 0,
        subjectId: subject?.SubjectId || 0,
      });
      setErrors({});
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [
    isOpen,
    document,
    categories,
    subjects,
    categoriesLoading,
    subjectsLoading,
  ]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }

    if (formData.categoryId === 0) {
      newErrors.categoryId = "Category is required";
    }

    if (formData.subjectId === 0) {
      newErrors.subjectId = "Subject is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

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
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 300);

      const fileName = await StorageService.uploadFile(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success("File uploaded successfully!");
      setFormData((prev) => ({ ...prev, fileUrl: fileName }));
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (!validateForm() || !document) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      await DocumentService.updateDocument(document.documentId, {
        title: formData.title,
        description: formData.description || undefined,
        fileUrl: formData.fileUrl || undefined,
        categoryId: formData.categoryId,
        subjectId: formData.subjectId,
      });

      toast.success("Document updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update document";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col w-[95vw] sm:w-auto">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>Update document information</DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {(!document || categoriesLoading || subjectsLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading document data...</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        {document && !categoriesLoading && !subjectsLoading && (
          <>
            <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-2">
          {/* Title */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="font-semibold">
                Title *
              </Label>
              <span className="text-xs text-muted-foreground">
                {formData.title.length}/200
              </span>
            </div>
            <Input
              id="title"
              name="title"
              placeholder="Enter document title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={200}
              disabled={loading}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span>✗</span> {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="font-semibold">
                Description
              </Label>
              <span className="text-xs text-muted-foreground">
                {formData.description?.length || 0}/2000
              </span>
            </div>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter document description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={2000}
              disabled={loading}
              className={`min-h-24 resize-none ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span>✗</span> {errors.description}
              </p>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Document File</Label>

            {/* Current File Display */}
            {formData.fileUrl && !selectedFile && (
              <Card className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded flex-shrink-0">
                    <File className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-foreground break-all line-clamp-2"
                      title={formData.fileUrl}
                    >
                      {formData.fileUrl}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current file
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* File Upload Area */}
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
                    disabled={loading || uploading}
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
                        <p className="font-medium text-foreground break-all line-clamp-2">
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
                        <p className="text-sm text-muted-foreground">
                          Uploading...
                        </p>
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
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Upload File
                    </Button>
                  )}

                  {/* Success State */}
                  {uploadProgress === 100 && !uploading && (
                    <div className="flex items-center justify-between gap-2 bg-green-100/50 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-md p-3">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <p className="font-medium text-sm">Ready to use</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Category & Subject */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-3">
              <Label htmlFor="categoryId" className="font-semibold">
                Category *
              </Label>
              <Select
                value={formData.categoryId?.toString() || ""}
                onValueChange={(value) =>
                  handleSelectChange("categoryId", value)
                }
                disabled={
                  loading || categoriesLoading || categories.length === 0
                }
              >
                <SelectTrigger
                  className={errors.categoryId ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      categoriesLoading ? "Loading..." : "Select a category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 && !categoriesLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No categories available
                    </div>
                  ) : (
                    categories
                      .filter((cat) => cat.CategoryId && cat.CategoryName)
                      .map((cat) => (
                        <SelectItem
                          key={cat.CategoryId}
                          value={cat.CategoryId?.toString() || ""}
                        >
                          {cat.CategoryName}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span>✗</span> {errors.categoryId}
                </p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-3">
              <Label htmlFor="subjectId" className="font-semibold">
                Subject *
              </Label>
              <Select
                value={formData.subjectId?.toString() || ""}
                onValueChange={(value) =>
                  handleSelectChange("subjectId", value)
                }
                disabled={loading || subjectsLoading || subjects.length === 0}
              >
                <SelectTrigger
                  className={errors.subjectId ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      subjectsLoading ? "Loading..." : "Select a subject"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 && !subjectsLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No subjects available
                    </div>
                  ) : (
                    subjects
                      .filter((sub) => sub.SubjectId && sub.SubjectName)
                      .map((sub) => (
                        <SelectItem
                          key={sub.SubjectId}
                          value={sub.SubjectId?.toString() || ""}
                        >
                          {sub.SubjectName}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.subjectId && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span>✗</span> {errors.subjectId}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
