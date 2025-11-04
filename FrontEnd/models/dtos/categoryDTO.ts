export type CategoryReadDTO = {
  categoryId: number;
  categoryName: string;
  description?: string;
  createdDate: string;
  updatedDate: string;
};

export type CategorySelect = {
  categoryId: number;
  categoryName: string;
  description?: string;
};
