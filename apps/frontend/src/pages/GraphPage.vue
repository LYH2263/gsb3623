<template>
  <section class="graph-page">
    <div class="toolbar card">
      <div class="search-row">
        <input v-model.trim="keyword" data-testid="graph-search-input" placeholder="输入关键词定位节点" @keyup.enter="searchNode" />
        <button data-testid="graph-search-btn" class="btn btn-primary" @click="searchNode">搜索</button>
        <button data-testid="graph-refresh-btn" class="btn btn-secondary" @click="reloadGraph">刷新图谱</button>
      </div>
      <p v-if="searchHint" class="hint-text" data-testid="graph-search-hint">{{ searchHint }}</p>
    </div>

    <div class="graph-layout">
      <div class="card graph-card">
        <GraphCanvas
          :nodes="graphStore.nodes"
          :links="graphStore.links"
          :highlighted-node-ids="highlightedNodeIds"
          :highlighted-link-ids="highlightedLinkIds"
          :focus-node-id="focusNodeId"
          @node-click="onNodeClick"
          @node-contextmenu="onNodeContextMenu"
          @link-contextmenu="onLinkContextMenu"
          @canvas-click="hideContextMenu"
        />
      </div>

      <aside class="card detail-panel" data-testid="node-detail-panel">
        <h3>节点详情</h3>
        <template v-if="selectedNode">
          <p><strong>标题：</strong>{{ selectedNode.title }}</p>
          <p><strong>类型：</strong>{{ selectedNode.node_type }}</p>
          <p><strong>描述：</strong>{{ selectedNode.description || '-' }}</p>

          <h4>关联文档</h4>
          <ul class="doc-list">
            <li v-for="doc in linkedDocuments" :key="doc.id">
              <RouterLink :to="`/documents/${doc.id}/edit`" :data-testid="`graph-doc-link-${doc.id}`">{{ doc.title }}</RouterLink>
            </li>
          </ul>
          <p v-if="!linkedDocuments.length" class="hint-text">暂无关联文档</p>
        </template>
        <p v-else class="hint-text">点击图谱节点查看详情</p>
      </aside>
    </div>

    <div
      v-if="contextMenu.visible"
      class="context-menu card"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      data-testid="graph-context-menu"
    >
      <template v-if="contextMenu.type === 'node'">
        <button class="btn btn-secondary" data-testid="graph-menu-node-detail" @click="showNodeDetailFromMenu">查看详情</button>
        <button class="btn btn-secondary" data-testid="graph-menu-node-manage" @click="goNodesPageFromMenu">前往节点管理</button>
        <button class="btn btn-danger" data-testid="graph-menu-node-delete" :disabled="!canDeleteNode(contextMenu.target)" @click="deleteNodeFromMenu">删除节点</button>
      </template>
      <template v-else>
        <button class="btn btn-secondary" data-testid="graph-menu-link-manage" @click="goRelationsPageFromMenu">前往关系管理</button>
        <button class="btn btn-danger" data-testid="graph-menu-link-delete" :disabled="!canDeleteRelation(contextMenu.target)" @click="deleteRelationFromMenu">删除关系</button>
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import GraphCanvas from '@/components/GraphCanvas.vue';
import { useAuthStore } from '@/stores/auth';
import { useRelationStore } from '@/stores/relations';
import { useGraphStore } from '@/stores/graph';
import { useNodeStore } from '@/stores/nodes';
import { useDocumentStore } from '@/stores/documents';
import { getErrorMessage } from '@/utils/error';

const router = useRouter();
const authStore = useAuthStore();
const graphStore = useGraphStore();
const relationStore = useRelationStore();
const nodeStore = useNodeStore();
const documentStore = useDocumentStore();

const keyword = ref('');
const searchHint = ref('');
const selectedNode = ref(null);
const linkedDocuments = ref([]);
const focusNodeId = ref(null);
const highlightedNodeIds = ref([]);
const highlightedLinkIds = ref([]);
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  type: 'node',
  target: null,
});

const graphNodeById = computed(() => {
  const map = new Map();
  graphStore.nodes.forEach((node) => map.set(node.id, node));
  return map;
});

const reloadGraph = async () => {
  await graphStore.fetchGraph();
  highlightedNodeIds.value = [];
  highlightedLinkIds.value = [];
  focusNodeId.value = null;
  searchHint.value = '';
};

const setDetailByNode = async (node) => {
  selectedNode.value = node;
  const docs = await documentStore.fetchDocuments({ node_id: node.id });
  linkedDocuments.value = docs;
};

const onNodeClick = async (node) => {
  hideContextMenu();
  await setDetailByNode(node);
};

const hideContextMenu = () => {
  contextMenu.visible = false;
  contextMenu.target = null;
};

const showContextMenu = (payload, type) => {
  contextMenu.visible = true;
  contextMenu.type = type;
  contextMenu.target = payload;
  contextMenu.x = payload.x;
  contextMenu.y = payload.y;
};

const onNodeContextMenu = (payload) => {
  showContextMenu(payload, 'node');
};

const onLinkContextMenu = (payload) => {
  showContextMenu(payload, 'link');
};

const canDeleteNode = (node) => authStore.isAdmin || node?.created_by === authStore.user?.id;
const canDeleteRelation = (relation) => authStore.isAdmin || relation?.created_by === authStore.user?.id;

const showNodeDetailFromMenu = async () => {
  if (!contextMenu.target) return;
  hideContextMenu();
  await setDetailByNode(contextMenu.target);
};

const goNodesPageFromMenu = async () => {
  hideContextMenu();
  await router.push('/nodes');
};

const goRelationsPageFromMenu = async () => {
  hideContextMenu();
  await router.push('/relations');
};

const deleteNodeFromMenu = async () => {
  const node = contextMenu.target;
  if (!node || !canDeleteNode(node)) return;
  if (!window.confirm(`确认删除节点 ${node.title}？`)) return;
  try {
    await nodeStore.deleteNode(node.id);
    hideContextMenu();
    await reloadGraph();
    selectedNode.value = null;
    linkedDocuments.value = [];
    searchHint.value = '节点删除成功';
  } catch (error) {
    searchHint.value = getErrorMessage(error, '删除节点失败');
  }
};

const deleteRelationFromMenu = async () => {
  const relation = contextMenu.target;
  if (!relation || !canDeleteRelation(relation)) return;
  if (!window.confirm('确认删除关系？')) return;
  try {
    await relationStore.deleteRelation(relation.id);
    hideContextMenu();
    await reloadGraph();
    searchHint.value = '关系删除成功';
  } catch (error) {
    searchHint.value = getErrorMessage(error, '删除关系失败');
  }
};

const searchNode = async () => {
  if (!keyword.value) {
    searchHint.value = '请输入关键词';
    return;
  }
  const result = await nodeStore.fetchNodes({ keyword: keyword.value });
  if (!result.length) {
    searchHint.value = '未找到匹配节点';
    highlightedNodeIds.value = [];
    highlightedLinkIds.value = [];
    return;
  }

  const target = graphNodeById.value.get(result[0].id);
  if (!target) {
    searchHint.value = '结果存在，但当前图谱无对应节点';
    return;
  }

  const neighborNodeIds = new Set([target.id]);
  const neighborLinkIds = [];
  graphStore.links.forEach((link) => {
    const source = Number(link.source?.id ?? link.source);
    const targetId = Number(link.target?.id ?? link.target);
    if (source === target.id || targetId === target.id) {
      neighborNodeIds.add(source);
      neighborNodeIds.add(targetId);
      neighborLinkIds.push(link.id);
    }
  });

  focusNodeId.value = target.id;
  highlightedNodeIds.value = [...neighborNodeIds];
  highlightedLinkIds.value = neighborLinkIds;
  searchHint.value = `已定位：${target.title}`;
  await setDetailByNode(target);
};

onMounted(async () => {
  await reloadGraph();
  window.addEventListener('click', hideContextMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', hideContextMenu);
});
</script>
