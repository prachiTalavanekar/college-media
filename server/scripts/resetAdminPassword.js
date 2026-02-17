const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'prachi@admin.com', role: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Set new password
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 New Password:', newPassword);
    console.log('🔗 Login URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetAdminPassword();