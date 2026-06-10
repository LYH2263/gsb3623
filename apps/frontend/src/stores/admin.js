import { defineStore } from 'pinia';
import { apiClient } from '@/api/client';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    overview: null,
  }),
  actions: {
    async fetchUsers() {
      const { data } = await apiClient.get('/admin/users/');
      this.users = data;
      return data;
    },
    async updateUser(id, payload) {
      const { data } = await apiClient.patch(`/admin/users/${id}/`, payload);
      return data;
    },
    async fetchOverview() {
      const { data } = await apiClient.get('/admin/overview/');
      this.overview = data;
      return data;
    },
  },
});
