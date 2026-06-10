import { expect, test } from '@playwright/test';

test.describe('AUTH', () => {
  test('未登录访问受保护页会跳转登录', async ({ page }) => {
    await page.goto('/nodes');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('错误登录提示 + 正确登录成功', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-username').fill('admin');
    await page.getByTestId('login-password').fill('wrong-password');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('auth-error')).toBeVisible();

    await page.getByTestId('login-username').fill('admin');
    await page.getByTestId('login-password').fill('Admin123!');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('注册成功后返回登录页并预填用户名', async ({ page }) => {
    await page.goto('/login');
    const name = `u_${Date.now()}`;
    await page.getByTestId('tab-register').click();
    await page.getByTestId('register-username').fill(name);
    await page.getByTestId('register-email').fill(`${name}@example.com`);
    await page.getByTestId('register-password').fill('Password123!');
    await page.getByTestId('register-confirm-password').fill('Password123!');
    await page.getByTestId('register-submit').click();

    await expect(page.getByTestId('login-username')).toHaveValue(name);
  });

  test('注册重复用户名提示后端字段错误', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('tab-register').click();
    await page.getByTestId('register-username').fill('admin');
    await page.getByTestId('register-email').fill(`dup_${Date.now()}@example.com`);
    await page.getByTestId('register-password').fill('Password123!');
    await page.getByTestId('register-confirm-password').fill('Password123!');
    await page.getByTestId('register-submit').click();
    await expect(page.getByTestId('auth-error')).toBeVisible();
  });

  test('注册两次密码不一致时前端阻止提交', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('tab-register').click();
    await page.getByTestId('register-username').fill(`pwd_${Date.now()}`);
    await page.getByTestId('register-email').fill(`pwd_${Date.now()}@example.com`);
    await page.getByTestId('register-password').fill('Password123!');
    await page.getByTestId('register-confirm-password').fill('Password1234!');
    await page.getByTestId('register-submit').click();
    await expect(page.getByTestId('auth-error')).toContainText('密码不一致');
  });

  test('禁用账号无法登录', async ({ page, request }) => {
    const userName = `inactive_${Date.now()}`;
    const registerRes = await request.post('http://127.0.0.1:8000/api/auth/register/', {
      data: {
        username: userName,
        email: `${userName}@example.com`,
        password: 'Password123!',
      },
    });
    expect(registerRes.status()).toBe(201);

    const adminLoginRes = await request.post('http://127.0.0.1:8000/api/auth/login/', {
      data: { username: 'admin', password: 'Admin123!' },
    });
    expect(adminLoginRes.status()).toBe(200);
    const adminToken = (await adminLoginRes.json()).access;

    const usersRes = await request.get('http://127.0.0.1:8000/api/admin/users/', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(usersRes.status()).toBe(200);
    const users = await usersRes.json();
    const user = users.find((item) => item.username === userName);
    expect(user).toBeTruthy();

    const disableRes = await request.patch(`http://127.0.0.1:8000/api/admin/users/${user.id}/`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { role: 'user', is_active: false },
    });
    expect(disableRes.status()).toBe(200);

    await page.goto('/login');
    await page.getByTestId('login-username').fill(userName);
    await page.getByTestId('login-password').fill('Password123!');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('auth-error')).toBeVisible();
  });
});
