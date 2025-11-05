"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { camelSubjectDetailDTO, SubjectSelect } from "@/models/dtos/subjectDTO";
import { SubjectService } from "@/services/subject/Subject";
import { CategoryService } from "@/services/category/Category";
import { CategorySelect } from "@/models/dtos/categoryDTO";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FileText, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const [subject, setSubject] = useState<SubjectSelect | null>(null);
  const [categories, setCategories] = useState<CategorySelect[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const id = parseInt(params.id as string);
        if (isNaN(id)) {
          router.push('/404');
          return;
        }
        
        // Fetch subject and categories in parallel
        const [subjectData, categoriesData] = await Promise.all([
          SubjectService.getSubjectById(id),
          CategoryService.getSelectCategories()
        ]);
        
        setSubject(subjectData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-4" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600">Subject not found</h1>
      </div>
    );
  }

  console.log("Subject Page render:", subject);

  return (
    <div className="container mx-auto p-8">
      <div className="grid gap-8">
        {/* Subject Header */}
        <Card>
          <div className="relative h-96 w-full">
            <Image
              src={subject.imageUrl || "/placeholder.png"}
              alt={subject.subjectName}
              fill
              className="object-contain rounded-t-lg bg-gray-100"
            />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">{subject.subjectName}</CardTitle>
          </CardHeader>
          {subject.description && (
            <CardContent>
              <p className="text-gray-600">{subject.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Documents List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subject.documents?.map((doc) => (
              <Card
                key={doc.documentId}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/document/${doc.documentId}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          {(!subject.documents || subject.documents.length === 0) && (
            <p className="text-center text-gray-500 py-8">
              No documents available for this subject
            </p>
          )}
        </div>
      </div>
    </div>
  );
}