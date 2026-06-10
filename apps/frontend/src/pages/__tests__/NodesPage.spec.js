import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import NodesPage from '../NodesPage.vue';

const nodeStoreMock = {
  items: [
    { id: 1, title: 'Node A', node_type: '技术', description: '', created_by: 2, created_at: new Date().toISOString() },
  ],
  fetchNodes: vi.fn(),
  createNode: vi.fn(),
  updateNode: vi.fn(),
  deleteNode: vi.fn(),
};

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAdmin: false,
    user: { id: 1, role: 'user' },
  }),
}));

vi.mock('@/stores/nodes', () => ({
  useNodeStore: () => nodeStoreMock,
}));

describe('NodesPage', () => {
  it('无权限节点的编辑按钮应禁用', async () => {
    const wrapper = mount(NodesPage);
    expect(wrapper.get('[data-testid="node-edit-1"]').attributes('disabled')).toBeDefined();
  });

  it('创建节点时空标题会被前端阻止', async () => {
    const wrapper = mount(NodesPage);
    await wrapper.get('[data-testid="nodes-new-btn"]').trigger('click');
    await wrapper.get('[data-testid="node-form-submit"]').trigger('click');
    expect(wrapper.get('[data-testid="node-form-error"]').text()).toContain('标题和类型为必填项');
  });
});
