export interface FilterState {
  title?: string;
  type?: string;
  status?: string;
}

export interface NotificationTableParams {
  page: number;
  pageSize: number;
  sort: {
    field: string | null;
    direction: "asc" | "desc" | null;
  };
  filters: FilterState;
}
