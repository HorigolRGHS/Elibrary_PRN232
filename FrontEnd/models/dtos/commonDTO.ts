export interface ResponseDTO<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
