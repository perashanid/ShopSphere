const mongoose = require('mongoose');
const config = require('../config/config');

const testDatabaseConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    
    await mongoose.connect(config.mongoUri);
    console.log('✅ Database connection successful!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
    
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = testDatabaseConnection;