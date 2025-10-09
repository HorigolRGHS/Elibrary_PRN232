import { api, setAuthToken, removeAuthToken } from '@/api/apiClient';
import { LoginRequestDTO, LoginResponseDTO } from '@/models/dtos/authDTO';
import { ResponseDTO } from '@/models/dtos/commonDTO';

export async function login(payload: LoginRequestDTO): Promise<LoginResponseDTO> {
  try {
    const res = await api.post<ResponseDTO<LoginResponseDTO>>('/auth/login', payload);

    if (!res) {
      throw new Error('Empty response from server');
    }

    if (!res.success) {
      const errMsg = res.message || 'Login failed';
      throw new Error(errMsg);
    }

    const data = res.data as LoginResponseDTO;

    const token = data?.accessToken ?? (data as any)?.token ?? null;
    if (token) {
      try {
        setAuthToken(token);
        console.debug('[authService] token saved to localStorage');
      } catch (e) {
        console.warn('[authService] failed to save token to localStorage', e);
      }
    } else {
      console.warn('[authService] login data did not contain an access token', data);
    }

    return data;
  } catch (err: any) {
    const serverMsg = err?.response?.data?.message ?? err?.message ?? 'Login failed';
    throw new Error(serverMsg);
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (e) {
  } finally {
    removeAuthToken();
  }
}

