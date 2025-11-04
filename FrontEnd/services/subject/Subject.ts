import { api } from "@/api/apiClient";
import { SubjectDetailDTO, SubjectResponseDTO, SubjectCreateDTO, SubjectUpdateDTO, SubjectSelect } from "@/models/dtos/subjectDTO";

export const SubjectService = {
  getSubjectList: async (params?: {
    skip?: number;
    top?: number;
    count?: boolean;
    filter?: string;
    orderBy?: string;
  }): Promise<{ items: SubjectResponseDTO[], totalCount: number }> => {
    const query = new URLSearchParams();

    if (params?.skip !== undefined) query.append("$skip", params.skip.toString());
    if (params?.top !== undefined) query.append("$top", params.top.toString());
    if (params?.count) query.append("$count", "true");
    if (params?.filter) query.append("$filter", params.filter);
    if (params?.orderBy) query.append("$orderby", params.orderBy);

    const data = await api.get(`/catalog/api/subjects?${query.toString()}`);

    let items: SubjectResponseDTO[] = [];
    let total = 0;

    if (Array.isArray(data)) {
      items = data;
      total = data.length;
    } else if (data && Array.isArray(data.items)) {
      items = data.items;
      total = data.totalCount ?? data.items.length;
    } else if (data) {
      items = [data];
      total = 1;
    }

    return { items, totalCount: total };
  },

  getSelectSubjects: async (): Promise<SubjectSelect[]> => {
    const res = await api.get(`/catalog/api/subjects`);
    return res ?? [];
    // return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  },

  getSubjectById: async (id: number): Promise<SubjectDetailDTO | null> => {
    const res = await api.get(`/catalog/api/subjects/${id}`);
    return res?.data ?? null;
  },

  createSubject: async (subject: SubjectCreateDTO): Promise<SubjectDetailDTO | null> => {
    const res = await api.post(`/catalog/api/subjects`, subject);
    return res?.data ?? null;
  },

  updateSubject: async (id: number, subject: SubjectUpdateDTO): Promise<SubjectDetailDTO | null> => {
    const res = await api.put(`/catalog/api/subjects/${id}`, subject);
    return res?.data ?? null;
  },

  deleteSubject: async (id: number): Promise<string | null> => {
    const res = await api.delete(`/catalog/api/subjects/${id}`);
    return res?.data?.message ?? "Deleted successfully";
  },
};