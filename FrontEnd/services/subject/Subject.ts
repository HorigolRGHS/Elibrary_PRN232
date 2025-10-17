import { api } from "@/api/apiClient";
import { SubjectSelect } from "@/models/dtos/subjectDTO";

export const SubjectService = {
    getSelectSubjects: async (): Promise<SubjectSelect[]> => {
        return await api.get<SubjectSelect[]>('/catalog/api/subjects');
    }
}