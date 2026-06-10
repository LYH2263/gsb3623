<template>
  <section class="card">
    <h2>知识节点管理</h2>
    <div class="search-row">
      <input v-model.trim="filters.keyword" data-testid="nodes-search-input" placeholder="关键词搜索" @keyup.enter="load" />
      <input v-model.trim="filters.type" data-testid="nodes-type-input" placeholder="类型筛选" @keyup.enter="load" />
      <button data-testid="nodes-search-btn" class="btn btn-secondary" @click="load">查询</button>
      <button data-testid="nodes-new-btn" class="btn btn-primary" @click="openCreate">新建节点</button>
    </div>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <table class="table" data-testid="nodes-table">
      <thead>
        <tr>
          <th>标题</th>
          <th>类型</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="node in nodeStore.items" :key="node.id">
          <td>{{ node.title }}</td>
          <td>{{ node.node_type }}</td>
          <td>{{ formatTime(node.created_at) }}</td>
          <td>
            <button :data-testid="`node-edit-${node.id}`" class="btn btn-secondary" :disabled="!canEdit(node)" @click="openEdit(node)">编辑</button>
            <button :data-testid="`node-delete-${node.id}`" class="btn btn-danger" :disabled="!canEdit(node)" @click="removeNode(node)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <BaseModal v-if="modalVisible" @close="modalVisible = false">
    <template #title>{{ editTarget ? '编辑节点' : '新建节点' }}</template>
    <div class="form-grid">
      <label>标题</label>
      <input v-model.trim="form.title" data-testid="node-form-title" />
      <label>类型</label>
      <input v-model.trim="form.node_type" data-testid="node-form-type" />
      <label>描述</label>
      <textarea v-model="form.description" data-testid="node-form-description" />
      <p v-if="formError" class="error-text" data-testid="node-form-error">{{ formError }}</p>
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="modalVisible = false">取消</button>
      <button data-testid="node-form-submit" class="btn btn-primary" @click="submit">保存</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useNodeStore } from '@/stores/nodes';
import { getErrorMessage } from '@/utils/error';

const authStore = useAuthStore();
const nodeStore = useNodeStore();

const filters = reactive({ keyword: '', type: '' });
const form = reactive({ title: '', node_type: '', description: '' });

const modalVisible = ref(false);
const editTarget = ref(null);
const formError = ref('');
const errorMsg = ref('');

const formatTime = (v) => new Date(v).toLocaleString('zh-CN');

const canEdit = (node) => authStore.isAdmin || node.created_by === authStore.user?.id;

const resetForm = () => {
  form.title = '';
  form.node_type = '';
  form.description = '';
  formError.value = '';
};

const load = async () => {
  errorMsg.value = '';
  try {
    await nodeStore.fetchNodes({ keyword: filters.keyword, type: filters.type });
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  }
};

const openCreate = () => {
  resetForm();
  editTarget.value = null;
  modalVisible.value = true;
};

const openEdit = (node) => {
  if (!canEdit(node)) return;
  form.title = node.title;
  form.node_type = node.node_type;
  form.description = node.description;
  editTarget.value = node;
  formError.value = '';
  modalVisible.value = true;
};

const submit = async () => {
  if (!form.title || !form.node_type) {
    formError.value = '标题和类型为必填项';
    return;
  }
  try {
    if (editTarget.value) {
      await nodeStore.updateNode(editTarget.value.id, form);
    } else {
      await nodeStore.createNode(form);
    }
    modalVisible.value = false;
    await load();
  } catch (error) {
    formError.value = getErrorMessage(error);
  }
};

const removeNode = async (node) => {
  if (!canEdit(node)) return;
  if (!window.confirm(`确认删除节点 ${node.title}？`)) return;
  try {
    await nodeStore.deleteNode(node.id);
    await load();
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  }
};

onMounted(load);
</script>
