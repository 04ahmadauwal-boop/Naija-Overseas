const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const ADMIN_EMAIL = 'naijaandoverseas@gmail.com';
const ADMIN_PASSWORD = 'Admin@NaijaOverseas2026';

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // Reset password plaintext so the pre-save hook hashes it correctly
    existing.password = ADMIN_PASSWORD;
    existing.role = 'admin';
    existing.isVerified = true;
    await existing.save();
    console.log('Existing user updated: password reset, role=admin, verified=true.');
  } else {
    // Pass plaintext — the pre-save hook will hash it
    await User.create({
      name: 'Education Education Naija & Overseas Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin account created successfully.');
  }

  console.log('Email:    ' + ADMIN_EMAIL);
  console.log('Password: ' + ADMIN_PASSWORD);

  await mongoose.disconnect();
  console.log('Done.');
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
