<template>
  <section class="card">
    <h2>知识关系管理</h2>
    <div class="search-row">
      <button data-testid="relation-new-btn" class="btn btn-primary" @click="openCreate">新建关系</button>
      <button data-testid="relation-refresh-btn" class="btn btn-secondary" @click="load">刷新</button>
    </div>
    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <table class="table" data-testid="relations-table">
      <thead>
        <tr>
          <th>源节点</th>
          <th>目标节点</th>
          <th>关系类型</th>
          <th>权重</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="relation in relationStore.items" :key="relation.id">
          <td>{{ findNodeName(relation.source_node) }}</td>
          <td>{{ findNodeName(relation.target_node) }}</td>
          <td>{{ relation.relation_type }}</td>
          <td>{{ relation.weight }}</td>
          <td>
            <button :data-testid="`relation-edit-${relation.id}`" class="btn btn-secondary" :disabled="!canEdit(relation)" @click="openEdit(relation)">编辑</button>
            <button :data-testid="`relation-delete-${relation.id}`" class="btn btn-danger" :disabled="!canEdit(relation)" @click="removeRelation(relation)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <BaseModal v-if="modalVisible" @close="modalVisible = false">
    <template #title>{{ editTarget ? '编辑关系' : '新建关系' }}</template>
    <div class="form-grid">
      <label>源节点</label>
      <select v-model.number="form.source_node" data-testid="relation-form-source">
        <option v-for="node in nodeStore.items" :key="node.id" :value="node.id">{{ node.title }}</option>
      </select>

      <label>目标节点</label>
      <select v-model.number="form.target_node" data-testid="relation-form-target">
        <option v-for="node in nodeStore.items" :key="node.id" :value="node.id">{{ node.title }}</option>
      </select>

      <label>关系类型</label>
      <input v-model.trim="form.relation_type" data-testid="relation-form-type" />

      <label>权重</label>
      <input v-model.number="form.weight" data-testid="relation-form-weight" type="number" min="0" step="0.1" />

      <label>描述</label>
      <textarea v-model="form.description" data-testid="relation-form-description" />
      <p v-if="formError" class="error-text" data-testid="relation-form-error">{{ formError }}</p>
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="modalVisible = false">取消</button>
      <button data-testid="relation-form-submit" class="btn btn-primary" @click="submit">保存</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useNodeStore } from '@/stores/nodes';
import { useRelationStore } from '@/stores/relations';
import { getErrorMessage } from '@/utils/error';

const authStore = useAuthStore();
const nodeStore = useNodeStore();
const relationStore = useRelationStore();

const modalVisible = ref(false);
const editTarget = ref(null);
const errorMsg = ref('');
const formError = ref('');

const form = reactive({
  source_node: null,
  target_node: null,
  relation_type: '',
  weight: 1,
  description: '',
});

const canEdit = (relation) => authStore.isAdmin || relation.created_by === authStore.user?.id;

const findNodeName = (id) => nodeStore.items.find((item) => item.id === id)?.title || `#${id}`;

const resetForm = () => {
  form.source_node = nodeStore.items[0]?.id || null;
  form.target_node = nodeStore.items[1]?.id || form.source_node;
  form.relation_type = '';
  form.weight = 1;
  form.description = '';
  formError.value = '';
};

const load = async () => {
  errorMsg.value = '';
  try {
    await nodeStore.fetchNodes();
    await relationStore.fetchRelations();
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  }
};

const openCreate = () => {
  editTarget.value = null;
  resetForm();
  modalVisible.value = true;
};

const openEdit = (relation) => {
  if (!canEdit(relation)) return;
  form.source_node = relation.source_node;
  form.target_node = relation.target_node;
  form.relation_type = relation.relation_type;
  form.weight = relation.weight;
  form.description = relation.description;
  editTarget.value = relation;
  formError.value = '';
  modalVisible.value = true;
};

const submit = async () => {
  if (!form.source_node || !form.target_node || !form.relation_type) {
    formError.value = '请完整填写关系信息';
    return;
  }
  if (form.weight < 0) {
    formError.value = '权重必须大于等于 0';
    return;
  }
  try {
    if (editTarget.value) {
      await relationStore.updateRelation(editTarget.value.id, form);
    } else {
      await relationStore.createRelation(form);
    }
    modalVisible.value = false;
    await load();
  } catch (error) {
    formError.value = getErrorMessage(error);
  }
};

const removeRelation = async (relation) => {
  if (!canEdit(relation)) return;
  if (!window.confirm('确认删除关系？')) return;
  try {
    await relationStore.deleteRelation(relation.id);
    await load();
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  }
};

onMounted(load);
</script>
