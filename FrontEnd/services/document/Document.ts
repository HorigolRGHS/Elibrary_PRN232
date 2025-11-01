// services/documentService.ts
import { api } from "@/api/apiClient";
import buildQuery from "odata-query";
import {
  DocumentUserResponseItemDTO,
  DocumentStaffResponseListDTO,
  CreateDocumentRequest,
  CreateDocumentResponse,
} from "@/models/dtos/documentDTO";
import { OdataResult, ResponseDTO } from "@/models/dtos/commonDTO";
import { FileMode, StorageService } from "../storage/Storage";

export interface DocumentQueryParams {
  select?: string[];
  filter?: Record<string, unknown> | string;
  orderBy?: string | string[];
  expand?: string | string[];
  top?: number;
  skip?: number;
  count?: boolean;
}

export interface DocumentListResult {
  items: DocumentStaffResponseListDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface DocumentApiResponse {
  DocumentId: number;
  Title: string;
  CategoryName: string;
  SubjectName: string;
  ViewCount: number;
  DownloadCount: number;
  Status: string;
  CreatedDate: string;
  CreatedBy: number | null;
  CreatedByFullname: string | null;
  DeletedDate: string | null;
}

const odataQueryString = (params?: DocumentQueryParams) =>
  params ? buildQuery(params) : "";

/**
 * Chuyển đổi từ API Response (PascalCase) sang DTO (camelCase)
 */
const mapApiResponseToDTO = (
  item: DocumentApiResponse
): DocumentStaffResponseListDTO => ({
  documentId: item.DocumentId,
  title: item.Title,
  categoryName: item.CategoryName,
  subjectName: item.SubjectName,
  viewCount: item.ViewCount,
  downloadCount: item.DownloadCount,
  status: item.Status,
  createdDate: item.CreatedDate,
  createdBy: item.CreatedBy ?? 0,
  createdByFullname: item.CreatedByFullname ?? "",
  deletedDate: item.DeletedDate ?? null,
});

/** --------- Service chính cho client --------- */
export const DocumentService = {
  /**
   * Lấy chi tiết document cho user (API bọc kiểu { success, message, data })
   */
  async getUserDocumentDetails(
    documentId: number
  ): Promise<DocumentUserResponseItemDTO> {
    const res = await api.get<ResponseDTO<DocumentUserResponseItemDTO>>(
      `/catalog/api/documents/${documentId}`
    );
    return res.data; // api.get đã unwrap JSON body -> ở đây res là JSON, không phải AxiosResponse
  },

  /**
   * Lấy stream file (preview hoặc full) dưới dạng File (để tải/hiển thị)
   */
  async getDocumentStream(
    docId: number,
    fileUrl: string,
    mode: FileMode = "preview"
  ): Promise<File> {
    const url = StorageService.buildFileDownloadUrl(docId, fileUrl, mode);
    return api.getFileAsFile(url);
  },

  /**
   * Tải file full (alias cho getDocumentStream với mode 'full')
   */
  async downloadDocument(docId: number, fileUrl: string): Promise<File> {
    const url = StorageService.buildFileDownloadUrl(docId, fileUrl, "full");
    return api.getFileAsFile(url);
  },

  async ApproveDocument(documentId: number): Promise<string> {
    const resp = await api.post<ResponseDTO<string>>(`/catalog/api/documents/${documentId}/approve`, { accept: true})
    return resp.message;
  },

  async RejectDocument(documentId: number, ureason: string): Promise<string> {
    const resp = await api.post<ResponseDTO<string>>(`/catalog/api/documents/${documentId}/approve`, { accept: false, reason: ureason })
    return resp.message;
  },

  /**
   * Danh sách document cho Admin (OData)
   * Trả về format chuẩn của FE: { items, totalCount, page, pageSize }
   */
  async getAdminDocumentList(
    params?: DocumentQueryParams
  ): Promise<DocumentListResult> {
    const qs = odataQueryString(params);
    const res = await api.get<OdataResult<DocumentApiResponse>>(
      `/catalog/odata/documents${qs}`
    );

    const items: DocumentStaffResponseListDTO[] = (res.value || []).map(
      mapApiResponseToDTO
    );

    const pageSize = params?.top ?? 10;
    const page = params?.skip
      ? Math.floor((params.skip as number) / pageSize) + 1
      : 1;

    return {
      items,
      totalCount: res["@odata.count"] ?? 0,
      page,
      pageSize,
    };
  },
  async getAdminDocumentItem(documentId: number): Promise<DocumentUserResponseItemDTO> {
    const res = await api.get<ResponseDTO<DocumentUserResponseItemDTO>>(
      `/catalog/api/documents/admin/${documentId}`
    );
    return res.data;
  },

  /**
   * Tạo document mới
   */
  async createDocument(
    data: CreateDocumentRequest
  ): Promise<string> {
    const res = await api.post<ResponseDTO<string>>(
      `/catalog/api/documents`,
      {
        title: data.title,
        description: data.description || "",
        fileUrl: data.fileUrl,
        categoryId: data.categoryId,
        subjectId: data.subjectId,
      }
    );
    return res.message;
  },
  async deleteDocument(documentId: number): Promise<string> {
    const res = await api.delete<ResponseDTO<string>>(
      `/catalog/api/documents/${documentId}`
    );
    return res.message;
  },

  /**
   * Cập nhật document (PATCH)
   */
  async updateDocument(
    documentId: number,
    data: { title?: string; description?: string; fileUrl?: string; categoryId?: number; subjectId?: number }
  ): Promise<string> {
    const res = await api.patch<ResponseDTO<string>>(
      `/catalog/api/documents/${documentId}`,
      data
    );
    return res.message;
  },
};
