export type CategoryReadDTO = {
  CategoryId: number;
  CategoryName: string;
  Description?: string;
  CreatedDate: string;
  UpdatedDate: string;
};

export type CategorySelect = {
  CategoryId: number;
  CategoryName: string;
  Description?: string;
};
