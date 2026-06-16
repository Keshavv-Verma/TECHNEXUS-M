const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const logger = require('../utils/logger');
const { 
  signupSchema, 
  loginSchema, 
  changePasswordSchema, 
  resetPasswordSchema 
} = require('../utils/validationSchemas');
const { 
  hashPassword, 
  comparePassword, 
  isArgon2Hash 
} = require('../utils/passwordUtils');

/**
 * POST /api/signup
 * Register a new user with Argon2id hashing
 */
const signup = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Hash password with Argon2id
    const hashedPassword = await hashPassword(value.password);

    const user = await User.create({
      name: value.name,
      email: value.email.toLowerCase(),
      password: hashedPassword,
    }); 

    res.status(201).json({
      message: 'User created successfully',
      userId: user._id,
    });
  } catch (error) {
    logger.error('Error creating user', error.message);
    
    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    next(error);
  }
};

/**
 * POST /api/login
 * Authenticate user and return JWT token
 * Automatically upgrades password hashing to Argon2id transparently
 */
const login = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    logger.debug('Login attempt', { email: email.toLowerCase() });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate using fallback compare function (handles both bcrypt and Argon2)
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Rolling Migration Check:
    // If the stored hash is not Argon2, re-hash it using Argon2id and save
    if (!isArgon2Hash(user.password)) {
      logger.info('Upgrading password hash to Argon2id dynamically', { userId: user._id.toString() });
      try {
        user.password = await hashPassword(password);
        await user.save();
      } catch (migrationError) {
        logger.error('Failed to upgrade legacy bcrypt hash to Argon2id during login', migrationError.message);
        // Do not block login if saving fails (robust fallback)
      }
    }

    // Generate JWT token (hardened JWT options)
    const token = jwt.sign(
      { userId: user._id.toString(), isAdmin: user.isAdmin, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn, algorithm: 'HS256' }
    );

    // Helper to parse duration string to ms
    const parseDuration = (str) => {
      const match = str.match(/^(\d+)([dhm])$/);
      if (!match) return 7 * 24 * 60 * 60 * 1000;
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        default: return 7 * 24 * 60 * 60 * 1000;
      }
    };

    // Generate Refresh token
    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn, algorithm: 'HS256' }
    );

    // Save refresh token to user
    const refreshExpires = new Date(Date.now() + parseDuration(config.jwt.refreshExpiresIn));
    user.refreshTokens.push({ token: refreshToken, expires: refreshExpires });
    await user.save();

    res.json({
      token,
      refreshToken,
      isAdmin: user.isAdmin,
      userId: user._id.toString(),
      message: 'Login successful',
    });
  } catch (error) {
    logger.error('Login error', error.message);
    next(error);
  }
};

/**
 * POST /api/refresh-token
 * Refresh access token using a valid refresh token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: incomingToken } = req.body;
    if (!incomingToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    // Verify incoming refresh token (hardened verification)
    let decoded;
    try {
      decoded = jwt.verify(incomingToken, config.jwt.secret, { algorithms: ['HS256'] });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if the refresh token is in user's refreshTokens and not expired
    const activeTokenIndex = user.refreshTokens.findIndex(
      (t) => t.token === incomingToken && t.expires > new Date()
    );

    if (activeTokenIndex === -1) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id.toString(), isAdmin: user.isAdmin, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn, algorithm: 'HS256' }
    );

    // Rotate refresh token: generate new refresh token
    const newRefreshToken = jwt.sign(
      { userId: user._id.toString() },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn, algorithm: 'HS256' }
    );

    // Helper to parse duration string to ms
    const parseDuration = (str) => {
      const match = str.match(/^(\d+)([dhm])$/);
      if (!match) return 7 * 24 * 60 * 60 * 1000;
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        default: return 7 * 24 * 60 * 60 * 1000;
      }
    };

    const refreshExpires = new Date(Date.now() + parseDuration(config.jwt.refreshExpiresIn));

    // Remove the old token and save the new rotated one
    user.refreshTokens.splice(activeTokenIndex, 1);
    user.refreshTokens.push({ token: newRefreshToken, expires: refreshExpires });
    await user.save();

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Refresh token error', error.message);
    next(error);
  }
};

/**
 * POST /api/logout
 * Revoke/delete the refresh token for a user
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken: incomingToken } = req.body;
    if (incomingToken) {
      // Find user who owns this token and remove it
      let decoded;
      try {
        decoded = jwt.verify(incomingToken, config.jwt.secret, { algorithms: ['HS256'] });
        const user = await User.findById(decoded.userId);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((t) => t.token !== incomingToken);
          await user.save();
        }
      } catch (err) {
        // Even if token verification fails, we can just proceed
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', error.message);
    next(error);
  }
};

/**
 * POST /api/change-password
 * Change password for the logged-in user
 */
const changePassword = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { oldPassword, newPassword } = value;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    // Hash and save new password
    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Change password error', error.message);
    next(error);
  }
};

/**
 * POST /api/admin/reset-password
 * Reset password for any user account (Admin only)
 */
const resetPassword = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, newPassword } = value;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash and save new password
    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'User password reset successfully' });
  } catch (error) {
    logger.error('Admin password reset error', error.message);
    next(error);
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  changePassword,
  resetPassword,
};
