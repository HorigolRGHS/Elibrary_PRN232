// DTO chi tiết của một Subject, dùng cho form, trang chi tiết
export type SubjectDetailDTO = {
    subjectId: number;
    subjectName: string;
    imageUrl?: string;
    description?: string;
    documents: {
      documentId: number;
      title: string;
    }[];
    createdDate: string;
    updatedDate?: string;
}

// DTO tóm tắt của Subject, dùng cho bảng danh sách (table)
export interface SubjectResponseDTO {
  subjectId: number;
  subjectName: string;
  imageUrl?: string;
  documentCount: number;
  createdDate: string;
  updatedDate: string;
}

// DTO để tạo mới Subject
export type SubjectCreateDTO = {
    subjectName: string;
    imageUrl?: string;
    description?: string;
}

// DTO để cập nhật Subject
export type SubjectUpdateDTO = Partial<SubjectCreateDTO>;

// Alias cho dễ hiểu, SubjectSelect chính là SubjectDetailDTO
export type SubjectSelect = SubjectDetailDTO;
