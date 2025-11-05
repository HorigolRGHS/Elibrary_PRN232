"use client";

import { useState, useEffect } from "react";
import { SubjectService } from "@/services/subject/Subject";
import { SubjectResponseDTO } from "@/models/dtos/subjectDTO";

export function useSubjectsForSelect() {
  const [subjects, setSubjects] = useState<SubjectResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await SubjectService.getSubjectList({
          top: 1000,
          count: false,
          orderBy: "subjectName asc",
        });
        
        const subjectsData = response.items || [];
        
        console.log("Fetched subjects response:", response);
        console.log("Fetched subjects items:", subjectsData);
        console.log("Subjects count:", subjectsData.length);
        
        if (subjectsData.length > 0) {
          console.log("First subject:", subjectsData[0]);
        }
        
        setSubjects(subjectsData);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError(err instanceof Error ? err.message : "Failed to load subjects");
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
  };
}

