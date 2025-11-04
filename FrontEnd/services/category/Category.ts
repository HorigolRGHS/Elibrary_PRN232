import { api } from "@/api/apiClient";
import apiClient from "@/api/apiClient";
import buildQuery from "odata-query";
import { CategorySelect, CategoryReadDTO } from "@/models/dtos/categoryDTO";

const toSelect = (item: any): CategorySelect => {
    return {
        categoryId: item.categoryId ?? item.CategoryId ?? item.id ?? 0,
        categoryName: item.categoryName ?? item.CategoryName ?? item.Name ?? "",
        description: item.description ?? item.Description ?? undefined,
    };
};

const toRead = (item: any): CategoryReadDTO => {
    return {
        categoryId: item.categoryId ?? item.CategoryId ?? item.id ?? 0,
        categoryName: item.categoryName ?? item.CategoryName ?? item.Name ?? "",
        description: item.description ?? item.Description ?? undefined,
        createdDate: item.createdDate ?? item.CreatedDate ?? (item.createdAt ?? ""),
        updatedDate: item.updatedDate ?? item.UpdatedDate ?? (item.updatedAt ?? ""),
    };
};



export const CategoryService = {
    // NOTE: removed OPTIONS preflight probing (supportsItemMethods) to avoid triggering server OPTIONS
    // The frontend will rely on admin role checks and handle failures from actual PUT/DELETE requests.
    getSelectCategories: async (): Promise<CategorySelect[]> => {
        const data = await api.get<any[]>(`/catalog/api/categories`);
        return (data || []).map(toSelect);
    },

    // full read DTO list (if backend returns more fields)
    getAll: async (): Promise<CategoryReadDTO[]> => {
        const data = await api.get<any[]>(`/catalog/api/categories`);
        return (data || []).map(toRead);
    },

    getById: async (id: number): Promise<CategoryReadDTO> => {
  try {
    console.debug('[CategoryService] trying GET', `/catalog/api/categories/(${id})`);
    const raw = await api.get<any>(`/catalog/api/categories/(${id})`);
    const item = _extractItemById(raw, id);
    if (item) {
      console.debug('[CategoryService] success GET', `/catalog/api/categories/(${id})`, item);
      return toRead(item);
    }
  } catch (err: any) {
    console.error('[CategoryService] GET failed', `/catalog/api/categories/(${id})`, err?.message);
    throw err;
  }
  
  // Fallback: GET list rồi tìm local theo id
  try {
    console.debug('[CategoryService] fallback: GET list to locate item', id);
    const list = await api.get<any[]>(`/catalog/api/categories`);
    const found = _extractItemById(list, id);
    if (found) return toRead(found);
  } catch (listErr: any) {
    console.error('[CategoryService] fallback list GET failed', listErr?.message);
  }

  throw new Error(`Category item ${id} not found`);
},


    createCategory: async (data: { CategoryName: string; Description?: string }) => {
        // send in server-expected shape (PascalCase) to be safe
        const payload = { CategoryName: data.CategoryName, Description: data.Description };
        return await api.post(`/catalog/api/categories`, payload);
    },

    updateCategory: async (id: number, data: { CategoryName?: string; Description?: string }) => {
        const payload: any = {};
        if (data.CategoryName !== undefined) payload.CategoryName = data.CategoryName;
        if (data.Description !== undefined) payload.Description = data.Description;
        const url = `/catalog/api/categories/(${id})`;
        
        console.debug('[CategoryService] PUT', url, payload);
        const resp = await api.put(url, payload);
        console.debug('[CategoryService] PUT success', url);
        return resp;
    },

    deleteCategory: async (id: number) => {
        const url = `/catalog/api/categories/(${id})`;
        try {
            console.debug('[CategoryService] trying DELETE', url);
            const resp = await api.delete(url);
            console.debug('[CategoryService] success DELETE', url);
            return resp;
        } catch (err: any) {
            throw new Error(`deleteCategory failed for id ${id}: ${err?.message}`);
        }
    },
    // --- Admin variants (call admin-specific endpoints when backend exposes them)
    getAdminList: async (params?: { select?: string[]; filter?: any; top?: number; skip?: number }) => {
        const qs = params ? buildQuery(params) : "";
        const res = await api.get<any>(`/catalog/odata/categories${qs}`);
        const items = (res?.value || []).map((it: any) => toRead(it));
        const pageSize = params?.top ?? 10;
        const page = params?.skip ? Math.floor((params.skip as number) / pageSize) + 1 : 1;
        return { items, totalCount: res?.["@odata.count"] ?? 0, page, pageSize };
    },

    getAdminItem: async (id: number) => {
  const attempted: string[] = [];
  let lastErr: any = null;

  // Ưu tiên query-style (do endpoint list đang hoạt động ổn)
  const queryUrl = `/catalog/api/categories?CategoryId=${id}`;
  attempted.push(queryUrl);
  try {
    console.debug('[CategoryService] trying fallback GET', queryUrl);
    const raw = await api.get<any>(queryUrl);
    const item = _extractItemById(raw, id); // 🔧 lọc theo id
    if (item) return toRead(item);
  } catch (err: any) {
    lastErr = lastErr || err;
    if (err?.response?.status !== 404) throw err;
  }

  // Thử admin per-item
  const adminUrl = `/catalog/api/categories/admin/(${id})`;
  attempted.push(adminUrl);
  try {
    console.debug('[CategoryService] trying GET admin item', adminUrl);
    const raw = await api.get<any>(adminUrl);
    const item = _extractItemById(raw, id); // 🔧 lọc theo id
    if (item) return toRead(item);
  } catch (err: any) {
    lastErr = lastErr || err;
    if (err?.response?.status !== 404) throw err;
  }

  // Fallback: GET list rồi tìm local
  try {
    console.debug('[CategoryService] fallback: GET list to locate admin item', id);
    const list = await api.get<any[]>(`/catalog/api/categories`);
    const found = _extractItemById(list, id); // 🔧 lọc theo id
    if (found) return toRead(found);
  } catch (listErr) {
    lastErr = lastErr || listErr;
  }

  const e: any = new Error('Admin Category GET failed: single-item admin endpoint not available (tried admin and fallback forms)');
  e.attempted = attempted;
  e.cause = lastErr;
  throw e;
},


    updateAdmin: async (id: number, data: { CategoryName?: string; Description?: string }) => {
        const payload: any = {};
        if (data.CategoryName !== undefined) payload.CategoryName = data.CategoryName;
        if (data.Description !== undefined) payload.Description = data.Description;
        const url = `/catalog/api/categories/(${id})`;
        
        console.debug('[CategoryService] PUT admin', url, payload);
        const res = await api.put(url, payload);
        console.debug('[CategoryService] PUT admin success', url);
        return res;
    },

    deleteAdmin: async (id: number) => {
        const url = `/catalog/api/categories/(${id})`;
        try {
            console.debug('[CategoryService] trying DELETE admin', url);
            const res = await api.delete(url);
            console.debug('[CategoryService] success DELETE admin', url);
            return res;
        } catch (err: any) {
            throw new Error(`deleteAdmin failed for id ${id}: ${err?.message}`);
        }
    },
};

const _getCandidateId = (it: any) => it?.CategoryId ?? it?.categoryId ?? it?.id ?? undefined;

const _extractItemById = (raw: any, id?: number) => {
    let item: any = raw;
    if (item && typeof item === 'object') {
        if ('data' in item && item.data !== undefined) item = item.data;
        else if ('value' in item && Array.isArray(item.value)) {
            if (id !== undefined) return item.value.find((el: any) => Number(_getCandidateId(el)) === Number(id));
            return item.value.length > 0 ? item.value[0] : undefined;
        }
    }
    if (Array.isArray(item)) {
        if (id !== undefined) return item.find((el: any) => Number(_getCandidateId(el)) === Number(id));
        return item[0];
    }
    return item;
};