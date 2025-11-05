import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  NotificationListItemDTO,
  NotificationsService,
} from "@/services/Notifications/Notifications";
import {
  NotificationTableParams,
  FilterState,
} from "../app/(dashboard)/dashboard/notifications/types";
import { useDebounce } from "@/hooks/useDebounce";

export interface NotificationListResult {
  items: NotificationListItemDTO[];
  totalCount: number;
}

export function useNotifications() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<NotificationListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Initialize params from URL
  const [params, setParams] = useState<NotificationTableParams>(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortField = searchParams.get("sortField");
    const sortDirection = searchParams.get("sortDirection") as
      | "asc"
      | "desc"
      | null;

    const filters: FilterState = {};
    const title = searchParams.get("title");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    if (title) filters.title = title;
    if (type) filters.type = type;
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
    (newParams: NotificationTableParams) => {
      const queryParams = new URLSearchParams();
      queryParams.set("page", newParams.page.toString());
      queryParams.set("pageSize", newParams.pageSize.toString());

      if (newParams.sort.field) {
        queryParams.set("sortField", newParams.sort.field);
      }
      if (newParams.sort.direction) {
        queryParams.set("sortDirection", newParams.sort.direction);
      }

      if (newParams.filters.title)
        queryParams.set("title", newParams.filters.title);
      if (newParams.filters.type)
        queryParams.set("type", newParams.filters.type);
      if (newParams.filters.status)
        queryParams.set("status", newParams.filters.status);

      router.push(`?${queryParams.toString()}`, { scroll: false });
    },
    [router]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter conditions for OData
      const filterConditions: string[] = [];

      if (debouncedFilters.title) {
        const escaped = debouncedFilters.title
          .toLowerCase()
          .replace(/'/g, "''");
        filterConditions.push(`contains(tolower(Title), '${escaped}')`);
      }
      if (debouncedFilters.type) {
        filterConditions.push(`Type eq '${debouncedFilters.type}'`);
      }
      if (debouncedFilters.status) {
        filterConditions.push(`Status eq '${debouncedFilters.status}'`);
      }

      // Build orderBy for OData
      let orderBy: string = "CreatedDate desc"; // default order
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

      // Fetch notifications from API
      const res = await NotificationsService.getList(queryString);
      // res is ApiResponse<{ oDataCount, value, ... }>
      // res.data is the inner object: { oDataCount, value, ... }
      const payload: any = res?.data;

      let items: NotificationListItemDTO[] = [];
      let count = 0;

      // Parse OData response shape
      if (payload?.value) {
        items = payload.value as NotificationListItemDTO[];
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
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [params.page, params.pageSize, params.sort, debouncedFilters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSortChange = (field: string) => {
    const newDirection =
      params.sort.field === field
        ? params.sort.direction === "asc"
          ? "desc"
          : params.sort.direction === "desc"
          ? null
          : "asc"
        : "asc";

    const newParams: NotificationTableParams = {
      ...params,
      page: 1,
      sort: { field, direction: newDirection as "asc" | "desc" | null },
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handleFilterChange = (filters: FilterState) => {
    const newParams: NotificationTableParams = {
      ...params,
      page: 1,
      filters,
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams: NotificationTableParams = {
      ...params,
      page,
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handlePageSizeChange = (pageSize: number) => {
    const newParams: NotificationTableParams = {
      ...params,
      page: 1,
      pageSize,
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const handleClearFilters = () => {
    const newParams: NotificationTableParams = {
      ...params,
      page: 1,
      filters: {},
    };

    setParams(newParams);
    updateURL(newParams);
  };

  const refetch = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
