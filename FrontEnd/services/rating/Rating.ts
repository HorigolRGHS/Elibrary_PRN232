import { api } from "@/api/apiClient";
import {
  RatingSelect,
  RatingReadDTO,
  RatingCreateRequest,
  RatingUpdateRequest,
} from "@/models/dtos/ratingDTO";

export const RatingService = {
  getAll: async (): Promise<RatingSelect[]> => {
    return await api.get<RatingSelect[]>(`/interaction/api/ratings`);
  },

  getById: async (id: number): Promise<RatingReadDTO> => {
    try {
      const raw = await api.get<RatingReadDTO>(`/interaction/api/ratings/${id}`);
      if (raw) {
        return raw;
      }
    } catch (err: any) {
      console.error('[RatingService] GET failed', err?.message);
    }

    try {
      const list = await api.get<RatingSelect[]>(`/interaction/api/ratings`);
      const found = list.find((item) => item.RatingId === id);
      if (found) return found as any;
    } catch (listErr: any) {
      console.error('[RatingService] fallback failed', listErr?.message);
    }

    throw new Error(`Rating ${id} not found`);
  },

  createRating: async (data: RatingCreateRequest) => {
    // Admin cannot create ratings
    const userRole = typeof window !== "undefined" 
      ? localStorage.getItem("userRole")?.toLowerCase()
      : null;
    
    if (userRole === "admin") {
      throw new Error("Admin users cannot create ratings");
    }

    const payload = {
      DocumentId: data.DocumentId,
      StarRating: data.StarRating,
      Review: data.Review ?? undefined,
      CreatedBy: data.CreatedBy,
    };
    return await api.post(`/interaction/api/ratings`, payload);
  },

  updateRating: async (id: number, data: RatingUpdateRequest) => {
    // Admin cannot update ratings
    const userRole = typeof window !== "undefined" 
      ? localStorage.getItem("userRole")?.toLowerCase()
      : null;
    
    if (userRole === "admin") {
      throw new Error("Admin users cannot update ratings");
    }

    const payload: any = {};
    if (data.DocumentId !== undefined) payload.DocumentId = data.DocumentId;
    if (data.StarRating !== undefined) payload.StarRating = data.StarRating;
    if (data.Review !== undefined) payload.Review = data.Review;

    return await api.put(`/interaction/api/ratings/${id}`, payload);
  },

  deleteRating: async (id: number) => {
    // Admin cannot delete ratings
    const userRole = typeof window !== "undefined" 
      ? localStorage.getItem("userRole")?.toLowerCase()
      : null;
    
    if (userRole === "admin") {
      throw new Error("Admin users cannot delete ratings");
    }

    return await api.delete(`/interaction/api/ratings/${id}`);
  },

  // Get user's rating for a specific document
  getUserRatingForDocument: async (userId: number, documentId: number): Promise<RatingReadDTO | null> => {
    try {
      const ratings = await api.get<RatingSelect[]>(`/interaction/api/ratings`);
      const userRating = ratings.find((r) => r.CreatedBy === userId && r.DocumentId === documentId);
      if (userRating) {
        return await RatingService.getById(userRating.RatingId);
      }
      return null;
    } catch (err: any) {
      console.error('[RatingService] getUserRatingForDocument failed', err?.message);
      return null;
    }
  },
};
