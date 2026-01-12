package com.helio.wellness;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Full-Screen Fall Alert Activity
 * Appears OVER lock screen when fall is detected
 * Shows 3 action buttons: I'm OK, Call Contact, Call 999
 */
public class FallAlertActivity extends Activity {
    
    private static final String PREFS_NAME = "FallDetectionPrefs";
    private static final String EMERGENCY_PREFS = "emergency_data";
    
    private Vibrator vibrator;
    private ToneGenerator toneGenerator;
    private boolean alarmActive = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        android.util.Log.d("FallAlert", "🚨 FallAlertActivity launched!");
        
        // CRITICAL: Allow activity to show over lock screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (keyguardManager != null) {
                keyguardManager.requestDismissKeyguard(this, null);
            }
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            );
        }
        
        // Create UI programmatically (no XML layout needed)
        createUI();
        
        // Start alarm and vibration
        startAlarm();
    }

    private void createUI() {
        // Root layout
        android.widget.LinearLayout root = new android.widget.LinearLayout(this);
        root.setOrientation(android.widget.LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#CC0000")); // Dark red
        root.setPadding(60, 100, 60, 100);
        root.setGravity(android.view.Gravity.CENTER);
        
        // Title
        TextView title = new TextView(this);
        title.setText("🤕 Hard Fall Detected!");
        title.setTextSize(32);
        title.setTextColor(Color.WHITE);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        title.setGravity(android.view.Gravity.CENTER);
        android.widget.LinearLayout.LayoutParams titleParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        );
        titleParams.setMargins(0, 0, 0, 40);
        title.setLayoutParams(titleParams);
        root.addView(title);
        
        // Subtitle
        TextView subtitle = new TextView(this);
        subtitle.setText("Are you OK? Choose an action:");
        subtitle.setTextSize(20);
        subtitle.setTextColor(Color.WHITE);
        subtitle.setGravity(android.view.Gravity.CENTER);
        android.widget.LinearLayout.LayoutParams subtitleParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        );
        subtitleParams.setMargins(0, 0, 0, 60);
        subtitle.setLayoutParams(subtitleParams);
        root.addView(subtitle);
        
        // Button 1: I'm OK (Green)
        Button okButton = new Button(this);
        okButton.setText("✓ I'm OK");
        okButton.setTextSize(22);
        okButton.setTextColor(Color.WHITE);
        okButton.setBackgroundColor(Color.parseColor("#00CC00"));
        okButton.setTypeface(null, android.graphics.Typeface.BOLD);
        android.widget.LinearLayout.LayoutParams okParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            200
        );
        okParams.setMargins(0, 0, 0, 30);
        okButton.setLayoutParams(okParams);
        okButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleOkClicked();
            }
        });
        root.addView(okButton);
        
        // Button 2: Call My Contact (Orange)
        Button contactButton = new Button(this);
        contactButton.setText("📞 Call My Contact");
        contactButton.setTextSize(22);
        contactButton.setTextColor(Color.WHITE);
        contactButton.setBackgroundColor(Color.parseColor("#FF9900"));
        contactButton.setTypeface(null, android.graphics.Typeface.BOLD);
        android.widget.LinearLayout.LayoutParams contactParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            200
        );
        contactParams.setMargins(0, 0, 0, 30);
        contactButton.setLayoutParams(contactParams);
        contactButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleCallContactClicked();
            }
        });
        root.addView(contactButton);
        
        // Button 3: Call 999 (Red)
        Button emergencyButton = new Button(this);
        emergencyButton.setText("🚨 Call 999");
        emergencyButton.setTextSize(22);
        emergencyButton.setTextColor(Color.WHITE);
        emergencyButton.setBackgroundColor(Color.parseColor("#888888"));
        emergencyButton.setTypeface(null, android.graphics.Typeface.BOLD);
        android.widget.LinearLayout.LayoutParams emergencyParams = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            200
        );
        emergencyButton.setLayoutParams(emergencyParams);
        emergencyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleCall999Clicked();
            }
        });
        root.addView(emergencyButton);
        
        setContentView(root);
    }

    private void startAlarm() {
        try {
            // Start vibration pattern (1 sec on, 0.5 sec off, repeat)
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern = {0, 1000, 500, 1000, 500, 1000, 500};
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
                } else {
                    vibrator.vibrate(pattern, 0);
                }
                android.util.Log.d("FallAlert", "✅ Vibration started");
            }
            
            // Start alarm tone
            toneGenerator = new ToneGenerator(AudioManager.STREAM_ALARM, 100);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    while (alarmActive) {
                        try {
                            toneGenerator.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 1000);
                            Thread.sleep(1500);
                        } catch (InterruptedException e) {
                            break;
                        }
                    }
                }
            }).start();
            android.util.Log.d("FallAlert", "✅ Alarm tone started");
            
        } catch (Exception e) {
            android.util.Log.e("FallAlert", "Error starting alarm", e);
        }
    }

    private void stopAlarm() {
        alarmActive = false;
        
        try {
            if (vibrator != null) {
                vibrator.cancel();
                android.util.Log.d("FallAlert", "✅ Vibration stopped");
            }
            if (toneGenerator != null) {
                toneGenerator.release();
                android.util.Log.d("FallAlert", "✅ Alarm tone stopped");
            }
        } catch (Exception e) {
            android.util.Log.e("FallAlert", "Error stopping alarm", e);
        }
    }

    private void handleOkClicked() {
        android.util.Log.d("FallAlert", "✅ User clicked: I'm OK");
        stopAlarm();
        resetFallFlag();
        finish();
    }

    private void handleCallContactClicked() {
        android.util.Log.d("FallAlert", "📞 User clicked: Call My Contact");
        stopAlarm();
        
        // Get primary emergency contact from Capacitor Preferences
        try {
            SharedPreferences prefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
            String emergencyDataJson = prefs.getString(EMERGENCY_PREFS, null);
            
            if (emergencyDataJson != null) {
                JSONObject emergencyData = new JSONObject(emergencyDataJson);
                JSONArray contacts = emergencyData.getJSONArray("contacts");
                
                // Find primary contact
                String primaryPhone = null;
                for (int i = 0; i < contacts.length(); i++) {
                    JSONObject contact = contacts.getJSONObject(i);
                    if (contact.optBoolean("primary", false)) {
                        primaryPhone = contact.getString("phone");
                        break;
                    }
                }
                
                // If no primary, use first contact
                if (primaryPhone == null && contacts.length() > 0) {
                    primaryPhone = contacts.getJSONObject(0).getString("phone");
                }
                
                if (primaryPhone != null) {
                    Intent callIntent = new Intent(Intent.ACTION_CALL);
                    callIntent.setData(Uri.parse("tel:" + primaryPhone));
                    callIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(callIntent);
                    android.util.Log.d("FallAlert", "📞 Calling: " + primaryPhone);
                } else {
                    android.util.Log.w("FallAlert", "⚠️ No emergency contact found");
                }
            } else {
                android.util.Log.w("FallAlert", "⚠️ No emergency data saved");
            }
        } catch (Exception e) {
            android.util.Log.e("FallAlert", "Error reading emergency contacts", e);
        }
        
        resetFallFlag();
        finish();
    }

    private void handleCall999Clicked() {
        android.util.Log.d("FallAlert", "🚨 User clicked: Call 999");
        stopAlarm();
        
        try {
            Intent callIntent = new Intent(Intent.ACTION_CALL);
            callIntent.setData(Uri.parse("tel:999"));
            callIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(callIntent);
            android.util.Log.d("FallAlert", "🚨 Calling 999");
        } catch (Exception e) {
            android.util.Log.e("FallAlert", "Error calling 999", e);
        }
        
        resetFallFlag();
        finish();
    }

    private void resetFallFlag() {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            prefs.edit().putBoolean("fallDetected", false).apply();
            android.util.Log.d("FallAlert", "✅ Fall flag reset");
        } catch (Exception e) {
            android.util.Log.e("FallAlert", "Error resetting fall flag", e);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopAlarm();
        android.util.Log.d("FallAlert", "Activity destroyed");
    }

    @Override
    public void onBackPressed() {
        // Prevent back button from dismissing alert
        android.util.Log.d("FallAlert", "Back button pressed - ignored");
    }
}
