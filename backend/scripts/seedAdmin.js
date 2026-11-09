const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staywise_db';

const seedUsers = async () => {
  try {
    console.log('Connecting to MongoDB for initial user seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to:', mongoose.connection.name);

    const defaultUsers = [
      {
        name: process.env.ADMIN_NAME || 'StayWise Administrator',
        email: (process.env.ADMIN_EMAIL || 'admin@staywise.com').toLowerCase(),
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        phone: process.env.ADMIN_PHONE || '+91 98765 43210',
        role: 'admin'
      },
      {
        name: 'Heritage Grand Manager',
        email: 'manager@staywise.com',
        password: 'Manager@123456',
        phone: '+91 98765 11223',
        role: 'hotel_manager'
      },
      {
        name: 'Aarav Sharma',
        email: 'guest@staywise.com',
        password: 'Guest@123456',
        phone: '+91 98765 99887',
        role: 'guest'
      }
    ];

    for (const u of defaultUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        existing.name = u.name;
        existing.role = u.role;
        existing.phone = u.phone;
        // Update password if specified
        existing.password = u.password;
        await existing.save();
        console.log(`Updated existing user: ${u.email} [${u.role}]`);
      } else {
        await User.create(u);
        console.log(`Created new seed user: ${u.email} [${u.role}]`);
      }
    }

    console.log('--- USER SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Roles seeded: admin, hotel_manager, guest');
    console.log('-------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('User seeding failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedUsers();
