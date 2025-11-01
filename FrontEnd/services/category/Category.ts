import { api } from "@/api/apiClient";
import { CategorySelect } from "@/models/dtos/categoryDTO";
import { ResponseDTO } from "@/models/dtos/commonDTO";

export const CategoryService = {
    getSelectCategories: async (): Promise<CategorySelect[]> => {
        return await api.get<CategorySelect[]>(`/catalog/api/categories`);
    }
}