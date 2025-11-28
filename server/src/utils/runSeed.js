require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const seedData = require('./seedData');

const runSeed = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Run seed
    await seedData();
    
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();