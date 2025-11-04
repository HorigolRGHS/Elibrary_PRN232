"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectService } from "@/services/subject/Subject";
import { SubjectDetailDTO } from "@/models/dtos/subjectDTO";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { FolderOpen, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: number;
}

export default function ViewSubjectSheet({
  open,
  onOpenChange,
  subjectId,
}: Props) {
  const [subject, setSubject] = useState<SubjectDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open || !subjectId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await SubjectService.getSubjectById(subjectId);
        setSubject(data);
      } catch {
        toast.error("Failed to load subject details");
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subjectId, open]);

  const handleDocumentClick = (id: number) => {
    onOpenChange(false); // Đóng sheet trước
    router.push(`/document/${id}`); // Chuyển sang trang document chi tiết
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[520px] overflow-y-auto p-0"
      >
        {/* Header */}
        <SheetHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
          <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
            Subject Details
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : subject ? (
            <>
              {/* 🧾 Subject Name */}
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  {subject.subjectName}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FolderOpen className="w-4 h-4" />
                  <span>ID: {subject.subjectId}</span>
                </div>
              </div>

              {/* 🖼️ Image Section */}
              {subject.imageUrl && (
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setZoomed(true)}
                >
                  <div className="relative w-full h-56 rounded-lg overflow-hidden border shadow-sm">
                    <Image
                      src={subject.imageUrl}
                      alt={subject.subjectName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Click image to zoom
                  </p>
                </div>
              )}

              {/* 🗒️ Description */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm text-muted-foreground bg-secondary/20 rounded-lg p-3 leading-relaxed whitespace-pre-line">
                  {subject.description || "No description available."}
                </p>
              </div>

              <Separator />

              {/* 📅 Dates */}
              <div className="bg-secondary/10 rounded-lg p-4 border space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" /> Timeline
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>
                    {new Date(subject.createdDate).toLocaleDateString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>
                    {subject.updatedDate
                      ? new Date(subject.updatedDate).toLocaleDateString(
                          "en-US"
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>

              <Separator />

              {/* 📚 Documents */}
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Documents ({subject.documents.length})
                </h3>
                {subject.documents.length > 0 ? (
                  <ul className="grid gap-2">
                    {subject.documents.map((doc) => (
                      <li
                        key={doc.documentId}
                        className="px-3 py-2 rounded-md border bg-secondary/5 hover:bg-secondary/20 hover:cursor-pointer transition flex justify-between items-center text-sm"
                        onClick={() => handleDocumentClick(doc.documentId)}
                      >
                        <span className="truncate max-w-[240px]">
                          {doc.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No related documents.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              Failed to load subject details.
            </p>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="border-t bg-secondary/5 p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>

        {/* 🔍 Zoom Modal */}
        {zoomed && subject?.imageUrl && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setZoomed(false)}
          >
            <div className="relative max-w-3xl max-h-[80vh]">
              <Image
                src={subject.imageUrl}
                alt={subject.subjectName}
                width={800}
                height={600}
                className="rounded-lg shadow-lg object-contain"
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
