package com.helio.wellness

import android.content.Context
import android.content.Intent
import android.net.Uri

/**
 * Kotlin helper for Health Connect - opens HC app
 * Called from Java HealthConnectBridge
 */
object HealthConnectPermissionHelper {
    
    fun openHealthConnectApp(context: Context): Boolean {
        return try {
            // Try to open Health Connect app
            val intent = context.packageManager.getLaunchIntentForPackage("com.google.android.apps.healthdata")
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                android.util.Log.d("HealthConnectHelper", "✅ Opened Health Connect app")
                true
            } else {
                android.util.Log.w("HealthConnectHelper", "⚠️ Health Connect app not found")
                false
            }
        } catch (e: Exception) {
            android.util.Log.e("HealthConnectHelper", "❌ Failed to open HC app", e)
            false
        }
    }
}
