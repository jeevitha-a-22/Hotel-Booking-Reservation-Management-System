// One-off script to create the first admin and staff accounts, since public
// registration (Module 1) only ever creates 'guest' role users.
// Usage: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seed = async () => {
  await connectDB();

  const accounts = [
    { name: 'Hotel Admin', email: 'admin@hotel.com', password: 'Admin@123', role: 'admin' },
    { name: 'Front Desk Staff', email: 'staff@hotel.com', password: 'Staff@123', role: 'staff' },
  ];

  for (const acc of accounts) {
    const existing = await User.findOne({ email: acc.email });
    if (existing) {
      console.log(`Skipped (already exists): ${acc.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(acc.password, 10);
    await User.create({ name: acc.name, email: acc.email, passwordHash, role: acc.role });
    console.log(`Created ${acc.role}: ${acc.email} / password: ${acc.password}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
