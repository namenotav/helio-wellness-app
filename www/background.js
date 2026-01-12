// Background Runner - Runs even when app is closed
// Handles: Step Counting + Fall Detection + GPS Tracking

addEventListener('backgroundRunnerTask', async (event) => {
  try {
    console.log('🏃 Background task running...');
    
    // ✅ FIX: Use CapacitorKV which is the actual API available in background runner
    const stepHistoryStr = await CapacitorKV.get('stepHistory');
    
    if (stepHistoryStr) {
      try {
        const history = JSON.parse(stepHistoryStr);
        const today = new Date().toISOString().split('T')[0];
        const todayData = history.find(h => h.date === today);
        
        if (todayData && todayData.steps !== undefined) {
          const steps = Math.max(0, todayData.steps); // Ensure never negative
          console.log(`📊 Background runner - Current steps: ${steps}`);
          
          // Update notification with current step count
          await CapacitorNotifications.schedule({
            notifications: [{
              title: '🏃 Helio Active',
              body: `${steps.toLocaleString()} steps today - Keep moving!`,
              id: 999,
              ongoing: true,
              autoCancel: false
            }]
          });
        } else {
          console.log('⚠️ No step data for today yet');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse stepHistory:', parseError);
      }
    } else {
      console.log('⚠️ No stepHistory found in CapacitorKV');
    }
    
    console.log('✅ Background task complete');
  } catch (error) {
    console.error('❌ Background task error:', error);
  }
});


