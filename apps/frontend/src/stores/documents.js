import { defineStore } from 'pinia';
import { apiClient } from '@/api/client';

export const useDocumentStore = defineStore('documents', {
  state: () => ({
    items: [],
    current: null,
    versions: [],
  }),
  actions: {
    async fetchDocuments(params = {}) {
      const { data } = await apiClient.get('/documents/', { params });
      this.items = data;
      return data;
    },
    async fetchDocument(id) {
      const { data } = await apiClient.get(`/documents/${id}/`);
      this.current = data;
      return data;
    },
    async createDocument(payload) {
      const { data } = await apiClient.post('/documents/', payload);
      return data;
    },
    async updateDocument(id, payload) {
      const { data } = await apiClient.put(`/documents/${id}/`, payload);
      return data;
    },
    async fetchVersions(id) {
      const { data } = await apiClient.get(`/documents/${id}/versions/`);
      this.versions = data;
      return data;
    },
  },
});
