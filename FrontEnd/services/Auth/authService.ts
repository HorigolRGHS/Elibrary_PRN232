import { api, setAuthToken, removeAuthToken } from '@/api/apiClient';
import { ForgotPasswordRequestDTO, LoginRequestDTO, LoginResponseDTO, RegisterRequestDTO, ResetPasswordRequestDTO } from '@/models/dtos/authDTO';
import { ResponseDTO } from '@/models/dtos/commonDTO';

export async function login(payload: LoginRequestDTO): Promise<ResponseDTO<LoginResponseDTO>> {
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
        console.debug('[authService] token saved to cookie');
      } catch (e) {
        console.warn('[authService] failed to save token to cookie', e);
      }
    } else {
      console.warn('[authService] login data did not contain an access token', data);
    }
    return res;
  } catch (err: any) {
    const serverMsg = err?.response?.data?.message ?? err?.message ?? 'Login failed';
    throw new Error(serverMsg);
  }
}

export async function logout(): Promise<void> {
  removeAuthToken();
}

export async function register(payload: RegisterRequestDTO): Promise<ResponseDTO<string>> {
  const body = {
    fullName: (payload as any).fullName,
    email: payload.email,
    password: payload.password,
  };

  try {
    const res = await api.post<ResponseDTO<string>>('/auth/register', body);
    if (!res) {
      throw new Error('Empty response from server');
    }
    if (!res.success) {
      const errMsg = res.message || 'Registration failed';
      throw new Error(errMsg);
    }
    return res;
  } catch (err: any) {
    const serverMsg = err?.response?.data?.message ?? err?.message ?? 'Registration failed';
    throw new Error(serverMsg);
  }
}

export async function confirmRegistration(params: {
  token: string;
  email: string;
}): Promise<ResponseDTO<string>> {
  const { token, email } = params;
  try {
    const res = await api.get<ResponseDTO<string>>(
      `/auth/confirm-registration?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    );
    return res;
  } catch (err: any) {
    const serverMsg =
      err?.response?.data?.message ??
      err?.message ??
      "Confirmation failed";
    throw new Error(serverMsg);
  }
}

export async function forgotPassword(payload: ForgotPasswordRequestDTO): Promise<ResponseDTO<string>> {
  try{
    const res = await api.post<ResponseDTO<string>>('/auth/forgot-password', payload);
    if (!res) {
      throw new Error('Empty response from server');
    }
    if (!res.success) {
      const errMsg = res.message || 'Forgot password failed';
      throw new Error(errMsg);
    }
    return res;
  } catch (err: any) {
    const serverMsg = err?.response?.data?.message ?? err?.message ?? 'Forgot password failed';
    throw new Error(serverMsg);
  }
}

export async function resetPassword(payload: ResetPasswordRequestDTO): Promise<ResponseDTO<string>> {
  try{
    // call the reset endpoint (not the forgot-request endpoint)
    const res = await api.post<ResponseDTO<string>>('/auth/reset-password', payload);
    if (!res) {
      throw new Error('Empty response from server');
    }
    if (!res.success) {
      const errMsg = res.message || 'Reset password failed';
      throw new Error(errMsg);
    }
    return res;
  } catch (err: any) {
    const serverMsg = err?.response?.data?.message ?? err?.message ?? 'Reset password failed';
    throw new Error(serverMsg);
  }
}