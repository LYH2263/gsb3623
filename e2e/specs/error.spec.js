import { expect, test } from '@playwright/test';

test.describe('ERROR', () => {
  test('未认证 API 返回统一错误格式', async ({ request }) => {
    const res = await request.get('http://127.0.0.1:8000/api/auth/me/');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('details');
    expect(body).toHaveProperty('request_id');
  });

  test('失效 token 访问受保护路由会跳回登录', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('kgm_access_token', 'invalid-token');
    });

    await page.goto('/nodes');
    await expect(page).toHaveURL(/\/login$/);
  });
});
