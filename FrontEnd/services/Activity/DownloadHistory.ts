import { api } from "@/api/apiClient";
import { PagedResult, ResponseDTO } from "@/models/dtos/commonDTO";
import { DownloadHistoryDTO } from "@/models/dtos/downloadHistoryDTO";

export interface DownloadHistoryParams {
    $skip?: number;
    $top?: number;
    $count?: boolean;
}

export const GetUserDownloadHistory = async (params?: DownloadHistoryParams) : Promise<PagedResult<DownloadHistoryDTO>> => {
    const response = await api.get<ResponseDTO<PagedResult<DownloadHistoryDTO>>>('/activity/api/downloads/my-history', {
        params: {
            $skip: params?.$skip ?? 0,
            $top: params?.$top ?? 10,
            $count: params?.$count ?? true
        }
    });
    return response.data;
}