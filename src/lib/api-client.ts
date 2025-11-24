import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthTokens,
  LoginRequest,
  Memory,
  MemoryWithMedia,
  MemoryListResponse,
  RequestUploadRequest,
  RequestUploadResponse,
  CompleteUploadRequest,
  MediaItem,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const { data } = await this.client.post<AuthTokens>(
                '/admin/auth/refresh',
                {},
                {
                  headers: { Authorization: `Bearer ${refreshToken}` },
                }
              );
              this.setTokens(data);
              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${data.accessToken}`;
                return this.client.request(error.config);
              }
            } catch (refreshError) {
              this.clearTokens();
              window.location.href = '/admin/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );

    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('accessToken');
  }

  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthTokens> {
    const { data } = await this.client.post<AuthTokens>('/admin/auth/login', credentials);
    this.setTokens(data);
    return data;
  }

  async logout() {
    this.clearTokens();
  }

  // Admin memory endpoints
  async createMemory(formData: FormData): Promise<Memory> {
    const { data } = await this.client.post<Memory>('/admin/memories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async listMemories(page = 1, limit = 20): Promise<MemoryListResponse> {
    const { data } = await this.client.get<MemoryListResponse>('/admin/memories', {
      params: { page, limit },
    });
    return data;
  }

  async getMemoryBySlugAdmin(slug: string, page = 1, limit = 50): Promise<MemoryWithMedia> {
    const { data } = await this.client.get<MemoryWithMedia>(`/admin/memories/${slug}`, {
      params: { page, limit },
    });
    return data;
  }

  // Public memory endpoints
  async getMemoryBySlug(slug: string, page = 1, limit = 50): Promise<MemoryWithMedia> {
    const { data } = await this.client.get<MemoryWithMedia>(`/memories/${slug}`, {
      params: { page, limit },
    });
    return data;
  }

  async requestUpload(slug: string, request: RequestUploadRequest): Promise<RequestUploadResponse> {
    const { data } = await this.client.post<RequestUploadResponse>(
      `/memories/${slug}/uploads/request`,
      request
    );
    return data;
  }

  async completeUpload(slug: string, request: CompleteUploadRequest): Promise<MediaItem> {
    const { data } = await this.client.post<MediaItem>(
      `/memories/${slug}/uploads/complete`,
      request
    );
    return data;
  }

  async getMediaItems(
    slug: string,
    page = 1,
    limit = 50
  ): Promise<{ mediaItems: MediaItem[]; pagination: any }> {
    const { data } = await this.client.get(`/memories/${slug}/media`, {
      params: { page, limit },
    });
    return data;
  }

  async deleteMediaItem(mediaId: string): Promise<void> {
    await this.client.delete(`/memories/media/${mediaId}`);
  }

  async deleteMemory(slug: string): Promise<void> {
    await this.client.delete(`/admin/memories/${slug}`);
  }

  // Direct upload to Supabase
  async uploadToSignedUrl(
    signedUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    await axios.put(signedUrl, file, {
      headers: {
        'Content-Type': file.type,
        'x-upsert': 'false',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });
  }
}

export const apiClient = new ApiClient();
