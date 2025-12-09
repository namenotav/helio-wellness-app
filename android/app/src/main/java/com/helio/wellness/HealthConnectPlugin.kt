package com.helio.wellness

import android.content.Intent
import android.net.Uri
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

class HealthConnectPlugin : Plugin() {

    private var healthConnectClient: HealthConnectClient? = null
    private val scope = CoroutineScope(Dispatchers.Main)

    private val PERMISSIONS = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getWritePermission(StepsRecord::class)
    )

    override fun load() {
        android.util.Log.d("HealthConnect", "🔵 PLUGIN LOADING...")
        try {
            val status = HealthConnectClient.getSdkStatus(context)
            android.util.Log.d("HealthConnect", "📊 SDK Status: $status")
            android.util.Log.d("HealthConnect", "📊 SDK_AVAILABLE constant: ${HealthConnectClient.SDK_AVAILABLE}")
            android.util.Log.d("HealthConnect", "📊 SDK_UNAVAILABLE constant: ${HealthConnectClient.SDK_UNAVAILABLE}")
            android.util.Log.d("HealthConnect", "📊 Package name: ${context.packageName}")
            
            if (status == HealthConnectClient.SDK_AVAILABLE) {
                android.util.Log.d("HealthConnect", "✅ Status is AVAILABLE - creating client")
                healthConnectClient = HealthConnectClient.getOrCreate(context)
                android.util.Log.d("HealthConnect", "✅ Client created successfully")
            } else {
                android.util.Log.w("HealthConnect", "⚠️ Status NOT AVAILABLE: $status")
            }
        } catch (e: Exception) {
            android.util.Log.e("HealthConnect", "❌ Failed to initialize", e)
        }
    }

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        android.util.Log.d("HealthConnect", "🔍 isAvailable() called from JavaScript")
        val ret = JSObject()
        try {
            val status = HealthConnectClient.getSdkStatus(context)
            val isAvailable = status == HealthConnectClient.SDK_AVAILABLE
            
            android.util.Log.d("HealthConnect", "📊 Current SDK Status: $status")
            android.util.Log.d("HealthConnect", "📊 Is Available: $isAvailable")
            android.util.Log.d("HealthConnect", "📊 Client exists: ${healthConnectClient != null}")
            
            ret.put("available", isAvailable)
            ret.put("sdkStatus", status)
            
            android.util.Log.d("HealthConnect", "✅ Returning to JavaScript: available=$isAvailable, status=$status")
            call.resolve(ret)
        } catch (e: Exception) {
            android.util.Log.e("HealthConnect", "❌ Exception in isAvailable()", e)
            ret.put("available", false)
            ret.put("error", e.message)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun openHealthConnectSettings(call: PluginCall) {
        android.util.Log.d("HealthConnect", "📱 openHealthConnectSettings() called")
        if (healthConnectClient == null) {
            android.util.Log.e("HealthConnect", "❌ Client is null")
            call.reject("Health Connect not available")
            return
        }

        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("healthconnect://home")
                putExtra("android.intent.extra.PACKAGE_NAME", context.packageName)
            }
            android.util.Log.d("HealthConnect", "🚀 Launching Health Connect settings")
            activity.startActivity(intent)
            
            val ret = JSObject()
            ret.put("success", true)
            android.util.Log.d("HealthConnect", "✅ Intent launched successfully")
            call.resolve(ret)
        } catch (e: Exception) {
            android.util.Log.e("HealthConnect", "❌ Failed to launch intent", e)
            call.reject("Failed to request permissions: ${e.message}")
        }
    }

    @PluginMethod
    fun getSteps(call: PluginCall) {
        if (healthConnectClient == null) {
            call.reject("Health Connect not available")
            return
        }

        scope.launch {
            try {
                val startTimeMillis = call.getLong("startTime")
                val endTimeMillis = call.getLong("endTime")
                
                val startTime: Instant
                val endTime: Instant
                
                if (startTimeMillis != null && endTimeMillis != null) {
                    startTime = Instant.ofEpochMilli(startTimeMillis)
                    endTime = Instant.ofEpochMilli(endTimeMillis)
                } else {
                    val now = LocalDateTime.now()
                    val startOfDay = now.toLocalDate().atStartOfDay()
                    startTime = startOfDay.atZone(ZoneId.systemDefault()).toInstant()
                    endTime = Instant.now()
                }

                val request = ReadRecordsRequest(
                    recordType = StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )

                val response = healthConnectClient!!.readRecords(request)
                
                var totalSteps = 0L
                for (record in response.records) {
                    totalSteps += record.count
                }

                val ret = JSObject()
                ret.put("steps", totalSteps)
                ret.put("startTime", startTime.toEpochMilli())
                ret.put("endTime", endTime.toEpochMilli())
                call.resolve(ret)
                
            } catch (e: Exception) {
                call.reject("Failed to read steps: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun hasPermissions(call: PluginCall) {
        if (healthConnectClient == null) {
            call.reject("Health Connect not available")
            return
        }

        scope.launch {
            try {
                val granted = healthConnectClient!!.permissionController.getGrantedPermissions()
                val hasReadSteps = granted.contains(HealthPermission.getReadPermission(StepsRecord::class))
                val hasWriteSteps = granted.contains(HealthPermission.getWritePermission(StepsRecord::class))
                
                val ret = JSObject()
                ret.put("hasReadSteps", hasReadSteps)
                ret.put("hasWriteSteps", hasWriteSteps)
                ret.put("hasAllPermissions", hasReadSteps && hasWriteSteps)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Failed to check permissions: ${e.message}")
            }
        }
    }
}
