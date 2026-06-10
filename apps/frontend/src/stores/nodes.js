import { defineStore } from 'pinia';
import { apiClient } from '@/api/client';

export const useNodeStore = defineStore('nodes', {
  state: () => ({
    items: [],
  }),
  actions: {
    async fetchNodes(params = {}) {
      const { data } = await apiClient.get('/nodes/', { params });
      this.items = data;
      return data;
    },
    async createNode(payload) {
      const { data } = await apiClient.post('/nodes/', payload);
      return data;
    },
    async updateNode(id, payload) {
      const { data } = await apiClient.put(`/nodes/${id}/`, payload);
      return data;
    },
    async deleteNode(id) {
      await apiClient.delete(`/nodes/${id}/`);
    },
  },
});
