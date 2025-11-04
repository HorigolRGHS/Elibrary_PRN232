"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SubjectResponseDTO } from "@/models/dtos/subjectDTO";
import { SubjectService } from "@/services/subject/Subject";
import { useDebounce } from "@/hooks/useDebounce";
import { SubjectTableParams, FilterState } from "@/app/(dashboard)/dashboard/subjects/types";

export function useSubjects() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<SubjectResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [params, setParams] = useState<SubjectTableParams>(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortField = searchParams.get("sortField") || "subjectId"; // Default sort field
    const sortDirection = searchParams.get("sortDirection") as "asc" | "desc" | null || "desc"; // Default direction

    const filters: FilterState = {};
    const subjectName = searchParams.get("subjectName");
    if (subjectName) filters.subjectName = subjectName;

    return {
      page,
      pageSize,
      sort: { field: sortField, direction: sortDirection },
      filters,
    };
  });

  const debouncedFilters = useDebounce(params.filters, 800);

  const updateURL = useCallback((newParams: SubjectTableParams) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", newParams.page.toString());
    queryParams.set("pageSize", newParams.pageSize.toString());
    if (newParams.sort.field) queryParams.set("sortField", newParams.sort.field);
    if (newParams.sort.direction) queryParams.set("sortDirection", newParams.sort.direction);
    if (newParams.filters.subjectName) queryParams.set("subjectName", newParams.filters.subjectName);

    router.replace(`?${queryParams.toString()}`, { scroll: false });
  }, [router]);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build filter string for OData
      const filterConditions: string[] = [];
      if (debouncedFilters.subjectName) {
        filterConditions.push(
          `contains(SubjectName, '${debouncedFilters.subjectName.replace(/'/g, "''")}')`
        );
      }

      // Build orderby string for OData
      const orderBy = params.sort.field && params.sort.direction 
        ? `${params.sort.field} ${params.sort.direction}`
        : undefined;

      const response = await SubjectService.getSubjectList({
        skip: (params.page - 1) * params.pageSize,
        top: params.pageSize,
        count: true,
        filter: filterConditions.length > 0 ? filterConditions.join(" and ") : undefined,
        orderBy,
      });

      setData(response.items);
      setTotalCount(response.totalCount);
      setTotalPages(Math.ceil(response.totalCount / params.pageSize));
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError(err instanceof Error ? err.message : "Failed to load subjects");
      setData([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.pageSize, params.sort, debouncedFilters]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Rest of the handlers remain the same
  const handleSortChange = (field: string) => {
    const newDirection =
      params.sort.field === field
        ? params.sort.direction === "asc"
          ? "desc"
          : params.sort.direction === "desc"
          ? null
          : "asc"
        : "asc";

    const newParams: SubjectTableParams = {
      ...params,
      page: 1,
      sort: { field: newDirection ? field : "", direction: newDirection },
    };

    setParams(newParams);
    updateURL(newParams);
  };

  // ...existing handlers (handleFilterChange, handlePageChange, etc.)...

  return {
    subjects: data,
    loading,
    error,
    totalCount,
    totalPages,
    params,
    handleSortChange,
    handleFilterChange: (filters: FilterState) => {
      const newParams = { ...params, page: 1, filters };
      setParams(newParams);
      updateURL(newParams);
    },
    handlePageChange: (page: number) => {
      const newParams = { ...params, page };
      setParams(newParams);
      updateURL(newParams);
    },
    handlePageSizeChange: (pageSize: number) => {
      const newParams = { ...params, page: 1, pageSize };
      setParams(newParams);
      updateURL(newParams);
    },
    handleClearFilters: () => {
      const newParams = { ...params, page: 1, filters: {} };
      setParams(newParams);
      updateURL(newParams);
    },
    refetch: () => fetchSubjects(),
  };
}