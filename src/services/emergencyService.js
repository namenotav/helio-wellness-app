// Emergency Health Autopilot - Detects emergencies and auto-responds
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import authService from './authService';

class EmergencyService {
  constructor() {
    this.monitoring = false;
    this.emergencyContacts = [];
    this.healthBaseline = null;
  }

  // Initialize emergency monitoring
  async startMonitoring() {
    this.monitoring = true;
    const user = authService.getCurrentUser();
    
    if (user) {
      this.emergencyContacts = user.profile.emergencyContacts || [];
      this.healthBaseline = this.establishBaseline(user);
    }
    
    // Check health metrics every 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.checkForEmergencies();
    }, 5 * 60 * 1000);
    
    console.log('🚨 Emergency monitoring started');
  }

  // Stop monitoring
  stopMonitoring() {
    this.monitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  // Establish baseline health metrics
  establishBaseline(user) {
    const { stats, profile } = user;
    const avgSteps = stats.totalDays > 0 ? stats.totalSteps / stats.totalDays : 5000;
    
    return {
      avgDailySteps: avgSteps,
      normalActivityPattern: this.calculateActivityPattern(stats),
      typicalHeartRate: 70, // Would come from wearable
      normalSleepHours: 7
    };
  }

  // Calculate normal activity pattern
  calculateActivityPattern(stats) {
    // Simplified - in real app would use time-series data
    return {
      morningActivity: 0.3,
      afternoonActivity: 0.5,
      eveningActivity: 0.2
    };
  }

  // Check for emergency conditions
  async checkForEmergencies() {
    const user = authService.getCurrentUser();
    if (!user) return;

    const currentMetrics = this.getCurrentMetrics(user);
    const anomalies = this.detectAnomalies(currentMetrics);
    
    if (anomalies.length > 0) {
      await this.handleEmergency(anomalies);
    }
  }

  // Get current health metrics
  getCurrentMetrics(user) {
    const today = new Date().toDateString();
    const todaySteps = user.stats.dailySteps?.[today] || 0;
    
    return {
      stepsToday: todaySteps,
      lastActiveTime: user.profile.lastActive || new Date(),
      recentFoodLog: user.profile.foodLog?.slice(-5) || [],
      recentSymptoms: user.profile.symptomLog?.slice(-3) || []
    };
  }

  // Detect health anomalies
  detectAnomalies(metrics) {
    const anomalies = [];
    
    // Sudden inactivity detection
    const hoursSinceActive = (new Date() - new Date(metrics.lastActiveTime)) / (1000 * 60 * 60);
    if (hoursSinceActive > 24) {
      anomalies.push({
        type: 'inactivity',
        severity: 'high',
        message: 'No activity detected for 24+ hours',
        action: 'check-welfare'
      });
    }

    // Severe allergic reaction pattern
    const recentDangerFoods = metrics.recentFoodLog.filter(f => f.safety === 'danger');
    const recentSevereSymptoms = metrics.recentSymptoms.filter(s => s.severity === 'severe');
    
    if (recentDangerFoods.length > 0 && recentSevereSymptoms.length > 0) {
      anomalies.push({
        type: 'allergic-reaction',
        severity: 'critical',
        message: 'Possible severe allergic reaction',
        action: 'call-ambulance'
      });
    }

    // Unusual step pattern (possible fall or illness)
    if (this.healthBaseline && metrics.stepsToday < this.healthBaseline.avgDailySteps * 0.2) {
      const hour = new Date().getHours();
      if (hour > 12) { // After noon, should have some steps
        anomalies.push({
          type: 'unusual-inactivity',
          severity: 'medium',
          message: 'Unusual lack of movement detected',
          action: 'send-alert'
        });
      }
    }

    return anomalies;
  }

  // Handle emergency situation
  async handleEmergency(anomalies) {
    const criticalAnomaly = anomalies.find(a => a.severity === 'critical');
    
    if (criticalAnomaly) {
      await this.triggerEmergencyProtocol(criticalAnomaly);
    } else {
      await this.sendWarningNotification(anomalies);
    }
  }

  // Full emergency protocol
  async triggerEmergencyProtocol(anomaly) {
    console.log('🚨 EMERGENCY DETECTED:', anomaly.message);
    
    // 1. Haptic alert
    await this.emergencyHapticPattern();
    
    // 2. Emergency notification
    await this.sendEmergencyNotification(anomaly);
    
    // 3. Alert emergency contacts
    await this.alertEmergencyContacts(anomaly);
    
    // 4. Prepare medical data
    const medicalPackage = await this.prepareMedicalData();
    
    // 5. Simulate ambulance call (in real app, would integrate with emergency services)
    if (anomaly.action === 'call-ambulance') {
      await this.simulateEmergencyCall(medicalPackage);
    }
  }

  // Emergency haptic pattern
  async emergencyHapticPattern() {
    for (let i = 0; i < 5; i++) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Send emergency notification
  async sendEmergencyNotification(anomaly) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '🚨 EMERGENCY ALERT',
          body: anomaly.message + ' - Emergency contacts notified',
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          attachments: null,
          actionTypeId: 'emergency',
          extra: { anomaly }
        }]
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  // Alert emergency contacts
  async alertEmergencyContacts(anomaly) {
    const user = authService.getCurrentUser();
    const contacts = user?.profile?.emergencyContacts || [];
    
    console.log('📞 Alerting emergency contacts:', contacts);
    
    // In real app: SMS API integration
    for (const contact of contacts) {
      console.log(`Sending alert to ${contact.name}: ${anomaly.message}`);
    }
    
    return {
      success: true,
      contactsAlerted: contacts.length,
      timestamp: new Date().toISOString()
    };
  }

  // Prepare medical data package
  async prepareMedicalData() {
    const user = authService.getCurrentUser();
    if (!user) return null;

    return {
      patientInfo: {
        name: user.name,
        age: user.profile.age,
        bloodType: user.profile.bloodType || 'Unknown',
        weight: user.profile.weight,
        height: user.profile.height
      },
      allergens: user.profile.allergens || [],
      medications: user.profile.medications || [],
      medicalConditions: user.profile.medicalConditions || [],
      emergencyContacts: user.profile.emergencyContacts || [],
      recentFoodLog: user.profile.foodLog?.slice(-10) || [],
      recentSymptoms: user.profile.symptomLog?.slice(-5) || [],
      timestamp: new Date().toISOString(),
      location: 'GPS coordinates would go here'
    };
  }

  // Simulate emergency call
  async simulateEmergencyCall(medicalData) {
    console.log('📞 CALLING EMERGENCY SERVICES (SIMULATED)');
    console.log('Medical Data Package:', medicalData);
    
    // In real app: Integration with emergency services API
    return {
      success: true,
      callPlaced: true,
      ambulanceETA: '12 minutes',
      medicalDataShared: true,
      hospitalAlerted: 'St. Mary\'s Hospital ER'
    };
  }

  // Send warning notification (non-critical)
  async sendWarningNotification(anomalies) {
    const message = anomalies.map(a => a.message).join('. ');
    
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: '⚠️ Health Warning',
          body: message,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default'
        }]
      });
    } catch (error) {
      console.error('Warning notification error:', error);
    }
  }

  // Add emergency contact
  async addEmergencyContact(contact) {
    const user = authService.getCurrentUser();
    if (!user) return { success: false };

    const contacts = user.profile.emergencyContacts || [];
    contacts.push({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      primary: contacts.length === 0
    });

    await authService.updateProfile({ emergencyContacts: contacts });
    return { success: true };
  }

  // Manual emergency trigger
  async triggerManualEmergency() {
    const anomaly = {
      type: 'manual-trigger',
      severity: 'critical',
      message: 'User manually triggered emergency alert',
      action: 'call-ambulance'
    };

    await this.triggerEmergencyProtocol(anomaly);
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
