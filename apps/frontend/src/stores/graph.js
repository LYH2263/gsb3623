import { defineStore } from 'pinia';
import { apiClient } from '@/api/client';

export const useGraphStore = defineStore('graph', {
  state: () => ({
    nodes: [],
    links: [],
  }),
  actions: {
    async fetchGraph() {
      const { data } = await apiClient.get('/graph/');
      this.nodes = data.nodes || [];
      this.links = data.links || [];
      return data;
    },
  },
});
