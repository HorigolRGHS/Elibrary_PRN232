export interface FilterState {
  documentId?: string;
  status?: string;
  createdBy?: string;
}

export interface ReportTableParams {
  page: number;
  pageSize: number;
  sort: { field: string | null; direction: "asc" | "desc" | null };
  filters: FilterState;
}
