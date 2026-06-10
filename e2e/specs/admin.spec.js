import { expect, test } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('ADMIN', () => {
  test('普通用户不显示管理后台入口且访问 admin 会跳转 403', async ({ page }) => {
    await login(page, 'alice', 'Alice123!');
    await expect(page.getByTestId('nav-admin')).toHaveCount(0);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/403$/);
    await expect(page.getByTestId('forbidden-page')).toBeVisible();
  });

  test('管理员可查看概览并更新用户', async ({ page }) => {
    await login(page, 'admin', 'Admin123!');
    await page.goto('/admin');

    await expect(page.getByTestId('stat-users')).toBeVisible();
    await expect(page.getByTestId('admin-users-table')).toBeVisible();

    const roleSelect = page.locator('[data-testid^="admin-role-"]').first();
    const activeCheckbox = page.locator('[data-testid^="admin-active-"]').first();
    const saveButton = page.locator('[data-testid^="admin-save-"]').first();

    const currentRole = await roleSelect.inputValue();
    await roleSelect.selectOption(currentRole === 'admin' ? 'user' : 'admin');

    const wasChecked = await activeCheckbox.isChecked();
    await activeCheckbox.setChecked(!wasChecked);
    await saveButton.click();
    await expect(page.getByTestId('admin-success')).toContainText('保存成功');
    await expect(page.getByTestId('admin-users-table')).toBeVisible();
    await expect(activeCheckbox).toHaveJSProperty('checked', !wasChecked);
  });
});
