import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7000",
  timeout: 30000,
  withCredentials: true, 
  headers: {
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (typeof config.data === 'object' && config.data !== null) {
      config.headers["Content-Type"] = "application/json";
    }

    const token = typeof window !== 'undefined' ? getAuthToken() : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request trong development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as { message?: string })?.message || error.message;
      switch (status) {
        case 401:
          if (typeof window !== 'undefined') {
            try {
              removeAuthToken();
            } catch (e) {
            }
            try {
              const ev = new CustomEvent('api:unauthorized', {
                detail: {
                  url: error.config?.url,
                  status: 401,
                },
              });
              window.dispatchEvent(ev);
            } catch (e) {
              console.warn('⚠️ Could not dispatch api:unauthorized event, falling back to full redirect', e);
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          if (typeof window !== 'undefined') {
              window.location.href = '/';
          }
          console.error('❌ Forbidden:', message);
          break;
        case 404:
          console.error('❌ Not Found:', message);
          break;
        case 422:
          console.error('❌ Validation Error:', error.response.data);
          break;
        case 500:
          console.error('❌ Server Error:', message);
          break;
        default:
          console.error('❌ API Error:', message);
      }
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    try {
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
    } catch (e) {
      // ignore
    }
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    try {
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } catch (e) {
      // ignore
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      const m = document.cookie.match(/(?:^|; )token=([^;]+)/);
      if (m) return decodeURIComponent(m[1]);
    } catch (e) {
      // ignore
    }
    return null;
  }
  return null;
};

// API methods với error handling
export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },

  // File upload method
  uploadFile: async <T = any>(url: string, formData: FormData, onUploadProgress?: (progress: number) => void): Promise<T> => {
    const response = await apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      },
    });
    return response.data;
  },

  // Download file method
  downloadFile: async (url: string, filename?: string): Promise<void> => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Get file as blob for viewing
  getFileBlob: async (url: string): Promise<Blob> => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get file as File object for PDF viewer
  getFileAsFile: async (url: string, filename?: string): Promise<File> => {
    console.log('📁 Fetching file from URL:', url);
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    console.log('📁 File response received:', {
      status: response.status,
      contentType: response.headers['content-type'],
      size: response.data.size,
    });
    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
    const file = new File([blob], filename || 'document.pdf', { type: blob.type });
    console.log('📁 File object created:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    return file;
  },
};

export default apiClient;