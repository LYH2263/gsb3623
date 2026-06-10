import { expect, test } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('DOCUMENTS', () => {
  test('文档创建、编辑保存、版本递增', async ({ page }) => {
    await login(page, 'admin', 'Admin123!');
    await page.goto('/documents');

    await page.getByTestId('documents-new-btn').click();
    const title = `Doc-${Date.now()}`;
    await page.getByTestId('doc-form-title').fill(title);
    await page.getByTestId('doc-form-node').selectOption({ label: 'Django' });
    await page.getByTestId('doc-form-content').fill('# v1\n\ncontent');
    await page.getByTestId('doc-form-submit').click();
    await expect(page.getByTestId('documents-table')).toContainText(title);

    await page.getByTestId('documents-filter-node').selectOption({ label: 'Django' });
    await expect(page.getByTestId('documents-table')).toContainText(title);

    await page.locator('tr', { hasText: title }).locator('[data-testid^="doc-versions-btn-"]').click();
    await expect(page.getByTestId('doc-versions-list')).toBeVisible();
    await expect(page.getByTestId('doc-versions-list')).toContainText('v1');
    await page.getByRole('button', { name: '关闭' }).click();

    await page.locator('tr', { hasText: title }).getByRole('link', { name: '编辑' }).click();
    await expect(page.getByTestId('doc-edit-title')).toContainText(title);
    await expect(page.getByTestId('doc-edit-node-tag')).toContainText('Django');
    await page.getByTestId('doc-edit-input-title').fill(`${title}-updated`);

    await page.getByTestId('doc-save-btn').click();
    await expect(page.getByTestId('doc-versions-panel')).toContainText('v2');
  });

  test('普通用户更新他人文档返回403', async ({ page, request }) => {
    await login(page, 'alice', 'Alice123!');
    const token = await page.evaluate(() => localStorage.getItem('kgm_access_token'));
    const meRes = await request.get('http://127.0.0.1:8000/api/auth/me/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const me = await meRes.json();

    const listRes = await request.get('http://127.0.0.1:8000/api/documents/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = await listRes.json();
    const targetDoc = list.find((item) => item.created_by !== me.id);

    const denyRes = await request.put(`http://127.0.0.1:8000/api/documents/${targetDoc.id}/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'deny',
        content: 'deny',
        node_id: null,
      },
    });
    expect(denyRes.status()).toBe(403);
  });
});
