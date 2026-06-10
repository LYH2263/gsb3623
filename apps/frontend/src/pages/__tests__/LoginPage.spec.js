import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from '../LoginPage.vue';

const pushMock = vi.fn();
const authStoreMock = {
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}));

describe('LoginPage', () => {
  it('登录表单必填校验生效', async () => {
    const wrapper = mount(LoginPage);
    await wrapper.get('[data-testid="login-submit"]').trigger('submit');
    expect(wrapper.get('[data-testid="auth-error"]').text()).toContain('请填写用户名和密码');
  });

  it('注册表单必填校验生效', async () => {
    const wrapper = mount(LoginPage);
    await wrapper.get('[data-testid="tab-register"]').trigger('click');
    await wrapper.get('[data-testid="register-submit"]').trigger('submit');
    expect(wrapper.get('[data-testid="auth-error"]').text()).toContain('请完整填写注册信息');
  });

  it('注册时两次密码不一致会提示错误', async () => {
    const wrapper = mount(LoginPage);
    await wrapper.get('[data-testid="tab-register"]').trigger('click');
    await wrapper.get('[data-testid="register-username"]').setValue('u1');
    await wrapper.get('[data-testid="register-email"]').setValue('u1@example.com');
    await wrapper.get('[data-testid="register-password"]').setValue('Password123!');
    await wrapper.get('[data-testid="register-confirm-password"]').setValue('Password1234!');
    await wrapper.get('[data-testid="register-submit"]').trigger('submit');
    expect(wrapper.get('[data-testid="auth-error"]').text()).toContain('两次输入的密码不一致');
  });
});
