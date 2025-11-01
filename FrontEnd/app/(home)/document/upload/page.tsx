"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Upload, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { DocumentService } from "@/services/document/Document";
import { CreateDocumentRequest } from "@/models/dtos/documentDTO";
import { FileUploadSection } from "@/components/documents/FileUploadSection";
import { useCategories } from "@/hooks/useCategories";
import { useSubjects } from "@/hooks/useSubjects";

export default function DocumentUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories();
  const { subjects } = useSubjects();

  const [formData, setFormData] = useState<CreateDocumentRequest>({
    title: "",
    description: "",
    fileUrl: "",
    categoryId: 0,
    subjectId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
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

    if (!formData.fileUrl.trim()) {
      newErrors.fileUrl = "File is required";
    } else if (formData.fileUrl.length > 500) {
      newErrors.fileUrl = "File name cannot exceed 500 characters";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "Subject is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (fileName: string) => {
    setFormData((prev) => ({
      ...prev,
      fileUrl: fileName,
    }));
    if (errors.fileUrl) {
      setErrors((prev) => ({
        ...prev,
        fileUrl: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const response = await DocumentService.createDocument(formData);
      toast.success(`Document created successfully!`);

      // Clean form after successful submission
      setFormData({
        title: "",
        description: "",
        fileUrl: "",
        categoryId: 0,
        subjectId: 0,
      });
      setErrors({});

      // Redirect after success
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create document";
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
    // Clear error for this field
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
      [name]:
        name === "categoryId" || name === "subjectId" ? parseInt(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              Upload Document
            </h1>
            <p className="text-muted-foreground mt-2">
              Share your knowledge with the community
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/2 border-b">
            <CardTitle>Document Information</CardTitle>
            <CardDescription>
              Provide complete details about your document
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="title"
                    className="text-base font-semibold text-foreground"
                  >
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
                  className={`h-12 text-base ${
                    errors.title
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>✗</span> {errors.title}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="description"
                    className="text-base font-semibold text-foreground"
                  >
                    Description
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.description?.length || 0}/2000
                  </span>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your document (optional)"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  maxLength={2000}
                  disabled={loading}
                  className={`min-h-32 text-base resize-none ${
                    errors.description
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>✗</span> {errors.description}
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              {/* File Upload Section */}
              <FileUploadSection
                onFileUpload={handleFileUpload}
                disabled={loading}
                error={errors.fileUrl}
                shouldReset={formData.fileUrl === "" && !loading}
              />

              <Separator className="my-4" />

              {/* Classification Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category Select */}
                <div className="space-y-3">
                  <Label
                    htmlFor="categoryId"
                    className="text-base font-semibold text-foreground"
                  >
                    Category *
                  </Label>
                  <Select
                    value={formData.categoryId?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("categoryId", value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger
                      id="categoryId"
                      className={`h-12 text-base ${
                        errors.categoryId
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.categoryId}
                          value={cat.categoryId.toString()}
                        >
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>✗</span> {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Subject Select */}
                <div className="space-y-3">
                  <Label
                    htmlFor="subjectId"
                    className="text-base font-semibold text-foreground"
                  >
                    Subject *
                  </Label>
                  <Select
                    value={formData.subjectId?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("subjectId", value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger
                      id="subjectId"
                      className={`h-12 text-base ${
                        errors.subjectId
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem
                          key={sub.subjectId}
                          value={sub.subjectId.toString()}
                        >
                          {sub.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subjectId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>✗</span> {errors.subjectId}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-8 h-11 text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-11 text-base gap-2 bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Document
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300 flex items-start gap-3">
              <span className="text-lg">ℹ️</span>
              <span>
                <strong>Tip:</strong> Make sure your document is publicly
                accessible and the URL is correct. Your document will be
                reviewed before appearing in the library.
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
