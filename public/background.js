// Background Runner - Runs even when app is closed
// Handles: Step Counting + Fall Detection + GPS Tracking

addEventListener('backgroundRunnerTask', async (event) => {
  try {
    console.log('🏃 Background task running...');
    
    // Get step count from foreground app (saved by nativeHealthService)
    const stepHistoryStr = await CapacitorKV.get('stepHistory');
    
    if (stepHistoryStr) {
      const history = JSON.parse(stepHistoryStr);
      const today = new Date().toDateString();
      const todayData = history.find(h => new Date(h.date).toDateString() === today);
      
      if (todayData) {
        console.log(`📊 Current steps: ${todayData.steps}`);
        
        // Update notification with current step count
        await CapacitorNotifications.schedule({
          notifications: [{
            title: '🏃 Helio Active',
            body: `${todayData.steps} steps today`,
            id: 999,
            ongoing: true,
            autoCancel: false
          }]
        });
      }
    }
    
    console.log('✅ Background task complete');
  } catch (error) {
    console.error('❌ Background task error:', error);
  }
});


