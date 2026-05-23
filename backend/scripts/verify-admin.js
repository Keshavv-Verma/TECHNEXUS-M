require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { User } = require('../models');

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/technexus';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const verifyAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.argv[2] || 'admin@example.com';
    const passwordToTest = process.argv[3] || 'Admin@123456';

    console.log(`Verifying admin user: ${adminEmail}\n`);

    // Find user
    const user = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!user) {
      console.log('✗ User not found in database');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✓ User found:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Is Admin: ${user.isAdmin}`);
    console.log(`  Created: ${user.createdAt}\n`);

    // Test password
    console.log(`Testing password: ${passwordToTest}`);
    const isMatch = await bcrypt.compare(passwordToTest, user.password);
    
    if (isMatch) {
      console.log('✓ Password matches! Login should work.\n');
    } else {
      console.log('✗ Password does NOT match.\n');
    }

    console.log('Hashed password (stored):');
    console.log(user.password);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

verifyAdmin();
