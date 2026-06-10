import { expect, test } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('RELATIONS', () => {
  test('关系创建/编辑/删除 + 非法权重校验', async ({ page }) => {
    await login(page, 'admin', 'Admin123!');
    await page.goto('/relations');

    await page.getByTestId('relation-new-btn').click();
    await page.getByTestId('relation-form-source').selectOption({ index: 0 });
    await page.getByTestId('relation-form-target').selectOption({ index: 1 });
    await page.getByTestId('relation-form-type').fill('测试关系');
    await page.getByTestId('relation-form-weight').fill('-1');
    await page.getByTestId('relation-form-submit').click();
    await expect(page.getByTestId('relation-form-error')).toContainText('权重必须大于等于 0');

    await page.getByTestId('relation-form-weight').fill('1.2');
    await page.getByTestId('relation-form-description').fill('desc');
    await page.getByTestId('relation-form-submit').click();
    await expect(page.getByTestId('relations-table')).toContainText('测试关系');

    const row = page.locator('tr', { hasText: '测试关系' }).first();
    await row.getByRole('button', { name: '编辑' }).click();
    await page.getByTestId('relation-form-weight').fill('2.5');
    await page.getByTestId('relation-form-submit').click();
    await expect(page.getByTestId('relations-table')).toContainText('2.5');

    page.on('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: '删除' }).click();
    await expect(page.getByTestId('relations-table')).not.toContainText('测试关系');
  });

  test('普通用户更新他人关系返回403', async ({ page, request }) => {
    await login(page, 'alice', 'Alice123!');
    const token = await page.evaluate(() => localStorage.getItem('kgm_access_token'));

    const listRes = await request.get('http://127.0.0.1:8000/api/relations/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = await listRes.json();
    const relation = list[0];

    const denyRes = await request.put(`http://127.0.0.1:8000/api/relations/${relation.id}/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        source_node: relation.source_node,
        target_node: relation.target_node,
        relation_type: relation.relation_type,
        weight: relation.weight,
        description: 'deny',
      },
    });
    expect(denyRes.status()).toBe(403);
  });
});
