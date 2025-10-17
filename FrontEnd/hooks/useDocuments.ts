import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DocumentStaffResponseListDTO } from "@/models/dtos/documentDTO";
import { DocumentTableParams, FilterState } from "../app/(dashboard)/dashboard/documents/types";
import { useDebounce } from "@/hooks/useDebounce";
import { DocumentService } from "@/services/document/Document";

export function useDocuments() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<DocumentStaffResponseListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Initialize params from URL
  const [params, setParams] = useState<DocumentTableParams>(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortField = searchParams.get("sortField");
    const sortDirection = searchParams.get("sortDirection") as "asc" | "desc" | null;

    const filters: FilterState = {};
    const title = searchParams.get("title");
    const categoryName = searchParams.get("categoryName");
    const subjectName = searchParams.get("subjectName");
    const status = searchParams.get("status");

    if (title) filters.title = title;
    if (categoryName) filters.categoryName = categoryName;
    if (subjectName) filters.subjectName = subjectName;
    if (status) filters.status = status;

    return {
      page,
      pageSize,
      sort: { field: sortField, direction: sortDirection },
      filters,
    };
  });

  // Debounce filters to avoid calling API on every keystroke
  // Only fetch after user stops typing for 1.5 seconds
  const debouncedFilters = useDebounce(params.filters, 1500);

  // Update URL when params change
  const updateURL = useCallback((newParams: DocumentTableParams) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", newParams.page.toString());
    queryParams.set("pageSize", newParams.pageSize.toString());

    if (newParams.sort.field) {
      queryParams.set("sortField", newParams.sort.field);
    }
    if (newParams.sort.direction) {
      queryParams.set("sortDirection", newParams.sort.direction);
    }

    if (newParams.filters.title) queryParams.set("title", newParams.filters.title);
    if (newParams.filters.categoryName) queryParams.set("categoryName", newParams.filters.categoryName);
    if (newParams.filters.subjectName) queryParams.set("subjectName", newParams.filters.subjectName);
    if (newParams.filters.status) queryParams.set("status", newParams.filters.status);

    router.push(`?${queryParams.toString()}`, { scroll: false });
  }, [router]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter object for OData
      const filterConditions: string[] = [];
      
      if (debouncedFilters.title) {
        filterConditions.push(`contains(tolower(Title), '${debouncedFilters.title.toLowerCase()}')`);
      }
      if (debouncedFilters.categoryName) {
        filterConditions.push(`contains(tolower(CategoryName), '${debouncedFilters.categoryName.toLowerCase()}')`);
      }
      if (debouncedFilters.subjectName) {
        filterConditions.push(`contains(tolower(SubjectName), '${debouncedFilters.subjectName.toLowerCase()}')`);
      }
      if (debouncedFilters.status) {
        filterConditions.push(`contains(tolower(Status), '${debouncedFilters.status.toLowerCase()}')`);
      }

      // Build orderBy for OData
      let orderBy: string | undefined;
      if (params.sort.field && params.sort.direction) {
        // Convert camelCase to PascalCase for OData
        const fieldName = params.sort.field.charAt(0).toUpperCase() + params.sort.field.slice(1);
        orderBy = `${fieldName} ${params.sort.direction}`;
      }

      const result = await DocumentService.getAdminDocumentList({
        skip: (params.page - 1) * params.pageSize,
        top: params.pageSize,
        count: true,
        filter: filterConditions.length > 0 ? filterConditions.join(' and ') : undefined,
        orderBy,
      });

      setData(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(Math.ceil(result.totalCount / params.pageSize));
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [params.page, params.pageSize, params.sort, debouncedFilters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSortChange = (field: string) => {
    const newDirection = params.sort.field === field
      ? params.sort.direction === "asc"
        ? "desc"
        : params.sort.direction === "desc"
        ? null
        : "asc"
      : "asc";

    const newParams: DocumentTableParams = {
      ...params,
      page: 1,
      sort: { field, direction: newDirection as "asc" | "desc" | null },
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handleFilterChange = (filters: FilterState) => {
    const newParams: DocumentTableParams = {
      ...params,
      page: 1,
      filters,
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams: DocumentTableParams = {
      ...params,
      page,
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handlePageSizeChange = (pageSize: number) => {
    const newParams: DocumentTableParams = {
      ...params,
      page: 1,
      pageSize,
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handleClearFilters = () => {
    const newParams: DocumentTableParams = {
      ...params,
      page: 1,
      filters: {},
    };

    setParams(newParams);
    updateURL(newParams);
  };

  // Refetch documents when action is performed
  const refetch = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    data,
    loading,
    error,
    totalCount,
    totalPages,
    params,
    handleSortChange,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
    refetch,
  };
}
