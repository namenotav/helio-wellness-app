package com.helio.wellness;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // FORCE CLEAR WEBVIEW CACHE - Fix for old JS files being cached
        getBridge().getWebView().clearCache(true);
        getBridge().getWebView().clearHistory();
        android.util.Log.d("MainActivity", "🗑️ WebView cache cleared!");
        
        // Register custom plugins
        registerPlugin(com.helio.wellness.StepCounterPlugin.class);
        registerPlugin(com.helio.wellness.StepCounterServicePlugin.class);
        registerPlugin(com.helio.wellness.HealthConnectPluginWrapper.class);
        
        android.util.Log.d("MainActivity", "✅ StepCounterServicePlugin registered");
        
        // WORKAROUND: Add Health Connect as direct JavaScript interface
        // Bypasses Capacitor plugin system entirely
        HealthConnectBridge hcBridge = new HealthConnectBridge(this, this);
        getBridge().getWebView().addJavascriptInterface(hcBridge, "AndroidHealthConnect");
        android.util.Log.d("MainActivity", "✅ HealthConnect WebView bridge registered");
        
        // WORKAROUND: Add Step Counter as direct JavaScript interface
        // Bypasses Capacitor plugin system entirely
        StepCounterBridge stepBridge = new StepCounterBridge(this);
        getBridge().getWebView().addJavascriptInterface(stepBridge, "AndroidStepCounter");
        android.util.Log.d("MainActivity", "✅ StepCounter WebView bridge registered");
        
        // WORKAROUND: Add Fall Detection as direct JavaScript interface
        // Bypasses Capacitor plugin system entirely
        FallDetectionBridge fallBridge = new FallDetectionBridge(this);
        getBridge().getWebView().addJavascriptInterface(fallBridge, "AndroidFallDetection");
        android.util.Log.d("MainActivity", "✅ FallDetection WebView bridge registered");
        
        // WORKAROUND: Add Health Monitoring as direct JavaScript interface
        // Bypasses Capacitor plugin system entirely
        HealthMonitoringBridge healthBridge = new HealthMonitoringBridge(this);
        getBridge().getWebView().addJavascriptInterface(healthBridge, "AndroidHealthMonitoring");
        android.util.Log.d("MainActivity", "✅ HealthMonitoring WebView bridge registered");
    }
}
