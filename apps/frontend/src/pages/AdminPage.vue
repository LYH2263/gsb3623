<template>
  <section class="card" data-testid="admin-page">
    <h2>管理后台</h2>
    <div v-if="!authStore.isAdmin" class="error-text" data-testid="admin-forbidden">403：仅管理员可访问</div>

    <template v-else>
      <div class="stats-grid" v-if="adminStore.overview">
        <div class="stat-card" data-testid="stat-nodes">节点：{{ adminStore.overview.nodes }}</div>
        <div class="stat-card" data-testid="stat-relations">关系：{{ adminStore.overview.relations }}</div>
        <div class="stat-card" data-testid="stat-documents">文档：{{ adminStore.overview.documents }}</div>
        <div class="stat-card" data-testid="stat-users">用户：{{ adminStore.overview.users }}</div>
      </div>

      <p v-if="successMsg" class="success-text" data-testid="admin-success">{{ successMsg }}</p>
      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <table class="table" data-testid="admin-users-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>启用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in adminStore.users" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <select :data-testid="`admin-role-${user.id}`" v-model="user.role">
                <option value="admin">admin</option>
                <option value="user">user</option>
              </select>
            </td>
            <td>
              <input :data-testid="`admin-active-${user.id}`" v-model="user.is_active" type="checkbox" />
            </td>
            <td>
              <button
                :data-testid="`admin-save-${user.id}`"
                class="btn btn-primary"
                :disabled="savingUserId === user.id"
                @click="saveUser(user)"
              >
                {{ savingUserId === user.id ? '保存中...' : '保存' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';
import { getErrorMessage } from '@/utils/error';

const adminStore = useAdminStore();
const authStore = useAuthStore();
const successMsg = ref('');
const errorMsg = ref('');
const savingUserId = ref(null);

const load = async () => {
  if (!authStore.isAdmin) return;
  try {
    await Promise.all([adminStore.fetchOverview(), adminStore.fetchUsers()]);
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  }
};

const saveUser = async (user) => {
  if (savingUserId.value) return;
  successMsg.value = '';
  errorMsg.value = '';
  savingUserId.value = user.id;
  try {
    const updatedUser = await adminStore.updateUser(user.id, { role: user.role, is_active: user.is_active });
    user.role = updatedUser.role;
    user.is_active = updatedUser.is_active;
    successMsg.value = `用户 ${user.username} 保存成功`;
  } catch (error) {
    errorMsg.value = getErrorMessage(error, '保存用户失败');
    await load();
  } finally {
    savingUserId.value = null;
  }
};

onMounted(load);
</script>
