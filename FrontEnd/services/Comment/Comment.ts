import { api } from "@/api/apiClient";
import { CommentListDTO, CreateCommentDTO, UpdateCommentDTO } from "@/models/dtos/commentDTO";
import { ResponseDTO } from "@/models/dtos/commonDTO";

export const CommentService = {
  getDocumentComments: async (documentId: number): Promise<CommentListDTO[]> => {
    const res = await api.get<ResponseDTO<CommentListDTO[]>>(`/interaction/api/comments/${documentId}`);
    return res.data ?? [];
  },

  createComment: async (data: CreateCommentDTO): Promise<CommentListDTO> => {
    const res = await api.post<ResponseDTO<CommentListDTO>>('/interaction/api/comments', data);
    return res.data ?? null;
  },

  updateComment: async (commentId: number, data: UpdateCommentDTO): Promise<CommentListDTO> => {
    const res = await api.put<ResponseDTO<CommentListDTO>>(`/interaction/api/comments/${commentId}`, data);
    return res.data ?? null;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/interaction/api/comments/${commentId}`);
  }
};