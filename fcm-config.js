// Firebase Cloud Messaging (FCM) Push Notification Configuration
// Run: npm install firebase-admin

import admin from 'firebase-admin';

// Initialize Firebase Admin (requires service account key)
const SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;

let fcmInitialized = false;

if (SERVICE_ACCOUNT) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(SERVICE_ACCOUNT)
    });
    fcmInitialized = true;
    console.log('✅ Firebase Cloud Messaging initialized');
  } catch (error) {
    console.warn('⚠️ FCM initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not set, push notifications disabled');
}

/**
 * Send push notification to a device
 */
export async function sendNotification(deviceToken, title, body, data = {}) {
  if (!fcmInitialized) {
    console.warn('FCM not initialized, skipping notification');
    return { success: false, error: 'FCM not initialized' };
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token: deviceToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          color: '#667eea',
          icon: 'notification_icon'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Notification send error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to multiple devices
 */
export async function sendBulkNotification(deviceTokens, title, body, data = {}) {
  if (!fcmInitialized) {
    console.warn('FCM not initialized, skipping bulk notification');
    return { success: false, error: 'FCM not initialized' };
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens: deviceTokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Bulk notification sent: ${response.successCount}/${deviceTokens.length} successful`);
    return { success: true, successCount: response.successCount, failureCount: response.failureCount };
  } catch (error) {
    console.error('❌ Bulk notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe device to topic
 */
export async function subscribeToTopic(deviceTokens, topic) {
  if (!fcmInitialized) {
    return { success: false, error: 'FCM not initialized' };
  }

  try {
    const response = await admin.messaging().subscribeToTopic(deviceTokens, topic);
    console.log(`✅ Subscribed ${response.successCount} devices to topic: ${topic}`);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Subscribe error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to topic
 */
export async function sendTopicNotification(topic, title, body, data = {}) {
  if (!fcmInitialized) {
    return { success: false, error: 'FCM not initialized' };
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      topic
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Topic notification sent to: ${topic}`);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Topic notification error:', error);
    return { success: false, error: error.message };
  }
}

// Export FCM status
export const isFCMInitialized = () => fcmInitialized;
