import { expect, test } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('GRAPH', () => {
  test('图谱渲染、缩放平移、搜索定位与无结果分支', async ({ page }) => {
    await login(page, 'admin', 'Admin123!');

    await expect(page.getByTestId('graph-canvas')).toBeVisible();
    const firstNode = page.locator('[data-testid^="graph-node-"]').first();
    await expect(firstNode).toBeVisible();

    await expect
      .poll(async () => {
        const value = await firstNode.getAttribute('cx');
        return value === null ? null : Number(value);
      })
      .not.toBeNull();

    const beforeZoom = await page.evaluate(() => document.querySelector('svg g')?.getAttribute('transform'));
    await page.getByTestId('graph-canvas').hover();
    await page.mouse.wheel(0, -500);
    await expect
      .poll(async () => page.evaluate(() => document.querySelector('svg g')?.getAttribute('transform')))
      .not.toBe(beforeZoom);

    await page.getByTestId('graph-search-input').fill('Django');
    await page.getByTestId('graph-search-btn').click();
    await expect(page.getByTestId('graph-search-hint')).toContainText('已定位');
    await expect(page.getByTestId('node-detail-panel')).toContainText('标题');
    const docLink = page.locator('[data-testid^="graph-doc-link-"]').first();
    await expect(docLink).toBeVisible();
    await docLink.click();
    await expect(page).toHaveURL(/\/documents\/\d+\/edit$/);

    await page.goto('/');
    await page.getByTestId('graph-search-input').fill('不存在关键词12345');
    await page.getByTestId('graph-search-btn').click();
    await expect(page.getByTestId('graph-search-hint')).toContainText('未找到');
  });

  test('节点/关系右键菜单可见并可跳转', async ({ page }) => {
    await login(page, 'admin', 'Admin123!');

    const firstNode = page.locator('[data-testid^="graph-node-"]').first();
    await firstNode.click({ button: 'right' });
    await expect(page.getByTestId('graph-context-menu')).toBeVisible();
    await page.getByTestId('graph-menu-node-manage').click();
    await expect(page).toHaveURL(/\/nodes$/);

    await page.goto('/');
    const hasLink = await page.evaluate(() => {
      const line = document.querySelector('line');
      if (!line) return false;
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 120,
        clientY: 120,
      });
      line.dispatchEvent(event);
      return true;
    });
    expect(hasLink).toBeTruthy();
    await expect(page.getByTestId('graph-context-menu')).toBeVisible();
    await page.getByTestId('graph-menu-link-manage').click();
    await expect(page).toHaveURL(/\/relations$/);
  });
});
