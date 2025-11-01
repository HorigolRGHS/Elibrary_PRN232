import { api } from "@/api/apiClient";
import { ResponseDTO } from "@/models/dtos/commonDTO";
import { fileDTO } from "@/models/dtos/storageDTO";

/** --------- Common types --------- */
export type FileMode = "preview" | "full";

export const StorageService = {
  /** --------- Helpers --------- */
  buildFileDownloadUrl: (
    docId: number,
    fileUrl: string,
    mode: FileMode
  ): string =>
    `/file/api/download?docId=${docId}&fileName=${encodeURIComponent(
      fileUrl
    )}&mode=${mode}`,

  uploadFile: async (ufile: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", ufile);
    const resp = await api.uploadFile<ResponseDTO<fileDTO>>(
      "/file/api/upload/file",
      formData
    );
    return resp.data.fileName;
  },
};
