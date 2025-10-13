import { api, setAuthToken } from "@/api/apiClient";
import { LoginResponseDTO } from "@/models/dtos/authDTO";
import { PagedResult, ResponseDTO } from "@/models/dtos/commonDTO";
import { UpdateUserAccountDTO, UpdateUserRequestDTO, UserInfoDTO, UserListItemDTO } from "@/models/dtos/userDTO";
import Error from "next/error";

export async function getProfile(): Promise<ResponseDTO<UserInfoDTO>> {
  try {
    const res = await api.get<ResponseDTO<UserInfoDTO>>(`/auth/me`);
    return res;
  } catch (err: any) {
    const serverMsg =
      err?.response?.data?.message ??
      err?.message ??
      "Get profile failed";
    throw new Error(serverMsg);
  }
}

export async function updateProfile(payload: UpdateUserRequestDTO): Promise<ResponseDTO<LoginResponseDTO>> {
  try {
    const res = await api.put<ResponseDTO<LoginResponseDTO>>(`/auth/me`, payload);
    const token = res?.data.accessToken ?? (res as any)?.token ?? null;
    if (token) {
      try {
        setAuthToken(token);
        console.debug('[userService] token saved to cookie');
      } catch (e) {
        console.warn('[userService] failed to save token to cookie', e);
      }
    } else {
      console.warn('[userService] response did not contain an access token');
    }
    return res;
  } catch (err: any) {
    const serverMsg =
      err?.response?.data?.message ??
      err?.message ??
      "Update profile failed";
    throw new Error(serverMsg);
  }
}



export async function getUsers(
  query?: string
): Promise<ResponseDTO<PagedResult<UserListItemDTO>>> {
  try {
    const endpoint = query ? `/auth/users?${query}` : `/auth/users`;
    const res = await api.get<ResponseDTO<PagedResult<UserListItemDTO>>>(endpoint);
    return res;
  } catch (err: any) {
    const serverMsg =
      err?.response?.data?.message ?? err?.message ?? "Get users failed";
    throw new Error(serverMsg);
  }
}

export async function updateUser(
  payload: UpdateUserAccountDTO
): Promise<ResponseDTO<string>> {
  try {
    const res = await api.put<ResponseDTO<string>>(`/auth/users`, payload);
    return res;
  } catch (err: any) {
    const serverMsg =
      err?.response?.data?.message ?? err?.message ?? "Update user failed";
    throw new Error(serverMsg);
  }
}

export async function deleteUser(
  userId: number
): Promise<ResponseDTO<string>> {
  try {
  const res = await api.delete<ResponseDTO<string>>(`/auth/users/${userId}`);
  return res;
  } catch (err: any) {
    const serverMsg =
      err?.response?.data?.message ?? err?.message ?? "Delete user failed";
    throw new Error(serverMsg);
  }
}