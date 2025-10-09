export interface ResponseDTO<T> {
  data: T;
  message: string;
  success: boolean;
}