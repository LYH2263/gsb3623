import { expect, test } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('NODES', () => {
  test('节点创建、前端校验、权限禁用与后端403', async ({ page, request }) => {
    await login(page, 'alice', 'Alice123!');
    await page.goto('/nodes');

    await page.getByTestId('nodes-new-btn').click();
    await page.getByTestId('node-form-submit').click();
    await expect(page.getByTestId('node-form-error')).toContainText('必填项');

    const title = `Node-${Date.now()}`;
    await page.getByTestId('node-form-title').fill(title);
    await page.getByTestId('node-form-type').fill('技术');
    await page.getByTestId('node-form-description').fill('e2e create');
    await page.getByTestId('node-form-submit').click();
    await expect(page.getByTestId('nodes-table')).toContainText(title);

    const djangoRow = page.locator('tr', { hasText: 'Django' }).first();
    await expect(djangoRow.getByRole('button', { name: '编辑' })).toBeDisabled();

    const token = await page.evaluate(() => localStorage.getItem('kgm_access_token'));
    const meRes = await request.get('http://127.0.0.1:8000/api/auth/me/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const me = await meRes.json();

    const listRes = await request.get('http://127.0.0.1:8000/api/nodes/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = await listRes.json();
    const adminNode = list.find((item) => item.created_by !== me.id);
    const denyRes = await request.put(`http://127.0.0.1:8000/api/nodes/${adminNode.id}/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'hacked',
        description: 'x',
        node_type: adminNode.node_type,
      },
    });
    expect(denyRes.status()).toBe(403);

    const badRes = await request.post('http://127.0.0.1:8000/api/nodes/', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: '',
        description: 'bypass frontend validation',
        node_type: '技术',
      },
    });
    expect(badRes.status()).toBe(400);
    const badBody = await badRes.json();
    expect(badBody).toHaveProperty('details');
  });

  test('删除节点会级联删除关系并将文档 node 置空', async ({ request }) => {
    const loginRes = await request.post('http://127.0.0.1:8000/api/auth/login/', {
      data: { username: 'admin', password: 'Admin123!' },
    });
    expect(loginRes.status()).toBe(200);
    const token = (await loginRes.json()).access;
    const headers = { Authorization: `Bearer ${token}` };

    const nodeARes = await request.post('http://127.0.0.1:8000/api/nodes/', {
      headers,
      data: { title: `Delete-A-${Date.now()}`, description: '', node_type: '概念' },
    });
    const nodeBRes = await request.post('http://127.0.0.1:8000/api/nodes/', {
      headers,
      data: { title: `Delete-B-${Date.now()}`, description: '', node_type: '概念' },
    });
    expect(nodeARes.status()).toBe(201);
    expect(nodeBRes.status()).toBe(201);
    const nodeA = await nodeARes.json();
    const nodeB = await nodeBRes.json();

    const relationRes = await request.post('http://127.0.0.1:8000/api/relations/', {
      headers,
      data: {
        source_node: nodeA.id,
        target_node: nodeB.id,
        relation_type: '关联',
        weight: 1,
        description: 'cascade test',
      },
    });
    expect(relationRes.status()).toBe(201);

    const docRes = await request.post('http://127.0.0.1:8000/api/documents/', {
      headers,
      data: {
        title: `Doc-${Date.now()}`,
        content: '# node bind',
        node_id: nodeA.id,
      },
    });
    expect(docRes.status()).toBe(201);
    const doc = await docRes.json();

    const deleteRes = await request.delete(`http://127.0.0.1:8000/api/nodes/${nodeA.id}/`, { headers });
    expect(deleteRes.status()).toBe(204);

    const relationListRes = await request.get(`http://127.0.0.1:8000/api/relations/?source_node=${nodeA.id}`, { headers });
    expect(relationListRes.status()).toBe(200);
    const relationList = await relationListRes.json();
    expect(relationList.length).toBe(0);

    const docDetailRes = await request.get(`http://127.0.0.1:8000/api/documents/${doc.id}/`, { headers });
    expect(docDetailRes.status()).toBe(200);
    const docDetail = await docDetailRes.json();
    expect(docDetail.node).toBeNull();
  });
});
