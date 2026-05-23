const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { signupSchema, loginSchema } = require('../utils/validationSchemas');

/**
 * POST /api/signup
 * Register a new user
 */
const signup = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(value.password, 10);

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
    console.error('Error creating user:', error);
    
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
 */
const login = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    console.log('Login attempt:', { email, passwordLength: password.length });

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('User not found:', email.toLowerCase());
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', { email: user.email, isAdmin: user.isAdmin, hashedPasswordLength: user.password.length });

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      token,
      isAdmin: user.isAdmin,
      userId: user._id,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

module.exports = {
  signup,
  login,
};
