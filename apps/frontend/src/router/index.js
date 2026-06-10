import { createRouter, createWebHistory } from 'vue-router';
import GraphPage from '@/pages/GraphPage.vue';
import NodesPage from '@/pages/NodesPage.vue';
import RelationsPage from '@/pages/RelationsPage.vue';
import DocumentsPage from '@/pages/DocumentsPage.vue';
import DocumentEditPage from '@/pages/DocumentEditPage.vue';
import LoginPage from '@/pages/LoginPage.vue';
import AdminPage from '@/pages/AdminPage.vue';
import ForbiddenPage from '@/pages/ForbiddenPage.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage },
    { path: '/', component: GraphPage, meta: { requiresAuth: true } },
    { path: '/nodes', component: NodesPage, meta: { requiresAuth: true } },
    { path: '/relations', component: RelationsPage, meta: { requiresAuth: true } },
    { path: '/documents', component: DocumentsPage, meta: { requiresAuth: true } },
    { path: '/documents/:id/edit', component: DocumentEditPage, meta: { requiresAuth: true } },
    { path: '/admin', component: AdminPage, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/403', component: ForbiddenPage },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      const token = localStorage.getItem('kgm_access_token');
      if (!token) {
        return '/login';
      }
      authStore.restoreToken(token);
    }

    if (!authStore.user) {
      try {
        await authStore.fetchMe();
      } catch {
        return '/login';
      }
    }
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/';
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return '/403';
  }

  return true;
});

export default router;
