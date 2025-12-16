import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarcodeScanner as BarcodeScannerPlugin } from '@capacitor-community/barcode-scanner'
import { Preferences } from '@capacitor/preferences'
import authService from '../services/authService'
import syncService from '../services/syncService'
import firestoreService from '../services/firestoreService'
import nativeHealthService from '../services/nativeHealthService'
import heartRateService from '../services/heartRateService'
import sleepTrackingService from '../services/sleepTrackingService'
import waterIntakeService from '../services/waterIntakeService'
import darkModeService from '../services/darkModeService'
import nutritionDatabaseService from '../services/nutritionDatabaseService'
import breathingService from '../services/breathingService'
import directAudioService from '../services/directAudioService'
import gamificationService from '../services/gamificationService'
import StepCounter from '../components/StepCounter'
import subscriptionService from '../services/subscriptionService'
import pdfExportService from '../services/pdfExportService'
import devAuthService from '../services/devAuthService'
import { analytics } from '../services/analyticsService'
// 🔥 NEW WEEK 1 SERVICES
import aiMemoryService from '../services/aiMemoryService'
import dnaService from '../services/dnaService'
import notificationSchedulerService from '../services/notificationSchedulerService'
import ErrorBoundary from '../components/ErrorBoundary'
import '../styles/NewDashboard.css'
import '../styles/GridDashboard.css'

// Wire up gamificationService with syncService for Preferences persistence
gamificationService.setSyncService(syncService);

// Subscription service will be initialized in useEffect after auth is ready
// (Moved from global scope to ensure user context is available)

// ⚡ LAZY LOAD MODALS - Load only when opened (40% faster initial load)
const FoodScanner = lazy(() => import('../components/FoodScanner'))
const ProfileSetup = lazy(() => import('../components/ProfileSetup'))
const HealthAvatar = lazy(() => import('../components/HealthAvatar'))
const ARScanner = lazy(() => import('../components/ARScanner'))
const EmergencyPanel = lazy(() => import('../components/EmergencyPanel'))
const InsuranceRewards = lazy(() => import('../components/InsuranceRewards'))
const DNAUpload = lazy(() => import('../components/DNAUpload'))
const SocialBattles = lazy(() => import('../components/SocialBattles'))
const MealAutomation = lazy(() => import('../components/MealAutomation'))
const GratitudeJournalModal = lazy(() => import('../components/GratitudeJournal'))
const LegalModal = lazy(() => import('../components/LegalModal'))
const StripePayment = lazy(() => import('../components/StripePayment'))
const AppleHealthSync = lazy(() => import('../components/AppleHealthSync'))
const WearableSync = lazy(() => import('../components/WearableSync'))
const PaywallModal = lazy(() => import('../components/PaywallModal'))
const Onboarding = lazy(() => import('../components/Onboarding'))
const DevUnlock = lazy(() => import('../components/DevUnlock'))
const DataRecovery = lazy(() => import('../components/DataRecovery'))

// 🔥 NEW WEEK 1 FEATURES - Barcode Scanner & Rep Counter
const BarcodeScanner = lazy(() => import('../components/BarcodeScanner'))
const RepCounter = lazy(() => import('../components/RepCounter'))
const GlobalFallAlert = lazy(() => import('../components/GlobalFallAlert'))

// 🧠 AI LEARNING FEATURES - Brain.js Habit Learning System
const BrainInsightsDashboard = lazy(() => import('../components/BrainInsightsDashboard'))

// 🔥 HOME REDESIGN - Phase 2 Complete Components
const TodayOverview = lazy(() => import('../components/TodayOverview'))
const HomeActionButton = lazy(() => import('../components/HomeActionButton'))
const StatsModal = lazy(() => import('../components/StatsModal'))
const PremiumModal = lazy(() => import('../components/PremiumModal'))
const BattlesModal = lazy(() => import('../components/BattlesModal'))
const FoodModal = lazy(() => import('../components/FoodModal'))
const DNAModal = lazy(() => import('../components/DNAModal'))
const WorkoutsModal = lazy(() => import('../components/WorkoutsModalNew'))
const HealthModal = lazy(() => import('../components/HealthModal'))
const GoalsModal = lazy(() => import('../components/GoalsModal'))
const ProgressModal = lazy(() => import('../components/ProgressModal'))
const CommunityRecipes = lazy(() => import('../components/CommunityRecipes'))

// 🎮 GAMIFICATION COMPONENTS
const StreakCounter = lazy(() => import('../components/StreakCounter'))
const LevelProgressBar = lazy(() => import('../components/LevelProgressBar'))
const DailyChallenges = lazy(() => import('../components/DailyChallenges'))
const AchievementUnlock = lazy(() => import('../components/AchievementUnlock'))

// 🎨 REDESIGNED TAB COMPONENTS
const VoiceTabRedesign = lazy(() => import('../components/VoiceTabRedesign'))
const ZenTabRedesign = lazy(() => import('../components/ZenTabRedesign'))
const ScanTabRedesign = lazy(() => import('../components/ScanTabRedesign'))
const ProfileTabRedesign = lazy(() => import('../components/ProfileTabRedesign'))

// 🎯 MAIN MODAL HUBS - Hierarchical Modal System
const AIAssistantModal = lazy(() => import('../components/AIAssistantModal'))
const HealthToolsModal = lazy(() => import('../components/HealthToolsModal'))
const DataManagementModal = lazy(() => import('../components/DataManagementModal'))
const SocialFeaturesModal = lazy(() => import('../components/SocialFeaturesModal'))
const SettingsHubModal = lazy(() => import('../components/SettingsHubModal'))
const QuickLogModal = lazy(() => import('../components/QuickLogModal'))

export default function NewDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState(null)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // 🔒 MUTEX: Prevent race conditions in loadRealData
  const [loadDataLock, setLoadDataLock] = useState(false)
  
  // 🔥 NEW: Store activities in state for rendering
  const [recentActivities, setRecentActivities] = useState([])
  const [activityCount, setActivityCount] = useState(0)
  
  // Killer Features Modals
  const [showHealthAvatar, setShowHealthAvatar] = useState(false)
  const [showARScanner, setShowARScanner] = useState(false)
  const [showFoodScanner, setShowFoodScanner] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showInsurance, setShowInsurance] = useState(false)
  const [showDNA, setShowDNA] = useState(false)
  const [showBattles, setShowBattles] = useState(false)
  const [showMeals, setShowMeals] = useState(false)
  
  // NEW WEEK 1 FEATURES - Barcode Scanner & Rep Counter
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showRepCounter, setShowRepCounter] = useState(false)
  const [dnaDailyTip, setDnaDailyTip] = useState(null)
  
  // Settings Modals
  const [showFullStats, setShowFullStats] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  
  // Activity Pulse Modal
  const [showActivityPulse, setShowActivityPulse] = useState(false)
  
  // Breathing Exercise Modal
  const [showBreathingModal, setShowBreathingModal] = useState(false)
  
  // Stress Relief Modal
  const [showStressRelief, setShowStressRelief] = useState(false)
  
  // Guided Meditation Modal
  const [showGuidedMeditation, setShowGuidedMeditation] = useState(false)
  
  // Gratitude Journal Modal
  const [showGratitudeJournal, setShowGratitudeJournal] = useState(false)
  
  // 🎮 GAMIFICATION STATE
  const [achievementToShow, setAchievementToShow] = useState(null)
  const [useRedesignedTabs, setUseRedesignedTabs] = useState(true)
  
  // 🎯 NEW HIERARCHICAL MODAL SYSTEM
  const [showAIAssistantModal, setShowAIAssistantModal] = useState(false)
  const [showHealthToolsModal, setShowHealthToolsModal] = useState(false)
  const [showDataManagementModal, setShowDataManagementModal] = useState(false)
  
  // 🧠 AI LEARNING SYSTEM
  const [showBrainInsights, setShowBrainInsights] = useState(false)
  const [showSocialFeaturesModal, setShowSocialFeaturesModal] = useState(false)
  const [showSettingsHubModal, setShowSettingsHubModal] = useState(false)
  const [showQuickLogModal, setShowQuickLogModal] = useState(false)

  // Listen for level up events
  useEffect(() => {
    const handleLevelUp = (event) => {
      const { level } = event.detail
      setAchievementToShow({
        id: 'level_up',
        icon: '⭐',
        name: `Level ${level} Reached!`,
        description: `You've reached level ${level}! Keep going!`,
        xp: level * 100
      })
    }

    window.addEventListener('levelUp', handleLevelUp)
    return () => window.removeEventListener('levelUp', handleLevelUp)
  }, [])
  
  // Legal Information Modal
  const [showLegal, setShowLegal] = useState(false)
  
  // GLOBAL FALL ALERT - Shows on top of ANY screen
  const [showGlobalFallAlert, setShowGlobalFallAlert] = useState(false)
  const [fallData, setFallData] = useState(null)
  
  // NEW FEATURES - Stripe, Apple Health, Wearables
  const [showStripePayment, setShowStripePayment] = useState(false)
  const [showAppleHealth, setShowAppleHealth] = useState(false)
  const [showWearables, setShowWearables] = useState(false)
  
  // Paywall Modal State
  const [paywallData, setPaywallData] = useState({ show: false, featureName: '', message: '', currentPlan: '', requiredPlan: '', onUpgrade: null })
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // Developer mode state
  const [showDevUnlock, setShowDevUnlock] = useState(false)
  const [isDevMode, setIsDevMode] = useState(() => {
    // Check localStorage immediately on mount
    const saved = localStorage.getItem('helio_dev_mode')
    if(import.meta.env.DEV)console.log('🔵 Initial isDevMode from localStorage:', saved)
    return saved === 'true'
  })
  const [showDevButton, setShowDevButton] = useState(true) // ALWAYS TRUE - will check auth later
  
  // Data Recovery modal state
  const [showDataRecovery, setShowDataRecovery] = useState(false)
  
  if(import.meta.env.DEV)console.log('🏗️ NewDashboard component loaded - Build timestamp:', new Date().toISOString())
  if(import.meta.env.DEV)console.log('🔵 Initial state:', { showDevButton: true, isDevMode })
  
  // Step tracking method state
  const [stepMethod, setStepMethod] = useState('detecting') // 'hardware', 'software', 'detecting'
  const [nativeServiceRunning, setNativeServiceRunning] = useState(false)
  const [nativeServiceStarting, setNativeServiceStarting] = useState(false)

  const [stats, setStats] = useState({
    streak: 7,
    todaySteps: 0,
    goalSteps: 10000,
    waterCups: 0,
    waterGoal: 8,
    mealsLogged: 0,
    mealsGoal: 3,
    wellnessScore: 78,
    level: 5,
    xp: 450,
    xpToNext: 600,
    weeklySteps: Array.from({ length: 7 }, () => ({ steps: 0, date: null })),
    heartRate: null,
    sleepHours: 0,
    sleepQuality: null
  })

  // New feature states
  const [heartRateConnected, setHeartRateConnected] = useState(false)
  const [sleepTracking, setSleepTracking] = useState(false)
  const [showHeartRateModal, setShowHeartRateModal] = useState(false)
  const [showSleepModal, setShowSleepModal] = useState(false)
  const [showWaterModal, setShowWaterModal] = useState(false)
  const [showNutritionSearch, setShowNutritionSearch] = useState(false)
  const [showWorkoutsModal, setShowWorkoutsModal] = useState(false)

  // Paywall-protected handlers for premium features
  const handleOpenMeditation = () => {
    if (!subscriptionService.hasAccess('meditation')) {
      const paywallInfo = subscriptionService.showPaywall('meditation', () => setShowStripePayment(true))
      setPaywallData(paywallInfo)
      return
    }
    setShowGuidedMeditation(true)
  }

  const handleOpenBreathing = () => {
    if (!subscriptionService.hasAccess('breathing')) {
      const paywallInfo = subscriptionService.showPaywall('breathing', () => setShowStripePayment(true))
      setPaywallData(paywallInfo)
      return
    }
    setShowBreathingModal(true)
  }

  const handleOpenWorkouts = () => {
    if (!subscriptionService.hasAccess('workouts')) {
      const paywallInfo = subscriptionService.showPaywall('workouts', () => setShowStripePayment(true))
      setPaywallData(paywallInfo)
      return
    }
    setShowWorkoutsModal(true)
  }

  const handleOpenHeartRate = () => {
    if (!subscriptionService.hasAccess('heartRate')) {
      const paywallInfo = subscriptionService.showPaywall('heartRate', () => setShowStripePayment(true))
      setPaywallData(paywallInfo)
      return
    }
    setShowHeartRateModal(true)
  }

  const handleOpenSleep = () => {
    if (!subscriptionService.hasAccess('sleepTracking')) {
      const paywallInfo = subscriptionService.showPaywall('sleepTracking', () => setShowStripePayment(true))
      setPaywallData(paywallInfo)
      return
    }
    setShowSleepModal(true)
  }

  // Rep Counter Handler - Using useCallback for stable reference
  const handleOpenRepCounter = useCallback(() => {
    console.log('🔥 REP COUNTER HANDLER CALLED');
    setShowRepCounter(true);
  }, []);

  // Food Scanner Handler - Using function declaration for proper hoisting
  function handleOpenFoodScanner() {
    const limit = subscriptionService.checkLimit('foodScans');
    if (!limit.allowed) {
      const paywallInfo = subscriptionService.showPaywall('foodScanner', () => setShowStripePayment(true));
      setPaywallData(paywallInfo);
      return;
    }
    setShowFoodScanner(true);
  }

  const handlePDFExport = (exportFunction, ...args) => {
    if (!subscriptionService.hasAccess('pdfExport')) {
      const paywallInfo = subscriptionService.showPaywall('pdfExport', () => setShowStripePayment(true))
      setPaywallData(paywallInfo)
      return
    }
    exportFunction(...args)
  }

  // Pre-bound PDF export handlers for MeTab
  const handleExportDailyStats = async () => {
    await refreshStats(); // ✅ Get latest real-time data
    handlePDFExport(pdfExportService.exportDailyStats.bind(pdfExportService), stats);
  };

  const handleExportWorkoutHistory = async () => {
    await refreshStats(); // ✅ Get latest real-time data
    handlePDFExport(pdfExportService.exportWorkoutHistory.bind(pdfExportService));
  };

  const handleExportWorkoutHistoryCSV = async () => {
    await refreshStats(); // ✅ Get latest real-time data
    handlePDFExport(pdfExportService.exportWorkoutHistoryCSV.bind(pdfExportService));
  };

  const handleExportFoodLog = async () => {
    await refreshStats(); // ✅ Get latest real-time data
    handlePDFExport(pdfExportService.exportFoodLog.bind(pdfExportService));
  };

  const handleExportFoodLogCSV = async () => {
    await refreshStats(); // ✅ Get latest real-time data
    handlePDFExport(pdfExportService.exportFoodLogCSV.bind(pdfExportService));
  };

  const handleExportFullReport = async () => {
    await refreshStats(); // ✅ Get latest real-time data
    handlePDFExport(pdfExportService.exportFullReport.bind(pdfExportService), stats);
  };

  // Register global fall alert callback
  useEffect(() => {
    import('../services/emergencyService').then(({ default: emergencyService }) => {
      emergencyService.setGlobalFallAlertCallback((data) => {
        setFallData(data);
        setShowGlobalFallAlert(true);
      });
      
      // 🔄 AUTO-RESUME FALL DETECTION IF PREVIOUSLY ENABLED
      setTimeout(async () => {
        try {
          const savedData = await emergencyService.loadEmergencyData();
          
          if (savedData?.fallDetection) {
            console.log('🔄 [AUTO-START] Fall detection was enabled, resuming...');
            
            // Check if native service is available (24/7 background)
            if (window.AndroidFallDetection) {
              console.log('🚀 [AUTO-START] Starting native fall detection service (24/7)...');
              const nativeFallModule = await import('../services/nativeFallDetectionService');
              const { default: nativeFallDetectionService } = nativeFallModule;
              await nativeFallDetectionService.start();
              console.log('✅ [AUTO-START] Native fall detection resumed - works 24/7 even when app closed!');
            } else {
              console.log('🚀 [AUTO-START] Starting JS fall detection (only works when app open)...');
              await emergencyService.startFallDetection(emergencyService.globalFallAlertCallback);
              console.log('✅ [AUTO-START] JS fall detection resumed - only works while app is open');
            }
          } else {
            console.log('ℹ️ [AUTO-START] Fall detection was not previously enabled, skipping auto-resume');
          }
        } catch (error) {
          console.error('❌ [AUTO-START] Fall detection auto-resume failed:', error);
        }
      }, 2000); // Wait 2 seconds for everything to initialize
    });
  }, [])

  // Initialize notification scheduler service
  useEffect(() => {
    const initNotifications = async () => {
      await notificationSchedulerService.initialize();
      if(import.meta.env.DEV)console.log('✅ Notification scheduler initialized');
    };
    initNotifications();
  }, []);

  // Load saved theme on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeSettings');
    if (savedTheme) {
      try {
        const { theme, accentColor } = JSON.parse(savedTheme);
        document.documentElement.setAttribute('data-theme', theme || 'dark');
        document.body.setAttribute('data-theme', theme || 'dark');
        document.documentElement.style.setProperty('--theme-accent-color', accentColor || '#8B5FE8');
        
        // 🎨 FORCE BACKGROUND VIA INLINE STYLES ON STARTUP
        if (theme === 'light') {
          document.body.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%)';
          document.body.style.color = '#000000';
        } else if (theme === 'midnight') {
          document.body.style.background = 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)';
          document.body.style.color = '#FFFFFF';
        } else if (theme === 'ocean') {
          document.body.style.background = 'linear-gradient(135deg, #0C4A6E 0%, #075985 100%)';
          document.body.style.color = '#FFFFFF';
        } else { // dark
          document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
          document.body.style.color = '#FFFFFF';
        }
        
        console.log('🎨 Theme loaded on startup:', theme, accentColor);
        console.log('📋 HTML data-theme:', document.documentElement.getAttribute('data-theme'));
        console.log('📋 Body data-theme:', document.body.getAttribute('data-theme'));
        console.log('📋 Accent color:', document.documentElement.style.getPropertyValue('--theme-accent-color'));
        console.log('🎨 Body background:', document.body.style.background);
        // Force immediate repaint
        setTimeout(() => {
          document.body.style.display = 'none';
          document.body.offsetHeight;
          document.body.style.display = '';
        }, 50);
      } catch (err) {
        console.warn('Failed to load theme:', err);
      }
    } else {
      console.log('⚠️ No saved theme found, using default dark theme');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
      document.body.style.color = '#FFFFFF';
    }
  }, []);

  // Check if first time user - show onboarding
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    if (!onboardingCompleted) {
      setShowOnboarding(true)
    }
  }, [])

  // 🔧 EMERGENCY: Clear cache and reload (call from console: window.clearCache())
  const clearCacheAndReload = async () => {
    console.log('🗑️ CLEARING ALL CACHES...');
    
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ Service worker caches cleared');
    }
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('✅ Service workers unregistered');
    }
    
    console.log('🔄 RELOADING APP...');
    window.location.reload(true);
  };

  // Expose globally for emergency use
  useEffect(() => {
    window.clearCache = clearCacheAndReload;
    console.log('💡 Emergency function available: window.clearCache()');
  }, []);

  // Initialize developer mode
  useEffect(() => {
    if(import.meta.env.DEV)console.log('⚡ useEffect RAN!')
    
    // Initialize dev auth service to log device ID
    const initDevAuth = async () => {
      await devAuthService.initialize()
    }
    initDevAuth()
    
    // Check if dev mode is already active
    const savedDevMode = localStorage.getItem('helio_dev_mode')
    if(import.meta.env.DEV)console.log('💾 localStorage helio_dev_mode:', savedDevMode)
    
    // SKIP CHANGING showDevButton - keep it true always
    if(import.meta.env.DEV)console.log('⚠️ Button will stay visible - device auth happens on unlock')
    
    // Only update isDevMode from localStorage
    if (savedDevMode === 'true') {
      setIsDevMode(true)
      if(import.meta.env.DEV)console.log('✅ Dev mode restored from localStorage')
    }
    
    // DON'T call setShowDevButton - leave it as true
  }, [])

  // 🔥 Initialize NEW Week 1 Features - AI Memory & DNA Daily Tips
  useEffect(() => {
    const initNewFeatures = async () => {
      // Initialize AI Memory Service
      await aiMemoryService.initialize()
      if(import.meta.env.DEV)console.log('🧠 AI Memory initialized')

      // Load DNA daily tip
      const tip = await dnaService.generateDailyTip()
      if (tip) {
        setDnaDailyTip(tip)
        window.dnaDailyTip = tip // Make accessible to HomeTab
        if(import.meta.env.DEV)console.log('🧬 DNA Daily Tip loaded:', tip.title)
      }
    }
    initNewFeatures()
  }, [])

  // 🔧 Force cleanup barcode scanner classes on Home tab mount to prevent dimmed banners
  useEffect(() => {
    // Remove any leftover barcode scanner classes when Home tab loads
    document.body.classList.remove('barcode-scanning-active')
    document.querySelector('html')?.classList.remove('barcode-scanning-active')
    
    // Force browser reflow to ensure banners render bright
    void document.body.offsetHeight
  }, [])

  // 🔧 Force cleanup when switching TO home tab (from scan tab with active scanner)
  useEffect(() => {
    if (activeTab === 'home') {
      // Force native webview restoration (Capacitor level)
      try {
        BarcodeScannerPlugin.showBackground()
      } catch (e) {
        // Ignore if scanner wasn't active
      }
      
      // Clean up any barcode scanner state
      document.body.classList.remove('barcode-scanning-active')
      document.querySelector('html')?.classList.remove('barcode-scanning-active')
      
      // Force multiple reflows to ensure complete cleanup
      void document.body.offsetHeight
      requestAnimationFrame(() => {
        void document.body.offsetHeight
      })
      
      if(import.meta.env.DEV)console.log('🏠 Switched to home tab - forced native webview restoration')
    }
  }, [activeTab])

  // Handle developer unlock
  const handleDevUnlock = async (password) => {
    try {
      const result = await devAuthService.unlockDevMode(password)
      if (result.success) {
        setIsDevMode(true)
        setShowDevUnlock(false)
        alert('✅ Developer Mode Activated!\n\nAll premium features unlocked for testing.')
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      return { success: false, message: 'Authentication failed' }
    }
  }
  
  // Handle developer mode disable
  const handleDisableDevMode = () => {
    if (confirm('🔒 Disable Developer Mode?\n\nThis will lock all premium features and require password to re-enable.')) {
      localStorage.removeItem('helio_dev_mode')
      devAuthService.isDevMode = false
      setIsDevMode(false)
      alert('🔒 Developer mode disabled. App will reload.')
      window.location.reload()
    }
  }

  // Reset step counter baseline - FIX for steps not resetting
  const handleResetStepCounter = async () => {
    try {
      const currentSteps = nativeHealthService.getStepCount()
      const todayDate = new Date().toISOString().split('T')[0]
      const userId = authService.getCurrentUser()?.uid
      
      // 🔥 FIX: Save to Capacitor Preferences (syncs with Java notification!)
      await Preferences.set({ key: 'stepBaseline', value: currentSteps.toString() })
      await Preferences.set({ key: 'stepBaselineDate', value: todayDate })
      // Also save to cloud for backup
      await firestoreService.save('stepBaseline', currentSteps.toString(), userId)
      await firestoreService.save('stepBaselineDate', todayDate, userId)
      
      // Reset weekly steps for today
      const currentDay = new Date().getDay()
      const todayIndex = currentDay === 0 ? 6 : currentDay - 1
      const weeklyStepsData = await firestoreService.get('weeklySteps', userId) || []
      while (weeklyStepsData.length < 7) {
        weeklyStepsData.push({ steps: 0, date: null })
      }
      weeklyStepsData[todayIndex] = { steps: 0, date: todayDate }
      await firestoreService.save('weeklySteps', weeklyStepsData, userId)
      
      // Force reload stats
      setStats(prev => ({ ...prev, todaySteps: 0, weeklySteps: weeklyStepsData }))
      
      alert(`✅ Step Counter Reset!\n\nBaseline: ${currentSteps}\nDate: ${todayDate}\n\nToday's steps will now start from 0.`)
      window.location.reload() // Reload to apply changes
    } catch (error) {
      alert('❌ Reset failed: ' + error.message)
    }
  }

  // 🚀 Start Background Step Tracking with Native Sensor
  const handleStartNativeService = async () => {
    console.log('🚀 User requested background step tracking')
    setNativeServiceStarting(true)
    
    try {
      // FIRST: Request notification permission (required for foreground service on Android 13+)
      console.log('📱 Step 1: Requesting notification permission...')
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      
      const notifPerm = await LocalNotifications.checkPermissions()
      console.log('Current notification permission:', notifPerm)
      
      if (notifPerm.display !== 'granted') {
        console.log('Requesting notification permission...')
        const requestResult = await LocalNotifications.requestPermissions()
        console.log('Notification permission result:', requestResult)
        
        if (requestResult.display !== 'granted') {
          alert('❌ Notification Permission Required\n\nForeground services need notification permission to run 24/7.\n\nPlease grant notification permission in the next dialog.')
          setNativeServiceStarting(false)
          return
        }
      }
      
      console.log('✅ Notification permission granted')
      console.log('📱 Step 2: Starting native step counter service...')
      
      // Import and start native foreground service with error handling
      const nativeStepModule = await import('../services/nativeStepService').catch(err => {
        console.error('❌ Failed to import nativeStepService:', err);
        throw new Error('Service module not available');
      });
      const { default: nativeStepService } = nativeStepModule;
      const started = await nativeStepService.start()
      
      if (started) {
        setNativeServiceRunning(true)
        console.log('✅ Service started successfully!')
        
        // Mutex lock to prevent race conditions during Firebase saves
        let stepSaveLock = false;
        
        // 🔥 NEW FIX: Poll every 30 seconds and refresh ALL stats (not just steps)
        const pollInterval = setInterval(async () => {
          // Skip if previous save still in progress (prevent race conditions)
          if (stepSaveLock) {
            console.log('⏭️ Polling: Skipping - previous save still in progress');
            return;
          }
          
          try {
            stepSaveLock = true; // Acquire lock
            console.log('🔄 [POLLING] Refreshing dashboard stats...')
            await loadRealData() // Reload all stats including steps
            loadActivities() // Refresh activity pulse
            console.log('✅ [POLLING] Dashboard updated successfully')
          } catch (err) {
            console.error('❌ [POLLING] Error:', err)
          } finally {
            stepSaveLock = false; // Release lock
          }
        }, 30000) // 🔥 FIX: 30 seconds for real-time feel (was 5 minutes)
        
        // Store interval ID so we can clear it later
        window.__stepPollingInterval = pollInterval
        
        // 🔥 NEW FIX: Load data IMMEDIATELY so dashboard shows steps right away (don't wait 30 seconds)
        setTimeout(async () => {
          console.log('🚀 [STARTUP] Loading initial data...')
          await loadRealData()
          loadActivities()
          console.log('✅ [STARTUP] Initial data loaded')
          alert('✅ 24/7 Step Tracking Enabled!\n\n✓ Persistent notification showing\n✓ Steps count even when app is closed\n✓ Dashboard syncs every 30 seconds\n\nWalk around and watch both notification and dashboard update!')
        }, 500)
      } else {
        alert('❌ Failed to Start Service\n\nPossible reasons:\n• No step counter sensor on device\n• Permission denied\n• Service already running\n\nCheck notification area for "🏃 Helio Active"')
      }
      
    } catch (error) {
      console.error('❌ Failed to start background tracking:', error)
      alert('❌ Error Starting Service\n\n' + error.message + '\n\nTry restarting the app or checking app permissions in settings.')
    } finally {
      setNativeServiceStarting(false)
    }
  }

  // 🔥 FIX: Restore from Preferences on first launch after uninstall
  useEffect(() => {
    const restoreFromPreferences = async () => {
      const userId = authService.getCurrentUser()?.uid
      if (!userId) return
      
      // Check if this is first load (no cloud data yet)
      const hasCloudData = await firestoreService.get('weeklySteps', userId)
      if (hasCloudData && hasCloudData.length > 0) {
        console.log('✅ [FIRST-LAUNCH] Cloud data exists, skipping restore')
        return // Already has data
      }
      
      // First launch - restore from Preferences
      console.log('🔄 [FIRST-LAUNCH] No cloud data - restoring from Preferences...')
      try {
        const { Preferences } = await import('@capacitor/preferences')
        const storedSteps = await Preferences.get({ key: 'wellnessai_todaySteps' })
        
        if (storedSteps.value) {
          const rawValue = storedSteps.value
          let steps = 0
          try {
            steps = parseInt(JSON.parse(rawValue))
          } catch {
            steps = parseInt(rawValue)
          }
          
          console.log('✅ [FIRST-LAUNCH] Restored', steps, 'steps from Preferences')
          
          // Save to Firestore with timestamp
          const today = new Date().toISOString().split('T')[0]
          const currentDay = new Date().getDay()
          const todayIndex = currentDay === 0 ? 6 : currentDay - 1
          
          const weeklySteps = Array(7).fill(null).map(() => ({ steps: 0, date: null, timestamp: 0 }))
          weeklySteps[todayIndex] = {
            steps: steps,
            date: today,
            timestamp: Date.now()
          }
          
          await firestoreService.save('weeklySteps', weeklySteps, userId)
          console.log('✅ [FIRST-LAUNCH] Saved to cloud with timestamp')
        } else {
          console.log('ℹ️ [FIRST-LAUNCH] No Preferences data to restore')
        }
      } catch (error) {
        console.error('❌ [FIRST-LAUNCH] Restore failed:', error)
      }
    }
    
    restoreFromPreferences()
  }, [])

  // Load real data from localStorage + Firebase cloud (moved outside useEffect so it can be called from anywhere)
  const loadRealData = async () => {
    // 🔒 MUTEX: Skip if another loadRealData is in progress
    if (loadDataLock) {
      console.log('⏭️ loadRealData: Skipping - already in progress');
      return;
    }
    
    setLoadDataLock(true);
    const today = new Date().toISOString().split('T')[0]
    
    try {
      // 🔥 CRITICAL: Use TODAY's steps calculated by notification service
        let todaySteps = 0
        try {
          const { Preferences } = await import('@capacitor/preferences')
          
          // The notification service already calculates today's steps correctly
          // Just read that value instead of recalculating
          try {
            const storedSteps = await Preferences.get({ key: 'wellnessai_todaySteps' })
            // Value is JSON-encoded (e.g., "4196" with quotes), so parse twice
            const rawValue = storedSteps.value || '0'
            try {
              todaySteps = parseInt(JSON.parse(rawValue))
            } catch {
              todaySteps = parseInt(rawValue)
            }
            console.log('📊 [DASHBOARD] Today steps from notification service:', todaySteps)
          } catch (readErr) {
            console.warn('⚠️ Could not read today steps:', readErr)
            todaySteps = 0
          }
          
          // No need to recalculate - notification service already does this correctly
          // Just use the value we read above
          console.log('✅ [DASHBOARD] Using today steps:', todaySteps)
        } catch (err) {
          console.error('❌ Error reading steps:', err)
          todaySteps = 0
        }

        // Count water cups today (load from cloud)
        const userId = authService.getCurrentUser()?.uid
        const waterLog = await firestoreService.get('waterLog', userId) || []
        const waterToday = waterLog.filter(w => w.date === today)
        const waterCups = waterToday.reduce((sum, w) => sum + (w.cups || 1), 0)

        // Count meals logged today (load from user profile)
        const currentUser = authService.getCurrentUser()
        const foodLog = currentUser?.profile?.foodLog || []
        const mealsToday = foodLog.filter(f => 
          f.date === today || (f.timestamp && new Date(f.timestamp).toISOString().split('T')[0] === today)
        )
        const mealsLogged = mealsToday.length
        if(import.meta.env.DEV)console.log('🍽️ Meals loaded on init:', mealsLogged, 'meals today')

        // ✅ Sync workoutHistory from Firebase (cross-device + persistent)
        const firebaseWorkouts = await firestoreService.get('workoutHistory', userId) || []
        const localWorkouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
        
        // Merge Firebase + localStorage (dedupe by timestamp)
        const workoutMap = new Map()
        localWorkouts.forEach(w => workoutMap.set(w.timestamp, w))
        firebaseWorkouts.forEach(w => workoutMap.set(w.timestamp, w))
        const mergedWorkouts = Array.from(workoutMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        
        // Save merged back to both storages
        localStorage.setItem('workoutHistory', JSON.stringify(mergedWorkouts))
        await firestoreService.save('workoutHistory', mergedWorkouts, userId)
        if(import.meta.env.DEV)console.log('💪 Workouts synced:', mergedWorkouts.length, 'total workouts')
        
        // ✅ Sync sleepLog from Firebase (cross-device + persistent)
        const firebaseSleep = await firestoreService.get('sleepLog', userId) || []
        const localSleep = JSON.parse(localStorage.getItem('sleepLog') || '[]')
        
        // Merge Firebase + localStorage (dedupe by timestamp)
        const sleepMap = new Map()
        localSleep.forEach(s => sleepMap.set(s.timestamp, s))
        firebaseSleep.forEach(s => sleepMap.set(s.timestamp, s))
        const mergedSleep = Array.from(sleepMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        
        // Save merged back to both storages
        localStorage.setItem('sleepLog', JSON.stringify(mergedSleep))
        await firestoreService.save('sleepLog', mergedSleep, userId)
        if(import.meta.env.DEV)console.log('😴 Sleep synced:', mergedSleep.length, 'total sleep sessions')
        
        // ⚔️ Sync Battle Data (Firebase + localStorage)
        try {
          const { default: socialBattlesService } = await import('../services/socialBattlesService.js')
          await socialBattlesService.init() // This handles all merge/sync logic internally
          if(import.meta.env.DEV)console.log('⚔️ Battles synced from Firebase')
        } catch (err) {
          console.warn('Failed to sync battle data:', err);
        }
        
        // Calculate streak (load from cloud)
        const loginHistory = await firestoreService.get('loginHistory', userId) || []
        let streak = 0
        if (loginHistory.length > 0) {
          const sortedLogins = loginHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
          let currentDate = new Date()
          streak = 1
          
          for (let i = 1; i < sortedLogins.length; i++) {
            const loginDate = new Date(sortedLogins[i].date)
            const daysDiff = Math.floor((currentDate - loginDate) / (1000 * 60 * 60 * 24))
            
            if (daysDiff === 1) {
              streak++
              currentDate = loginDate
            } else if (daysDiff > 1) {
              break
            }
          }
        }

        // Load weekly steps history (from cloud)
        const weeklyStepsData = await firestoreService.get('weeklySteps', userId) || []
        const currentDay = new Date().getDay() // 0=Sun, 1=Mon, etc
        const todayIndex = currentDay === 0 ? 6 : currentDay - 1 // Convert to Mon=0, Sun=6
        const todayDate = new Date().toISOString().split('T')[0]
        
        // Ensure we have data for all 7 days
        while (weeklyStepsData.length < 7) {
          weeklyStepsData.push({ steps: 0, date: null })
        }
        
        // Check if it's a new week (Monday = reset all days)
        if (currentDay === 1) { // Monday
          const lastMonday = weeklyStepsData[0]?.date
          if (lastMonday && lastMonday !== todayDate) {
            // New week started - clear all days except today
            for (let i = 0; i < 7; i++) {
              weeklyStepsData[i] = { steps: 0, date: null }
            }
          }
        }
        
        // 🔥 todaySteps is now calculated above using same logic as notification
        
        // 🛡️ SMART MERGE: Combine cloud history + live sensor data
        const cloudTodayData = weeklyStepsData[todayIndex]
        const stepHistoryRaw = JSON.parse(localStorage.getItem('stepHistory') || '[]')
        const stepHistory = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : []
        const historyEntry = stepHistory.find(s => s.date === todayDate)
        const historySteps = historyEntry?.steps || 0
        
        if (cloudTodayData?.date === todayDate) {
          // Cloud data is from today
          const cloudSteps = cloudTodayData.steps || 0
          const liveSteps = todaySteps || 0
          const cloudTimestamp = cloudTodayData.timestamp || 0
          const now = Date.now()
          
          // 🔥 CORRUPTION FIX: Detect suspiciously high cloud data vs live sensor
          const cloudTooHigh = cloudSteps > 1000 && liveSteps < 500 && cloudSteps > liveSteps * 10
          if (cloudTooHigh) {
            console.log('🚨 CORRUPTION DETECTED: Cloud=' + cloudSteps + ' vs Live=' + liveSteps + ' - using live sensor!')
            todaySteps = liveSteps
            // Force immediate save with new timestamp to fix corruption
            weeklyStepsData[todayIndex] = {
              steps: todaySteps,
              date: todayDate,
              timestamp: Date.now()
            }
            await firestoreService.save('weeklySteps', weeklyStepsData, userId)
            // Also clear localStorage history corruption
            localStorage.setItem('stepHistory', JSON.stringify([]))
            console.log('✅ CORRUPTION FIXED: Reset to ' + todaySteps + ' steps')
            
            // Skip normal merge logic - we've already fixed it
            console.log('📊 [DASHBOARD] Setting stats.todaySteps to:', todaySteps)
            console.log('📊 [DASHBOARD] Stats updated! Should now show:', todaySteps, 'steps')
            setStats({ ...stats, todaySteps })
            return // Exit early - corruption fixed
          }
          
          // 🔥 NEW: Detect stale cloud data (older than 10 minutes)
          const isCloudStale = cloudTimestamp > 0 && (now - cloudTimestamp) > 600000 // 10 min
          
          if (isCloudStale) {
            console.log('⚠️ Cloud data is stale (' + Math.round((now - cloudTimestamp) / 60000) + ' min old) - ignoring and using live sensor')
            todaySteps = Math.max(historySteps, liveSteps) // Ignore stale cloud data
          } else {
            // Cloud is fresh or has no timestamp (legacy) - use Math.max as before
            const maxSteps = Math.max(cloudSteps, historySteps, liveSteps)
            todaySteps = maxSteps
          }
          
          console.log('✅ Step merge: cloud=' + cloudSteps + ' (stale=' + isCloudStale + ') history=' + historySteps + ' live=' + liveSteps + ' → using=' + todaySteps)
        } else {
          // Cloud data is old/stale - use max of history or live
          const maxSteps = Math.max(historySteps, todaySteps)
          todaySteps = maxSteps
          console.log('⚠️ Cloud steps are from', cloudTodayData?.date, '- using max(history=' + historySteps + ', live=' + todaySteps + ') =', maxSteps)
        }
        
      // 🔥 CRITICAL FIX: Only update timestamp when step count CHANGES
      const stepsChanged = cloudTodayData.steps !== todaySteps
      const newTimestamp = stepsChanged ? Date.now() : (cloudTimestamp || Date.now())
      
      weeklyStepsData[todayIndex] = {
        steps: todaySteps,
        date: todayDate,
        timestamp: newTimestamp
      }
      console.log('✅ Weekly array updated: index', todayIndex, 'steps', todaySteps, 'timestamp', newTimestamp, 'changed=', stepsChanged)
      
      await firestoreService.save('weeklySteps', weeklyStepsData, userId)
      
      // Update localStorage stepHistory for Activity Pulse synchronization
      const existingTodayIndex = stepHistory.findIndex(s => s.date === todayDate)
      
      if (existingTodayIndex >= 0) {
        // Update existing entry
        stepHistory[existingTodayIndex] = {
          steps: todaySteps,
          date: todayDate,
          timestamp: Date.now()
        }
      } else {
        // Add new entry
        stepHistory.push({
          steps: todaySteps,
          date: todayDate,
          timestamp: Date.now()
        })
      }
      localStorage.setItem('stepHistory', JSON.stringify(stepHistory))
        if(import.meta.env.DEV)console.log('💾 Updated stepHistory in localStorage for Activity Pulse')

        console.log('📊 [DASHBOARD] Setting stats.todaySteps to:', todaySteps);
        setStats(prev => ({
          ...prev,
          todaySteps: todaySteps,
          waterCups,
          mealsLogged,
          streak: streak || prev.streak,
          weeklySteps: weeklyStepsData
        }))
        console.log('📊 [DASHBOARD] Stats updated! Should now show:', todaySteps, 'steps');
      } catch (error) {
        if(import.meta.env.DEV)console.error('Error loading real stats:', error)
      } finally {
        // 🔒 MUTEX: Always release lock
        setLoadDataLock(false);
      }
  }

  // 🔥 FIX: Load real data IMMEDIATELY on mount (don't wait for tracking button)
  useEffect(() => {
    const initData = async () => {
      console.log('🚀 [MOUNT] Loading dashboard data immediately...')
      await loadRealData()
      loadActivities()
      console.log('✅ [MOUNT] Initial data loaded')
      
      // ⭐ GAMIFICATION: Daily check-in for streaks
      try {
        const checkInResult = await gamificationService.checkIn()
        if (!checkInResult.alreadyCheckedIn) {
          if(import.meta.env.DEV)console.log('🎉 [GAMIFICATION] Daily check-in! +10 XP, Streak:', checkInResult.streak)
          // Optionally show notification to user
          if (checkInResult.leveledUp) {
            if(import.meta.env.DEV)console.log('🎊 [GAMIFICATION] LEVEL UP!')
          }
        } else {
          if(import.meta.env.DEV)console.log('✅ [GAMIFICATION] Already checked in today, Streak:', checkInResult.streak)
        }
      } catch (error) {
        console.error('❌ [GAMIFICATION] Check-in failed:', error)
        // Don't block app - continue without gamification
      }
      
      // 🔥 AUTO-START: Start foreground service automatically if not running
      try {
        console.log('🔍 [AUTO-START] Checking if foreground service is running...')
        const nativeStepModule = await import('../services/nativeStepService').catch(err => {
          console.error('❌ Failed to import nativeStepService:', err);
          return null;
        });
        if (!nativeStepModule) {
          console.warn('⚠️ [AUTO-START] Service module not available');
          return;
        }
        const { default: nativeStepService } = nativeStepModule;
        const isRunning = nativeStepService.isRunning
        console.log('🔍 [AUTO-START] Service running status:', isRunning)
        
        if (!isRunning) {
          console.log('🚀 [AUTO-START] Foreground service not running - starting automatically...')
          
          // Request notification permission first
          const { LocalNotifications } = await import('@capacitor/local-notifications')
          const notifPerm = await LocalNotifications.checkPermissions()
          console.log('🔍 [AUTO-START] Notification permission:', notifPerm.display)
          
          if (notifPerm.display === 'granted') {
            console.log('✅ [AUTO-START] Permission granted, starting service...')
            const started = await nativeStepService.start()
            console.log('🔍 [AUTO-START] Service start result:', started)
            
            if (started) {
              setNativeServiceRunning(true)
              console.log('✅ [AUTO-START] Foreground service started successfully!')
              
              // Start polling for updates
              const pollInterval = setInterval(async () => {
                console.log('🔄 [POLLING] Refreshing dashboard stats...')
                await loadRealData()
              }, 30000)
              
              window._stepPollInterval = pollInterval
            }
          } else {
            console.log('⚠️ [AUTO-START] Notification permission not granted - service needs manual start')
          }
        } else {
          console.log('✅ [AUTO-START] Foreground service already running')
          setNativeServiceRunning(true)
        }
      } catch (error) {
        console.error('❌ [AUTO-START] Failed to auto-start service:', error)
      }
    }
    initData()
    
    return () => {
      if (window._stepPollInterval) {
        console.log('🧹 Cleaning up polling interval')
        clearInterval(window._stepPollInterval)
      }
    }
  }, [])

  useEffect(() => {
    // Track dashboard view
    analytics.trackPageView('Dashboard_Home');
    
    // Initialize subscription service after component mount
    window.subscriptionService = subscriptionService;
    
    // Initialize auth service to load user from Preferences
    const initAuth = async () => {
      await authService.initialize();
      await syncService.initialize();
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        if (!currentUser.profile?.allergens && !currentUser.profile?.age) {
          setShowProfileSetup(true);
        }
      }
    };
    initAuth();
    
    // Initialize step tracking
    let cleanupFn = null
    const initStepTracking = async () => {
      try {
        await nativeHealthService.initialize()
        
        if(import.meta.env.DEV)console.log('🔍 Checking tracking method...')
        if(import.meta.env.DEV)console.log('   - Multi-sensor:', nativeHealthService.isUsingMultiSensor)
        if(import.meta.env.DEV)console.log('   - Active sensors:', nativeHealthService.activeSensorCount)
        if(import.meta.env.DEV)console.log('   - Hardware:', nativeHealthService.isUsingHardware)
        
        // Small delay to ensure initialization completes
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Detect which method is being used (priority order)
        if (nativeHealthService.isUsingMultiSensor) {
          if(import.meta.env.DEV)console.log(`🌟🌟🌟 DASHBOARD: MULTI-SENSOR FUSION ACTIVE! ${nativeHealthService.activeSensorCount} sensors!`)
          setStepMethod('multisensor')
          window.stepMethod = 'multisensor'
          window.activeSensorCount = nativeHealthService.activeSensorCount
        } else if (nativeHealthService.isUsingHardware) {
          if(import.meta.env.DEV)console.log('✅ DASHBOARD: Hardware step counter active')
          setStepMethod('hardware')
          window.stepMethod = 'hardware'
        } else {
          if(import.meta.env.DEV)console.log('⚠️ DASHBOARD: Basic software detection')
          setStepMethod('software')
          window.stepMethod = 'software'
        }
        
        // Old step listener DISABLED - native service polling handles updates now
        // (Not adding listener to prevent old health service from overwriting native service data)
        if(import.meta.env.DEV)console.log('✅ Step listener disabled - native service polling handles all updates')
        
        // DON'T load from old health service - let loadRealData() and polling handle it
        if(import.meta.env.DEV)console.log('📊 Step updates now handled by native service polling (no old health service interference)')
        
        // Cleanup function
        cleanupFn = () => {
          const index = nativeHealthService.stepListeners.indexOf(stepListener)
          if (index > -1) {
            nativeHealthService.stepListeners.splice(index, 1)
          }
          nativeHealthService.cleanup()
          if(import.meta.env.DEV)console.log('🧹 Step tracking cleanup complete')
        }
      } catch (error) {
        if(import.meta.env.DEV)console.error('Failed to init step tracking:', error)
      }
    }
    
    initStepTracking()
    
    return () => {
      if (cleanupFn) cleanupFn()
    }
  }, [])

  // Function to refresh stats from localStorage
  const refreshStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Get live step count
    const liveStepCount = nativeHealthService.getStepCount()
    
    // Count water cups today
    const waterLog = JSON.parse(localStorage.getItem('waterLog') || '[]')
    const waterToday = waterLog.filter(w => w.date === today)
    const waterCups = waterToday.reduce((sum, w) => sum + (w.cups || 1), 0)
    
    // 💾 Count meals logged today - LOAD FROM USER PROFILE
    const currentUser = authService.getCurrentUser()
    const foodLog = currentUser?.profile?.foodLog || []
    const mealsToday = foodLog.filter(f => 
      f.date === today || (f.timestamp && new Date(f.timestamp).toISOString().split('T')[0] === today)
    )
    const mealsLogged = mealsToday.length
    if(import.meta.env.DEV)console.log('🔄 Meals refreshed:', mealsLogged)
    
    // Count workouts today
    const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
    const workoutsToday = workoutHistory.filter(w => w.date === today)
    const workoutsCount = workoutsToday.length
    
    setStats(prev => ({
      ...prev,
      todaySteps: liveStepCount,
      waterCups: waterCups,
      mealsLogged: mealsLogged
    }))
    
    if(import.meta.env.DEV)console.log('🔄 Stats refreshed:', { steps: liveStepCount, water: waterCups, meals: mealsLogged, workouts: workoutsCount })
    
    // ✅ FIX: Reload activities to update Activity Pulse immediately
    await loadActivities()
    if(import.meta.env.DEV)console.log('✅ Activity Pulse refreshed with latest workout data')
  }

  // Initialize new services
  useEffect(() => {
    // Initialize water intake service
    waterIntakeService.initialize()
    
    // Initialize dark mode
    darkModeService.initialize()
    
    // Check if heart rate monitor is connected
    if (heartRateService.isConnected()) {
      setHeartRateConnected(true)
      heartRateService.subscribe((reading) => {
        setStats(prev => ({ ...prev, heartRate: reading.bpm }))
      })
    }
    
    // Check if sleep tracking is active
    if (sleepTrackingService.isTracking) {
      setSleepTracking(true)
    }

    // Restore sleep session if exists
    sleepTrackingService.restoreSleepSession()

    // Event listeners for custom events (now with paywall protection)
    const handleOpenWater = () => {
      setShowWaterModal(true)
    }

    window.addEventListener('openHeartRate', handleOpenHeartRate)
    window.addEventListener('openSleep', handleOpenSleep)
    window.addEventListener('openWaterModal', handleOpenWater)
    window.addEventListener('openWorkouts', handleOpenWorkouts)
    window.addEventListener('openFoodScanner', handleOpenFoodScanner)
    window.addEventListener('openBreathing', handleOpenBreathing)
    window.addEventListener('openGuidedMeditation', handleOpenMeditation)
    
    if(import.meta.env.DEV)console.log('✅ New services initialized')

    return () => {
      window.removeEventListener('openHeartRate', handleOpenHeartRate)
      window.removeEventListener('openSleep', handleOpenSleep)
      window.removeEventListener('openWaterModal', handleOpenWater)
      window.removeEventListener('openWorkouts', handleOpenWorkouts)
      window.removeEventListener('openFoodScanner', handleOpenFoodScanner)
      window.removeEventListener('openBreathing', handleOpenBreathing)
      window.removeEventListener('openGuidedMeditation', handleOpenMeditation)
    }
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.profile?.fullName || user?.displayName || user?.name || user?.profile?.name || 'Champion'
    
    if (hour < 12) return `Good morning, ${name}! ☀️`
    if (hour < 18) return `Good afternoon, ${name}! 🌤️`
    return `Good evening, ${name}! 🌙`
  }

  const getMotivation = () => {
    const messages = [
      "You're absolutely crushing it today! 💪",
      "Keep going, you're unstoppable! 🚀",
      "Your future self will thank you! ⭐",
      "Every step counts. You got this! 🔥",
      "Small wins lead to big victories! 🏆"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const handleGoalComplete = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  // Get all activities from localStorage (real data)
  const getAllActivities = async () => {
    const activities = []
    const today = new Date().toISOString().split('T')[0]
    
    try {
      // Step History
      const stepHistoryRaw = JSON.parse(localStorage.getItem('stepHistory') || '[]')
      const stepHistory = Array.isArray(stepHistoryRaw) ? stepHistoryRaw : []
      stepHistory.filter(s => s.date === today).forEach(step => {
        activities.push({
          type: 'steps',
          icon: '👟',
          text: `${step.steps} steps`,
          time: new Date(step.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          timestamp: step.timestamp || Date.now(),
          calories: Math.floor(step.steps * 0.04)
        })
      })

      // Workout History
      const workoutHistoryRaw = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
      const workoutHistory = Array.isArray(workoutHistoryRaw) ? workoutHistoryRaw : []
      workoutHistory.filter(w => w.date === today).forEach(workout => {
        activities.push({
          type: 'workout',
          icon: '💪',
          text: `${workout.type || 'Workout'} - ${workout.duration || 0} min`,
          time: new Date(workout.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          timestamp: workout.timestamp || Date.now(),
          calories: workout.calories || 0
        })
      })

      // 💾 Food Log - LOAD FROM CAPACITOR PREFERENCES
      const { value: foodLogJson } = await Preferences.get({ key: 'foodLog' })
      const foodLogRaw = foodLogJson ? JSON.parse(foodLogJson) : []
      const foodLog = Array.isArray(foodLogRaw) ? foodLogRaw : []
      foodLog.filter(f => f.date === today || new Date(f.timestamp).toISOString().split('T')[0] === today).forEach(food => {
        activities.push({
          type: 'meal',
          icon: '🍽️',
          text: food.name || 'Meal logged',
          time: new Date(food.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          timestamp: food.timestamp || Date.now(),
          calories: food.calories || 0
        })
      })

      // Sleep Log
      const sleepLogRaw = JSON.parse(localStorage.getItem('sleepLog') || '[]')
      const sleepLog = Array.isArray(sleepLogRaw) ? sleepLogRaw : []
      sleepLog.filter(s => s.date === today).forEach(sleep => {
        activities.push({
          type: 'sleep',
          icon: '😴',
          text: `${sleep.hours || 0}h ${sleep.minutes || 0}m sleep`,
          time: new Date(sleep.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          timestamp: sleep.timestamp || Date.now()
        })
      })

      // Water intake
      const waterLogRaw = JSON.parse(localStorage.getItem('waterLog') || '[]')
      const waterLog = Array.isArray(waterLogRaw) ? waterLogRaw : []
      waterLog.filter(w => w.date === today).forEach(water => {
        activities.push({
          type: 'water',
          icon: '💧',
          text: `${water.cups || 1} cup water`,
          time: new Date(water.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          timestamp: water.timestamp || Date.now()
        })
      })

      // Meditation/Zen sessions
      const meditationLogRaw = JSON.parse(localStorage.getItem('meditationLog') || '[]')
      const meditationLog = Array.isArray(meditationLogRaw) ? meditationLogRaw : []
      meditationLog.filter(m => m.date === today).forEach(med => {
        activities.push({
          type: 'meditation',
          icon: '🧘',
          text: `${med.duration || 0} min meditation`,
          time: new Date(med.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          timestamp: med.timestamp || Date.now()
        })
      })

      // Activity log from AI tracking
      const activityLogRaw = JSON.parse(localStorage.getItem('activityLog') || '[]')
      const activityLog = Array.isArray(activityLogRaw) ? activityLogRaw : []
      activityLog.filter(a => new Date(a.startTime).toISOString().split('T')[0] === today).forEach(act => {
        if (act.activity && act.activity !== 'stationary') {
          activities.push({
            type: 'activity',
            icon: act.activity === 'running' ? '🏃' : act.activity === 'walking' ? '🚶' : '🚗',
            text: `${act.activity} detected`,
            time: new Date(act.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            timestamp: act.startTime
          })
        }
      })

    } catch (error) {
      if(import.meta.env.DEV)console.error('Error loading activities:', error)
    }

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }

  const loadActivities = async () => {
    const all = await getAllActivities()
    setRecentActivities(all.slice(0, 10))
    setActivityCount(all.length)
  }
  
  // Call loadActivities when meals are logged or when returning to home tab
  useEffect(() => {
    if (activeTab === 'home') {
      loadActivities()
    }
  }, [activeTab])

  return (
    <div className="new-dashboard">
      {/* 🎮 GAMIFICATION COMPONENTS */}
      <Suspense fallback={null}>
        <StreakCounter />
      </Suspense>

      {achievementToShow && (
        <Suspense fallback={null}>
          <AchievementUnlock 
            achievement={achievementToShow} 
            onClose={() => setAchievementToShow(null)} 
          />
        </Suspense>
      )}
      
      {/* 🎯 HIERARCHICAL MODAL SYSTEM */}
      {showAIAssistantModal && (
        <Suspense fallback={null}>
          <AIAssistantModal 
            userName={user?.name || user?.profile?.name || 'Friend'}
            onClose={() => setShowAIAssistantModal(false)} 
          />
        </Suspense>
      )}
      
      {/* 🧠 BRAIN.JS AI LEARNING SYSTEM */}
      {showBrainInsights && (
        <Suspense fallback={null}>
          <BrainInsightsDashboard 
            onClose={() => setShowBrainInsights(false)} 
          />
        </Suspense>
      )}
      
      {showHealthToolsModal && (
        <Suspense fallback={null}>
          <HealthToolsModal 
            onClose={() => setShowHealthToolsModal(false)}
            onOpenHealthAvatar={() => { setShowHealthToolsModal(false); analytics.trackFeatureUse('Health_Avatar'); setShowHealthAvatar(true); }}
            onOpenARScanner={() => { setShowHealthToolsModal(false); analytics.trackFeatureUse('AR_Scanner'); setShowARScanner(true); }}
            onOpenEmergency={() => { setShowHealthToolsModal(false); analytics.trackFeatureUse('Emergency_Panel'); setShowEmergency(true); }}
            onOpenInsurance={() => { setShowHealthToolsModal(false); analytics.trackFeatureUse('Insurance_Rewards'); setShowInsurance(true); }}
          />
        </Suspense>
      )}
      
      {showDataManagementModal && (
        <Suspense fallback={null}>
          <DataManagementModal 
            onClose={() => setShowDataManagementModal(false)}
            onOpenDNA={() => { setShowDataManagementModal(false); analytics.trackFeatureUse('DNA_Analysis'); setShowDNA(true); }}
            onExportDailyStats={handleExportDailyStats}
            onExportWorkoutHistory={handleExportWorkoutHistory}
            onExportFoodLog={handleExportFoodLog}
            onExportFullReport={handleExportFullReport}
            checkFeatureAccess={(featureName, onSuccess) => {
              if (subscriptionService.hasAccess(featureName)) {
                onSuccess();
              } else {
                setShowDataManagementModal(false);
                const paywallInfo = subscriptionService.showPaywall(featureName, () => setShowStripePayment(true));
                setPaywallData(paywallInfo);
              }
            }}
          />
        </Suspense>
      )}
      
      {showSocialFeaturesModal && (
        <Suspense fallback={null}>
          <SocialFeaturesModal 
            onClose={() => setShowSocialFeaturesModal(false)}
            onOpenBattles={() => { setShowSocialFeaturesModal(false); analytics.trackFeatureUse('Social_Battles'); setShowBattles(true); }}
            onOpenMeals={() => { setShowSocialFeaturesModal(false); analytics.trackFeatureUse('Meal_Automation'); setShowMeals(true); }}
            checkFeatureAccess={(featureName, onSuccess) => {
              if (subscriptionService.hasAccess(featureName)) {
                onSuccess();
              } else {
                setShowSocialFeaturesModal(false);
                const paywallInfo = subscriptionService.showPaywall(featureName, () => setShowStripePayment(true));
                setPaywallData(paywallInfo);
              }
            }}
          />
        </Suspense>
      )}
      
      {showSettingsHubModal && (
        <Suspense fallback={null}>
          <SettingsHubModal 
            onClose={() => setShowSettingsHubModal(false)}
            onOpenNotifications={() => { setShowSettingsHubModal(false); setShowNotifications(true); }}
            onOpenTheme={() => { setShowSettingsHubModal(false); setShowTheme(true); }}
            onOpenDevUnlock={() => { setShowSettingsHubModal(false); setShowDevUnlock(true); }}
            onLogout={() => {
              setShowSettingsHubModal(false);
              authService.signOut();
              navigate('/');
            }}
            showDevButton={showDevButton}
            isDevMode={isDevMode}
            onDisableDevMode={handleDisableDevMode}
            onResetStepCounter={handleResetStepCounter}
            user={{
              ...user,
              onOpenStripePayment: () => setShowStripePayment(true),
              onOpenAppleHealth: () => setShowAppleHealth(true),
              onOpenWearables: () => setShowWearables(true),
              onOpenDataRecovery: () => setShowDataRecovery(true)
            }}
          />
        </Suspense>
      )}
      
      {showQuickLogModal && (
        <Suspense fallback={null}>
          <QuickLogModal 
            isOpen={showQuickLogModal}
            onClose={() => setShowQuickLogModal(false)}
          />
        </Suspense>
      )}

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              background: ['#FF6B35', '#FFB84D', '#44FF44', '#00C8FF', '#FF00FF'][Math.floor(Math.random() * 5)]
            }}></div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="dashboard-content">
        {activeTab === 'home' && (
          <>
            <Suspense fallback={<div>Loading...</div>}>
              <LevelProgressBar />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <DailyChallenges onChallengeComplete={(xp) => {
                // Show points popup
              }} />
            </Suspense>
            <HomeTab 
              stats={stats} 
              greeting={getGreeting()}
              motivation={getMotivation()}
              onGoalComplete={handleGoalComplete}
              recentActivities={recentActivities}
              activityCount={activityCount}
              onOpenActivityPulse={() => setShowActivityPulse(true)}
              stepMethod={stepMethod}
              handleOpenWorkouts={handleOpenWorkouts}
              handleOpenFoodScanner={handleOpenFoodScanner}
              handleOpenHeartRate={handleOpenHeartRate}
              handleOpenSleep={handleOpenSleep}
              onOpenBarcodeScanner={() => { analytics.trackFeatureUse('Barcode_Scanner'); setShowBarcodeScanner(true); }}
              onOpenRecipeCreator={() => { analytics.trackFeatureUse('Recipe_Creator'); setShowMeals(true); }}
              onOpenRestaurants={() => { analytics.trackFeatureUse('Restaurants'); setShowBarcodeScanner(true); }}
              onOpenSocial={() => { analytics.trackFeatureUse('Social_Battles'); setShowBattles(true); }}
              onOpenRepCounter={() => { analytics.trackFeatureUse('Rep_Counter'); setShowRepCounter(true); }}
              onOpenBrainInsights={() => { analytics.trackFeatureUse('Brain_Insights'); setShowBrainInsights(true); }}
              nativeServiceRunning={nativeServiceRunning}
              nativeServiceStarting={nativeServiceStarting}
              onStartNativeService={handleStartNativeService}
              setNativeServiceRunning={setNativeServiceRunning}
              onOpenQuickLog={() => setShowQuickLogModal(true)}
            />
          </>
        )}
        
        {activeTab === 'voice' && useRedesignedTabs && (
          <Suspense fallback={<div>Loading...</div>}>
            <VoiceTabRedesign 
              userName={user?.name || user?.profile?.name || 'Friend'}
              onOpenVoiceChat={(prompt) => {
                // Open voice chat with prompt
              }}
              onOpenAIAssistant={() => setShowAIAssistantModal(true)}
            />
          </Suspense>
        )}

        {activeTab === 'voice' && !useRedesignedTabs && (
          <VoiceTab userName={user?.name || user?.profile?.name || 'Friend'} />
        )}
        
        {activeTab === 'scan' && useRedesignedTabs && (
          <Suspense fallback={<div>Loading...</div>}>
            <ScanTabRedesign 
              onOpenFoodScanner={() => { analytics.trackFeatureUse('Food_Scanner'); setShowFoodScanner(true); }}
              onOpenARScanner={() => { analytics.trackFeatureUse('AR_Scanner'); setShowARScanner(true); }}
              onOpenBarcodeScanner={() => { analytics.trackFeatureUse('Barcode_Scanner'); setShowBarcodeScanner(true); }}
              onOpenRepCounter={() => { analytics.trackFeatureUse('Rep_Counter'); setShowRepCounter(true); }}
            />
          </Suspense>
        )}

        {activeTab === 'scan' && !useRedesignedTabs && (
          <ScanTab 
            onOpenFoodScanner={() => { analytics.trackFeatureUse('Food_Scanner'); setShowFoodScanner(true); }}
            onOpenARScanner={() => { analytics.trackFeatureUse('AR_Scanner'); setShowARScanner(true); }}
            onOpenBarcodeScanner={() => { analytics.trackFeatureUse('Barcode_Scanner'); setShowBarcodeScanner(true); }}
            onOpenRepCounter={() => { analytics.trackFeatureUse('Rep_Counter'); setShowRepCounter(true); }}
          />
        )}
        
        {activeTab === 'zen' && useRedesignedTabs && (
          <Suspense fallback={<div>Loading...</div>}>
            <ZenTabRedesign 
              onOpenBreathing={handleOpenBreathing}
              onOpenMeditation={handleOpenMeditation}
            />
          </Suspense>
        )}

        {activeTab === 'zen' && !useRedesignedTabs && (
          <ZenTab 
            onOpenBreathing={handleOpenBreathing} 
            onOpenStressRelief={handleOpenBreathing}
            onOpenGuidedMeditation={handleOpenMeditation}
            onOpenGratitudeJournal={() => setShowGratitudeJournal(true)}
          />
        )}
        
        {activeTab === 'me' && useRedesignedTabs && (
          <Suspense fallback={<div>Loading...</div>}>
            <ProfileTabRedesign 
              user={user}
              onOpenSettings={(section) => {
                // Open settings
              }}
              onOpenPremium={() => setShowStripePayment(true)}
              onOpenHealthTools={() => setShowHealthToolsModal(true)}
              onOpenDataManagement={() => setShowDataManagementModal(true)}
              onOpenSocialFeatures={() => setShowSocialFeaturesModal(true)}
              onOpenSettingsHub={() => setShowSettingsHubModal(true)}
              onEditProfile={() => setShowProfileSetup(true)}
              onOpenFullStats={() => setShowFullStats(true)}
            />
          </Suspense>
        )}

        {activeTab === 'me' && !useRedesignedTabs && (
          <MeTab 
            user={{
              ...user,
              onOpenStripePayment: () => setShowStripePayment(true),
              onOpenAppleHealth: () => setShowAppleHealth(true),
              onOpenWearables: () => setShowWearables(true),
              onOpenDataRecovery: () => setShowDataRecovery(true)
            }}
            stats={stats}
            onOpenHealthAvatar={() => { analytics.trackFeatureUse('Health_Avatar'); setShowHealthAvatar(true); }}
            onOpenARScanner={() => { analytics.trackFeatureUse('AR_Scanner'); setShowARScanner(true); }}
            onOpenEmergency={() => { analytics.trackFeatureUse('Emergency_Panel'); setShowEmergency(true); }}
            onOpenInsurance={() => { analytics.trackFeatureUse('Insurance_Rewards'); setShowInsurance(true); }}
            onOpenDNA={() => { analytics.trackFeatureUse('DNA_Analysis'); setShowDNA(true); }}
            onOpenBattles={() => { analytics.trackFeatureUse('Social_Battles'); setShowBattles(true); }}
            onOpenMeals={() => { analytics.trackFeatureUse('Meal_Automation'); setShowMeals(true); }}
            onEditProfile={() => setShowProfileSetup(true)}
            onOpenFullStats={async () => {
              if(import.meta.env.DEV)console.log('🔥 Opening Full Stats - Refreshing data...')
              await refreshStats(); // ✅ Get latest real-time data
              setShowFullStats(true)
              if(import.meta.env.DEV)console.log('✅ Full Stats opened with fresh data')
            }}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenTheme={() => setShowTheme(true)}
            onLogout={() => {
              authService.signOut()
              navigate('/')
            }}
            checkFeatureAccess={(featureName, onSuccess) => {
              if (subscriptionService.hasAccess(featureName)) {
                onSuccess();
              } else {
                const paywallInfo = subscriptionService.showPaywall(featureName, () => setShowStripePayment(true));
                setPaywallData(paywallInfo);
              }
            }}
            onExportDailyStats={handleExportDailyStats}
            onExportWorkoutHistory={handleExportWorkoutHistory}
            onExportFoodLog={handleExportFoodLog}
            onExportFullReport={handleExportFullReport}
            showDevButton={showDevButton}
            isDevMode={isDevMode}
            onOpenDevUnlock={() => setShowDevUnlock(true)}
            onResetStepCounter={handleResetStepCounter}
            onDisableDevMode={handleDisableDevMode}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          <span className="nav-icon">🎤</span>
          <span className="nav-label">Voice</span>
        </button>
        
        <button 
          className={`nav-item center ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          <span className="nav-icon-center">📸</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'zen' ? 'active' : ''}`}
          onClick={() => setActiveTab('zen')}
        >
          <span className="nav-icon">🧘</span>
          <span className="nav-label">Zen</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'me' ? 'active' : ''}`}
          onClick={() => setActiveTab('me')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Me</span>
        </button>
      </nav>

      {/* Modals - Lazy Loaded with Error Boundaries */}
      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {showProfileSetup && (
          <ErrorBoundary fallbackMessage="Profile setup encountered an error. Please try again.">
            <ProfileSetup onComplete={() => {
              setShowProfileSetup(false);
              // Refresh user data after profile update
              const updatedUser = authService.getCurrentUser();
              setUser(updatedUser);
            }} />
          </ErrorBoundary>
        )}
        {showHealthAvatar && (
          <ErrorBoundary fallbackMessage="Health avatar encountered an error. Please try again." onReset={() => setShowHealthAvatar(false)}>
            <HealthAvatar onClose={() => setShowHealthAvatar(false)} />
          </ErrorBoundary>
        )}
        {showARScanner && (
          <ErrorBoundary fallbackMessage="AR scanner encountered an error. Please try again." onReset={() => setShowARScanner(false)}>
            <ARScanner onClose={() => setShowARScanner(false)} />
          </ErrorBoundary>
        )}
        {showFoodScanner && (
          <ErrorBoundary fallbackMessage="Food scanner encountered an error. Please try again." onReset={() => setShowFoodScanner(false)}>
            <FoodScanner onClose={() => { setShowFoodScanner(false); refreshStats(); }} />
          </ErrorBoundary>
        )}
        {showEmergency && (
          <ErrorBoundary fallbackMessage="Emergency panel encountered an error. Please try again." onReset={() => setShowEmergency(false)}>
            <EmergencyPanel onClose={() => setShowEmergency(false)} />
          </ErrorBoundary>
        )}
        {showInsurance && (
          <ErrorBoundary fallbackMessage="Insurance rewards encountered an error. Please try again." onReset={() => setShowInsurance(false)}>
            <InsuranceRewards onClose={() => setShowInsurance(false)} />
          </ErrorBoundary>
        )}
        {showDNA && (
          <ErrorBoundary fallbackMessage="DNA upload encountered an error. Please try again." onReset={() => setShowDNA(false)}>
            <DNAUpload onClose={() => setShowDNA(false)} />
          </ErrorBoundary>
        )}
        {showBattles && (
          <ErrorBoundary fallbackMessage="Social battles encountered an error. Please try again." onReset={() => setShowBattles(false)}>
            <SocialBattles onClose={async () => { 
              setShowBattles(false); 
              await refreshStats();
              // Clear any cached battle data
              const { default: socialBattlesService } = await import('../services/socialBattlesService');
              await socialBattlesService.init(); // Reload latest data
            }} />
          </ErrorBoundary>
        )}
        {showMeals && (
          <ErrorBoundary fallbackMessage="Meal automation encountered an error. Please try again." onReset={() => setShowMeals(false)}>
            <MealAutomation onClose={() => setShowMeals(false)} />
          </ErrorBoundary>
        )}
        
        {/* 🔥 NEW WEEK 1 FEATURES */}
        {showBarcodeScanner && (
          <ErrorBoundary fallbackMessage="Barcode scanner encountered an error. Please try again." onReset={() => setShowBarcodeScanner(false)}>
            <BarcodeScanner onClose={() => setShowBarcodeScanner(false)} onFoodScanned={(food) => { if(import.meta.env.DEV)console.log('Food scanned:', food); /* Keep modal open to show results */ }} />
          </ErrorBoundary>
        )}
        {showRepCounter && (
          <ErrorBoundary fallbackMessage="Rep counter encountered an error. Please try again." onReset={() => setShowRepCounter(false)}>
            <RepCounter onClose={() => setShowRepCounter(false)} onWorkoutComplete={(workout) => { if(import.meta.env.DEV)console.log('Workout complete:', workout); gamificationService.addXP(workout.reps * 2); setShowRepCounter(false); refreshStats(); }} />
          </ErrorBoundary>
        )}
      </Suspense>
      
      {/* Settings Modals */}
      {showNotifications && <NotificationsModal user={user} onClose={() => setShowNotifications(false)} />}
      {showTheme && <ThemeModal onClose={() => setShowTheme(false)} />}
      
      {/* Full Stats Modal - Placed outside parent to avoid CSS conflicts */}
      {showFullStats && <FullStatsModal user={user} stats={stats} onClose={() => setShowFullStats(false)} />}
      
      {/* Activity Pulse Modal */}
      {showActivityPulse && <ActivityPulseModal activitiesPromise={getAllActivities()} onClose={() => setShowActivityPulse(false)} />}
      
      {/* Stress Relief Modal */}
      {showStressRelief && <StressReliefModal onClose={() => setShowStressRelief(false)} />}
      
      {/* Guided Meditation Modal */}
      {showGuidedMeditation && <GuidedMeditationModal onClose={() => setShowGuidedMeditation(false)} />}

      {/* New Feature Modals */}
      {showHeartRateModal && <HeartRateModal onClose={() => { setShowHeartRateModal(false); refreshStats(); }} />}
      {showSleepModal && <SleepModal onClose={async () => { 
        setShowSleepModal(false); 
        await refreshStats();
        // ✅ FIX: Clear avatar cache so Health Avatar shows updated sleep data
        try {
          const { default: healthAvatarService } = await import('../services/healthAvatarService');
          healthAvatarService.cachedState = null;
          healthAvatarService.cacheTimestamp = 0;
          if(import.meta.env.DEV)console.log('✅ Health Avatar cache cleared - will show fresh sleep data');
        } catch (e) {
          console.warn('Could not clear avatar cache:', e);
        }
      }} />}
      {showWaterModal && <WaterModal onClose={() => { setShowWaterModal(false); refreshStats(); }} />}
      {showWorkoutsModal && <WorkoutsModal onClose={async () => { 
        setShowWorkoutsModal(false); 
        await refreshStats();
        // ✅ FIX: Clear avatar cache so Health Avatar shows updated workout data
        try {
          const { default: healthAvatarService } = await import('../services/healthAvatarService');
          healthAvatarService.cachedState = null;
          healthAvatarService.cacheTimestamp = 0;
          if(import.meta.env.DEV)console.log('✅ Health Avatar cache cleared - will show fresh workout data');
        } catch (e) {
          console.warn('Could not clear avatar cache:', e);
        }
      }} />}
      {showBreathingModal && <BreathingModal onClose={() => { setShowBreathingModal(false); refreshStats(); }} />}
      
      {/* Legal Information Modal */}
      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {showLegal && <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} />}
      </Suspense>
      
      {/* GLOBAL FALL ALERT - Shows on top of ANY screen */}
      <Suspense fallback={null}>
        {showGlobalFallAlert && (
          <GlobalFallAlert 
            fallData={fallData} 
            onDismiss={() => {
              setShowGlobalFallAlert(false);
              setFallData(null);
            }} 
          />
        )}
      </Suspense>
      
      {/* NEW PREMIUM FEATURES MODALS */}
      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {showStripePayment && <StripePayment isOpen={showStripePayment} onClose={() => setShowStripePayment(false)} />}
        {showAppleHealth && <AppleHealthSync isOpen={showAppleHealth} onClose={() => setShowAppleHealth(false)} />}
        {showWearables && <WearableSync isOpen={showWearables} onClose={() => setShowWearables(false)} />}
      </Suspense>
      
      {/* PAYWALL MODAL */}
      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {paywallData.show && (
          <PaywallModal
            isOpen={paywallData.show}
            onClose={() => setPaywallData({ ...paywallData, show: false })}
            featureName={paywallData.featureName}
            message={paywallData.message}
            currentPlan={paywallData.currentPlan}
            requiredPlan={paywallData.requiredPlan}
            onUpgrade={paywallData.onUpgrade}
          />
        )}
      </Suspense>
      
      {/* ONBOARDING TUTORIAL */}
      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {showOnboarding && (
          <Onboarding
            onComplete={() => setShowOnboarding(false)}
            onSkip={() => setShowOnboarding(false)}
          />
        )}
      </Suspense>

      {/* DEVELOPER MODE UNLOCK */}
      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {showDevUnlock && (
          <DevUnlock
            onUnlock={handleDevUnlock}
            onCancel={() => setShowDevUnlock(false)}
          />
        )}
      </Suspense>

      {/* DATA RECOVERY & BACKUP */}
      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {showDataRecovery && (
          <DataRecovery onClose={() => setShowDataRecovery(false)} />
        )}
      </Suspense>
      
      <Suspense fallback={<div className="modal-loading">Loading...</div>}>
        {showGratitudeJournal && <GratitudeJournalModal onClose={() => setShowGratitudeJournal(false)} />}
      </Suspense>
      
      {/* Floating Help Button - Always Visible */}
      <button 
        className="floating-help-btn"
        onClick={() => setShowLegal(true)}
        title="Legal Information & Help"
      >
        <span className="help-icon">⚖️</span>
        <span className="help-text">Legal</span>
      </button>
    </div>
  )
}

// Home Tab Component
function HomeTab({ stats, greeting, motivation, onGoalComplete, recentActivities, activityCount, onOpenActivityPulse, stepMethod, handleOpenWorkouts, handleOpenFoodScanner, handleOpenHeartRate, handleOpenSleep, onOpenBarcodeScanner, onOpenRecipeCreator, onOpenRestaurants, onOpenSocial, onOpenRepCounter, onOpenBrainInsights, nativeServiceRunning, nativeServiceStarting, onStartNativeService, setNativeServiceRunning, onOpenQuickLog }) {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showBattlesModal, setShowBattlesModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [showWorkoutsModal, setShowWorkoutsModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showRecipesModal, setShowRecipesModal] = useState(false);

  const actionButtons = [
    { icon: '🧠', label: 'AI INSIGHTS', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', onClick: onOpenBrainInsights },
    { icon: '📊', label: 'MY STATS', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', onClick: () => setShowStatsModal(true) },
    { icon: '🏆', label: 'BATTLES', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', onClick: () => setShowBattlesModal(true) },
    { icon: '🍽️', label: 'FOOD', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', onClick: () => setShowFoodModal(true) },
    { icon: '🧬', label: 'DNA', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', onClick: () => setShowDNAModal(true) },
    { icon: '💪', label: 'WORKOUTS', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', onClick: () => setShowWorkoutsModal(true) },
    { icon: '🏥', label: 'HEALTH', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', onClick: () => setShowHealthModal(true) },
    { icon: '🎯', label: 'GOALS', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', onClick: () => setShowGoalsModal(true) },
    { icon: '📈', label: 'PROGRESS', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', onClick: () => setShowProgressModal(true) },
    { icon: '💎', label: 'PREMIUM', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', onClick: () => setShowPremiumModal(true) },
    { icon: '👨‍🍳', label: 'RECIPES', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', onClick: () => setShowRecipesModal(true) }
  ];

  return (
    <div className="home-tab" style={{ paddingBottom: '100px', overflowY: 'auto', height: '100%' }}>
      {/* Today Overview - Top Summary */}
      <Suspense fallback={<div>Loading...</div>}>
        <TodayOverview todaySteps={stats.todaySteps} />
      </Suspense>

      {/* 24/7 Step Tracking - Compact Button */}
      {!nativeServiceRunning && (
        <button
          onClick={onStartNativeService}
          disabled={nativeServiceStarting}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #00C8FF 0%, #0088FF 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: nativeServiceStarting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0, 136, 255, 0.3)',
            transition: 'all 0.3s ease',
            opacity: nativeServiceStarting ? 0.7 : 1
          }}
          onMouseOver={(e) => { if (!nativeServiceStarting) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 136, 255, 0.4)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 136, 255, 0.3)'; }}
        >
          <span style={{ fontSize: '18px' }}>{nativeServiceStarting ? '⏳' : '🚀'}</span>
          <span>{nativeServiceStarting ? 'Starting...' : 'Enable 24/7 Step Tracking'}</span>
        </button>
      )}
      
      {nativeServiceRunning && (
        <button
          onClick={async () => {
            try {
              const { default: nativeStepService } = await import('../services/nativeStepService')
              await nativeStepService.stop()
            setNativeServiceRunning(false)
            if (window.__stepPollingInterval) {
              clearInterval(window.__stepPollingInterval)
            }
            } catch (err) {
              console.error('Failed to stop native service:', err);
              alert('Failed to stop tracking service');
            }
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #44FF44 0%, #00FF88 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(68, 255, 68, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <span>24/7 Tracking Active</span>
          </div>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>Tap to stop</span>
        </button>
      )}

      {/* DNA Daily Tip Banner (if available) */}
      {window.dnaDailyTip && (
        <div className="dna-tip-banner" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px',
          borderRadius: '16px',
          margin: '16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          cursor: 'pointer'
        }} onClick={() => alert(`${window.dnaDailyTip.tip}\n\nBased on your ${window.dnaDailyTip.gene} gene (${window.dnaDailyTip.trait}: ${window.dnaDailyTip.value})`)}>
          <span style={{fontSize: '32px'}}>{window.dnaDailyTip.icon}</span>
          <div style={{flex: 1}}>
            <div style={{color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px'}}>
              🧬 DNA Daily Tip
            </div>
            <div style={{color: 'rgba(255,255,255,0.9)', fontSize: '13px'}}>
              {window.dnaDailyTip.title}
            </div>
            <div style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px'}}>
              {window.dnaDailyTip.tip.substring(0, 80)}...
            </div>
          </div>
          <span style={{color: 'white', fontSize: '20px'}}>→</span>
        </div>
      )}

      {/* Quick Log Button - Water/Sleep/Workout */}
      <button
        onClick={onOpenQuickLog}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #8B5FE8 0%, #C084FC 100%)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px',
          boxShadow: '0 2px 8px rgba(139, 95, 232, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 95, 232, 0.4)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 95, 232, 0.3)'; }}
      >
        <span style={{ fontSize: '18px' }}>⚡</span>
        <span>Quick Log - Water/Sleep/Workout</span>
      </button>

      {/* Action Button Grid - 3x3 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '0 4px',
        marginBottom: '20px'
      }}>
        {actionButtons.map((button, index) => (
          <Suspense key={index} fallback={<div>Loading...</div>}>
            <HomeActionButton
              icon={button.icon}
              label={button.label}
              gradient={button.gradient}
              onClick={button.onClick}
            />
          </Suspense>
        ))}
      </div>

      {/* Modals */}
      <Suspense fallback={<div>Loading...</div>}>
        <StatsModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} todaySteps={stats.todaySteps} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <BattlesModal isOpen={showBattlesModal} onClose={() => setShowBattlesModal(false)} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <FoodModal isOpen={showFoodModal} onClose={() => setShowFoodModal(false)} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <DNAModal isOpen={showDNAModal} onClose={() => setShowDNAModal(false)} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <WorkoutsModal 
          isOpen={showWorkoutsModal} 
          onClose={() => setShowWorkoutsModal(false)}
          onOpenRepCounter={onOpenRepCounter}
          onOpenWorkouts={handleOpenWorkouts}
        />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <HealthModal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <GoalsModal isOpen={showGoalsModal} onClose={() => setShowGoalsModal(false)} todaySteps={stats.todaySteps} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <ProgressModal isOpen={showProgressModal} onClose={() => setShowProgressModal(false)} todaySteps={stats.todaySteps} />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <CommunityRecipes isOpen={showRecipesModal} onClose={() => setShowRecipesModal(false)} />
      </Suspense>

      {/* Spacer to ensure bottom buttons are visible */}
      <div style={{height: '20px', flexShrink: 0}}></div>
    </div>
  )
}

// Voice Tab Component
function VoiceTab({ userName }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isTextMode, setIsTextMode] = useState(false) // Track if user is typing (text-only mode)
  const [messages, setMessages] = useState([
    { type: 'ai', text: `Hey ${userName}! I'm here to help. What's on your mind?` }
  ])

  const startListening = async () => {
    setIsListening(true)
    
    try {
      // Try Web Speech API first (works better on some devices)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        if(import.meta.env.DEV)console.log('Using Web Speech API')
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          if(import.meta.env.DEV)console.log('Web Speech result:', transcript)
          setIsListening(false)
          processUserMessage(transcript)
        }
        
        recognition.onerror = (event) => {
          if(import.meta.env.DEV)console.error('Web Speech error:', event.error)
          setIsListening(false)
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: "I couldn't hear you. Try typing instead!" 
          }])
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        recognition.start()
        return
      }
      
      // Fallback to Capacitor plugin
      if(import.meta.env.DEV)console.log('Trying Capacitor Speech Recognition plugin')
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
      
      // Check if available first
      try {
        const availCheck = await SpeechRecognition.available()
        if(import.meta.env.DEV)console.log('Speech recognition available:', availCheck)
        
        if (!availCheck.available) {
          throw new Error('Speech recognition not available')
        }
      } catch (availError) {
        if(import.meta.env.DEV)console.error('Availability check failed:', availError)
        throw new Error('Speech not supported')
      }

      // Request permissions
      try {
        const permResult = await SpeechRecognition.requestPermissions()
        if(import.meta.env.DEV)console.log('Permission result:', permResult)
        
        if (permResult.speechRecognition !== 'granted') {
          alert('Please allow microphone access in your phone settings')
          setIsListening(false)
          return
        }
      } catch (permError) {
        if(import.meta.env.DEV)console.error('Permission request failed:', permError)
        alert('Microphone permission required. Please enable it in Settings.')
        setIsListening(false)
        return
      }

      // Clean up any previous listeners
      try {
        await SpeechRecognition.removeAllListeners()
      } catch (e) {
        if(import.meta.env.DEV)console.log('No listeners to remove')
      }

      let hasReceivedResult = false

      // Add error listener
      SpeechRecognition.addListener('error', (error) => {
        if(import.meta.env.DEV)console.error('Speech recognition error event:', error)
        if (!hasReceivedResult) {
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: "I couldn't hear you clearly. Please try again or use the suggestion buttons below!" 
          }])
          setIsListening(false)
        }
      })

      // Add result listener
      SpeechRecognition.addListener('result', async (data) => {
        if(import.meta.env.DEV)console.log('Speech result received:', data)
        hasReceivedResult = true
        
        if (data.matches && data.matches.length > 0) {
          const userText = data.matches[0]
          
          // Add user message
          setMessages(prev => [...prev, { type: 'user', text: userText }])
          
          // Stop listening
          setIsListening(false)
          setIsProcessing(true)
          
          try {
            await SpeechRecognition.stop()
          } catch (e) {
            if(import.meta.env.DEV)console.log('Stop error:', e)
          }
          
          // Process with AI in voice mode
          setIsTextMode(false) // Voice mode
          try {
            const geminiService = (await import('../services/geminiService')).default
            const user = JSON.parse(localStorage.getItem('wellnessai_user') || '{}')
            
            const response = await geminiService.chat(userText, {
              allergens: user.profile?.allergens || [],
              dietaryPreferences: user.profile?.dietaryPreferences || [],
              healthGoals: user.profile?.healthGoals || []
            })
            
            // Add AI response
            setMessages(prev => [...prev, { type: 'ai', text: response }])
            
            // Speak the response (voice mode)
            await speakText(response)
          } catch (error) {
            if(import.meta.env.DEV)console.error('AI error:', error)
            setMessages(prev => [...prev, { 
              type: 'ai', 
              text: "Oops! I had trouble with that. Can you try asking in a different way?" 
            }])
          }
          
          setIsProcessing(false)
        } else {
          setIsListening(false)
        }
      })

      // Start listening - try with popup first
      if(import.meta.env.DEV)console.log('Starting speech recognition...')
      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 5,
        prompt: 'Speak now',
        partialResults: false,
        popup: true
      })
      
      if(import.meta.env.DEV)console.log('Speech recognition started successfully')

      // Auto-stop after 10 seconds
      setTimeout(async () => {
        if (!hasReceivedResult) {
          try {
            await SpeechRecognition.stop()
            setMessages(prev => [...prev, { 
              type: 'ai', 
              text: "I didn't catch that. Try speaking again or use the suggestion buttons!" 
            }])
          } catch (e) {
            if(import.meta.env.DEV)console.log('Auto-stop error:', e)
          }
          setIsListening(false)
        }
      }, 10000)

    } catch (error) {
      if(import.meta.env.DEV)console.error('Speech recognition setup error:', error)
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: `Voice input not available right now 😔 But I can still help! Try clicking the suggestion buttons below or typing your question.` 
      }])
      setIsListening(false)
    }
  }

  const stopListening = async () => {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
      await SpeechRecognition.stop()
      await SpeechRecognition.removeAllListeners()
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error stopping speech:', error)
    }
    setIsListening(false)
  }

  const speakText = async (text) => {
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
      setIsSpeaking(true)
      
      await TextToSpeech.speak({
        text: text,
        lang: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      })
      
      setIsSpeaking(false)
    } catch (error) {
      if(import.meta.env.DEV)console.error('Text-to-speech error:', error)
      setIsSpeaking(false)
    }
  }

  const processUserMessage = async (userText, skipVoice = false) => {
    // Check if developer mode is active - bypass all limits
    const isDevMode = localStorage.getItem('helio_dev_mode') === 'true'
    
    // CHECK AI MESSAGE LIMIT FOR FREE USERS (skip if dev mode)
    if (!isDevMode) {
      const limit = subscriptionService.checkLimit('aiMessages')
      if (!limit.allowed) {
        setMessages(prev => [...prev, 
          { type: 'user', text: userText },
          { 
            type: 'ai', 
            text: `🔒 You've reached your daily limit of ${limit.limit} AI messages.\n\nUpgrade for more:\n💪 Essential £4.99/mo - 30 messages/day\n⭐ Premium £14.99/mo - 50 messages/day\n👑 Ultimate £29.99/mo - UNLIMITED messages` 
          }
        ])
        setPaywallData(subscriptionService.showPaywall('aiVoiceCoach', () => setShowStripePayment(true)))
        return
      }
    } else {
      if(import.meta.env.DEV)console.log('🔓 Developer mode active - unlimited AI messages')
    }

    setMessages(prev => [...prev, { type: 'user', text: userText }])
    setIsProcessing(true)
    
    try {
      if(import.meta.env.DEV)console.log('Processing user message:', userText)
      const geminiService = (await import('../services/geminiService')).default
      if(import.meta.env.DEV)console.log('Gemini service loaded')
      
      const user = JSON.parse(localStorage.getItem('wellnessai_user') || '{}')
      if(import.meta.env.DEV)console.log('User context loaded')
      
      const response = await geminiService.chat(userText, {
        allergens: user.profile?.allergens || [],
        dietaryPreferences: user.profile?.dietaryPreferences || [],
        healthGoals: user.profile?.healthGoals || []
      })
      
      if(import.meta.env.DEV)console.log('Got AI response:', response)
      setMessages(prev => [...prev, { type: 'ai', text: response }])
      
      // INCREMENT USAGE COUNT (only if not dev mode)
      if (!isDevMode) {
        subscriptionService.incrementUsage('aiMessages')
        const newLimit = subscriptionService.checkLimit('aiMessages')
        if(import.meta.env.DEV)console.log(`✅ AI message used. Remaining: ${newLimit.remaining}/${newLimit.limit}`)
      }
      
      // Speak the response ONLY if not in text-only mode
      if (!skipVoice) {
        await speakText(response)
      } else {
        if(import.meta.env.DEV)console.log('📝 Text-only mode - skipping voice output')
      }
      
    } catch (error) {
      if(import.meta.env.DEV)console.error('=== PROCESSING ERROR ===')
      if(import.meta.env.DEV)console.error('Error type:', error.constructor.name)
      if(import.meta.env.DEV)console.error('Error message:', error.message)
      if(import.meta.env.DEV)console.error('Full error:', error)
      
      // Show the actual error to help debug
      const errorMsg = `Error: ${error.message}. Check console for details.`
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: errorMsg
      }])
      await speakText("There was an error. Please check your internet connection and try again.")
    }
    
    setIsProcessing(false)
  }

  const handleSuggestionClick = (text) => {
    setIsTextMode(false) // Enable voice mode
    processUserMessage(text, false) // false = include voice output
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim()) {
      setIsTextMode(true) // Enable text-only mode
      processUserMessage(textInput, true) // true = skip voice output
      setTextInput('')
    }
  }

  return (
    <div className="voice-tab">
      <div className="voice-header">
        <h1>AI Voice Coach 🎤</h1>
        <p>Just talk to me like a friend</p>
        {(() => {
          // Hide limits for developers
          const isDevMode = localStorage.getItem('helio_dev_mode') === 'true';
          if (isDevMode) {
            return null; // Don't show any badge for developers
          }
          
          const limit = window.subscriptionService?.checkLimit('aiMessages');
          if (limit && !window.subscriptionService?.hasAccess('aiVoiceCoach')) {
            return (
              <div style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: limit.remaining <= 1 ? 'rgba(255, 68, 68, 0.2)' : 'rgba(139, 95, 232, 0.2)',
                borderRadius: '20px',
                fontSize: '13px',
                color: limit.remaining <= 1 ? '#FF4444' : '#C084FC',
                fontWeight: 'bold',
                border: `2px solid ${limit.remaining <= 1 ? '#FF4444' : 'rgba(139, 95, 232, 0.4)'}`
              }}>
                {limit.remaining > 0 ? (
                  <>💬 {limit.remaining}/{limit.limit} messages left today</>
                ) : (
                  <>🔒 Daily limit reached - Upgrade for unlimited!</>
                )}
              </div>
            );
          }
          return null;
        })()}
      </div>

      <div className="voice-messages">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`voice-message ${msg.type}`}
            onClick={() => msg.type === 'ai' && speakText(msg.text)}
            title={msg.type === 'ai' ? 'Click to hear again' : ''}
          >
            <span className="message-icon">{msg.type === 'ai' ? '✨' : '👤'}</span>
            <p>{msg.text}</p>
          </div>
        ))}
        {isProcessing && (
          <div className="voice-message ai loading-message">
            <span className="message-icon">✨</span>
            <p>
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
              Thinking...
            </p>
          </div>
        )}
      </div>

      <button 
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
      >
        {isListening ? (
          <>
            <span className="pulse-ring"></span>
            <span className="voice-icon">🎙️</span>
            <p>I'm listening...</p>
          </>
        ) : isProcessing ? (
          <>
            <span className="voice-icon">⏳</span>
            <p>Processing...</p>
          </>
        ) : (
          <>
            <span className="voice-icon">🎤</span>
            <p>Tap to talk</p>
          </>
        )}
      </button>

      {/* Text Input Alternative */}
      <form className="voice-text-input" onSubmit={handleTextSubmit}>
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Or type your message..."
          disabled={isProcessing || isListening}
          className="text-input-field"
        />
        <button 
          type="submit" 
          className="text-send-btn"
          disabled={!textInput.trim() || isProcessing || isListening}
        >
          Send 📤
        </button>
      </form>

      <div className="voice-suggestions">
        <p className="suggestions-label">Or try these quick questions:</p>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("What should I eat for lunch?")}
          disabled={isListening || isProcessing}
        >
          "What should I eat for lunch?"
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("How am I doing today?")}
          disabled={isListening || isProcessing}
        >
          "How am I doing today?"
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("Show me my progress")}
          disabled={isListening || isProcessing}
        >
          "Show me my progress"
        </button>
      </div>

      {isSpeaking && (
        <div className="speaking-indicator">
          <span className="speaker-icon">🔊</span>
          <p>AI is speaking...</p>
        </div>
      )}
    </div>
  )
}

// Scan Tab Component
function ScanTab({ onOpenFoodScanner, onOpenARScanner, onOpenBarcodeScanner, onOpenRepCounter }) {
  if(import.meta.env.DEV)console.log('🔥🔥🔥 SCAN TAB LOADED - NEW FEATURES AVAILABLE');
  if(import.meta.env.DEV)console.log('Barcode Scanner handler:', typeof onOpenBarcodeScanner);
  if(import.meta.env.DEV)console.log('Rep Counter handler:', typeof onOpenRepCounter);
  
  return (
    <div className="scan-tab">
      <div className="scan-header">
        <h1>Scan Anything 📸</h1>
        <p>I'll tell you everything about it</p>
      </div>

      <div className="scan-options">
        {/* 🔥 NEW: Barcode Scanner - MOVED TO TOP */}
        <button className="scan-option-card new-feature" onClick={() => { if(import.meta.env.DEV)console.log('🔥 BARCODE SCANNER CLICKED'); onOpenBarcodeScanner(); }} style={{border: '3px solid #11998e', transform: 'scale(1.02)'}}>
          <span className="scan-option-icon">📦</span>
          <h3>Barcode Scanner 🔥</h3>
          <p>Scan product barcodes instantly</p>
          <span className="scan-badge" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', fontSize: '16px', fontWeight: 'bold'}}>NEW!</span>
        </button>

        <button className="scan-option-card" onClick={onOpenFoodScanner}>
          <span className="scan-option-icon">🍔</span>
          <h3>Food Scanner</h3>
          <p>See if it's safe for you</p>
          <span className="scan-badge">AI Powered</span>
        </button>

        <button className="scan-option-card" onClick={onOpenARScanner}>
          <span className="scan-option-icon">✨</span>
          <h3>AR Scanner</h3>
          <p>See calories & nutrition in real-time</p>
          <span className="scan-badge">Augmented Reality</span>
        </button>

        <button className="scan-option-card new-feature" onClick={() => { if(import.meta.env.DEV)console.log('🔥 REP COUNTER CLICKED'); onOpenRepCounter(); }} style={{border: '3px solid #ff6b6b', transform: 'scale(1.02)'}}>
          <span className="scan-option-icon">💪</span>
          <h3>Rep Counter 🔥</h3>
          <p>AI-powered workout tracking</p>
          <span className="scan-badge" style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', fontSize: '16px', fontWeight: 'bold'}}>NEW!</span>
        </button>
      </div>

      <div className="scan-features">
        <h3>What I can detect:</h3>
        <div className="feature-list">
          <div className="feature-item">✅ Hidden allergens</div>
          <div className="feature-item">✅ Calories & macros</div>
          <div className="feature-item">✅ Ingredient analysis</div>
          <div className="feature-item">✅ Healthy alternatives</div>
          <div className="feature-item">✅ Product barcodes (NEW!)</div>
          <div className="feature-item">✅ Exercise reps (NEW!)</div>
        </div>
      </div>
    </div>
  )
}

// Zen Tab Component
function ZenTab({ onOpenBreathing, onOpenStressRelief, onOpenGuidedMeditation, onOpenGratitudeJournal }) {
  return (
    <div className="zen-tab">
      <div className="zen-header">
        <h1>Zen Mode 🧘</h1>
        <p>Take a moment for yourself</p>
      </div>

      <div className="breathing-exercise">
        <div className="breath-circle">
          <p className="breath-text">Tap to start</p>
        </div>
        <button 
          className="breath-button"
          onClick={onOpenBreathing}
          style={{position: 'relative'}}
        >
          Start Breathing Exercise
          {!window.subscriptionService?.hasAccess('breathing') && (
            <span style={{position: 'absolute', top: '10px', right: '10px', fontSize: '16px'}}>🔒</span>
          )}
        </button>
      </div>

      <div className="zen-activities">
        <h3>Mental Wellness Activities</h3>
        <button className="zen-card" onClick={onOpenGuidedMeditation} style={{position: 'relative'}}>
          <span className="zen-icon">🎵</span>
          <div>
            <h4>Guided Meditation {!window.subscriptionService?.hasAccess('meditation') && '🔒'}</h4>
            <p>Powerful & energizing sessions</p>
          </div>
        </button>
        <button className="zen-card" onClick={onOpenGratitudeJournal}>
          <span className="zen-icon">📝</span>
          <div>
            <h4>Gratitude Journal</h4>
            <p>Write what you're thankful for</p>
          </div>
        </button>
        <button className="zen-card" onClick={onOpenStressRelief} style={{position: 'relative'}}>
          <span className="zen-icon">😌</span>
          <div>
            <h4>Stress Relief {!window.subscriptionService?.hasAccess('breathing') && '🔒'}</h4>
            <p>Quick relaxation techniques</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// Me Tab Component
function MeTab({ user, stats, onOpenHealthAvatar, onOpenARScanner, onOpenEmergency, onOpenInsurance, onOpenDNA, onOpenBattles, onOpenMeals, onEditProfile, onOpenFullStats, onOpenNotifications, onOpenTheme, onLogout, checkFeatureAccess, onExportDailyStats, onExportWorkoutHistory, onExportFoodLog, onExportFullReport, showDevButton, isDevMode, onOpenDevUnlock, onResetStepCounter, onDisableDevMode }) {
  if(import.meta.env.DEV)console.log('🎯 MeTab rendered with props:', { showDevButton, isDevMode })
  
  // Calculate BMI if available
  const heightM = user?.profile?.height ? user.profile.height / 100 : null;
  const bmi = (heightM && user?.profile?.weight) 
    ? (user.profile.weight / (heightM * heightM)).toFixed(1) 
    : user?.profile?.bmi || null;

  return (
    <div className="me-tab-grid">
      {/* Compact Profile Header */}
      <div className="profile-compact">
        <div className="profile-compact-avatar">
          {user?.profile?.photo ? (
            <img src={user.profile.photo} alt="Profile" />
          ) : (
            <span>{user?.profile?.avatar || '👤'}</span>
          )}
        </div>
        <div className="profile-compact-info">
          <h2 className="profile-compact-name">{user?.profile?.fullName || user?.profile?.name || 'Wellness Warrior'}</h2>
          <p className="profile-compact-level">⭐ Level {stats.level} • 🔥 {stats.streak} Day Streak</p>
          <div className="profile-compact-stats">
            {user?.profile?.age && <span className="profile-stat-mini">🎂 {user.profile.age}y</span>}
            {user?.profile?.height && <span className="profile-stat-mini">📏 {user.profile.height}cm</span>}
            {user?.profile?.weight && <span className="profile-stat-mini">⚖️ {user.profile.weight}kg</span>}
            {bmi && (
              <span className="profile-stat-mini" style={{
                color: bmi < 18.5 ? '#FFA500' : bmi < 25 ? '#44FF44' : bmi < 30 ? '#FFA500' : '#FF4444'
              }}>BMI {bmi}</span>
            )}
          </div>
        </div>
        <button className="edit-profile-mini-btn" onClick={onEditProfile}>
          ✏️ Edit
        </button>
      </div>

      {/* Developer Mode Card */}
      {isDevMode && (
        <div className="dev-mode-card">
          <div className="dev-mode-title">✅ DEVELOPER MODE ACTIVE</div>
          <div className="dev-mode-subtitle">All Premium Features Unlocked 🚀</div>
          <button onClick={onResetStepCounter} className="dev-mode-btn reset">
            🔄 Reset Step Counter
          </button>
          <button onClick={onDisableDevMode} className="dev-mode-btn disable">
            🔒 Disable Developer Mode
          </button>
        </div>
      )}

      {/* Me Tab Icon Grid - 4x4 */}
      <div className="me-icon-grid">
        <button className="me-icon-btn" onClick={onOpenHealthAvatar}>
          <div className="icon-circle">
            <span>🧬</span>
          </div>
          <span className="icon-label">Health Avatar</span>
        </button>

        <button className="me-icon-btn premium-feature" onClick={onOpenARScanner}>
          <div className="icon-circle">
            <span>📸</span>
          </div>
          <span className="icon-label">AR Scanner</span>
          <span className="premium-tag">✨</span>
        </button>

        <button className="me-icon-btn" onClick={onOpenEmergency}>
          <div className="icon-circle">
            <span>🚨</span>
          </div>
          <span className="icon-label">Emergency</span>
        </button>

        <button className="me-icon-btn premium-feature" onClick={() => checkFeatureAccess('dnaAnalysis', onOpenDNA)}>
          <div className="icon-circle">
            <span>🧬</span>
          </div>
          <span className="icon-label">DNA Analysis</span>
          {!subscriptionService.hasAccess('dnaAnalysis') && <span className="premium-tag">🔒</span>}
        </button>

        <button className="me-icon-btn premium-feature" onClick={() => checkFeatureAccess('socialBattles', onOpenBattles)}>
          <div className="icon-circle">
            <span>⚔️</span>
          </div>
          <span className="icon-label">Battles</span>
          {!subscriptionService.hasAccess('socialBattles') && <span className="premium-tag">🔒</span>}
        </button>

        <button className="me-icon-btn premium-feature" onClick={() => checkFeatureAccess('mealAutomation', onOpenMeals)}>
          <div className="icon-circle">
            <span>🍽️</span>
          </div>
          <span className="icon-label">Meal Auto</span>
          {!subscriptionService.hasAccess('mealAutomation') && <span className="premium-tag">🔒</span>}
        </button>

        <button className="me-icon-btn" onClick={onEditProfile}>
          <div className="icon-circle">
            <span>👤</span>
          </div>
          <span className="icon-label">Profile</span>
        </button>

        <button className="me-icon-btn" onClick={onOpenFullStats}>
          <div className="icon-circle">
            <span>📊</span>
          </div>
          <span className="icon-label">Full Stats</span>
        </button>

        <button className="me-icon-btn" onClick={onOpenNotifications}>
          <div className="icon-circle">
            <span>🔔</span>
          </div>
          <span className="icon-label">Notifications</span>
        </button>

        <button className="me-icon-btn" onClick={onOpenTheme}>
          <div className="icon-circle">
            <span>🎨</span>
          </div>
          <span className="icon-label">Theme</span>
        </button>

        <button className="me-icon-btn" onClick={onExportDailyStats}>
          <div className="icon-circle">
            <span>📋</span>
          </div>
          <span className="icon-label">Daily PDF</span>
        </button>

        <button className="me-icon-btn" onClick={onExportWorkoutHistory}>
          <div className="icon-circle">
            <span>🏋️</span>
          </div>
          <span className="icon-label">Workouts PDF</span>
        </button>

        <button className="me-icon-btn" onClick={onExportFoodLog}>
          <div className="icon-circle">
            <span>🍽️</span>
          </div>
          <span className="icon-label">Food PDF</span>
        </button>

        <button className="me-icon-btn" onClick={onExportFullReport}>
          <div className="icon-circle">
            <span>📊</span>
          </div>
          <span className="icon-label">Full Report</span>
        </button>

        <button className="me-icon-btn" onClick={() => user.onOpenDataRecovery()}>
          <div className="icon-circle">
            <span>💾</span>
          </div>
          <span className="icon-label">Backup/Restore</span>
        </button>

        <button className="me-icon-btn premium-feature" onClick={() => checkFeatureAccess('appleHealthSync', user.onOpenAppleHealth)}>
          <div className="icon-circle">
            <span>❤️</span>
          </div>
          <span className="icon-label">Apple Health</span>
          {!subscriptionService.hasAccess('appleHealthSync') && <span className="premium-tag">🔒</span>}
        </button>

        <button className="me-icon-btn premium-feature" onClick={() => checkFeatureAccess('wearableSync', user.onOpenWearables)}>
          <div className="icon-circle">
            <span>⌚</span>
          </div>
          <span className="icon-label">Wearables</span>
          {!subscriptionService.hasAccess('wearableSync') && <span className="premium-tag">🔒</span>}
        </button>

        {showDevButton && !isDevMode && (
          <button className="me-icon-btn premium-feature" onClick={onOpenDevUnlock}>
            <div className="icon-circle">
              <span>🔒</span>
            </div>
            <span className="icon-label">Dev Mode</span>
          </button>
        )}

        <button className="me-icon-btn" onClick={onLogout}>
          <div className="icon-circle">
            <span>🚪</span>
          </div>
          <span className="icon-label">Sign Out</span>
        </button>
      </div>

      {/* Upgrade CTA Card */}
      <div className="upgrade-cta-card" onClick={() => user.onOpenStripePayment()}>
        <div className="upgrade-cta-icon">💎</div>
        <h3 className="upgrade-cta-title">Upgrade to {subscriptionService.getPlanBadge() === '🆓 FREE' ? 'Premium' : 'VIP'}</h3>
        <p className="upgrade-cta-text">Join 50,000+ users unlocking DNA, Battles & AI!</p>
        <button className="upgrade-cta-btn">See Plans 🚀</button>
      </div>

      {/* Spacer to ensure bottom buttons are visible */}
      <div style={{height: '120px', flexShrink: 0}}></div>
    </div>
  )
}

// Full Stats Modal Component - Fixed Data Sources
function FullStatsModal({ user, stats, onClose }) {
  const [foodLog, setFoodLog] = useState([])
  const [statsLoaded, setStatsLoaded] = useState(false)
  
  // Load food log from localStorage (correct source)
  useEffect(() => {
    const loadFoodLog = async () => {
      try {
        console.log('🔍 [FullStatsModal] Loading data from localStorage...')
        
        // ✅ FIX: Load foodLog from localStorage (not Capacitor Preferences)
        const foodLogData = JSON.parse(localStorage.getItem('foodLog') || '[]')
        console.log('🔍 [FullStatsModal] localStorage foodLog:', foodLogData.length, 'meals')
        setFoodLog(foodLogData)
      } catch (e) {
        if(import.meta.env.DEV)console.error('Error reading foodLog', e)
      }
      setStatsLoaded(true)
    }
    loadFoodLog()
  }, [])
  
  // ✅ FIX: Get data from localStorage with proper error handling
  let stepHistory = [], workoutHistory = [], sleepLog = []
  
  console.log('🔍 [FullStatsModal] Loading data sources...')
  console.log('🔍 [FullStatsModal] Live stats from parent:', {
    todaySteps: stats?.todaySteps,
    waterCups: stats?.waterCups,
    mealsLogged: stats?.mealsLogged,
    streak: stats?.streak,
    wellnessScore: stats?.wellnessScore
  })
  
  try {
    const rawStepHistory = localStorage.getItem('stepHistory')
    stepHistory = JSON.parse(rawStepHistory || '[]')
    console.log('🔍 [FullStatsModal] stepHistory length:', stepHistory.length)
    console.log('🔍 [FullStatsModal] Last 3 entries:', stepHistory.slice(-3))
  } catch (e) { if(import.meta.env.DEV)console.error('Error reading stepHistory', e) }
  
  try {
    const rawWorkoutHistory = localStorage.getItem('workoutHistory')
    console.log('🔍 [FullStatsModal] Raw workoutHistory:', rawWorkoutHistory)
    workoutHistory = JSON.parse(rawWorkoutHistory || '[]')
    console.log('🔍 [FullStatsModal] Parsed workoutHistory length:', workoutHistory.length)
    console.log('🔍 [FullStatsModal] Workout entries:', workoutHistory)
  } catch (e) { if(import.meta.env.DEV)console.error('Error reading workoutHistory', e) }
  
  try {
    sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]')
  } catch (e) { if(import.meta.env.DEV)console.error('Error reading sleepLog', e) }
  
  // ✅ FIX: Calculate stats using correct sources
  console.log('🔍 [FullStatsModal] Calculating stats...')
  
  // Total steps = historical steps + today's live steps
  const historicalSteps = Array.isArray(stepHistory) ? stepHistory.reduce((sum, day) => {
    return sum + (Number(day?.steps) || 0)
  }, 0) : 0
  const totalSteps = historicalSteps + (stats?.todaySteps || 0)
  console.log('🔍 [FullStatsModal] Historical:', historicalSteps, 'Today:', stats?.todaySteps, 'Total:', totalSteps)
  
  // Average steps per day (including today)
  const totalDays = stepHistory.length + 1 // +1 for today
  const avgSteps = totalDays > 0 ? Math.round(totalSteps / totalDays) : 0
  
  const totalFoodScans = Array.isArray(foodLog) ? foodLog.length : 0
  const totalWorkouts = Array.isArray(workoutHistory) ? workoutHistory.length : 0
  const totalSleepHours = Array.isArray(sleepLog) ? sleepLog.reduce((sum, night) => sum + (Number(night?.hours) || 0), 0) : 0
  const avgSleepHours = sleepLog.length > 0 ? (totalSleepHours / sleepLog.length).toFixed(1) : 0
  
  // ✅ FIX: Use stats.streak from parent (correct source)
  const currentStreak = stats?.streak || 0
  
  // ✅ FIX: Active days = days with step data (not loginHistory)
  const activeDays = stepHistory.filter(s => s?.date).length + 1 // +1 for today
  
  console.log('📊 [FullStatsModal] FINAL STATS:', {
    totalSteps,
    avgSteps,
    totalFoodScans,
    totalWorkouts,
    totalSleepHours,
    avgSleepHours,
    activeDays,
    currentStreak
  })
  
  const statCardStyle = {
    background: 'linear-gradient(135deg, rgba(139, 95, 232, 0.2), rgba(139, 95, 232, 0.05))',
    border: '1px solid rgba(139, 95, 232, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center'
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        color: 'white'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: '#8B5FE8',
          border: 'none',
          color: 'white',
          fontSize: '28px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 1
        }}>×</button>
        
        <h2 style={{fontSize: '28px', marginBottom: '5px', color: 'white'}}>📊 Your Full Stats</h2>
        <p style={{fontSize: '14px', color: '#888', marginBottom: '25px'}}>Complete health overview</p>

        {/* Today's Progress Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 95, 232, 0.3), rgba(139, 95, 232, 0.1))',
          border: '2px solid rgba(139, 95, 232, 0.5)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{fontSize: '18px', marginBottom: '15px', color: 'white'}}>📅 Today's Progress</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '24px'}}>👟</div>
              <p style={{color: 'white', fontSize: '20px', margin: '5px 0'}}>{(stats?.todaySteps || 0).toLocaleString()}</p>
              <small style={{color: '#aaa', fontSize: '12px'}}>Steps</small>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '24px'}}>💧</div>
              <p style={{color: 'white', fontSize: '20px', margin: '5px 0'}}>{stats?.waterCups || 0}/8</p>
              <small style={{color: '#aaa', fontSize: '12px'}}>Water</small>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '24px'}}>🍎</div>
              <p style={{color: 'white', fontSize: '20px', margin: '5px 0'}}>{stats?.mealsLogged || 0}</p>
              <small style={{color: '#aaa', fontSize: '12px'}}>Meals</small>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {/* Total Steps */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>👟</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{totalSteps.toLocaleString()}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Total Steps</p>
            <small style={{color: '#888', fontSize: '12px'}}>Avg: {avgSteps.toLocaleString()}/day</small>
          </div>
          
          {/* Wellness Score */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>⭐</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{stats?.wellnessScore || 0}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Wellness Score</p>
            <small style={{color: '#888', fontSize: '12px'}}>Out of 100</small>
          </div>
          
          {/* Food Scans */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>🍽️</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{totalFoodScans}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Food Scans</p>
            <small style={{color: '#888', fontSize: '12px'}}>Meals logged</small>
          </div>
          
          {/* Workouts */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>💪</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{totalWorkouts}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Workouts</p>
            <small style={{color: '#888', fontSize: '12px'}}>Total sessions</small>
          </div>
          
          {/* Water Intake */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>💧</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{stats?.waterCups || 0}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Water Today</p>
            <small style={{color: '#888', fontSize: '12px'}}>Goal: 8 cups</small>
          </div>
          
          {/* Sleep */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>😴</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{avgSleepHours}h</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Avg Sleep</p>
            <small style={{color: '#888', fontSize: '12px'}}>{sleepLog.length} nights</small>
          </div>
          
          {/* Level & XP */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>🏆</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>Level {stats?.level || 1}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Progress</p>
            <small style={{color: '#888', fontSize: '12px'}}>{stats?.xp || 0} XP</small>
          </div>
          
          {/* Streak */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>🔥</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{currentStreak}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Day Streak</p>
            <small style={{color: '#888', fontSize: '12px'}}>{activeDays} active days</small>
          </div>
          
          {/* Active Days */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>📅</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{activeDays}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Active Days</p>
            <small style={{color: '#888', fontSize: '12px'}}>Total logins</small>
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div style={{
          background: 'rgba(139, 95, 232, 0.1)',
          border: '1px solid rgba(139, 95, 232, 0.3)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{fontSize: '18px', marginBottom: '15px', color: 'white'}}>📈 7-Day Step Activity</h3>
          <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '8px'}}>
            {[0, 1, 2, 3, 4, 5, 6].map(i => {
              // ✅ FIX: Use stats.weeklySteps from parent (correct source)
              const dayData = stats?.weeklySteps?.[i] || { steps: 0 }
              const steps = dayData.steps || 0
              const height = Math.max((steps / 10000) * 100, 5)
              return (
                <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <small style={{color: '#8B5FE8', fontSize: '10px', marginBottom: '3px'}}>
                    {steps > 0 ? (steps / 1000).toFixed(1) + 'k' : '0'}
                  </small>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    background: steps > 0 ? 'linear-gradient(to top, #8B5FE8, #B794F6)' : 'rgba(139, 95, 232, 0.2)',
                    borderRadius: '6px 6px 0 0',
                    minHeight: '5px'
                  }}></div>
                  <small style={{color: '#666', fontSize: '11px', marginTop: '5px'}}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </small>
                </div>
              )
            })}
          </div>
        </div>

        {/* Health Profile */}
        <div style={{
          background: 'rgba(139, 95, 232, 0.1)',
          border: '1px solid rgba(139, 95, 232, 0.3)',
          borderRadius: '15px',
          padding: '20px'
        }}>
          <h3 style={{fontSize: '18px', marginBottom: '10px', color: 'white'}}>👤 Health Summary</h3>
          <p style={{color: '#aaa', fontSize: '14px', marginBottom: '5px'}}>👋 {user?.name || user?.profile?.fullName || 'Champion'}</p>
          <p style={{color: '#aaa', fontSize: '14px', marginBottom: '5px'}}>🏆 Level {stats?.level || 1} | {stats?.xp || 0} XP</p>
          <p style={{color: '#aaa', fontSize: '14px', marginBottom: '5px'}}>🔥 {currentStreak} day streak | {activeDays} active days</p>
          <p style={{color: '#aaa', fontSize: '14px', marginBottom: '10px'}}>⭐ Wellness Score: {stats?.wellnessScore || 0}/100</p>
          <p style={{color: '#8B5FE8', fontSize: '14px', fontWeight: 'bold'}}>Keep crushing your goals! 💪</p>
        </div>
      </div>
    </div>
  )
}

function FullStatsModalOLD({ user, onClose }) {
  // Get real data from localStorage
  const stepHistory = JSON.parse(localStorage.getItem('stepHistory') || '[]')
  const foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]')
  const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
  const sleepLog = JSON.parse(localStorage.getItem('sleepLog') || '[]')
  const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]')
  
  // Calculate stats
  const totalSteps = stepHistory.reduce((sum, day) => sum + (day.steps || 0), 0)
  const avgSteps = stepHistory.length > 0 ? Math.round(totalSteps / stepHistory.length) : 0
  const totalFoodScans = foodLog.length
  const totalWorkouts = workoutHistory.length
  const totalSleepHours = sleepLog.reduce((sum, night) => sum + (night.hours || 0), 0)
  const avgSleepHours = sleepLog.length > 0 ? (totalSleepHours / sleepLog.length).toFixed(1) : 0
  const activeDays = loginHistory.length
  const currentStreak = loginHistory.length > 0 ? loginHistory[loginHistory.length - 1].streak || 0 : 0

  const statCardStyle = {
    background: 'linear-gradient(135deg, rgba(139, 95, 232, 0.2), rgba(139, 95, 232, 0.05))',
    border: '1px solid rgba(139, 95, 232, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center'
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'red',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'yellow',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        border: '5px solid blue'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'green',
          border: 'none',
          color: 'white',
          fontSize: '32px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 1
        }}>×</button>
        
        <div style={{marginBottom: '20px', padding: '20px', background: 'orange', border: '3px solid purple'}}>
          <h2 style={{color: 'black', fontSize: '32px', margin: 0}}>🔴 STATS MODAL 🔴</h2>
          <p style={{color: 'black', fontSize: '18px', margin: '10px 0 0 0', fontWeight: 'bold'}}>If you see this, modal is rendering!</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {/* Steps */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>👟</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{totalSteps.toLocaleString()}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Total Steps</p>
            <small style={{color: '#666', fontSize: '12px'}}>Avg: {avgSteps.toLocaleString()}/day</small>
          </div>
          
          {/* Food */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>🍎</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{totalFoodScans}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Food Scans</p>
            <small style={{color: '#666', fontSize: '12px'}}>Meals logged</small>
          </div>
          
          {/* Workouts */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>💪</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{totalWorkouts}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Workouts</p>
            <small style={{color: '#666', fontSize: '12px'}}>Sessions</small>
          </div>
          
          {/* Sleep */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>😴</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{avgSleepHours}h</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Avg Sleep</p>
            <small style={{color: '#666', fontSize: '12px'}}>{sleepLog.length} nights</small>
          </div>
          
          {/* Streak */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>🔥</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>{currentStreak}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Streak</p>
            <small style={{color: '#666', fontSize: '12px'}}>{activeDays} days</small>
          </div>
          
          {/* Level */}
          <div style={statCardStyle}>
            <div style={{fontSize: '32px', marginBottom: '10px'}}>⭐</div>
            <h3 style={{color: 'white', fontSize: '24px', margin: '5px 0'}}>Level {user?.level || 5}</h3>
            <p style={{color: '#8B5FE8', margin: '5px 0', fontSize: '14px'}}>Wellness</p>
            <small style={{color: '#666', fontSize: '12px'}}>{user?.xp || 450} XP</small>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: '100%',
          padding: '15px',
          background: 'linear-gradient(135deg, #8B5FE8, #6A3FD8)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '20px'
        }}>Close</button>
      </div>
    </div>
  )
}

// Notifications Modal Component
function NotificationsModal({ user, onClose }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [dailyReminders, setDailyReminders] = useState(true)
  const [goalAlerts, setGoalAlerts] = useState(true)
  const [streakReminders, setStreakReminders] = useState(true)
  const [healthTips, setHealthTips] = useState(true)
  const [emergencyAlerts, setEmergencyAlerts] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [testingSent, setTestingSent] = useState(false)

  // Check notification permission on mount
  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const permission = await LocalNotifications.checkPermissions()
      setPermissionGranted(permission.display === 'granted')
    } catch (error) {
      console.warn('Failed to check notification permission:', error)
    }
  }

  const requestPermission = async () => {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const permission = await LocalNotifications.requestPermissions()
      if (permission.display === 'granted') {
        setPermissionGranted(true)
        alert('✅ Notification permission granted!')
      } else {
        alert('⚠️ Please enable notifications in your device settings.')
      }
    } catch (error) {
      console.error('Failed to request permission:', error)
      alert('❌ Failed to request notification permission')
    }
  }

  const sendTestNotification = async () => {
    if (!permissionGranted) {
      alert('⚠️ Please grant notification permission first')
      return
    }

    try {
      await notificationSchedulerService.testNotification('dailyReminders')
      setTestingSent(true)
      setTimeout(() => setTestingSent(false), 3000)
      alert('✅ Test notification sent! Check your notification bar in 2 seconds.')
    } catch (error) {
      console.error('Failed to send test notification:', error)
      alert('❌ Failed to send test notification')
    }
  }

  const handleSave = async () => {
    if (!permissionGranted) {
      alert('⚠️ Please grant notification permission first to enable notifications.')
      return
    }

    const settings = {
      notificationsEnabled,
      dailyReminders,
      goalAlerts,
      streakReminders,
      healthTips,
      emergencyAlerts
    }
    localStorage.setItem('notificationSettings', JSON.stringify(settings))
    
    // Update notification scheduler with new settings
    await notificationSchedulerService.updateSettings(settings)
    
    // Show summary of what was scheduled
    const enabled = []
    if (dailyReminders) enabled.push('Daily Reminders (9 AM, 12 PM, 6 PM)')
    if (goalAlerts) enabled.push('Goal Alerts (Real-time)')
    if (streakReminders) enabled.push('Streak Reminders (8 PM)')
    if (healthTips) enabled.push('Health Tips (10 AM, 3 PM, 7 PM)')
    
    const summary = enabled.length > 0 
      ? `✅ Scheduled:\n\n${enabled.join('\n')}`
      : '✅ All notifications disabled'
    
    alert(summary)
    onClose()
  }

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setNotificationsEnabled(settings.notificationsEnabled ?? true)
      setDailyReminders(settings.dailyReminders ?? true)
      setGoalAlerts(settings.goalAlerts ?? true)
      setStreakReminders(settings.streakReminders ?? true)
      setHealthTips(settings.healthTips ?? true)
      setEmergencyAlerts(settings.emergencyAlerts ?? true)
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content notifications-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>🔔 Notification Settings</h2>
          <p>Manage how we keep you informed</p>
          {!permissionGranted && (
            <div style={{
              background: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '10px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#FFB84D', margin: '0 0 8px 0', fontSize: '14px' }}>
                ⚠️ Notification permission required
              </p>
              <button 
                onClick={requestPermission}
                style={{
                  background: '#FFB84D',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Enable Notifications
              </button>
            </div>
          )}
          {permissionGranted && (
            <div style={{
              background: 'rgba(68, 255, 68, 0.1)',
              border: '1px solid rgba(68, 255, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '10px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#44FF44', margin: '0 0 8px 0', fontSize: '14px' }}>
                ✅ Notifications enabled
              </p>
              <button 
                onClick={sendTestNotification}
                disabled={testingSent}
                style={{
                  background: testingSent ? '#666' : '#44FF44',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: testingSent ? 'not-allowed' : 'pointer',
                  opacity: testingSent ? 0.6 : 1
                }}
              >
                {testingSent ? '📤 Sent!' : '🔔 Send Test Notification'}
              </button>
            </div>
          )}
        </div>

        <div className="notification-settings">
          <div className="setting-item">
            <div className="setting-info">
              <h3>🔔 Enable Notifications</h3>
              <p>Master switch for all notifications</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={notificationsEnabled} 
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>⏰ Daily Reminders</h3>
              <p>Log your meals, steps, and water</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={dailyReminders} 
                onChange={(e) => setDailyReminders(e.target.checked)}
                disabled={!notificationsEnabled}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>🎯 Goal Alerts</h3>
              <p>Get notified when you hit your goals</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={goalAlerts} 
                onChange={(e) => setGoalAlerts(e.target.checked)}
                disabled={!notificationsEnabled}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>🔥 Streak Reminders</h3>
              <p>Don't break your streak!</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={streakReminders} 
                onChange={(e) => setStreakReminders(e.target.checked)}
                disabled={!notificationsEnabled}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>💡 Health Tips</h3>
              <p>Personalized wellness advice</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={healthTips} 
                onChange={(e) => setHealthTips(e.target.checked)}
                disabled={!notificationsEnabled}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>🚨 Emergency Alerts</h3>
              <p>Critical health notifications (Always On)</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={emergencyAlerts} 
                disabled
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  )
}

// Theme Modal Component
function ThemeModal({ onClose }) {
  const [selectedTheme, setSelectedTheme] = useState('dark')
  const [accentColor, setAccentColor] = useState('#8B5FE8')

  const themes = [
    { id: 'dark', name: 'Dark Mode', icon: '🌙', colors: { bg: '#0F0F23', card: '#1A1A2E' } },
    { id: 'light', name: 'Light Mode', icon: '☀️', colors: { bg: '#FFFFFF', card: '#F5F5F5' } },
    { id: 'midnight', name: 'Midnight', icon: '🌃', colors: { bg: '#000000', card: '#1A1A1A' } },
    { id: 'ocean', name: 'Ocean', icon: '🌊', colors: { bg: '#001F3F', card: '#003D5C' } },
  ]

  const accentColors = [
    { name: 'Purple', color: '#8B5FE8' },
    { name: 'Blue', color: '#00C8FF' },
    { name: 'Green', color: '#44FF44' },
    { name: 'Pink', color: '#FF00FF' },
    { name: 'Orange', color: '#FFB84D' },
    { name: 'Red', color: '#FF6B35' },
  ]

  const handleSave = () => {
    const themeSettings = {
      theme: selectedTheme,
      accentColor: accentColor
    }
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings))
    
    // Apply theme immediately to html element
    document.documentElement.setAttribute('data-theme', selectedTheme)
    document.documentElement.style.setProperty('--theme-accent-color', accentColor)
    
    // Also apply to body for immediate visual feedback
    document.body.setAttribute('data-theme', selectedTheme)
    
    // 🎨 FORCE BACKGROUND VIA INLINE STYLES (CSS not working due to minification)
    if (selectedTheme === 'light') {
      document.body.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%)';
      document.body.style.color = '#000000';
    } else if (selectedTheme === 'midnight') {
      document.body.style.background = 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)';
      document.body.style.color = '#FFFFFF';
    } else if (selectedTheme === 'ocean') {
      document.body.style.background = 'linear-gradient(135deg, #0C4A6E 0%, #075985 100%)';
      document.body.style.color = '#FFFFFF';
    } else { // dark
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
      document.body.style.color = '#FFFFFF';
    }
    
    // Clear any cached theme CSS
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        styleSheets[i].disabled = true;
        styleSheets[i].disabled = false;
      } catch (e) {
        // Cross-origin stylesheets can't be accessed
      }
    }
    
    console.log('✅ Theme applied:', selectedTheme, accentColor);
    console.log('📋 HTML data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('📋 Body data-theme:', document.body.getAttribute('data-theme'));
    console.log('🎨 Body background:', document.body.style.background);
    
    onClose()
    
    // Force style recalculation
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
      // Force repaint
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
    }, 100)
  }

  useEffect(() => {
    const saved = localStorage.getItem('themeSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setSelectedTheme(settings.theme || 'dark')
      setAccentColor(settings.accentColor || '#8B5FE8')
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content theme-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>🎨 Customize Theme</h2>
          <p>Make the app your own</p>
        </div>

        <div className="theme-section">
          <h3>Theme Style</h3>
          <div className="theme-grid">
            {themes.map(theme => (
              <button
                key={theme.id}
                className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => setSelectedTheme(theme.id)}
                style={{
                  background: theme.colors.bg,
                  border: selectedTheme === theme.id ? `2px solid ${accentColor}` : '2px solid #333'
                }}
              >
                <span className="theme-icon" style={{fontSize: '40px'}}>{theme.icon}</span>
                <h4 style={{color: theme.id === 'light' ? '#000' : '#fff'}}>{theme.name}</h4>
                {selectedTheme === theme.id && <span className="selected-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="theme-section">
          <h3>Accent Color</h3>
          <div className="color-grid">
            {accentColors.map(color => (
              <button
                key={color.color}
                className={`color-option ${accentColor === color.color ? 'selected' : ''}`}
                onClick={() => setAccentColor(color.color)}
                style={{
                  background: color.color,
                  border: accentColor === color.color ? '3px solid #fff' : '3px solid transparent'
                }}
              >
                {accentColor === color.color && <span className="color-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="theme-preview">
          <h3>Preview</h3>
          <div className="preview-card" style={{background: themes.find(t => t.id === selectedTheme)?.colors.card}}>
            <div className="preview-button" style={{background: accentColor}}>Button</div>
            <div className="preview-text">Sample Text</div>
            <div className="preview-icon" style={{color: accentColor}}>⭐</div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" style={{background: accentColor}} onClick={handleSave}>Apply Theme</button>
        </div>
      </div>
    </div>
  )
}

// Activity Pulse Modal - Shows all user activities with real data
function ActivityPulseModal({ activitiesPromise, onClose }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  
  useEffect(() => {
    activitiesPromise.then(acts => {
      setActivities(acts)
      setLoading(false)
    })
  }, [activitiesPromise])

  const filterActivities = () => {
    if (filter === 'all') return activities
    return activities.filter(a => a.type === filter)
  }

  const getTotalCalories = () => {
    return activities.reduce((sum, a) => sum + (a.calories || 0), 0)
  }

  const getFilterCount = (type) => {
    return activities.filter(a => a.type === type).length
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '20px'
    }}>
      <div className="activity-pulse-modal" onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '25px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(139, 95, 232, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <div>
            <h2 style={{color: 'white', fontSize: '28px', margin: '0 0 5px 0'}}>
              ⚡ Activity Pulse
            </h2>
            <p style={{color: '#888', fontSize: '14px', margin: 0}}>
              {activities.length} activities • {getTotalCalories()} calories
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            fontSize: '28px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>×</button>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {[
            {id: 'all', label: 'All', icon: '⚡'},
            {id: 'steps', label: 'Steps', icon: '👟'},
            {id: 'workout', label: 'Workouts', icon: '💪'},
            {id: 'meal', label: 'Meals', icon: '🍽️'},
            {id: 'water', label: 'Water', icon: '💧'},
            {id: 'meditation', label: 'Zen', icon: '🧘'},
            {id: 'sleep', label: 'Sleep', icon: '😴'}
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? 'rgba(139, 95, 232, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: filter === f.id ? '2px solid #8B5FE8' : '2px solid transparent',
                borderRadius: '20px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {f.id === 'all' ? activities.length : getFilterCount(f.id)}
              </span>
            </button>
          ))}
        </div>

        {/* Activity Timeline */}
        <div className="activity-timeline" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {filterActivities().length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <div style={{fontSize: '48px', marginBottom: '10px'}}>📭</div>
              <p>No {filter !== 'all' ? filter : ''} activities yet today</p>
              <p style={{fontSize: '14px'}}>Start moving to see your pulse!</p>
            </div>
          ) : (
            filterActivities().map((activity, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139, 95, 232, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                {/* Activity Icon */}
                <div style={{
                  background: activity.type === 'steps' ? 'rgba(0, 200, 255, 0.2)' :
                             activity.type === 'workout' ? 'rgba(255, 68, 68, 0.2)' :
                             activity.type === 'meal' ? 'rgba(68, 255, 68, 0.2)' :
                             activity.type === 'water' ? 'rgba(0, 150, 255, 0.2)' :
                             activity.type === 'meditation' ? 'rgba(160, 82, 255, 0.2)' :
                             activity.type === 'sleep' ? 'rgba(255, 184, 77, 0.2)' :
                             'rgba(255, 255, 255, 0.1)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  {activity.icon}
                </div>

                {/* Activity Info */}
                <div style={{flex: 1}}>
                  <div style={{color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px'}}>
                    {activity.text}
                  </div>
                  <div style={{color: '#888', fontSize: '13px'}}>
                    {activity.time}
                    {activity.calories > 0 && (
                      <span style={{marginLeft: '10px', color: '#FFB84D'}}>
                        🔥 {activity.calories} cal
                      </span>
                    )}
                  </div>
                </div>

                {/* Activity Badge */}
                <div style={{
                  background: activity.type === 'steps' ? 'linear-gradient(135deg, #00C8FF, #0088FF)' :
                             activity.type === 'workout' ? 'linear-gradient(135deg, #FF4444, #FF6B6B)' :
                             activity.type === 'meal' ? 'linear-gradient(135deg, #44FF44, #00FF88)' :
                             activity.type === 'water' ? 'linear-gradient(135deg, #0096FF, #00C8FF)' :
                             activity.type === 'meditation' ? 'linear-gradient(135deg, #A052FF, #C084FC)' :
                             activity.type === 'sleep' ? 'linear-gradient(135deg, #FFB84D, #FFA500)' :
                             'linear-gradient(135deg, #8B5FE8, #B794F6)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}>
                  {activity.type}
                </div>
              </div>
            ))
          )}
        </div>

        {/* XP Progress Section */}
        {(() => {
          const gamificationData = gamificationService.getLevelInfo()
          const achievementCount = gamificationService.data.achievements.length
          const nextLevel = gamificationData.level + 1
          const progressPercent = gamificationData.progress
          
          // Calculate today's XP from activities
          const todayXP = activities.reduce((sum, activity) => {
            // XP calculation based on activity type
            let xp = 0
            if (activity.type === 'steps') xp = 10
            if (activity.type === 'workout') xp = 15
            if (activity.type === 'meal') xp = 15
            if (activity.type === 'water') xp = 5
            if (activity.type === 'meditation') xp = 10
            if (activity.type === 'sleep') xp = 10
            return sum + xp
          }, 0)

          return (
            <div style={{
              marginTop: '25px',
              padding: '25px',
              background: 'linear-gradient(135deg, rgba(139, 95, 232, 0.2), rgba(160, 82, 255, 0.15))',
              borderRadius: '20px',
              border: '2px solid rgba(139, 95, 232, 0.4)',
              boxShadow: '0 10px 30px rgba(139, 95, 232, 0.2)'
            }}>
              {/* XP Header */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  color: '#8B5FE8',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '10px'
                }}>
                  ⚡ Today's XP Progress
                </div>
                <div style={{
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  textShadow: '0 0 20px rgba(139, 95, 232, 0.5)'
                }}>
                  +{todayXP} XP
                </div>
                <div style={{
                  color: '#888',
                  fontSize: '13px',
                  marginTop: '5px'
                }}>
                  Earned from {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </div>
              </div>

              {/* Level Progress */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                padding: '20px',
                marginBottom: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{color: 'white', fontSize: '16px', fontWeight: 'bold'}}>
                    Level {gamificationData.level}
                  </div>
                  <div style={{color: '#8B5FE8', fontSize: '16px', fontWeight: 'bold'}}>
                    Level {nextLevel}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: `${Math.min(progressPercent, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #8B5FE8, #C084FC, #8B5FE8)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite',
                    borderRadius: '10px',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
                
                <div style={{
                  color: '#888',
                  fontSize: '13px',
                  textAlign: 'center'
                }}>
                  {gamificationData.totalXP.toLocaleString()} / {(gamificationData.totalXP + gamificationData.xpToNext).toLocaleString()} XP
                  <span style={{color: '#8B5FE8', marginLeft: '8px'}}>
                    ({gamificationData.xpToNext} XP to next level)
                  </span>
                </div>
              </div>

              {/* Achievements */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                padding: '15px',
                background: 'rgba(255, 184, 77, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 184, 77, 0.3)'
              }}>
                <span style={{fontSize: '24px'}}>🏆</span>
                <div>
                  <div style={{color: 'white', fontSize: '18px', fontWeight: 'bold'}}>
                    {achievementCount} Achievement{achievementCount !== 1 ? 's' : ''}
                  </div>
                  <div style={{color: '#888', fontSize: '12px'}}>
                    Unlocked
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Summary Footer */}
        {activities.length > 0 && (
          <div style={{
            marginTop: '25px',
            padding: '20px',
            background: 'rgba(139, 95, 232, 0.1)',
            borderRadius: '15px',
            border: '2px solid rgba(139, 95, 232, 0.3)'
          }}>
            <div style={{color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px'}}>
              🎯 Today's Impact
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px'}}>
              <div>
                <div style={{color: '#888', fontSize: '12px'}}>Total Activities</div>
                <div style={{color: 'white', fontSize: '24px', fontWeight: 'bold'}}>{activities.length}</div>
              </div>
              <div>
                <div style={{color: '#888', fontSize: '12px'}}>Calories Burned</div>
                <div style={{color: '#FFB84D', fontSize: '24px', fontWeight: 'bold'}}>{getTotalCalories()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Heart Rate Modal
function HeartRateModal({ onClose }) {
  const [heartRate, setHeartRate] = useState(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (heartRateService.isConnected()) {
      setConnected(true)
      setHeartRate(heartRateService.getCurrentHeartRate())
      
      const unsubscribe = heartRateService.subscribe((reading) => {
        setHeartRate(reading.bpm)
      })
      
      return unsubscribe
    }
  }, [])

  const connectDevice = async () => {
    setConnecting(true)
    try {
      const result = await heartRateService.connectDevice()
      setConnected(true)
      alert(`✅ Connected to ${result.deviceName}!`)
    } catch (error) {
      alert(`❌ Connection failed: ${error.message}`)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    await heartRateService.disconnect()
    setConnected(false)
    setHeartRate(null)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px'}}>
        <h2>💓 Heart Rate Monitor</h2>
        
        {!connected ? (
          <div style={{textAlign: 'center', padding: '30px'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>🫀</div>
            <p>Connect a Bluetooth heart rate monitor to track your heart rate in real-time.</p>
            <button 
              onClick={connectDevice} 
              disabled={connecting}
              style={{
                marginTop: '20px',
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #FF4D6A, #FF758C)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {connecting ? 'Connecting...' : 'Connect Device'}
            </button>
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '30px'}}>
            <div style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#FF4D6A',
              marginBottom: '10px'
            }}>
              {heartRate || '--'}
            </div>
            <div style={{fontSize: '18px', color: '#888', marginBottom: '20px'}}>BPM</div>
            <div style={{fontSize: '24px', marginBottom: '30px'}}>💓</div>
            <button 
              onClick={disconnect}
              style={{
                padding: '10px 25px',
                background: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          </div>
        )}
        
        <button onClick={onClose} className="close-button">✕</button>
      </div>
    </div>
  )
}

// Sleep Tracking Modal
function SleepModal({ onClose }) {
  const [tracking, setTracking] = useState(sleepTrackingService.isTracking)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (tracking) {
      const interval = setInterval(() => {
        setStats(sleepTrackingService.getSleepStats())
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [tracking])

  const startTracking = async () => {
    await sleepTrackingService.startTracking()
    setTracking(true)
    alert('😴 Sleep tracking started! Leave your phone on the nightstand.')
  }

  const stopTracking = async () => {
    const result = await sleepTrackingService.stopTracking()
    setTracking(false)
    if (result) {
      alert(`✅ Slept for ${result.duration} hours! Quality: ${result.quality}/100`)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px'}}>
        <h2>😴 Sleep Tracking</h2>
        
        {!tracking ? (
          <div style={{textAlign: 'center', padding: '30px'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>🌙</div>
            <p>Track your sleep quality using your phone's motion sensors.</p>
            <button 
              onClick={startTracking}
              style={{
                marginTop: '20px',
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #A052FF, #C084FC)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Start Tracking
            </button>
          </div>
        ) : (
          <div style={{padding: '20px'}}>
            <div style={{textAlign: 'center', marginBottom: '30px'}}>
              <div style={{fontSize: '48px', marginBottom: '10px'}}>😴</div>
              <div style={{fontSize: '24px', fontWeight: 'bold'}}>
                {stats?.duration || '0.0'}h
              </div>
              <div style={{color: '#888'}}>Sleep Duration</div>
            </div>

            {stats && (
              <div style={{marginBottom: '20px'}}>
                <div style={{marginBottom: '15px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                    <span>Deep Sleep</span>
                    <span>{stats.phases.deep}%</span>
                  </div>
                  <div style={{background: '#333', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                    <div style={{background: '#A052FF', width: `${stats.phases.deep}%`, height: '100%'}}></div>
                  </div>
                </div>
                <div style={{marginBottom: '15px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                    <span>REM Sleep</span>
                    <span>{stats.phases.rem}%</span>
                  </div>
                  <div style={{background: '#333', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                    <div style={{background: '#FF758C', width: `${stats.phases.rem}%`, height: '100%'}}></div>
                  </div>
                </div>
                <div style={{marginBottom: '15px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                    <span>Light Sleep</span>
                    <span>{stats.phases.light}%</span>
                  </div>
                  <div style={{background: '#333', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                    <div style={{background: '#00C8FF', width: `${stats.phases.light}%`, height: '100%'}}></div>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={stopTracking}
              style={{
                width: '100%',
                padding: '12px',
                background: '#FF4D6A',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Stop & Save
            </button>
          </div>
        )}
        
        <button onClick={onClose} className="close-button">✕</button>
      </div>
    </div>
  )
}

// Water Modal
function WaterModal({ onClose }) {
  const [progress, setProgress] = useState(waterIntakeService.getTodayProgress())

  const addWater = (amount) => {
    const result = waterIntakeService.addIntake(amount)
    setProgress(result)
    if (result.goalReached) {
      alert('🎉 Daily water goal reached!')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px'}}>
        <h2>💧 Water Intake</h2>
        
        <div style={{textAlign: 'center', padding: '30px 20px'}}>
          <div style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '10px'}}>
            {progress.intake}ml
          </div>
          <div style={{color: '#888', marginBottom: '20px'}}>
            of {progress.goal}ml ({progress.percentage}%)
          </div>

          <div style={{background: '#333', height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '30px'}}>
            <div style={{
              background: 'linear-gradient(90deg, #0096FF, #00C8FF)',
              width: `${Math.min(progress.percentage, 100)}%`,
              height: '100%',
              transition: 'width 0.3s ease'
            }}></div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px'}}>
            <button onClick={() => addWater(250)} style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #0096FF, #00C8FF)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              🥤 Glass<br/>(250ml)
            </button>
            <button onClick={() => addWater(500)} style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #00C8FF, #00E5FF)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              🍶 Bottle<br/>(500ml)
            </button>
            <button onClick={() => addWater(1000)} style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #00E5FF, #00FFD1)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              🥤 Large<br/>(1000ml)
            </button>
            <button onClick={() => addWater(200)} style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #0096FF, #00A8FF)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              ☕ Cup<br/>(200ml)
            </button>
          </div>
        </div>
        
        <button onClick={onClose} className="close-button">✕</button>
      </div>
    </div>
  )
}

// Breathing Exercise Modal
function BreathingModal({ onClose }) {
  const [step, setStep] = useState('select') // 'select', 'settings', 'active'
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [selectedVoice] = useState('female')
  const [duration, setDuration] = useState(5)
  const [currentPhase, setCurrentPhase] = useState(null)
  const [isActive, setIsActive] = useState(false)

  const patterns = breathingService.getPatterns()

  const startExercise = () => {
    setStep('active')
    setIsActive(true)
    
    breathingService.setVoice(selectedVoice)
    
    breathingService.startExercise(
      selectedPattern,
      duration,
      (phase) => {
        setCurrentPhase(phase)
      },
      (cycle, total) => {
        // Cycle complete
      },
      (result) => {
        // Exercise complete
        setIsActive(false)
        setStep('complete')
      }
    )
  }

  const stopExercise = () => {
    breathingService.stopExercise()
    setIsActive(false)
    setStep('select')
    setCurrentPhase(null)
  }

  const previewVoice = (voice) => {
    breathingService.setVoice(voice)
    breathingService.speak(`hello... I'm here with you... just breathe... and let go...`)
  }

  if (step === 'select') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
          <h2>🧘 Choose Breathing Pattern</h2>
          
          <div style={{display: 'grid', gap: '15px', marginTop: '20px'}}>
            {patterns.map(pattern => (
              <button
                key={pattern.id}
                onClick={() => {
                  setSelectedPattern(pattern.id)
                  setStep('settings')
                }}
                style={{
                  padding: '20px',
                  background: '#1a1a1a',
                  border: '2px solid #333',
                  borderRadius: '15px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8B5FE8'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                  <span style={{fontSize: '32px'}}>{pattern.icon}</span>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '5px'}}>
                      {pattern.name}
                    </div>
                    <div style={{fontSize: '14px', color: '#888'}}>
                      {pattern.description}
                    </div>
                  </div>
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {pattern.benefits.map((benefit, idx) => (
                    <span key={idx} style={{
                      background: '#8B5FE8',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'white'
                    }}>
                      {benefit}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          
          <button onClick={onClose} style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            background: '#333',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (step === 'settings') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px'}}>
          <h2>⚙️ Exercise Settings</h2>
          
          <div style={{marginTop: '30px'}}>
            {/* Duration Selection */}
            <div style={{marginBottom: '30px'}}>
              <label style={{display: 'block', fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '15px'}}>
                ⏱️ Duration
              </label>
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                {[1, 3, 5, 10, 15].map(min => (
                  <button
                    key={min}
                    onClick={() => setDuration(min)}
                    style={{
                      padding: '12px 20px',
                      background: duration === min ? 'linear-gradient(135deg, #8B5FE8, #B794F6)' : '#333',
                      border: duration === min ? '2px solid #B794F6' : '1px solid #555',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      cursor: 'pointer',
                      flex: '1',
                      minWidth: '60px'
                    }}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={startExercise}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #44FF44, #00FF88)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: '0 4px 20px rgba(68, 255, 68, 0.4)'
              }}
            >
              ▶️ Begin Exercise
            </button>
            
            <button
              onClick={() => setStep('select')}
              style={{
                width: '100%',
                padding: '12px',
                background: '#333',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'active') {
    const progress = currentPhase ? (currentPhase.cycle / currentPhase.totalCycles) * 100 : 0
    
    return (
      <div className="modal-overlay" style={{background: 'rgba(0, 0, 0, 0.95)'}}>
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          {/* Progress */}
          <div style={{
            position: 'absolute',
            top: '40px',
            color: 'white',
            fontSize: '16px',
            opacity: 0.7
          }}>
            {currentPhase && `${currentPhase.cycle} / ${currentPhase.totalCycles} cycles`}
          </div>

          {/* Breathing Circle */}
          <div style={{
            width: 'min(300px, 70vw)',
            height: 'min(300px, 70vw)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5FE8, #00C8FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            transform: currentPhase?.phase === 'inhale' ? 'scale(1.3)' : 
                      currentPhase?.phase === 'exhale' ? 'scale(0.8)' : 'scale(1)',
            transition: 'transform 1s ease-in-out',
            boxShadow: '0 0 60px rgba(139, 95, 232, 0.6)'
          }}>
            <div style={{
              fontSize: 'clamp(24px, 6vw, 32px)',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center'
            }}>
              {currentPhase?.text || 'Prepare...'}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: 'min(300px, 80%)',
            height: '8px',
            background: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '40px'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #44FF44, #00FF88)',
              transition: 'width 1s ease'
            }}></div>
          </div>

          {/* Stop Button */}
          <button
            onClick={stopExercise}
            style={{
              padding: '15px 40px',
              background: 'rgba(255, 68, 68, 0.2)',
              border: '2px solid #FF4444',
              borderRadius: '25px',
              color: '#FF4444',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ⏹️ Stop Exercise
          </button>
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    const stats = breathingService.getStats()
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px', textAlign: 'center'}}>
          <h2 style={{fontSize: '48px', margin: '20px 0'}}>✨</h2>
          <h2>Exercise Complete!</h2>
          <p style={{fontSize: '16px', color: '#888', margin: '20px 0'}}>
            Well done! You've completed your breathing exercise.
          </p>

          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '15px',
            marginTop: '20px'
          }}>
            <div style={{fontSize: '14px', color: '#888', marginBottom: '15px'}}>Your Stats</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white'}}>
                  {stats.totalSessions}
                </div>
                <div style={{fontSize: '12px', color: '#888'}}>Total Sessions</div>
              </div>
              <div>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white'}}>
                  {stats.totalMinutes}
                </div>
                <div style={{fontSize: '12px', color: '#888'}}>Minutes</div>
              </div>
              <div>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#44FF44'}}>
                  {stats.streak}
                </div>
                <div style={{fontSize: '12px', color: '#888'}}>Day Streak</div>
              </div>
              <div>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#8B5FE8'}}>
                  {stats.totalCycles}
                </div>
                <div style={{fontSize: '12px', color: '#888'}}>Total Cycles</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: '30px',
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #8B5FE8, #B794F6)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return null
}

// Stress Relief Modal - Proven Relaxation Techniques
function StressReliefModal({ onClose }) {
  const [selectedTechnique, setSelectedTechnique] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const techniques = {
    pmr: {
      name: 'Progressive Muscle Relaxation',
      icon: '💪',
      duration: '10-15 min',
      benefits: ['Reduces physical tension', 'Improves sleep', 'Decreases anxiety'],
      when: 'When you feel physically tense or before sleep',
      steps: [
        'Find a comfortable position, sitting or lying down.',
        'Take 3 deep breaths to center yourself.',
        'Tense your right fist as tightly as you can for 5 seconds.',
        'Release and feel the tension flowing out. Notice the difference.',
        'Tense your right bicep for 5 seconds, then release.',
        'Repeat with your left arm: fist, then bicep.',
        'Raise your shoulders to your ears, hold 5 seconds, release.',
        'Scrunch your face muscles tightly, hold, then release.',
        'Press your tongue to the roof of your mouth, hold, release.',
        'Arch your back gently, hold 5 seconds, release.',
        'Tighten your stomach muscles, hold, release.',
        'Squeeze your buttocks together, hold, release.',
        'Tense your right thigh, hold, release. Then left thigh.',
        'Point your right toes away from you, hold, release. Repeat left.',
        'Curl your toes tightly, hold, release.',
        'Take 3 deep breaths and scan your body for any remaining tension.',
        'Rest for a moment and enjoy the feeling of complete relaxation.'
      ],
      audioScript: 'Welcome to Progressive Muscle Relaxation. Find a comfortable position and close your eyes. We will tense and release each muscle group to help you deeply relax.'
    },
    breathing478: {
      name: '4-7-8 Breathing',
      icon: '🫁',
      duration: '5 min',
      benefits: ['Calms nervous system', 'Reduces stress instantly', 'Helps with sleep'],
      when: 'When feeling anxious or unable to sleep',
      steps: [
        'Sit comfortably with your back straight.',
        'Place the tip of your tongue behind your upper front teeth.',
        'Exhale completely through your mouth, making a whoosh sound.',
        'Close your mouth and inhale quietly through your nose for 4 counts.',
        'Hold your breath for 7 counts.',
        'Exhale completely through your mouth for 8 counts, making a whoosh sound.',
        'This completes one breath cycle.',
        'Repeat for 4 complete cycles (about 1 minute).',
        'Breathe normally and notice how calm you feel.',
        'You can repeat this 3-4 times throughout the day.'
      ],
      audioScript: 'Four seven eight breathing. This ancient technique activates your relaxation response. Let us begin.'
    },
    bodyscan: {
      name: 'Body Scan Meditation',
      icon: '🧘',
      duration: '10 min',
      benefits: ['Releases unconscious tension', 'Improves body awareness', 'Promotes deep relaxation'],
      when: 'Anytime you need to reset and reconnect with your body',
      steps: [
        'Lie down or sit comfortably. Close your eyes.',
        'Take 3 deep breaths, letting go of tension with each exhale.',
        'Bring awareness to the top of your head. Notice any sensations.',
        'Slowly move attention to your forehead. Release any tension.',
        'Notice your eyes, cheeks, jaw. Let them soften.',
        'Move to your neck and shoulders. Feel them relax and drop.',
        'Scan down your right arm to your fingertips. Feel the weight.',
        'Repeat with your left arm.',
        'Bring awareness to your chest. Feel it rise and fall with your breath.',
        'Notice your stomach and lower back. Let them soften.',
        'Scan your hips and pelvis. Release any holding.',
        'Move down your right leg to your toes. Notice temperature and sensation.',
        'Repeat with your left leg.',
        'Take a moment to feel your whole body at once.',
        'Notice the support beneath you.',
        'Take 3 deep breaths and slowly open your eyes when ready.'
      ],
      audioScript: 'Body scan meditation. We will journey through your body, releasing tension and finding peace.'
    },
    autogenic: {
      name: 'Autogenic Training',
      icon: '🌊',
      duration: '8 min',
      benefits: ['Self-hypnosis for deep calm', 'Lowers blood pressure', 'Reduces stress hormones'],
      when: 'For deep relaxation or before important events',
      steps: [
        'Lie down comfortably. Close your eyes.',
        'Take 3 deep, calming breaths.',
        'Silently repeat: "My right arm is heavy." Feel the weight.',
        'Repeat: "My left arm is heavy."',
        'Repeat: "Both arms are heavy."',
        'Now say: "My right arm is warm." Feel warmth spreading.',
        'Repeat: "My left arm is warm."',
        'Say: "My heartbeat is calm and regular." Listen to your heart.',
        'Say: "My breathing is calm and effortless." Notice your breath.',
        'Say: "My stomach is soft and warm." Feel warmth in your belly.',
        'Say: "My forehead is cool and clear." Feel a cooling sensation.',
        'Rest in this state of deep relaxation for 2-3 minutes.',
        'To finish, take a deep breath, stretch gently, and open your eyes.'
      ],
      audioScript: 'Autogenic training. Through self-suggestion, we will guide your body into deep relaxation.'
    },
    grounding: {
      name: '5-4-3-2-1 Grounding',
      icon: '🌟',
      duration: '3-5 min',
      benefits: ['Stops panic attacks', 'Grounds you in the present', 'Reduces anxiety quickly'],
      when: 'During anxiety, panic, or when feeling overwhelmed',
      steps: [
        'Pause and take a deep breath.',
        'Look around and name 5 things you can SEE.',
        'Really look at them - colors, shapes, details.',
        'Now notice 4 things you can TOUCH or FEEL.',
        'The texture of your clothes, the chair beneath you, the air on your skin.',
        'Listen carefully for 3 things you can HEAR.',
        'Distant sounds, nearby sounds, subtle sounds.',
        'Identify 2 things you can SMELL.',
        'If you can not smell anything, think of 2 favorite scents.',
        'Finally, notice 1 thing you can TASTE.',
        'Or think of your favorite flavor.',
        'Take another deep breath.',
        'Notice how you feel more present and grounded.'
      ],
      audioScript: 'Five four three two one grounding. This technique brings you back to the present moment when anxiety tries to pull you away.'
    },
    mindful: {
      name: 'Mindful Breathing',
      icon: '🍃',
      duration: '5 min',
      benefits: ['Calms the mind', 'Reduces rumination', 'Increases focus'],
      when: 'Anytime you need mental clarity or calm',
      steps: [
        'Sit comfortably with your spine straight.',
        'Close your eyes or lower your gaze.',
        'Bring attention to your natural breath.',
        'Notice the sensation of air entering your nostrils.',
        'Feel your chest and belly rise with each inhale.',
        'Notice the natural pause at the top of the inhale.',
        'Feel the air leaving as you exhale.',
        'Notice your belly and chest falling.',
        'When your mind wanders (it will), gently bring it back to your breath.',
        'Count your breaths if it helps: Inhale one, exhale one. Inhale two, exhale two.',
        'Continue for 5 minutes.',
        'Slowly open your eyes and notice how you feel.'
      ],
      audioScript: 'Mindful breathing meditation. Simply observe your breath without trying to change it.'
    },
    visualization: {
      name: 'Safe Place Visualization',
      icon: '🏝️',
      duration: '10 min',
      benefits: ['Creates instant calm', 'Reduces stress hormones', 'Provides mental escape'],
      when: 'When overwhelmed or needing mental peace',
      steps: [
        'Close your eyes and take 3 deep breaths.',
        'Imagine a place where you feel completely safe and calm.',
        'It could be a beach, forest, mountain, or imaginary place.',
        'See it clearly: What colors do you see?',
        'What time of day is it? What is the light like?',
        'What sounds do you hear? Birds, waves, wind?',
        'What do you smell? Ocean air, pine trees, flowers?',
        'What do you feel on your skin? Warmth, breeze, softness?',
        'Notice how your body feels in this safe place.',
        'Stay here as long as you need.',
        'Know you can return to this place anytime.',
        'When ready, take a deep breath and slowly open your eyes.',
        'Bring that feeling of calm with you.'
      ],
      audioScript: 'Safe place visualization. We will journey to a place of complete peace and safety that exists within your imagination.'
    }
  }

  const handlePlayTechnique = async () => {
    if (!selectedTechnique) return
    
    setIsPlaying(true)
    setCurrentStep(0)
    
    const technique = techniques[selectedTechnique]
    
    // Play audio introduction
    await directAudioService.speak(technique.audioScript)
    
    // Guide through each step
    for (let i = 0; i < technique.steps.length; i++) {
      setCurrentStep(i)
      await directAudioService.speak(technique.steps[i])
      await new Promise(resolve => setTimeout(resolve, 1000)) // Pause between steps
    }
    
    await directAudioService.speak('You have completed this relaxation technique. Take a moment to notice how you feel.')
    
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleStop = () => {
    directAudioService.stop()
    setIsPlaying(false)
    setCurrentStep(0)
  }

  if (!selectedTechnique) {
    // Selection screen
    return (
      <div className="modal-overlay" onClick={onClose} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '25px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(139, 95, 232, 0.3)'
        }}>
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{color: 'white', fontSize: '28px', margin: 0}}>
              😌 Stress Relief
            </h2>
            <button onClick={onClose} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}>×</button>
          </div>

          <p style={{color: '#888', marginBottom: '25px', fontSize: '14px'}}>
            Choose a scientifically-proven relaxation technique. Each includes audio guidance and written instructions.
          </p>

          {/* Technique Cards */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {Object.entries(techniques).map(([key, tech]) => (
              <button
                key={key}
                onClick={() => setSelectedTechnique(key)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(139, 95, 232, 0.15)'
                  e.currentTarget.style.borderColor = '#8B5FE8'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '15px'}}>
                  <span style={{fontSize: '36px'}}>{tech.icon}</span>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <h3 style={{color: 'white', fontSize: '18px', margin: 0}}>{tech.name}</h3>
                      <span style={{color: '#8B5FE8', fontSize: '12px', fontWeight: 'bold'}}>{tech.duration}</span>
                    </div>
                    <p style={{color: '#888', fontSize: '13px', margin: '0 0 10px 0'}}>{tech.when}</p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                      {tech.benefits.map((benefit, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(139, 95, 232, 0.2)',
                          color: '#C084FC',
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '8px'
                        }}>
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Technique detail screen
  const technique = techniques[selectedTechnique]
  
  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '20px'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '25px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(139, 95, 232, 0.3)'
      }}>
        {/* Header */}
        <button onClick={() => setSelectedTechnique(null)} style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: 'white',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}>
          ← Back
        </button>

        <div style={{textAlign: 'center', marginBottom: '25px'}}>
          <span style={{fontSize: '60px'}}>{technique.icon}</span>
          <h2 style={{color: 'white', fontSize: '24px', margin: '10px 0'}}>{technique.name}</h2>
          <p style={{color: '#8B5FE8', fontSize: '14px', fontWeight: 'bold'}}>{technique.duration}</p>
        </div>

        {/* Benefits */}
        <div style={{marginBottom: '25px'}}>
          <h4 style={{color: 'white', fontSize: '16px', marginBottom: '10px'}}>Benefits:</h4>
          {technique.benefits.map((benefit, idx) => (
            <div key={idx} style={{color: '#888', fontSize: '14px', marginBottom: '5px', paddingLeft: '10px'}}>
              ✓ {benefit}
            </div>
          ))}
        </div>

        {/* Play/Stop Button */}
        {!isPlaying ? (
          <button onClick={handlePlayTechnique} style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #8B5FE8, #B794F6)',
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px',
            boxShadow: '0 5px 20px rgba(139, 95, 232, 0.4)'
          }}>
            🎧 Start Audio Guide
          </button>
        ) : (
          <button onClick={handleStop} style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #FF4444, #FF6B6B)',
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px'
          }}>
            ⏹️ Stop
          </button>
        )}

        {/* Written Instructions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{color: 'white', fontSize: '16px', marginBottom: '15px'}}>📖 Step-by-Step Instructions:</h4>
          {technique.steps.map((step, idx) => (
            <div key={idx} style={{
              color: isPlaying && idx === currentStep ? '#FFB84D' : (idx < currentStep ? '#888' : 'white'),
              fontSize: '14px',
              marginBottom: '12px',
              paddingLeft: '25px',
              position: 'relative',
              transition: 'color 0.3s ease'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: isPlaying && idx === currentStep ? '#FFB84D' : '#8B5FE8',
                fontWeight: 'bold'
              }}>
                {idx + 1}.
              </span>
              {step}
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Close
        </button>
      </div>
    </div>
  )
}

// Guided Meditation Modal - Energizing & Empowering Techniques
function GuidedMeditationModal({ onClose }) {
  const [selectedMeditation, setSelectedMeditation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const meditations = {
    morning: {
      name: 'Morning Energy Activation',
      icon: '☀️',
      duration: '10 min',
      benefits: ['Energizes your day', 'Boosts motivation', 'Clears mental fog'],
      when: 'First thing in the morning',
      steps: [
        'Sit comfortably with your spine straight. Feel powerful and alert.',
        'Take a deep breath in through your nose, filling your lungs completely.',
        'Exhale fully, releasing any sleepiness or doubt.',
        'Visualize golden sunlight pouring down from above.',
        'See it entering through the top of your head, filling your entire body with energy.',
        'Feel this warm, powerful light awakening every cell.',
        'Say to yourself: I am fully awake. I am powerful. I am ready.',
        'Breathe in confidence. Breathe out hesitation.',
        'Visualize your day ahead going perfectly.',
        'See yourself handling challenges with ease and grace.',
        'Feel the energy building in your core, like a fire growing stronger.',
        'Stand up slowly, feeling tall, strong, and unstoppable.',
        'Take one final deep breath and smile.',
        'You are ready to conquer this day.'
      ],
      audioScript: 'Morning energy activation. Rise like the sun and feel your power awaken. Let us begin.'
    },
    innerPower: {
      name: 'Inner Power Meditation',
      icon: '💎',
      duration: '12 min',
      benefits: ['Unlocks inner strength', 'Builds resilience', 'Increases self-confidence'],
      when: 'When you need to feel strong',
      steps: [
        'Sit in a powerful posture. Shoulders back, head high.',
        'Close your eyes and take three powerful breaths.',
        'Imagine a diamond at the center of your chest.',
        'This diamond represents your unbreakable inner strength.',
        'With each breath, the diamond glows brighter.',
        'Feel its energy radiating through your entire body.',
        'Remember a time when you were strong, when you overcame something difficult.',
        'Feel that strength now, in this moment.',
        'Say to yourself: I am strong. I am capable. I am unstoppable.',
        'Visualize challenges before you crumbling like dust.',
        'Nothing can break you. You are solid as diamond.',
        'Feel this power in your bones, in your blood.',
        'Let it fill every cell until you vibrate with strength.',
        'Open your eyes. You are power itself.'
      ],
      audioScript: 'Inner power meditation. Deep within you lies unbreakable strength. We will awaken it now.'
    },
    confidence: {
      name: 'Confidence Boost',
      icon: '🌟',
      duration: '8 min',
      benefits: ['Builds unshakeable confidence', 'Eliminates self-doubt', 'Radiates charisma'],
      when: 'Before important events or presentations',
      steps: [
        'Stand tall with your feet shoulder-width apart.',
        'Place your hands on your hips in a power pose.',
        'Breathe deeply and feel your presence expanding.',
        'You are not small. You are magnificent.',
        'Say out loud: I am confident. I am worthy. I am enough.',
        'Visualize yourself succeeding brilliantly at your goal.',
        'See people responding positively to you.',
        'Feel what it feels like to be completely confident.',
        'Your voice is strong. Your presence commands respect.',
        'Doubt has no place here. Only certainty.',
        'You were born for this moment.',
        'Breathe in power. Breathe out fear.',
        'Smile confidently. You already know you will succeed.',
        'Now go and show the world who you are.'
      ],
      audioScript: 'Confidence boost. You are about to remember who you truly are. Powerful. Confident. Unstoppable.'
    },
    quickEnergy: {
      name: 'Quick Energy Reset',
      icon: '⚡',
      duration: '5 min',
      benefits: ['Instant energy surge', 'Clears mental fatigue', 'Sharpens focus'],
      when: 'Afternoon slump or when tired',
      steps: [
        'Stand up and shake out your body vigorously for 10 seconds.',
        'Take a huge breath in and hold it for 5 seconds.',
        'Exhale forcefully through your mouth with a HA sound.',
        'Repeat this power breath 3 times.',
        'Jump in place 10 times, feeling energy surge with each jump.',
        'Rub your palms together rapidly until they are hot.',
        'Place your warm palms over your closed eyes.',
        'Feel energy transferring from your hands to your brain.',
        'Tap your chest firmly with your fist, like a drum.',
        'Say loudly: I am awake! I am alive! I am energized!',
        'Do 10 arm circles forward, then 10 backward.',
        'Take one final deep breath and feel completely refreshed.',
        'You are recharged and ready.'
      ],
      audioScript: 'Quick energy reset. In just five minutes, you will feel completely recharged. Let us activate your energy now.'
    },
    warrior: {
      name: 'Warrior Mindset',
      icon: '🦁',
      duration: '10 min',
      benefits: ['Builds mental toughness', 'Conquers fear', 'Prepares for challenges'],
      when: 'Before facing difficult situations',
      steps: [
        'Stand in warrior pose: feet wide, arms extended.',
        'Feel your connection to the ground beneath you.',
        'You are immovable. You are a warrior.',
        'Breathe like a warrior: strong, powerful breaths.',
        'Visualize yourself as a lion, king of the jungle.',
        'No challenge is too great. No obstacle too high.',
        'Remember: warriors are not born, they are forged.',
        'Every challenge you have faced has made you stronger.',
        'You have survived 100% of your worst days.',
        'Today will be no different. You will prevail.',
        'Say: I am a warrior. I face fear with courage.',
        'Feel strength flowing through your veins.',
        'Your spirit is unbreakable. Your will is iron.',
        'Open your eyes. You are ready for battle.'
      ],
      audioScript: 'Warrior mindset meditation. The warrior within you is awakening. Feel your courage rising.'
    },
    chakra: {
      name: 'Chakra Energy Activation',
      icon: '🔥',
      duration: '15 min',
      benefits: ['Activates all energy centers', 'Balances life force', 'Awakens kundalini'],
      when: 'For deep energy work',
      steps: [
        'Sit comfortably with your spine perfectly straight.',
        'Close your eyes and breathe naturally.',
        'Bring awareness to the base of your spine. See a red glowing light.',
        'As you breathe, this red light grows brighter. Root chakra activated.',
        'Move to your lower belly. See an orange light glowing. Sacral chakra awakening.',
        'Feel creativity and passion flowing through you.',
        'Move to your solar plexus. A yellow sun burns bright. Power chakra activated.',
        'Feel confidence and personal power radiating.',
        'Move to your heart center. A green light expands. Heart chakra opening.',
        'Feel love and compassion flowing infinitely.',
        'Move to your throat. A blue light glows. Throat chakra activated.',
        'Your voice carries truth and power.',
        'Move to your third eye, between your brows. Indigo light shines. Intuition awakens.',
        'Move to the crown of your head. Violet light explodes outward. Connection to universe.',
        'Feel all seven chakras spinning and glowing in harmony.',
        'You are pure energy. You are infinite.'
      ],
      audioScript: 'Chakra energy activation. We will awaken each energy center from root to crown. Feel your power multiply.'
    },
    affirmation: {
      name: 'Positive Affirmation Power',
      icon: '🌈',
      duration: '8 min',
      benefits: ['Reprograms subconscious', 'Builds positive beliefs', 'Manifests success'],
      when: 'Daily practice for transformation',
      steps: [
        'Sit comfortably and place your hand over your heart.',
        'Take a deep breath and feel your heartbeat.',
        'Say each affirmation with total conviction.',
        'I am powerful beyond measure.',
        'I am worthy of all good things.',
        'I am capable of achieving anything I set my mind to.',
        'I radiate confidence and positive energy.',
        'Opportunities flow to me effortlessly.',
        'I am healthy, wealthy, and wise.',
        'I am loved, supported, and appreciated.',
        'I trust myself completely.',
        'I am exactly where I need to be.',
        'Every day I am becoming better and stronger.',
        'I am grateful for my incredible life.',
        'I am unstoppable.',
        'Feel these truths settling into your bones.',
        'They are not wishes. They are facts.',
        'You are all of these things right now.'
      ],
      audioScript: 'Positive affirmation meditation. Words have power. These affirmations will reprogram your mind for success.'
    },
    mountain: {
      name: 'Mountain Strength',
      icon: '🏔️',
      duration: '10 min',
      benefits: ['Unshakeable stability', 'Emotional resilience', 'Grounded power'],
      when: 'When feeling unstable or anxious',
      steps: [
        'Sit in a solid, grounded position.',
        'Feel the weight of your body pressing down.',
        'You are not fragile. You are a mountain.',
        'Visualize yourself as a massive mountain peak.',
        'Your base is deep in the earth, immovable.',
        'Storms come. Winds blow. You do not move.',
        'Rain falls. Snow covers you. You remain.',
        'Centuries pass. You stand eternal.',
        'Feel this mountain strength in your body.',
        'Nothing can shake you. Nothing can move you.',
        'Emotions are like weather passing over the mountain.',
        'They come. They go. The mountain remains.',
        'You are solid. You are stable. You are strong.',
        'Breathe with the patience of mountains.',
        'You have all the time in the world.',
        'You are unshakeable.'
      ],
      audioScript: 'Mountain strength visualization. You are about to become as solid and unshakeable as an ancient mountain.'
    }
  }

  const handlePlayMeditation = async () => {
    if (!selectedMeditation) return
    
    setIsPlaying(true)
    setCurrentStep(0)
    
    const meditation = meditations[selectedMeditation]
    
    // Play audio introduction
    await directAudioService.speak(meditation.audioScript)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Guide through each step with pauses
    for (let i = 0; i < meditation.steps.length; i++) {
      setCurrentStep(i)
      await directAudioService.speak(meditation.steps[i])
      
      // Longer pause between steps for meditation
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    await directAudioService.speak('You have completed this powerful meditation. Notice how strong and energized you feel.')
    
    // ⭐ GAMIFICATION: Log meditation activity
    try {
      await gamificationService.logActivity('meditation')
      if(import.meta.env.DEV)console.log('⭐ [GAMIFICATION] Meditation activity logged')
    } catch (error) {
      console.error('❌ [GAMIFICATION] Failed to log meditation activity:', error)
    }
    
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleStop = () => {
    directAudioService.stop()
    setIsPlaying(false)
    setCurrentStep(0)
  }

  if (!selectedMeditation) {
    // Selection screen
    return (
      <div className="modal-overlay" onClick={onClose} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '25px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 184, 77, 0.3)'
        }}>
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{color: 'white', fontSize: '28px', margin: 0}}>
              🎵 Guided Meditation
            </h2>
            <button onClick={onClose} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}>×</button>
          </div>

          <p style={{color: '#888', marginBottom: '25px', fontSize: '14px'}}>
            Choose an energizing meditation to feel powerful, confident, and unstoppable. Each includes audio guidance.
          </p>

          {/* Meditation Cards */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {Object.entries(meditations).map(([key, med]) => (
              <button
                key={key}
                onClick={() => setSelectedMeditation(key)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 184, 77, 0.15)'
                  e.currentTarget.style.borderColor = '#FFB84D'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '15px'}}>
                  <span style={{fontSize: '36px'}}>{med.icon}</span>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <h3 style={{color: 'white', fontSize: '18px', margin: 0}}>{med.name}</h3>
                      <span style={{color: '#FFB84D', fontSize: '12px', fontWeight: 'bold'}}>{med.duration}</span>
                    </div>
                    <p style={{color: '#888', fontSize: '13px', margin: '0 0 10px 0'}}>{med.when}</p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                      {med.benefits.map((benefit, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(255, 184, 77, 0.2)',
                          color: '#FFD700',
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '8px'
                        }}>
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Meditation detail screen
  const meditation = meditations[selectedMeditation]
  
  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '20px'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '25px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(255, 184, 77, 0.3)'
      }}>
        {/* Header */}
        <button onClick={() => setSelectedMeditation(null)} style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: 'white',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}>
          ← Back
        </button>

        <div style={{textAlign: 'center', marginBottom: '25px'}}>
          <span style={{fontSize: '60px'}}>{meditation.icon}</span>
          <h2 style={{color: 'white', fontSize: '24px', margin: '10px 0'}}>{meditation.name}</h2>
          <p style={{color: '#FFB84D', fontSize: '14px', fontWeight: 'bold'}}>{meditation.duration}</p>
        </div>

        {/* Benefits */}
        <div style={{marginBottom: '25px'}}>
          <h4 style={{color: 'white', fontSize: '16px', marginBottom: '10px'}}>✨ Benefits:</h4>
          {meditation.benefits.map((benefit, idx) => (
            <div key={idx} style={{color: '#888', fontSize: '14px', marginBottom: '5px', paddingLeft: '10px'}}>
              ⭐ {benefit}
            </div>
          ))}
        </div>

        {/* Play/Stop Button */}
        {!isPlaying ? (
          <button onClick={handlePlayMeditation} style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #FFB84D, #FF9500)',
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px',
            boxShadow: '0 5px 20px rgba(255, 184, 77, 0.4)'
          }}>
            🎧 Start Guided Meditation
          </button>
        ) : (
          <button onClick={handleStop} style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #FF4444, #FF6B6B)',
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px'
          }}>
            ⏹️ Stop
          </button>
        )}

        {/* Written Instructions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{color: 'white', fontSize: '16px', marginBottom: '15px'}}>📖 Meditation Guide:</h4>
          {meditation.steps.map((step, idx) => (
            <div key={idx} style={{
              color: isPlaying && idx === currentStep ? '#FFD700' : (idx < currentStep ? '#888' : 'white'),
              fontSize: '14px',
              marginBottom: '12px',
              paddingLeft: '25px',
              position: 'relative',
              transition: 'color 0.3s ease',
              fontWeight: isPlaying && idx === currentStep ? 'bold' : 'normal'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: isPlaying && idx === currentStep ? '#FFD700' : '#FFB84D',
                fontWeight: 'bold'
              }}>
                {idx + 1}.
              </span>
              {step}
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Close
        </button>
      </div>
    </div>
  )
}



