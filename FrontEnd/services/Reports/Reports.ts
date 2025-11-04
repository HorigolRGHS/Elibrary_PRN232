import { api } from "@/api/apiClient";
import { ResponseDTO } from "@/models/dtos/commonDTO";

export interface ReportListItemDTO {
  reportId: number;
  documentId: number;
  createdBy: number;
  createdByName?: string;
  createdDate: string;
  status: "Pending" | "Resolved";
  reason?: string;
}

export interface ReportDetailDTO extends ReportListItemDTO {
  reason: string;
  updatedDate?: string;
}

export class ReportsService {
  static async getList(queryString: string): Promise<any> {
    const url = `/interaction/Reports${queryString ? `?${queryString}` : ""}`;
    return api.get(url);
  }

  static async getById(id: number): Promise<any> {
    return api.get(`/interaction/Reports/${id}`);
  }

  static async delete(id: number): Promise<ResponseDTO<boolean>> {
    return api.delete(`/interaction/Reports/${id}`);
  }

  static async update(id: number, data: any): Promise<any> {
    return api.put(`/interaction/Reports/${id}`, data);
  }

  static async create(data: {
    documentId: number;
    reason: string;
  }): Promise<ResponseDTO<ReportDetailDTO>> {
    return api.post(`/interaction/Reports`, data);
  }
}
