const UserAnalytics = require('../models/UserAnalytics');

const generateSampleAnalytics = async () => {
  try {
    console.log('Generating sample analytics data...');
    
    const sampleData = [];
    const now = new Date();
    
    // Generate data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate 5-20 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 15) + 5;
      
      for (let j = 0; j < sessionsPerDay; j++) {
        const sessionId = `session-${date.getTime()}-${j}`;
        const events = [];
        
        // Generate random events for each session
        const eventTypes = ['product_click', 'category_view', 'page_time', 'add_to_cart', 'purchase'];
        const numEvents = Math.floor(Math.random() * 10) + 1;
        
        for (let k = 0; k < numEvents; k++) {
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const event = {
            type: eventType,
            timestamp: new Date(date.getTime() + (k * 60000)), // Events 1 minute apart
            metadata: {
              timeSpent: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
              scrollDepth: Math.floor(Math.random() * 100),
              interactionCount: Math.floor(Math.random() * 20),
              deviceType: Math.random() > 0.7 ? 'mobile' : 'desktop',
              trafficSource: ['direct', 'search', 'social'][Math.floor(Math.random() * 3)]
            }
          };
          
          // Add product/category specific data
          if (['product_click', 'add_to_cart', 'purchase', 'page_time'].includes(eventType)) {
            event.productId = `product-${Math.floor(Math.random() * 10) + 1}`;
            event.metadata.productName = `Sample Product ${Math.floor(Math.random() * 10) + 1}`;
            
            if (eventType === 'purchase') {
              event.metadata.revenue = Math.floor(Math.random() * 200) + 20;
            }
          }
          
          if (eventType === 'category_view') {
            event.categoryId = `category-${Math.floor(Math.random() * 5) + 1}`;
            event.metadata.categoryName = `Category ${Math.floor(Math.random() * 5) + 1}`;
          }
          
          events.push(event);
        }
        
        const analyticsRecord = {
          sessionId,
          events,
          sessionInfo: {
            startTime: date,
            duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
            pageViews: numEvents,
            isReturningUser: Math.random() > 0.6,
            deviceInfo: {
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              platform: 'Win32',
              isMobile: Math.random() > 0.7
            }
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          createdAt: date
        };
        
        // Randomly assign some sessions to users
        if (Math.random() > 0.5) {
          analyticsRecord.userId = `user-${Math.floor(Math.random() * 100) + 1}`;
        }
        
        sampleData.push(analyticsRecord);
      }
    }
    
    // Insert sample data
    await UserAnalytics.insertMany(sampleData);
    console.log(`✅ Generated ${sampleData.length} sample analytics records`);
    
  } catch (error) {
    console.error('Error generating sample analytics:', error);
  }
};

module.exports = { generateSampleAnalytics };