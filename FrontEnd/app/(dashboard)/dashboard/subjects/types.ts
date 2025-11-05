import { SubjectResponseDTO } from "@/models/dtos/subjectDTO";

export interface SortState {
  field: string;
  direction: "asc" | "desc" | null;
}

export interface FilterState {
  subjectId?: number;
  subjectName?: string;
  documentCount?: number;
  createdDate?: string;
  updatedDate?: string;
}

export interface SubjectTableParams {
  page: number;
  pageSize: number;
  sort: SortState;
  filters: FilterState;
}

export interface ColumnConfig<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}
