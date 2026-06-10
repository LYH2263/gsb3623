<template>
  <section class="doc-edit-layout">
    <div class="card">
      <h2 data-testid="doc-edit-title">文档编辑：{{ form.title || '-' }}</h2>
      <div class="search-row">
        <button data-testid="doc-save-btn" class="btn btn-primary" @click="save">保存</button>
        <RouterLink class="btn btn-secondary" to="/documents">返回列表</RouterLink>
      </div>
      <p v-if="errorMsg" class="error-text" data-testid="doc-edit-error">{{ errorMsg }}</p>
      <p class="hint-text" data-testid="doc-edit-node-tag">关联节点：{{ nodeTitle }}</p>
      <div class="form-grid">
        <label>标题</label>
        <input v-model.trim="form.title" data-testid="doc-edit-input-title" />
      </div>
      <MdEditor v-model="form.content" data-testid="doc-editor" />
    </div>

    <aside class="card version-panel" data-testid="doc-versions-panel">
      <h3>版本历史</h3>
      <ul>
        <li v-for="version in documentStore.versions" :key="version.id" :data-testid="`doc-version-${version.version_number}`">
          v{{ version.version_number }} - {{ formatTime(version.created_at) }}
        </li>
      </ul>
    </aside>
  </section>
</template>

<script setup>
import { MdEditor } from 'md-editor-v3';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDocumentStore } from '@/stores/documents';
import { getErrorMessage } from '@/utils/error';

const route = useRoute();
const documentStore = useDocumentStore();
const errorMsg = ref('');
const nodeTitle = ref('未关联');

const form = reactive({
  title: '',
  content: '',
  node_id: null,
});

const formatTime = (value) => new Date(value).toLocaleString('zh-CN');

const load = async () => {
  errorMsg.value = '';
  try {
    const doc = await documentStore.fetchDocument(route.params.id);
    form.title = doc.title;
    form.content = doc.content;
    form.node_id = doc.node;
    nodeTitle.value = doc.node_title || '未关联';
    await documentStore.fetchVersions(route.params.id);
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  }
};

const save = async () => {
  try {
    await documentStore.updateDocument(route.params.id, {
      title: form.title,
      content: form.content,
      node_id: form.node_id,
    });
    const refreshed = await documentStore.fetchDocument(route.params.id);
    nodeTitle.value = refreshed.node_title || '未关联';
    await documentStore.fetchVersions(route.params.id);
  } catch (error) {
    errorMsg.value = getErrorMessage(error, '保存失败');
  }
};

onMounted(load);
</script>
