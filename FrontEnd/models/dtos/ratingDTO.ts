export type RatingSelect = {
  ratingId: number;
  documentId: number;
  starRating: number;
  review?: string;
  createdBy: number;
  createdDate: string;
};

export type RatingReadDTO = {
  ratingId: number;
  documentId: number;
  documentTitle?: string;
  starRating: number;
  review?: string;
  createdBy: number;
  createdByName?: string;
  createdDate: string;
  updatedDate?: string;
};

export type RatingCreateRequest = {
  DocumentId: number;
  StarRating: number;
  Review?: string;
  CreatedBy: number;
};

export type RatingUpdateRequest = {
  DocumentId?: number;
  StarRating?: number;
  Review?: string;
};
