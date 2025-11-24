import { DataProvider } from 'react-admin';
import { apiClient } from '@/lib/api-client';

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;

    if (resource === 'memories') {
      const data = await apiClient.listMemories(page, perPage);
      return {
        data: data.memories.map((m) => {
          const { id: uuid, ...rest } = m;
          return {
            ...rest,
            id: m.slug, // Use slug as the ID for React Admin
            uuid, // Keep UUID for reference
            mediaCount: m._count.mediaItems,
          };
        }) as any,
        total: data.pagination.totalCount,
      };
    }

    throw new Error(`Unknown resource: ${resource}`);
  },

  getOne: async (resource, params) => {
    if (resource === 'memories') {
      // params.id is now the slug
      const data = await apiClient.getMemoryBySlugAdmin(params.id as string);
      const { id: uuid, ...rest } = data.memory;
      return {
        data: {
          ...rest,
          id: data.memory.slug, // Use slug as ID for React Admin
          uuid, // Keep UUID for reference
          mediaItems: data.mediaItems,
        } as any,
      };
    }

    throw new Error(`Unknown resource: ${resource}`);
  },

  getMany: async (_resource, _params) => {
    // Not implemented for this use case
    return { data: [] };
  },

  getManyReference: async (_resource, _params) => {
    // Not implemented for this use case
    return { data: [], total: 0 };
  },

  create: async (resource, params) => {
    if (resource === 'memories') {
      const formData = new FormData();
      formData.append('title', params.data.title);
      if (params.data.description) {
        formData.append('description', params.data.description);
      }

      // Ensure eventDate is in ISO 8601 format
      const eventDate =
        params.data.eventDate instanceof Date
          ? params.data.eventDate.toISOString()
          : new Date(params.data.eventDate).toISOString();
      formData.append('eventDate', eventDate);

      if (params.data.cover?.rawFile) {
        formData.append('cover', params.data.cover.rawFile);
      }

      const data = await apiClient.createMemory(formData);
      return { data: { ...data, id: data.slug, uuid: data.id } as any };
    }

    throw new Error(`Unknown resource: ${resource}`);
  },

  update: async (resource, params) => {
    if (resource === 'memories') {
      const formData = new FormData();
      formData.append('title', params.data.title);
      if (params.data.description) {
        formData.append('description', params.data.description);
      }

      // Ensure eventDate is in ISO 8601 format
      const eventDate =
        params.data.eventDate instanceof Date
          ? params.data.eventDate.toISOString()
          : new Date(params.data.eventDate).toISOString();
      formData.append('eventDate', eventDate);

      // Only add cover if a new file was uploaded
      if (params.data.cover?.rawFile) {
        formData.append('cover', params.data.cover.rawFile);
      }

      const data = await apiClient.updateMemory(params.id as string, formData);
      return { data: { ...data, id: data.slug, uuid: data.id } as any };
    }

    throw new Error(`Unknown resource: ${resource}`);
  },

  updateMany: async (_resource, _params) => {
    // Not implemented for this use case
    return { data: [] };
  },

  delete: async (resource, params) => {
    if (resource === 'memories') {
      await apiClient.deleteMemory(params.id as string);
      return { data: { id: params.id } as any };
    }

    if (resource === 'media') {
      await apiClient.deleteMediaItem(params.id as string);
      return { data: { id: params.id } as any };
    }

    throw new Error(`Unknown resource: ${resource}`);
  },

  deleteMany: async (_resource, _params) => {
    // Not implemented for this use case
    return { data: [] };
  },
};
