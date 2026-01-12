package com.helio.wellness;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

public class StepCounterForegroundService extends Service implements SensorEventListener {

    private static final String CHANNEL_ID = "StepCounterChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final String PREFS_NAME = "StepCounterPrefs";
    
    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private int initialStepCount = -1;
    private int currentStepCount = 0;
    private SharedPreferences prefs;

    @Override
    public void onCreate() {
        super.onCreate();
        
        // Initialize sensor
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        
        // Load saved step count
        currentStepCount = prefs.getInt("currentStepCount", 0);
        initialStepCount = prefs.getInt("initialStepCount", -1);
        
        android.util.Log.d("StepService", "Service created. Current steps: " + currentStepCount);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        android.util.Log.d("StepService", "⚡⚡⚡ onStartCommand called - MUST create notification in 5 seconds or Android KILLS service!");
        
        try {
            // Create notification channel FIRST
            createNotificationChannel();
            android.util.Log.d("StepService", "✅ Notification channel created");
            
            // Create notification - MUST happen immediately!
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🏃 Helio Step Tracker")
                .setContentText("Tracking " + currentStepCount + " steps - Tap to open")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setOngoing(true)  // Cannot be dismissed by user
                .setAutoCancel(false)  // Don't remove when tapped
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)  // Android 12+ immediate display
                .build();

            android.util.Log.d("StepService", "✅ Notification built, calling startForeground() NOW");
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ requires foregroundServiceType
                startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
                android.util.Log.d("StepService", "✅ startForeground() with HEALTH type");
            } else {
                startForeground(NOTIFICATION_ID, notification);
                android.util.Log.d("StepService", "✅ startForeground() called");
            }
            
            // Register step counter listener AFTER foreground notification is posted
            if (stepCounterSensor != null) {
                sensorManager.registerListener(
                    this,
                    stepCounterSensor,
                    SensorManager.SENSOR_DELAY_NORMAL
                );
                android.util.Log.d("StepService", "✅ Step counter listener registered - TYPE_STEP_COUNTER sensor found");
            } else {
                android.util.Log.e("StepService", "❌ Step counter sensor not available on this device");
            }
            
        } catch (Exception e) {
            android.util.Log.e("StepService", "❌ FATAL ERROR in onStartCommand", e);
            e.printStackTrace();
        }

        return START_STICKY; // Service will restart if killed by Android
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int totalSteps = (int) event.values[0];
            
            // Initialize baseline on first reading
            if (initialStepCount == -1) {
                initialStepCount = totalSteps;
                currentStepCount = 0;
                prefs.edit().putInt("initialStepCount", initialStepCount).apply();
                android.util.Log.d("StepService", "📍 Baseline set: " + totalSteps);
                updateNotification(); // Update notification immediately with 0 steps
            } else {
                // 🔥 FIX: Detect sensor reset (device reboot)
                // If sensor value is LESS than baseline, the sensor was reset
                if (totalSteps < initialStepCount) {
                    android.util.Log.d("StepService", "⚠️ SENSOR RESET DETECTED! Sensor: " + totalSteps + ", Old baseline: " + initialStepCount);
                    android.util.Log.d("StepService", "🔄 Preserving " + currentStepCount + " steps from before reset");
                    
                    // Save the accumulated steps before reset
                    int stepsBeforeReset = currentStepCount;
                    prefs.edit().putInt("stepsBeforeReset", stepsBeforeReset).apply();
                    
                    // Reset baseline to current sensor value
                    initialStepCount = totalSteps;
                    prefs.edit().putInt("initialStepCount", initialStepCount).apply();
                    
                    // Continue counting from where we left off
                    currentStepCount = stepsBeforeReset;
                    android.util.Log.d("StepService", "✅ New baseline: " + initialStepCount + ", Continuing from: " + currentStepCount + " steps");
                } else {
                    // Normal calculation: current sensor - baseline + any steps from before reset
                    int stepsBeforeReset = prefs.getInt("stepsBeforeReset", 0);
                    currentStepCount = (totalSteps - initialStepCount) + stepsBeforeReset;
                }
                
                // NEVER allow negative steps
                if (currentStepCount < 0) {
                    android.util.Log.e("StepService", "❌ NEGATIVE STEPS DETECTED: " + currentStepCount + " - Resetting to 0");
                    currentStepCount = 0;
                    initialStepCount = totalSteps;
                    prefs.edit()
                        .putInt("initialStepCount", initialStepCount)
                        .putInt("stepsBeforeReset", 0)
                        .putInt("currentStepCount", 0)
                        .apply();
                }
                
                // Save and update notification every step (for real-time updates)
                prefs.edit().putInt("currentStepCount", currentStepCount).apply();
                updateNotification();
                
                // Log every 10 steps to reduce log spam
                if (currentStepCount % 10 == 0) {
                    android.util.Log.d("StepService", "📊 Steps: " + currentStepCount);
                }
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Not used
    }

    private void updateNotification() {
        try {
            NotificationManager notificationManager = 
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager == null) {
                android.util.Log.e("StepService", "❌ NotificationManager is null!");
                return;
            }
            
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🏃 " + currentStepCount + " steps today")
                .setContentText("24/7 tracking active - Tap to open")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setOngoing(true)  // Cannot be dismissed
                .setAutoCancel(false)  // Don't remove when tapped
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)  // Changed from LOW to DEFAULT
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .build();

            notificationManager.notify(NOTIFICATION_ID, notification);
            
        } catch (Exception e) {
            android.util.Log.e("StepService", "❌ Error updating notification", e);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            android.util.Log.d("StepService", "Creating notification channel for Android O+");
            
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Step Counter Service",
                NotificationManager.IMPORTANCE_DEFAULT  // Changed from LOW to DEFAULT for visibility
            );
            channel.setDescription("24/7 step tracking in background");
            channel.setShowBadge(true);
            channel.enableLights(false);
            channel.enableVibration(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
                android.util.Log.d("StepService", "✅ Notification channel created successfully");
            } else {
                android.util.Log.e("StepService", "❌ NotificationManager is null!");
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        // Save final count
        prefs.edit().putInt("currentStepCount", currentStepCount).apply();
        android.util.Log.d("StepService", "Service destroyed. Steps saved: " + currentStepCount);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
