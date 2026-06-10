import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPage from '../AdminPage.vue';

const authStoreMock = {
  isAdmin: true,
};

const adminStoreMock = {
  overview: { nodes: 1, relations: 1, documents: 1, users: 1 },
  users: [{ id: 1, username: 'alice', email: 'alice@example.com', role: 'user', is_active: true }],
  fetchOverview: vi.fn(),
  fetchUsers: vi.fn(),
  updateUser: vi.fn(),
};

const flushView = async () => {
  await Promise.resolve();
  await nextTick();
};

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}));

vi.mock('@/stores/admin', () => ({
  useAdminStore: () => adminStoreMock,
}));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStoreMock.isAdmin = true;
    adminStoreMock.overview = { nodes: 1, relations: 1, documents: 1, users: 1 };
    adminStoreMock.users = [{ id: 1, username: 'alice', email: 'alice@example.com', role: 'user', is_active: true }];
    adminStoreMock.fetchOverview.mockResolvedValue(adminStoreMock.overview);
    adminStoreMock.fetchUsers.mockResolvedValue(adminStoreMock.users);
    adminStoreMock.updateUser.mockResolvedValue({ role: 'user', is_active: true });
  });

  it('非管理员不会加载管理数据并显示 403 文案', async () => {
    authStoreMock.isAdmin = false;
    const wrapper = mount(AdminPage);
    await flushView();

    expect(wrapper.get('[data-testid="admin-forbidden"]').text()).toContain('仅管理员可访问');
    expect(adminStoreMock.fetchOverview).not.toHaveBeenCalled();
    expect(adminStoreMock.fetchUsers).not.toHaveBeenCalled();
  });

  it('保存用户成功后会显示成功提示', async () => {
    const wrapper = mount(AdminPage);
    await flushView();

    await wrapper.get('[data-testid="admin-save-1"]').trigger('click');
    await flushView();

    expect(adminStoreMock.updateUser).toHaveBeenCalledWith(1, { role: 'user', is_active: true });
    expect(wrapper.get('[data-testid="admin-success"]').text()).toContain('保存成功');
  });
});
