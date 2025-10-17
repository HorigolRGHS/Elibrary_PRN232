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

export interface OdataResult<T> {
  "@odata.context": string;
  "@odata.count": number;
  value: T[];
}
