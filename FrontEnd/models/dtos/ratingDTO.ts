export type RatingSelect = {
  RatingId: number;
  DocumentId: number;
  StarRating: number;
  Review?: string;
  CreatedBy: number;
  CreatedDate: string;
};

export type RatingReadDTO = {
  RatingId: number;
  DocumentId: number;
  DocumentTitle?: string;
  StarRating: number;
  Review?: string;
  CreatedBy: number;
  CreatedByName?: string;
  CreatedDate: string;
  UpdatedDate?: string;
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
