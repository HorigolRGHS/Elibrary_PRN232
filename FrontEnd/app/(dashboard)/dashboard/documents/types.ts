
// Sort direction
export type SortDirection = "asc" | "desc" | null;

// Column definition for type safety and easy configuration
export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

// Sort state
export interface SortState {
  field: string | null;
  direction: SortDirection;
}

// Filter state
export interface FilterState {
  title?: string;
  description?: string;
  categoryName?: string;
  subjectName?: string;
  status?: string;
}

// Query params for API
export interface DocumentTableParams {
  page: number;
  pageSize: number;
  sort: SortState;
  filters: FilterState;
}
