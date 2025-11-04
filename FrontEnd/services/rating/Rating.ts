import { api } from "@/api/apiClient";
import {
  RatingSelect,
  RatingReadDTO,
  RatingCreateRequest,
  RatingUpdateRequest,
} from "@/models/dtos/ratingDTO";

const toSelect = (item: any): RatingSelect => {
  return {
    ratingId: item.ratingId ?? item.RatingId ?? 0,
    documentId: item.documentId ?? item.DocumentId ?? 0,
    starRating: item.starRating ?? item.StarRating ?? 0,
    review: item.review ?? item.Review ?? undefined,
    createdBy: item.createdBy ?? item.CreatedBy ?? 0,
    createdDate: item.createdDate ?? item.CreatedDate ?? "",
  };
};

const toRead = (item: any): RatingReadDTO => {
  return {
    ratingId: item.ratingId ?? item.RatingId ?? 0,
    documentId: item.documentId ?? item.DocumentId ?? 0,
    documentTitle: item.documentTitle ?? item.DocumentTitle ?? undefined,
    starRating: item.starRating ?? item.StarRating ?? 0,
    review: item.review ?? item.Review ?? undefined,
    createdBy: item.createdBy ?? item.CreatedBy ?? 0,
    createdByName: item.createdByName ?? item.CreatedByName ?? undefined,
    createdDate: item.createdDate ?? item.CreatedDate ?? "",
    updatedDate: item.updatedDate ?? item.UpdatedDate ?? undefined,
  };
};

export const RatingService = {
  getAll: async (): Promise<RatingSelect[]> => {
    const data = await api.get<any[]>(`/interaction/api/ratings`);
    return (data || []).map(toSelect);
  },

  getById: async (id: number): Promise<RatingReadDTO> => {
    try {
      const raw = await api.get<any>(`/interaction/api/ratings/${id}`);
      if (raw) {
        return toRead(raw);
      }
    } catch (err: any) {
      console.error('[RatingService] GET failed', err?.message);
    }

    try {
      const list = await api.get<any[]>(`/interaction/api/ratings`);
      const found = (list || []).find(
        (item: any) => item.ratingId === id || item.RatingId === id
      );
      if (found) return toRead(found);
    } catch (listErr: any) {
      console.error('[RatingService] fallback failed', listErr?.message);
    }

    throw new Error(`Rating ${id} not found`);
  },

  createRating: async (data: RatingCreateRequest) => {
    const payload = {
      DocumentId: data.DocumentId,
      StarRating: data.StarRating,
      Review: data.Review ?? undefined,
      CreatedBy: data.CreatedBy,
    };
    return await api.post(`/interaction/api/ratings`, payload);
  },

  updateRating: async (id: number, data: RatingUpdateRequest) => {
    const payload: any = {};
    if (data.DocumentId !== undefined) payload.DocumentId = data.DocumentId;
    if (data.StarRating !== undefined) payload.StarRating = data.StarRating;
    if (data.Review !== undefined) payload.Review = data.Review;

    return await api.put(`/interaction/api/ratings/${id}`, payload);
  },

  deleteRating: async (id: number) => {
    return await api.delete(`/interaction/api/ratings/${id}`);
  },
};
