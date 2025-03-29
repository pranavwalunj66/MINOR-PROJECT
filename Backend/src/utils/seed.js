const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/user.model');
const Class = require('../models/class.model');
const Quiz = require('../models/quiz.model');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearCollections() {
  try {
    await User.deleteMany({});
    await Class.deleteMany({});
    await Quiz.deleteMany({});
    console.log('All collections cleared successfully');
  } catch (error) {
    console.error('Error clearing collections:', error);
    throw error;
  }
}

async function createTestUsers() {
  const testUsers = [
    {
      name: 'Test Teacher',
      email: 'teacher@test.com',
      phone: '9876543210',
      password: 'Teacher@123',  // Plain password, will be hashed by the model
      role: 'teacher',
      isVerified: true
    },
    {
      name: 'Test Student',
      email: 'student@test.com',
      phone: '9876543211',
      password: 'Student@123',  // Plain password, will be hashed by the model
      role: 'student',
      prn: '123456789012',
      department: 'Computer Science',
      isVerified: true
    }
  ];

  try {
    // Delete existing users first
    await User.deleteMany({
      email: { $in: ['teacher@test.com', 'student@test.com'] }
    });

    // Create new users
    const users = await User.create(testUsers);
    console.log('Test users created:', users.map(u => ({
      email: u.email,
      role: u.role,
      isVerified: u.isVerified
    })));
    return users;
  } catch (error) {
    console.error('Error creating test users:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('Starting database seed...');
    await clearCollections();
    await createTestUsers();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function if this script is run directly
if (require.main === module) {
  connectDB().then(() => seedDatabase());
}

module.exports = { connectDB, clearCollections, createTestUsers, seedDatabase };
