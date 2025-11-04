import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CategorySelect } from "@/models/dtos/categoryDTO";
import { CategoryService } from "@/services/category/Category";

interface CategoryParams {
  page: number;
  pageSize: number;
  searchQuery: string;
}

export function useCategories() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<CategorySelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Initialize params from URL
  const [params, setParams] = useState<CategoryParams>(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const searchQuery = searchParams.get("q") || "";

    return { page, pageSize, searchQuery };
  });

  // Update URL when params change
  const updateURL = useCallback((newParams: CategoryParams) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", newParams.page.toString());
    queryParams.set("pageSize", newParams.pageSize.toString());
    if (newParams.searchQuery) {
      queryParams.set("q", newParams.searchQuery);
    }

    router.push(`?${queryParams.toString()}`, { scroll: false });
  }, [router]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await CategoryService.getSelectCategories();
      const allCategories = data || [];

      // Apply search filter
      let filtered = allCategories;
      if (params.searchQuery) {
        const q = params.searchQuery.toLowerCase();
        filtered = allCategories.filter(
          (c) =>
            `${c.categoryName}`.toLowerCase().includes(q) ||
            `${c.categoryId}`.toString().includes(q)
        );
      }

      // Calculate pagination
      const total = filtered.length;
      const pages = Math.ceil(total / params.pageSize);
      const start = (params.page - 1) * params.pageSize;
      const paginatedData = filtered.slice(start, start + params.pageSize);

      setCategories(paginatedData);
      setTotalCount(total);
      setTotalPages(pages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMessage);
      setCategories([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handlePageChange = (page: number) => {
    const newParams: CategoryParams = { ...params, page };
    setParams(newParams);
    updateURL(newParams);
  };

  const handlePageSizeChange = (pageSize: number) => {
    const newParams: CategoryParams = { ...params, page: 1, pageSize };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleSearch = (query: string) => {
    const newParams: CategoryParams = { ...params, page: 1, searchQuery: query };
    setParams(newParams);
    updateURL(newParams);
  };

  return {
    categories,
    loading,
    error,
    totalCount,
    totalPages,
    params,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    refresh: fetchCategories,
  };
}
