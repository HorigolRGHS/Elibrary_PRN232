// ===== CREATE DTO =====
export type DocumentCreateDTO = {
    Title: string;
    Description: string;
    FileUrl: string;
    CategoryId: string;
    SubjectId: number;
}

export type CreateDocumentRequest = {
    title: string;          
    description?: string;    
    fileUrl: string;         
    categoryId: number;      
    subjectId: number;       
}

export type CreateDocumentResponse = {
    documentId: number;
    title: string;
    message?: string;
}

// ===== USER RESPONSE DTO =====
export type DocumentUserResponseListDTO = {
    documentId: number;
    title: string;
    description: string;
    viewCount: number;
    downloadCount: number;
    categoryName: string;
    subjectName: string;
    createdDate: string;
}

export type DocumentUserResponseItemDTO = {
    documentId: number;
    title: string;
    description: string;
    fileUrl: string | null;
    viewCount: number;
    downloadCount: number;
    categoryName: string;
    subjectName: string;
    createdBy: number;
    createdDate: string;
}

// ===== STAFF RESPONSE DTO =====
export type DocumentStaffResponseItemDTO = {
    documentId: number;
    title: string;
    description: string;
    fileUrl: string;
    viewCount: number;
    downloadCount: number;
    categoryId: number;
    categoryName: string;
    subjectId: number;
    subjectName: string;
    status: string;
    createdDate: string;
    createdBy: number;
    createdByUsername: string;
    updatedDate: string;
    deletedBy: number | null;
    deletedByUsername: string | null;
}

export type DocumentStaffResponseListDTO = {
    documentId: number;
    title: string;
    categoryName: string;
    subjectName: string;
    viewCount: number;
    downloadCount: number;
    status: string;
    createdDate: string;
    createdBy: number;
    createdByFullname: string;
    deletedDate: string | null;
}

export type DocumentUpdateDTO = {
    title?: string;
    description?: string;
    fileUrl?: string;
    categoryId?: number;
    subjectId?: number;
}