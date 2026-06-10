import { defineStore } from 'pinia';
import { apiClient } from '@/api/client';

export const useRelationStore = defineStore('relations', {
  state: () => ({
    items: [],
  }),
  actions: {
    async fetchRelations(params = {}) {
      const { data } = await apiClient.get('/relations/', { params });
      this.items = data;
      return data;
    },
    async createRelation(payload) {
      const { data } = await apiClient.post('/relations/', payload);
      return data;
    },
    async updateRelation(id, payload) {
      const { data } = await apiClient.put(`/relations/${id}/`, payload);
      return data;
    },
    async deleteRelation(id) {
      await apiClient.delete(`/relations/${id}/`);
    },
  },
});
