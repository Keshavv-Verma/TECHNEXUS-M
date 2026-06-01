const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcryptjs');
const { 
  hashPassword, 
  comparePassword, 
  isArgon2Hash 
} = require('../utils/passwordUtils');

test('Argon2id Hashing Utility Tests', async (t) => {

  await t.test('should hash password successfully using Argon2id format', async () => {
    const rawPassword = 'SuperSecretSecurePassword123';
    const hash = await hashPassword(rawPassword);

    assert.ok(hash);
    assert.equal(isArgon2Hash(hash), true);
    assert.ok(hash.startsWith('$argon2id$'));
  });

  await t.test('should verify valid Argon2id password and fail invalid password', async () => {
    const rawPassword = 'SuperSecretSecurePassword123';
    const wrongPassword = 'IncorrectPassword123';
    const hash = await hashPassword(rawPassword);

    const isMatchCorrect = await comparePassword(rawPassword, hash);
    const isMatchIncorrect = await comparePassword(wrongPassword, hash);

    assert.equal(isMatchCorrect, true);
    assert.equal(isMatchIncorrect, false);
  });

  await t.test('should verify legacy bcrypt password successfully (backward compatibility)', async () => {
    const rawPassword = 'BcryptPassword123!';
    const wrongPassword = 'IncorrectBcryptPassword';
    // Generate standard legacy bcrypt hash
    const bcryptHash = await bcrypt.hash(rawPassword, 10);

    assert.equal(isArgon2Hash(bcryptHash), false);

    const isMatchCorrect = await comparePassword(rawPassword, bcryptHash);
    const isMatchIncorrect = await comparePassword(wrongPassword, bcryptHash);

    assert.equal(isMatchCorrect, true);
    assert.equal(isMatchIncorrect, false);
  });

  await t.test('isArgon2Hash should return false for non-argon strings', () => {
    assert.equal(isArgon2Hash('plaintext'), false);
    assert.equal(isArgon2Hash(''), false);
    assert.equal(isArgon2Hash(null), false);
    assert.equal(isArgon2Hash(undefined), false);
    assert.equal(isArgon2Hash('$2a$10$abcdefghijklmnopqrstuv'), false); // legacy bcrypt format
  });
});
