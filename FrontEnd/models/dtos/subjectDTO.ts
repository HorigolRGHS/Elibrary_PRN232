export type SubjectDetailDTO = {
    SubjectId: number;
    SubjectName: string;
    ImageUrl?: string;
    Description?: string;
    Documents: {
      DocumentId: number;
      Title: string;
    }[];
    CreatedDate: string;
    UpdatedDate?: string;
}

export type camelSubjectDetailDTO = {
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

export interface SubjectResponseDTO {
  SubjectId: number;
  SubjectName: string;
  ImageUrl?: string;
  DocumentCount: number;
  CreatedDate: string;
  UpdatedDate: string;
}

export type SubjectCreateDTO = {
    subjectName: string;
    imageUrl?: string;
    description?: string;
}

export type SubjectUpdateDTO = Partial<SubjectCreateDTO>;

export type SubjectSelect = SubjectDetailDTO;
