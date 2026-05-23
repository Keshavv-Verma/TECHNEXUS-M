const assert = require('node:assert/strict');
const test = require('node:test');

const app = require('../app');
const prisma = require('../models');

const request = path =>
  new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        const { port } = server.address();
        const response = await fetch(`http://127.0.0.1:${port}${path}`);
        resolve(response);
      } catch (error) {
        reject(error);
      } finally {
        server.close();
      }
    });
  });

test.after(async () => {
  await prisma.$disconnect();
});

test('health endpoint responds successfully', async () => {
  const response = await request('/health');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'OK');
  assert.ok(body.timestamp);
});
