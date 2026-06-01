const assert = require('node:assert/strict');
const test = require('node:test');
const { signup, login, changePassword, resetPassword } = require('../controllers/authController');
const { User } = require('../models');
const { isArgon2Hash, hashPassword, comparePassword } = require('../utils/passwordUtils');
const bcrypt = require('bcryptjs');

// Mock helpers for Express Req, Res, Next
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

test('TechNexus Auth Controllers Tests', async (t) => {

  await t.test('signup - should hash password using Argon2id and create user', async () => {
    // Stub User.create
    let createdUser = null;
    User.create = async (data) => {
      createdUser = data;
      return { _id: 'mock-user-id' };
    };

    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123!',
      }
    };
    const res = mockResponse();
    const next = () => {};

    await signup(req, res, next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.message, 'User created successfully');
    assert.ok(createdUser);
    assert.equal(createdUser.name, 'John Doe');
    assert.equal(createdUser.email, 'john@example.com');
    assert.equal(isArgon2Hash(createdUser.password), true);
    assert.ok(createdUser.password.startsWith('$argon2id$'));
  });

  await t.test('login - should perform rolling migration for legacy bcrypt password', async () => {
    const rawPassword = 'BcryptLegacyPassword123!';
    const bcryptHash = await bcrypt.hash(rawPassword, 10);
    
    let saved = false;
    const mockUser = {
      _id: { toString: () => 'user-id-123' },
      email: 'legacy@example.com',
      password: bcryptHash,
      isAdmin: false,
      refreshTokens: [],
      save: async function() {
        saved = true;
        return this;
      }
    };

    // Stub User.findOne
    User.findOne = async () => mockUser;

    const req = {
      body: {
        email: 'legacy@example.com',
        password: rawPassword,
      }
    };
    const res = mockResponse();
    const next = () => {};

    await login(req, res, next);

    assert.equal(res.body.message, 'Login successful');
    assert.ok(res.body.token);
    assert.ok(res.body.refreshToken);
    
    // Verify rolling migration took place
    assert.equal(saved, true);
    assert.equal(isArgon2Hash(mockUser.password), true);
    assert.ok(mockUser.password.startsWith('$argon2id$'));
  });

  await t.test('login - should NOT trigger rolling migration if already Argon2id', async () => {
    const rawPassword = 'ArgonPassword123!';
    const argonHash = await hashPassword(rawPassword);
    
    let savedCount = 0;
    const mockUser = {
      _id: { toString: () => 'user-id-456' },
      email: 'argon@example.com',
      password: argonHash,
      isAdmin: false,
      refreshTokens: [],
      save: async function() {
        savedCount++;
        return this;
      }
    };

    // Stub User.findOne
    User.findOne = async () => mockUser;

    const req = {
      body: {
        email: 'argon@example.com',
        password: rawPassword,
      }
    };
    const res = mockResponse();
    const next = () => {};

    await login(req, res, next);

    assert.equal(res.body.message, 'Login successful');
    
    // Verifying that user.save was called only once (to append refreshTokens),
    // and password hash is untouched
    assert.equal(savedCount, 1);
    assert.equal(mockUser.password, argonHash);
  });

  await t.test('changePassword - should verify old password and update to Argon2id', async () => {
    const originalPassword = 'OldPassword123!';
    const newPassword = 'NewSecretSecurePassword123!';
    const oldHash = await hashPassword(originalPassword);

    let saved = false;
    const mockUser = {
      _id: 'user-id-789',
      password: oldHash,
      save: async function() {
        saved = true;
        return this;
      }
    };

    User.findById = async () => mockUser;

    const req = {
      user: { userId: 'user-id-789' },
      body: {
        oldPassword: originalPassword,
        newPassword: newPassword,
      }
    };
    const res = mockResponse();
    const next = () => {};

    await changePassword(req, res, next);

    assert.equal(res.body.message, 'Password updated successfully');
    assert.equal(saved, true);
    assert.equal(isArgon2Hash(mockUser.password), true);
    // Verify verify with new password works
    const isNewMatch = await comparePassword(newPassword, mockUser.password);
    assert.equal(isNewMatch, true);
  });

  await t.test('resetPassword - should hash reset password with Argon2id', async () => {
    const resetTargetPassword = 'AdminResetPassword123!';
    
    let saved = false;
    const mockUser = {
      _id: 'target-user-abc',
      password: 'some-old-hash',
      save: async function() {
        saved = true;
        return this;
      }
    };

    User.findById = async () => mockUser;

    const req = {
      body: {
        userId: 'target-user-abc',
        newPassword: resetTargetPassword,
      }
    };
    const res = mockResponse();
    const next = () => {};

    await resetPassword(req, res, next);

    assert.equal(res.body.message, 'User password reset successfully');
    assert.equal(saved, true);
    assert.equal(isArgon2Hash(mockUser.password), true);
    const isMatch = await comparePassword(resetTargetPassword, mockUser.password);
    assert.equal(isMatch, true);
  });
});
