package com.helio.wellnessai;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.util.Log;

/**
 * WebView bridge for checking and requesting full-screen intent permission
 * Exposes permission helper methods to JavaScript
 */
public class PermissionBridge {
    
    private static final String TAG = "PermissionBridge";
    private Context context;
    private PermissionHelper permissionHelper;
    
    public PermissionBridge(Context context) {
        this.context = context;
        this.permissionHelper = new PermissionHelper(context);
        Log.d(TAG, "PermissionBridge initialized");
    }
    
    /**
     * Check if full-screen intent permission is granted
     * Called from JavaScript to determine if full-screen fall alerts will work
     */
    @JavascriptInterface
    public boolean canUseFullScreenIntent() {
        boolean canUse = permissionHelper.canUseFullScreenIntent();
        Log.d(TAG, "canUseFullScreenIntent: " + canUse);
        return canUse;
    }
    
    /**
     * Open Android Settings to request full-screen intent permission
     * Called from JavaScript when user taps "Enable" in permission dialog
     */
    @JavascriptInterface
    public void requestFullScreenIntentPermission() {
        Log.d(TAG, "requestFullScreenIntentPermission called");
        permissionHelper.openFullScreenIntentSettings();
    }
    
    /**
     * Check if device is running Android 14+
     * Used by JavaScript to show/hide permission dialogs
     */
    @JavascriptInterface
    public boolean isAndroid14Plus() {
        boolean isAndroid14 = permissionHelper.isAndroid14Plus();
        Log.d(TAG, "isAndroid14Plus: " + isAndroid14);
        return isAndroid14;
    }
    
    /**
     * Get Android SDK version for debugging
     */
    @JavascriptInterface
    public int getAndroidVersion() {
        int version = permissionHelper.getAndroidVersion();
        Log.d(TAG, "Android version: " + version);
        return version;
    }
}
