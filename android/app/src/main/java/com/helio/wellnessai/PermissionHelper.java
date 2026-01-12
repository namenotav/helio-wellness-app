package com.helio.wellnessai;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;

/**
 * Helper class for checking and requesting full-screen intent permission
 * Required for Android 14+ (API 34+) to show full-screen fall alerts
 */
public class PermissionHelper {
    
    private Context context;
    
    public PermissionHelper(Context context) {
        this.context = context;
    }
    
    /**
     * Check if the app can use full-screen intents
     * Auto-granted on Android <14, requires user permission on Android 14+
     */
    public boolean canUseFullScreenIntent() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // Android 13 and below - permission auto-granted
            return true;
        }
        
        // Android 14+ - check if permission granted
        NotificationManager notificationManager = 
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        
        if (notificationManager != null) {
            return notificationManager.canUseFullScreenIntent();
        }
        
        return false;
    }
    
    /**
     * Open Android Settings to allow user to grant full-screen intent permission
     * Takes user directly to the notification settings for this app
     */
    public void openFullScreenIntentSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT);
                intent.setData(android.net.Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            } catch (Exception e) {
                // Fallback to general app notification settings
                openNotificationSettings();
            }
        } else {
            // Android <14 - no action needed, permission auto-granted
        }
    }
    
    /**
     * Fallback: Open general notification settings for this app
     */
    private void openNotificationSettings() {
        try {
            Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName());
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception e) {
            // Last resort: Open general app settings
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(android.net.Uri.parse("package:" + context.getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }
    }
    
    /**
     * Get Android version code for debugging
     */
    public int getAndroidVersion() {
        return Build.VERSION.SDK_INT;
    }
    
    /**
     * Check if device is Android 14+
     */
    public boolean isAndroid14Plus() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE;
    }
}
