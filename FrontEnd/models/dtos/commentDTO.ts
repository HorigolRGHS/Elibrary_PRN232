export interface CommentListDTO {
  commentId: number;
  content: string;
  createdDate: string;
  createdBy: number;
  createdByFullName: string;
  updatedDate?: string | null;
}

export interface CreateCommentDTO {
  documentId: number;
  content: string;
  createdBy: number;
}

export interface UpdateCommentDTO {
  content: string;
}