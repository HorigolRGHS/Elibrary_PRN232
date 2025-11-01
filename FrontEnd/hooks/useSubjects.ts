import { useState, useEffect } from "react";
import { SubjectSelect } from "@/models/dtos/subjectDTO";
import { SubjectService } from "@/services/subject/Subject";

export function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SubjectService.getSelectSubjects();
        setSubjects(data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch subjects";
        setError(errorMessage);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return { subjects, loading, error };
}
