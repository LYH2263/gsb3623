<template>
  <div class="app-shell">
    <header v-if="showNav" class="topbar">
      <div class="brand">知识关系管理平台</div>
      <nav class="nav-links">
        <RouterLink data-testid="nav-graph" to="/">图谱</RouterLink>
        <RouterLink data-testid="nav-nodes" to="/nodes">节点</RouterLink>
        <RouterLink data-testid="nav-relations" to="/relations">关系</RouterLink>
        <RouterLink data-testid="nav-documents" to="/documents">文档</RouterLink>
        <RouterLink v-if="authStore.isAdmin" data-testid="nav-admin" to="/admin">管理后台</RouterLink>
      </nav>
      <div class="topbar-actions">
        <span v-if="authStore.user" class="user-badge">{{ authStore.user.username }}</span>
        <button data-testid="logout-btn" class="btn btn-secondary" @click="logout">退出</button>
      </div>
    </header>

    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const showNav = computed(() => route.path !== '/login' && authStore.isAuthenticated);

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
