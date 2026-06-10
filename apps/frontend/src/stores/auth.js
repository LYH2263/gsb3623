import { defineStore } from 'pinia';
import { apiClient } from '@/api/client';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('kgm_access_token') || '',
    refreshToken: localStorage.getItem('kgm_refresh_token') || '',
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    restoreToken(token) {
      this.accessToken = token;
    },
    async register(payload) {
      const { data } = await apiClient.post('/auth/register/', payload);
      return data;
    },
    async login(payload) {
      const { data } = await apiClient.post('/auth/login/', payload);
      this.accessToken = data.access;
      this.refreshToken = data.refresh;
      this.user = data.user;
      localStorage.setItem('kgm_access_token', data.access);
      localStorage.setItem('kgm_refresh_token', data.refresh);
      return data;
    },
    async fetchMe() {
      const { data } = await apiClient.get('/auth/me/');
      this.user = data;
      return data;
    },
    logout() {
      this.accessToken = '';
      this.refreshToken = '';
      this.user = null;
      localStorage.removeItem('kgm_access_token');
      localStorage.removeItem('kgm_refresh_token');
    },
  },
});
