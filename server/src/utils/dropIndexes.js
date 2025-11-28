require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

const dropIndexes = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    try {
      await collection.dropIndex('variants.sku_1');
      console.log('✅ Dropped variants.sku_1 index');
    } catch (error) {
      console.log('ℹ️ Index variants.sku_1 does not exist or already dropped');
    }
    
    console.log('✅ Index cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping indexes:', error);
    process.exit(1);
  }
};

dropIndexes();