require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models');
const { hashPassword } = require('../utils/passwordUtils');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/technexus';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Reset or create admin user with Argon2id hash
const resetAdminPassword = async () => {
  try {
    await connectDB();

    const adminEmail = process.argv[2] || 'admin@example.com';
    const newPassword = process.argv[3] || 'Admin@123456';

    console.log(`\nResetting admin password...`);
    console.log(`Email: ${adminEmail}`);
    console.log(`New Password: ${newPassword}`);

    // Check if user exists
    let user = await User.findOne({ email: adminEmail.toLowerCase() });

    // Hash the password with Argon2id
    const hashedPassword = await hashPassword(newPassword);

    if (user) {
      // Update existing user's password
      user.password = hashedPassword;
      user.isAdmin = true;
      await user.save();
      console.log('\n✅ Admin password updated successfully using Argon2id!');
    } else {
      // Create new admin user
      user = await User.create({
        name: 'Admin',
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        isAdmin: true,
      });
      console.log('\n✅ New admin user created successfully using Argon2id!');
    }

    console.log(`\nAdmin Details:`);
    console.log(`Email: ${user.email}`);
    console.log(`Is Admin: ${user.isAdmin}`);
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${newPassword}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

resetAdminPassword();
