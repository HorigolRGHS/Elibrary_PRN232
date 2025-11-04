"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectSelect } from "@/models/dtos/subjectDTO";
import { SubjectService } from "@/services/subject/Subject";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import Badge from "@/components/ui/badge";
import Herosection from "@/components/layout/herosection";

export default function Home() {
  const [subjects, setSubjects] = useState<SubjectSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await SubjectService.getSelectSubjects();
        setSubjects(data);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleNavigateToSubject = (subjectId: number) => {
    router.push(`/subject/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full-width layout with hero section */}
      <div className="font-sans min-h-screen w-full">
        <Herosection />
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Browse Subjects</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card
            key={subject.subjectId}
            className="group hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            onClick={() => handleNavigateToSubject(subject.subjectId)}
          >
            <div className="relative h-48">
              <Image
                src={subject.imageUrl || "/placeholder.png"}
                alt={subject.subjectName}
                fill
                className="object-cover rounded-t-lg"
              />
              <div className="absolute bottom-2 right-2 pointer-events-none">
                <Badge
                  className="bg-blue-600 text-white text-xs md:text-sm px-3 py-1 shadow-md flex items-center gap-1 rounded-full"
                >
                  <FileText className="h-4 w-4" />
                  <span>{subject.documents?.length || 0} docs</span>
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="group-hover:text-blue-600 transition-colors">
                {subject.subjectName}
              </CardTitle>
            </CardHeader>
            {subject.description && (
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {subject.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
