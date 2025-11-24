// Shared types between frontend and backend
export interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Memory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverUrl?: string;
  eventDate: Date;
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdByAdminId: string;
}

export interface MediaItem {
  id: string;
  memoryId: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  uploadedBy?: string;
  uploadedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateMemoryRequest {
  title: string;
  description?: string;
  eventDate: string;
}

export interface RequestUploadRequest {
  filename: string;
  mimeType: string;
  size: number;
}

export interface RequestUploadResponse {
  signedUrl: string;
  path: string;
  token: string;
  memoryId: string;
}

export interface CompleteUploadRequest {
  path: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface MemoryWithMedia {
  memory: Memory;
  mediaItems: MediaItem[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface MemoryListResponse {
  memories: (Memory & { _count: { mediaItems: number } })[];
  pagination: Pagination;
}
