const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { connectDB, disconnectDB, Product, Category } = require('../models');
const config = require('../config');

let server;
let port;
let adminToken;
let testProduct;

test.before(async () => {
  // Connect to the DB
  await connectDB();

  // Start server on random port
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      resolve();
    });
  });

  // Generate a mock admin token
  adminToken = jwt.sign(
    { userId: '60c72b2f9b1d8e2a4c8f3b1a', isAdmin: true, email: 'admin@test.com' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
});

test.after(async () => {
  // Cleanup test product if it was not deleted
  if (testProduct && testProduct._id) {
    await Product.findByIdAndDelete(testProduct._id);
  }
  
  // Close server and disconnect DB
  await new Promise((resolve) => server.close(resolve));
  await disconnectDB();
});

test('Product API CRUD integration', async (t) => {
  // 1. Create a product
  await t.test('POST /api/products creates a product successfully', async () => {
    const response = await fetch(`http://127.0.0.1:${port}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Test Integration Product',
        category: 'ELECTRONICS',
        price: 999,
        rating: 4.5,
        image: 'https://example.com/test.jpg',
        description: 'Test Description'
      })
    });

    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.name, 'Test Integration Product');
    assert.equal(body.price, 999);
    assert.equal(body.categoryId.name, 'ELECTRONICS');
    testProduct = body;
  });

  // 2. Fetch the created product
  await t.test('GET /api/products/:id retrieves the product', async () => {
    assert.ok(testProduct && testProduct._id);
    const response = await fetch(`http://127.0.0.1:${port}/api/products/${testProduct._id}`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.name, 'Test Integration Product');
  });

  // 3. Update the product
  await t.test('PUT /api/products/:id updates the product successfully', async () => {
    const response = await fetch(`http://127.0.0.1:${port}/api/products/${testProduct._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Updated Test Product',
        price: 1099,
        category: 'ELECTRONICS'
      })
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message, 'Product updated successfully');
    assert.equal(body.product.name, 'Updated Test Product');
    assert.equal(body.product.price, 1099);
  });

  // 4. Delete the product
  await t.test('DELETE /api/products/:id deletes the product successfully', async () => {
    const response = await fetch(`http://127.0.0.1:${port}/api/products/${testProduct._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message, 'Product deleted successfully');
    assert.equal(body.product._id, testProduct._id);

    // Verify it is deleted
    const checkResponse = await fetch(`http://127.0.0.1:${port}/api/products/${testProduct._id}`);
    assert.equal(checkResponse.status, 404);
    
    // Clear variable so after hook does not try to delete again
    testProduct = null;
  });
});
