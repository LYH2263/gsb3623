<template>
  <section class="card">
    <h2>文档管理</h2>
    <div class="search-row">
      <select v-model.number="filterNodeId" data-testid="documents-filter-node" @change="load">
        <option :value="null">全部节点</option>
        <option v-for="node in nodeStore.items" :key="node.id" :value="node.id">{{ node.title }}</option>
      </select>
      <button data-testid="documents-new-btn" class="btn btn-primary" @click="openCreate">新建文档</button>
      <button data-testid="documents-refresh-btn" class="btn btn-secondary" @click="load">刷新</button>
    </div>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <table class="table" data-testid="documents-table">
      <thead>
        <tr>
          <th>标题</th>
          <th>关联节点</th>
          <th>更新时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documentStore.items" :key="doc.id">
          <td>{{ doc.title }}</td>
          <td>{{ findNodeName(doc.node) }}</td>
          <td>{{ formatTime(doc.updated_at) }}</td>
          <td>
            <button :data-testid="`doc-versions-btn-${doc.id}`" class="btn btn-secondary" @click="openVersions(doc)">版本历史</button>
            <RouterLink :to="`/documents/${doc.id}/edit`" :data-testid="`doc-edit-link-${doc.id}`" class="btn btn-secondary">编辑</RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <BaseModal v-if="modalVisible" @close="modalVisible = false">
    <template #title>新建文档</template>
    <div class="form-grid">
      <label>标题</label>
      <input v-model.trim="form.title" data-testid="doc-form-title" />
      <label>关联节点</label>
      <select v-model.number="form.node_id" data-testid="doc-form-node">
        <option :value="null">不关联</option>
        <option v-for="node in nodeStore.items" :key="node.id" :value="node.id">{{ node.title }}</option>
      </select>
      <label>Markdown 内容</label>
      <textarea v-model="form.content" data-testid="doc-form-content" rows="7" />
      <p v-if="formError" class="error-text" data-testid="doc-form-error">{{ formError }}</p>
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="modalVisible = false">取消</button>
      <button data-testid="doc-form-submit" class="btn btn-primary" @click="submit">创建</button>
    </template>
  </BaseModal>

  <BaseModal v-if="versionsModalVisible" @close="versionsModalVisible = false">
    <template #title>版本历史 - {{ versionTitle }}</template>
    <ul class="version-list" data-testid="doc-versions-list">
      <li v-for="item in documentStore.versions" :key="item.id">
        v{{ item.version_number }} - {{ formatTime(item.created_at) }}
      </li>
    </ul>
    <p v-if="!documentStore.versions.length" class="hint-text">暂无版本记录</p>
    <template #footer>
      <button class="btn btn-secondary" @click="versionsModalVisible = false">关闭</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import { useDocumentStore } from '@/stores/documents';
import { useNodeStore } from '@/stores/nodes';
import { getErrorMessage } from '@/utils/error';

const nodeStore = useNodeStore();
const documentStore = useDocumentStore();

const filterNodeId = ref(null);
const modalVisible = ref(false);
const versionsModalVisible = ref(false);
const versionTitle = ref('');
const errorMsg = ref('');
const formError = ref('');
const form = reactive({ title: '', node_id: null, content: '' });

const formatTime = (v) => new Date(v).toLocaleString('zh-CN');

const findNodeName = (id) => {
  if (!id) return '未关联';
  return nodeStore.items.find((item) => item.id === id)?.title || `#${id}`;
};

const load = async () => {
  try {
    await nodeStore.fetchNodes();
    await documentStore.fetchDocuments(filterNodeId.value ? { node_id: filterNodeId.value } : {});
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  }
};

const openCreate = () => {
  form.title = '';
  form.node_id = null;
  form.content = '';
  formError.value = '';
  modalVisible.value = true;
};

const submit = async () => {
  if (!form.title) {
    formError.value = '标题不能为空';
    return;
  }
  try {
    await documentStore.createDocument(form);
    modalVisible.value = false;
    await load();
  } catch (error) {
    formError.value = getErrorMessage(error);
  }
};

const openVersions = async (doc) => {
  try {
    versionTitle.value = doc.title;
    await documentStore.fetchVersions(doc.id);
    versionsModalVisible.value = true;
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  }
};

onMounted(load);
</script>
