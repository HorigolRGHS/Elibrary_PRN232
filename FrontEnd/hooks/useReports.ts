import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ReportListItemDTO, ReportsService } from "@/services/Reports/Reports";
import {
  ReportTableParams,
  FilterState,
} from "../app/(dashboard)/dashboard/reports/types";
import { useDebounce } from "@/hooks/useDebounce";

export interface ReportListResult {
  items: ReportListItemDTO[];
  totalCount: number;
}

export function useReports() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<ReportListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Initialize params from URL
  const [params, setParams] = useState<ReportTableParams>(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortField = searchParams.get("sortField");
    const sortDirection = searchParams.get("sortDirection") as
      | "asc"
      | "desc"
      | null;

    const filters: FilterState = {};
    const documentId = searchParams.get("documentId");
    const status = searchParams.get("status");

    if (documentId) filters.documentId = documentId;
    if (status) filters.status = status;

    return {
      page,
      pageSize,
      sort: { field: sortField, direction: sortDirection },
      filters,
    };
  });

  // Debounce filters to avoid calling API on every keystroke
  const debouncedFilters = useDebounce(params.filters, 1500);

  // Update URL when params change
  const updateURL = useCallback(
    (newParams: ReportTableParams) => {
      const queryParams = new URLSearchParams();
      queryParams.set("page", newParams.page.toString());
      queryParams.set("pageSize", newParams.pageSize.toString());

      if (newParams.sort.field) {
        queryParams.set("sortField", newParams.sort.field);
      }
      if (newParams.sort.direction) {
        queryParams.set("sortDirection", newParams.sort.direction);
      }

      if (newParams.filters.documentId)
        queryParams.set("documentId", newParams.filters.documentId);
      if (newParams.filters.status)
        queryParams.set("status", newParams.filters.status);

      router.push(`?${queryParams.toString()}`, { scroll: false });
    },
    [router]
  );

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter conditions for OData
      const filterConditions: string[] = [];

      if (debouncedFilters.documentId) {
        filterConditions.push(`documentId eq ${debouncedFilters.documentId}`);
      }
      if (debouncedFilters.status) {
        filterConditions.push(`status eq '${debouncedFilters.status}'`);
      }

      // Build orderBy for OData
      let orderBy: string = "createdDate desc"; // default order
      if (params.sort.field && params.sort.direction) {
        const fieldName =
          params.sort.field.charAt(0).toUpperCase() +
          params.sort.field.slice(1);
        orderBy = `${fieldName} ${params.sort.direction}`;
      }

      // Calculate skip and take for paging
      const skip = (params.page - 1) * params.pageSize;

      // Build OData query string
      const qs: string[] = [];
      if (filterConditions.length) {
        qs.push(`$filter=${filterConditions.join(" and ")}`);
      }
      qs.push(`$orderby=${orderBy}`);
      qs.push(`$skip=${skip}`);
      qs.push(`$top=${params.pageSize}`);
      qs.push(`$count=true`);

      const queryString = qs.join("&");

      // Fetch reports from API
      const res = await ReportsService.getList(queryString);
      // res is ApiResponse<{ oDataCount, value, ... }>
      // res.data is the inner object: { oDataCount, value, ... }
      const payload: any = res?.data;

      let items: ReportListItemDTO[] = [];
      let count = 0;

      // Parse OData response shape
      if (payload?.value) {
        items = payload.value as ReportListItemDTO[];
        count = payload.oDataCount ?? items.length;
      } else if (Array.isArray(payload)) {
        items = payload;
        count = payload.length;
      } else if (payload?.items) {
        items = payload.items;
        count = payload.totalCount || payload.items.length;
      } else {
        items = payload?.Value || [];
        count = payload?.ODataCount || payload?.length || 0;
      }

      setData(items);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / params.pageSize));
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [params.page, params.pageSize, params.sort, debouncedFilters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSortChange = (field: string) => {
    const newDirection =
      params.sort.field === field
        ? params.sort.direction === "asc"
          ? "desc"
          : params.sort.direction === "desc"
          ? null
          : "asc"
        : "asc";

    const newParams: ReportTableParams = {
      ...params,
      page: 1,
      sort: { field: newDirection ? field : null, direction: newDirection },
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handleFilterChange = (filters: FilterState) => {
    const newParams: ReportTableParams = {
      ...params,
      page: 1,
      filters,
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = { ...params, page: newPage };
    setParams(newParams);
    updateURL(newParams);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...params, page: 1, pageSize: newPageSize };
    setParams(newParams);
    updateURL(newParams);
  };

  const handleClearFilters = () => {
    const newParams: ReportTableParams = {
      page: 1,
      pageSize: 10,
      sort: { field: null, direction: null },
      filters: {},
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const refetch = () => {
    fetchReports();
  };

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
