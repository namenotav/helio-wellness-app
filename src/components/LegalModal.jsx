import React, { useState } from 'react'
import './LegalModal.css'

const LegalModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('manual')

  if (!isOpen) return null

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="legal-close-btn" onClick={onClose}>✕</button>
        
        <h2 className="legal-title">Legal Information</h2>
        
        <div className="legal-tabs">
          <button 
            className={`legal-tab ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            📖 User Manual
          </button>
          <button 
            className={`legal-tab ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Terms of Service
          </button>
          <button 
            className={`legal-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
          <button 
            className={`legal-tab ${activeTab === 'gdpr' ? 'active' : ''}`}
            onClick={() => setActiveTab('gdpr')}
          >
            GDPR Rights
          </button>
          <button 
            className={`legal-tab ${activeTab === 'disclaimer' ? 'active' : ''}`}
            onClick={() => setActiveTab('disclaimer')}
          >
            Medical Disclaimer
          </button>
          <button 
            className={`legal-tab ${activeTab === 'cookies' ? 'active' : ''}`}
            onClick={() => setActiveTab('cookies')}
          >
            Cookie Policy
          </button>
        </div>

        <div className="legal-content">
          {activeTab === 'manual' && <UserManual />}
          {activeTab === 'terms' && <TermsOfService />}
          {activeTab === 'privacy' && <PrivacyPolicy />}
          {activeTab === 'gdpr' && <GDPRRights />}
          {activeTab === 'disclaimer' && <MedicalDisclaimer />}
          {activeTab === 'cookies' && <CookiePolicy />}
        </div>
      </div>
    </div>
  )
}

const UserManual = () => (
  <div className="legal-section">
    <h3>📖 Helio/WellnessAI User Manual</h3>
    <p className="legal-update">Complete Guide to All Features</p>
    
    <p>Welcome to Helio/WellnessAI! This comprehensive guide will help you understand and use all the powerful features of your health and wellness companion.</p>
    
    <h4>🏠 1. Home Tab - Your Wellness Dashboard</h4>
    <p>The Home tab is your command center for daily health tracking and insights.</p>
    
    <h5>Greeting & Wellness Score</h5>
    <ul>
      <li><strong>Personalized Greeting:</strong> See your name and current time of day (morning/afternoon/evening)</li>
      <li><strong>Wellness Score:</strong> Overall health metric calculated from your activity, sleep, nutrition, and engagement</li>
      <li><strong>Level & XP:</strong> Gamification system with 20 levels - earn XP by completing activities</li>
    </ul>
    
    <h5>Quick Stats Cards</h5>
    <ul>
      <li><strong>Steps Counter:</strong> Real-time step tracking from your device's motion sensors</li>
      <li><strong>Water Intake:</strong> Log water cups throughout the day (goal: 8 cups)</li>
      <li><strong>Meals Logged:</strong> Track breakfast, lunch, dinner for complete nutrition</li>
      <li><strong>Streak Counter:</strong> Days in a row you've hit your goals - stay motivated!</li>
    </ul>
    
    <h5>Weekly Step History</h5>
    <ul>
      <li>Visual bar chart showing last 7 days of step counts</li>
      <li>Today highlighted with special styling</li>
      <li>Tap any day to see detailed breakdown</li>
    </ul>
    
    <h5>Activity Pulse 💓</h5>
    <p><strong>What it is:</strong> Real-time feed of all your recent activities with XP rewards</p>
    <p><strong>How to use:</strong></p>
    <ul>
      <li>Click "Activity Pulse" card to see full modal</li>
      <li>View all activities: steps, workouts, food, water, sleep, meditation, gratitude</li>
      <li>Each activity shows: emoji icon, description, time, and XP earned</li>
      <li>See your total XP and progress to next level</li>
      <li>Activities update in real-time as you log them</li>
    </ul>
    
    <h5>Today's Journey 📖</h5>
    <p><strong>What it is:</strong> Chronological summary of everything you've done today</p>
    <p><strong>Features:</strong></p>
    <ul>
      <li>Automatic activity logging with timestamps</li>
      <li>XP totals for each activity type</li>
      <li>Motivational messages based on your progress</li>
      <li>Empty state if no activities yet - encourages you to start!</li>
    </ul>
    
    <h5>Killer Features Section ⚡</h5>
    <p>Quick access buttons to premium features:</p>
    <ul>
      <li><strong>🧬 DNA Analysis:</strong> Upload 23andMe files for personalized genetic insights</li>
      <li><strong>📸 AR Food Scanner:</strong> Point camera at food to identify and log nutrition</li>
      <li><strong>🏃 Social Battles:</strong> Compete with friends in fitness challenges</li>
      <li><strong>🤖 Health Avatar:</strong> Visual representation of your wellness journey</li>
      <li><strong>🚨 Emergency Panel:</strong> Quick access to emergency contacts and SOS features</li>
      <li><strong>🍽️ Meal Automation:</strong> AI-powered meal planning and prep suggestions</li>
      <li><strong>💰 Insurance Rewards:</strong> Coming Soon - Save money on health insurance</li>
    </ul>
    
    <h4>🎤 2. Voice Tab - AI Coach</h4>
    <p>Your personal AI-powered health coach with voice interaction.</p>
    
    <h5>AI Voice Coach Features</h5>
    <ul>
      <li><strong>Tap to Talk:</strong> Hold the microphone button and speak your question</li>
      <li><strong>Text Input:</strong> Type your message in the input field if you prefer typing</li>
      <li><strong>Quick Questions:</strong> Tap pre-written suggestions like "What should I eat for lunch?" or "How am I doing today?"</li>
      <li><strong>Conversation History:</strong> Scroll through your chat history with timestamps</li>
      <li><strong>Nicole Voice:</strong> Responses are spoken aloud using ElevenLabs Nicole voice</li>
      <li><strong>Click to Replay:</strong> Tap any AI message (sparkle ✨ icon) to hear it again</li>
    </ul>
    
    <h5>What You Can Ask</h5>
    <ul>
      <li>"What should I eat for lunch?" - Get meal suggestions based on your nutrition goals</li>
      <li>"How am I doing today?" - Get summary of your daily progress and wellness</li>
      <li>"Show me my progress" - See detailed stats and achievements</li>
      <li>"Give me a workout routine" - Get personalized exercise recommendations</li>
      <li>"I feel tired, what should I do?" - Get energy-boosting tips</li>
      <li>"Analyze my DNA results" - If you uploaded DNA, get genetic insights</li>
      <li>Any health, fitness, or nutrition question!</li>
    </ul>
    
    <h5>AI Limitations</h5>
    <ul>
      <li>⚠️ AI is NOT a doctor - always consult healthcare professionals</li>
      <li>Responses are general information, not personalized medical advice</li>
      <li>AI can make mistakes - verify important information</li>
      <li>Internet connection required for AI features</li>
    </ul>
    
    <h4>📸 3. Scan Tab - AI Vision Features</h4>
    <p>Advanced computer vision for food tracking and health monitoring.</p>
    
    <h5>Food Scanner 🍕</h5>
    <p><strong>How to use:</strong></p>
    <ol>
      <li>Tap the Scan tab at bottom</li>
      <li>Point your camera at any food item</li>
      <li>App automatically identifies the food using AI</li>
      <li>See nutritional breakdown: calories, protein, carbs, fats</li>
      <li>Adjust portion size (small/medium/large)</li>
      <li>Tap "Log Food" to add to your daily nutrition tracking</li>
    </ol>
    <p><strong>What it recognizes:</strong></p>
    <ul>
      <li>Fruits, vegetables, meats, grains</li>
      <li>Packaged foods with visible labels</li>
      <li>Restaurant meals and dishes</li>
      <li>Snacks, desserts, beverages</li>
      <li>Over 10,000 food items in database</li>
    </ul>
    
    <h5>AR Scanner Features (Advanced)</h5>
    <ul>
      <li>Augmented Reality overlay on camera view</li>
      <li>Real-time nutritional information display</li>
      <li>Barcode scanning for packaged foods</li>
      <li>Ingredient analysis and allergen warnings</li>
    </ul>
    
    <h4>🧘 4. Zen Tab - Mindfulness & Meditation</h4>
    <p>Your mental wellness sanctuary with multiple relaxation techniques.</p>
    
    <h5>Breathing Exercises 🫁</h5>
    <p><strong>5 Scientifically-Proven Patterns:</strong></p>
    <ul>
      <li><strong>Box Breathing (4-4-4-4):</strong> Military technique for focus and stress relief - 4 sec inhale, 4 hold, 4 exhale, 4 hold</li>
      <li><strong>4-7-8 Relaxation:</strong> Fall asleep faster - 4 sec inhale, 7 hold, 8 exhale</li>
      <li><strong>Coherent Breathing (5-5):</strong> Balance nervous system - 5 sec inhale, 5 exhale</li>
      <li><strong>Energizing Breath (4-4-6-2):</strong> Boost energy naturally - quick pattern for morning</li>
      <li><strong>Deep Relaxation (4-4-8-4):</strong> Maximum calm - longer exhales activate parasympathetic system</li>
    </ul>
    <p><strong>How to use:</strong></p>
    <ol>
      <li>Tap "Breathing Exercises" button</li>
      <li>Choose a pattern based on your goal</li>
      <li>Follow the visual circle animation (expand = inhale, contract = exhale)</li>
      <li>Listen to Nicole's voice guidance for perfect timing</li>
      <li>Complete 5-10 cycles for best results</li>
      <li>Earn XP for each session!</li>
    </ol>
    
    <h5>Stress Relief Techniques 😌</h5>
    <p><strong>7 Professional Relaxation Methods:</strong></p>
    <ul>
      <li><strong>Progressive Muscle Relaxation (PMR):</strong> Tense and release muscle groups systematically</li>
      <li><strong>4-7-8 Breathing:</strong> Quick stress reset in 2 minutes</li>
      <li><strong>Body Scan Meditation:</strong> Mental journey through your body to release tension</li>
      <li><strong>Autogenic Training:</strong> Self-hypnosis for deep relaxation</li>
      <li><strong>5-4-3-2-1 Grounding:</strong> Anxiety relief using your 5 senses</li>
      <li><strong>Mindful Breathing:</strong> Focus on breath to calm racing thoughts</li>
      <li><strong>Safe Place Visualization:</strong> Imagine your perfect peaceful sanctuary</li>
    </ul>
    <p><strong>Each technique includes:</strong></p>
    <ul>
      <li>Audio guidance with Nicole's soothing voice</li>
      <li>Written step-by-step instructions</li>
      <li>Highlighted current step during practice</li>
      <li>3-10 minute duration options</li>
    </ul>
    
    <h5>Guided Meditation 🧘‍♀️</h5>
    <p><strong>8 Empowering Meditations:</strong></p>
    <ul>
      <li><strong>Morning Energy Boost:</strong> Start your day with power and positivity</li>
      <li><strong>Inner Power Activation:</strong> Connect with your core strength</li>
      <li><strong>Confidence Builder:</strong> Overcome self-doubt and fears</li>
      <li><strong>Quick Energy Reset:</strong> 5-minute recharge for busy days</li>
      <li><strong>Warrior Mindset:</strong> Mental toughness and resilience</li>
      <li><strong>Chakra Activation:</strong> Balance your energy centers</li>
      <li><strong>Positive Affirmation Practice:</strong> Rewire your mindset</li>
      <li><strong>Mountain Strength:</strong> Embody stability and unshakeable peace</li>
    </ul>
    <p><strong>Features:</strong></p>
    <ul>
      <li>5-15 minute guided sessions</li>
      <li>Background music and nature sounds</li>
      <li>Audio + text instructions</li>
      <li>Progress tracking with current step highlighting</li>
      <li>Earn meditation XP and achievements</li>
    </ul>
    
    <h5>Gratitude Journal 📓</h5>
    <p><strong>Daily Gratitude Practice:</strong></p>
    <ul>
      <li><strong>Write Entry:</strong> Express what you're thankful for (earn +10 XP per entry)</li>
      <li><strong>Random Prompts:</strong> 8 inspiring prompts like "What made you smile today?" or "Who are you thankful for?"</li>
      <li><strong>View Entries:</strong> See all past gratitude entries with timestamps</li>
      <li><strong>Edit & Delete:</strong> Manage your journal entries</li>
      <li><strong>Character Counter:</strong> Track entry length (recommended 50-500 chars)</li>
    </ul>
    <p><strong>Benefits:</strong></p>
    <ul>
      <li>Proven to increase happiness and reduce depression</li>
      <li>Improves sleep quality and relationships</li>
      <li>Builds resilience and positive mindset</li>
      <li>Creates lasting record of positive moments</li>
    </ul>
    
    <h4>👤 5. Me Tab - Profile & Settings</h4>
    <p>Customize your experience and track your journey.</p>
    
    <h5>Profile Information</h5>
    <ul>
      <li><strong>Name & Photo:</strong> Personalize your profile</li>
      <li><strong>Age, Height, Weight:</strong> Used for accurate calorie and fitness calculations</li>
      <li><strong>Fitness Goals:</strong> Weight loss, muscle gain, maintenance, or general health</li>
      <li><strong>Activity Level:</strong> Sedentary, lightly active, moderately active, very active, athlete</li>
    </ul>
    
    <h5>Full Statistics Modal 📊</h5>
    <p>Comprehensive breakdown of all your health metrics:</p>
    <ul>
      <li><strong>Activity:</strong> Steps, workouts, active minutes, calories burned</li>
      <li><strong>Nutrition:</strong> Calories consumed, macros (protein/carbs/fats), water intake</li>
      <li><strong>Sleep:</strong> Hours slept, sleep quality score, sleep patterns</li>
      <li><strong>Mental Wellness:</strong> Meditation minutes, stress levels, mood tracking</li>
      <li><strong>Gamification:</strong> Current level, total XP, achievements unlocked, streak days</li>
      <li><strong>Weekly Trends:</strong> Charts showing your progress over time</li>
    </ul>
    
    <h5>Settings ⚙️</h5>
    <ul>
      <li><strong>Notifications:</strong> Customize reminders for water, meals, exercise, meditation</li>
      <li><strong>Theme:</strong> Choose color schemes (coming soon: dark mode)</li>
      <li><strong>Units:</strong> Metric (kg, cm) or Imperial (lbs, inches)</li>
      <li><strong>Privacy:</strong> Manage data sharing and permissions</li>
      <li><strong>Sync Settings:</strong> Connect to Apple Health or Google Fit</li>
    </ul>
    
    <h5>Account Actions</h5>
    <ul>
      <li><strong>Export Data:</strong> Download all your data in JSON format</li>
      <li><strong>Clear Cache:</strong> Free up storage space</li>
      <li><strong>Delete Account:</strong> Permanently remove all data (cannot be undone)</li>
      <li><strong>Logout:</strong> Sign out of your account</li>
    </ul>
    
    <h4>🎮 6. Gamification System</h4>
    <p>Earn XP and level up by completing activities!</p>
    
    <h5>XP Earning Activities</h5>
    <ul>
      <li><strong>Steps:</strong> +1 XP per 1,000 steps</li>
      <li><strong>Workouts:</strong> +50 XP per session</li>
      <li><strong>Food Logging:</strong> +10 XP per meal</li>
      <li><strong>Water Intake:</strong> +5 XP per cup</li>
      <li><strong>Sleep Tracking:</strong> +30 XP for 7+ hours</li>
      <li><strong>Meditation:</strong> +25 XP per session</li>
      <li><strong>Breathing Exercises:</strong> +15 XP per session</li>
      <li><strong>Gratitude Journal:</strong> +10 XP per entry</li>
      <li><strong>DNA Upload:</strong> +100 XP (one-time)</li>
      <li><strong>Streak Bonuses:</strong> +50 XP for 7-day streak, +100 XP for 30 days</li>
    </ul>
    
    <h5>Levels & Milestones</h5>
    <ul>
      <li><strong>20 Levels Total:</strong> From Beginner (Level 1) to Wellness Master (Level 20)</li>
      <li><strong>XP Requirements:</strong> Level 1 = 0 XP, Level 2 = 100 XP, increasing progressively</li>
      <li><strong>Level Up Rewards:</strong> Unlock new features, badges, and achievements</li>
      <li><strong>Confetti Animation:</strong> Celebrate every level up with visual effects</li>
    </ul>
    
    <h5>Achievements & Badges</h5>
    <ul>
      <li>🏃 First Steps - Log your first 1,000 steps</li>
      <li>🍎 Nutrition Rookie - Log your first meal</li>
      <li>💧 Hydration Hero - Drink 8 cups in one day</li>
      <li>😴 Sleep Champion - Get 8+ hours of sleep</li>
      <li>🧘 Zen Master - Complete 10 meditation sessions</li>
      <li>🔥 7-Day Streak - Stay consistent for a week</li>
      <li>⚡ 30-Day Warrior - Complete 30-day streak</li>
      <li>🧬 DNA Explorer - Upload genetic data</li>
    </ul>
    
    <h4>🧬 7. DNA Analysis Features</h4>
    <p>Upload genetic data from 23andMe or similar services for personalized insights.</p>
    
    <h5>How to Upload DNA Data</h5>
    <ol>
      <li>Download your raw DNA file from 23andMe, Ancestry.com, or similar service</li>
      <li>Tap "DNA Analysis" button on Home tab</li>
      <li>Click "Upload DNA File"</li>
      <li>Select your .txt or .csv file</li>
      <li>Wait for analysis (takes 30-60 seconds)</li>
      <li>View your personalized genetic insights</li>
    </ol>
    
    <h5>DNA Insights Provided</h5>
    <ul>
      <li><strong>Fitness Genetics:</strong> Muscle fiber type, endurance capacity, injury risk</li>
      <li><strong>Nutrition Genetics:</strong> Lactose tolerance, caffeine metabolism, vitamin needs</li>
      <li><strong>Health Risks:</strong> Predisposition to conditions (NOT diagnostic - informational only)</li>
      <li><strong>Ancestry & Traits:</strong> Eye color, hair type, taste preferences</li>
      <li><strong>Personalized Recommendations:</strong> Diet and exercise plans based on your genes</li>
    </ul>
    
    <h5>⚠️ IMPORTANT DNA Disclaimers</h5>
    <ul>
      <li>Results are for INFORMATIONAL PURPOSES ONLY - not medical diagnosis</li>
      <li>Genetic predisposition ≠ destiny - lifestyle matters more</li>
      <li>Always discuss results with genetic counselor or doctor</li>
      <li>Your DNA is NEVER sold to third parties</li>
      <li>Data is encrypted and stored securely</li>
      <li>You can delete your DNA data anytime from settings</li>
    </ul>
    
    <h4>🤝 8. Social Features</h4>
    
    <h5>Social Battles ⚔️</h5>
    <ul>
      <li><strong>Challenge Friends:</strong> Compete in step contests, workout challenges, and wellness battles</li>
      <li><strong>Leaderboards:</strong> See who's leading in daily steps, weekly workouts, or monthly streaks</li>
      <li><strong>Team Challenges:</strong> Join or create team challenges with multiple participants</li>
      <li><strong>Friendly Trash Talk:</strong> Send motivational (or competitive) messages to friends</li>
      <li><strong>Achievement Sharing:</strong> Share your wins on social media</li>
    </ul>
    
    <h4>🚨 9. Emergency Features</h4>
    
    <h5>Emergency Panel</h5>
    <ul>
      <li><strong>Emergency Contacts:</strong> Quick dial your pre-configured emergency contacts</li>
      <li><strong>SOS Button:</strong> Sends location and health data to emergency contacts</li>
      <li><strong>Medical ID:</strong> Display critical medical information for first responders</li>
      <li><strong>Allergy Alerts:</strong> Lists your allergies, medications, and conditions</li>
    </ul>
    
    <h4>💡 10. Tips for Getting the Most from Helio/WellnessAI</h4>
    
    <h5>Daily Routine Suggestions</h5>
    <ul>
      <li><strong>Morning (7-9 AM):</strong> Log breakfast, do 5-min energizing meditation, check your wellness score</li>
      <li><strong>Midday (12-2 PM):</strong> Log lunch, take a walk (get those steps!), drink water</li>
      <li><strong>Afternoon (3-4 PM):</strong> Quick breathing exercise for energy boost, scan and log snacks</li>
      <li><strong>Evening (6-8 PM):</strong> Log dinner, do a workout, earn XP</li>
      <li><strong>Night (9-10 PM):</strong> Gratitude journal entry, relaxation meditation, sleep tracking</li>
    </ul>
    
    <h5>Maximize XP Gains</h5>
    <ul>
      <li>Log EVERYTHING - food, water, activities all earn XP</li>
      <li>Complete daily challenges for bonus XP</li>
      <li>Maintain your streak - consistency = big XP multipliers</li>
      <li>Try new features - first-time bonuses available</li>
      <li>Compete in social battles for competitive XP rewards</li>
    </ul>
    
    <h5>Data Accuracy Tips</h5>
    <ul>
      <li>Keep your phone with you during the day for accurate step counting</li>
      <li>Manually log workouts that don't involve phone (swimming, cycling)</li>
      <li>Scan food immediately after meals for timely nutrition tracking</li>
      <li>Update your weight weekly for accurate calorie calculations</li>
      <li>Enable location services for GPS-tracked outdoor activities</li>
    </ul>
    
    <h4>🆘 11. Troubleshooting & FAQs</h4>
    
    <h5>Common Issues</h5>
    <ul>
      <li><strong>Steps not counting?</strong> Check phone permissions for motion sensors, keep phone with you, restart app</li>
      <li><strong>AI not responding?</strong> Check internet connection, verify you're not rate-limited, try again in few minutes</li>
      <li><strong>Food scanner not working?</strong> Ensure good lighting, clean camera lens, hold phone steady</li>
      <li><strong>Voice not playing?</strong> Check volume settings, verify Nicole voice files downloaded, restart app</li>
      <li><strong>Data not syncing?</strong> Check internet connection, log out and log back in, clear cache</li>
    </ul>
    
    <h5>Performance Optimization</h5>
    <ul>
      <li>Clear cache weekly: Settings → Clear Cache</li>
      <li>Export data monthly for backups</li>
      <li>Keep app updated to latest version</li>
      <li>Free up phone storage if app is slow</li>
      <li>Close and restart app if experiencing bugs</li>
    </ul>
    
    <h4>📞 12. Support & Contact</h4>
    
    <h5>Get Help</h5>
    <ul>
      <li><strong>Email Support:</strong> support@wellnessai.app or support@helio.app</li>
      <li><strong>Legal Questions:</strong> legal@wellnessai.app</li>
      <li><strong>Privacy Concerns:</strong> privacy@wellnessai.app</li>
      <li><strong>Technical Issues:</strong> tech@wellnessai.app</li>
      <li><strong>Response Time:</strong> Within 24-48 hours for support requests</li>
    </ul>
    
    <h5>Additional Resources</h5>
    <ul>
      <li>Website: www.wellnessai.app</li>
      <li>Video Tutorials: YouTube channel (search "Helio WellnessAI")</li>
      <li>Community Forum: community.wellnessai.app</li>
      <li>Social Media: @HelioWellnessAI on Instagram, Twitter, Facebook</li>
    </ul>
    
    <p className="legal-emphasis"><strong>🎉 Congratulations! You now know how to use every feature of Helio/WellnessAI. Start your wellness journey today and level up your health! Remember: consistency is key - small daily actions lead to big transformations. You've got this, Champion! 💪</strong></p>
  </div>
)

const TermsOfService = () => (
  <div className="legal-section">
    <h3>Terms of Service</h3>
    <p className="legal-update">Last Updated: November 30, 2025</p>
    
    <p className="legal-emphasis"><strong>IMPORTANT LEGAL NOTICE: By using this application, you acknowledge that Helio/WellnessAI and all associated entities, developers, contractors, employees, and affiliates SHALL NOT BE HELD LIABLE for any damages, injuries, losses, or consequences of any kind resulting from your use of this application.</strong></p>
    
    <h4>1. Acceptance of Terms</h4>
    <p>By downloading, accessing, installing, or using Helio/WellnessAI (collectively referred to as "the App," "the Application," "the Service," or "the Platform"), you ("User," "you," or "your") explicitly accept, acknowledge, and agree to be legally bound by these Terms of Service ("Terms," "Agreement," or "TOS") in their entirety, without modification, reservation, or exception.</p>
    <p>These Terms constitute a legally binding contract between you and Helio/WellnessAI, its parent company, subsidiaries, affiliates, partners, licensors, service providers, contractors, employees, officers, directors, agents, and any related entities (collectively "Company," "we," "us," or "our").</p>
    <p><strong>IF YOU DO NOT AGREE TO ALL TERMS AND CONDITIONS SET FORTH IN THIS AGREEMENT, YOU MUST IMMEDIATELY CEASE ALL USE OF THE APPLICATION AND UNINSTALL IT FROM YOUR DEVICE. CONTINUED USE CONSTITUTES ACCEPTANCE OF ALL TERMS.</strong></p>
    
    <h4>2. Description of Service</h4>
    <p>Helio/WellnessAI is a wellness, fitness, and health information tracking application that provides various features including, but not strictly limited to:</p>
    <ul>
      <li>Physical activity tracking, step counting, and movement monitoring</li>
      <li>Artificial Intelligence-powered health information, suggestions, and coaching (NOT medical advice)</li>
      <li>Food recognition technology and nutritional information estimates</li>
      <li>DNA data file upload and algorithmic analysis for informational purposes only</li>
      <li>Guided meditation, breathing exercises, and relaxation techniques</li>
      <li>Gamification elements including points, levels, achievements, and social features</li>
      <li>Sleep tracking estimates and wellness scoring</li>
      <li>Heart rate monitoring (estimates only, not medical-grade)</li>
      <li>Water intake logging and reminders</li>
      <li>Emergency contact features and safety tools</li>
    </ul>
    <p><strong>DISCLAIMER: All services are provided "AS IS" and "AS AVAILABLE" without any warranties, representations, or guarantees of accuracy, reliability, completeness, or fitness for any particular purpose. Helio/WellnessAI makes NO WARRANTIES, express or implied, regarding service quality, uptime, data accuracy, or results.</strong></p>
    
    <h4>3. User Accounts and Registration</h4>
    <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.</p>
    
    <h4>4. User Responsibilities</h4>
    <p>You agree to:</p>
    <ul>
      <li>Provide accurate, current, and complete information</li>
      <li>Maintain and promptly update your account information</li>
      <li>Not impersonate any person or entity</li>
      <li>Not use the App for any illegal or unauthorized purpose</li>
      <li>Not interfere with or disrupt the App's functionality</li>
      <li>Not attempt to gain unauthorized access to any portion of the App</li>
    </ul>
    
    <h4>5. Health Data, DNA Information, and Critical Disclaimers</h4>
    <p>You acknowledge and understand that you retain ownership rights to your health data and DNA information. However, by uploading, inputting, or allowing collection of such data through the App, you grant Helio/WellnessAI a worldwide, perpetual, irrevocable, royalty-free, non-exclusive license to use, process, analyze, store, and display this data solely for the purposes of:</p>
    <ul>
      <li>Providing the core App functionality and features</li>
      <li>Generating personalized insights and recommendations</li>
      <li>Improving AI algorithms and service quality (in anonymized, aggregated form)</li>
      <li>Complying with legal obligations</li>
    </ul>
    <p><strong>DNA DATA CRITICAL WARNINGS:</strong></p>
    <ul>
      <li>DNA analysis provided by Helio/WellnessAI is for INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY</li>
      <li>Results are NOT clinical-grade, NOT FDA-approved, NOT diagnostically validated, and NOT intended for medical decision-making</li>
      <li>Helio/WellnessAI is NOT a clinical laboratory, NOT CLIA-certified, NOT accredited for diagnostic testing, and NOT staffed by medical geneticists</li>
      <li>DNA interpretations may be INCORRECT, INCOMPLETE, OUTDATED, or BASED ON LIMITED SCIENTIFIC EVIDENCE</li>
      <li>Genetic science is constantly evolving; today's interpretations may be contradicted by future research</li>
      <li>We NEVER sell your raw DNA data to third parties for commercial purposes</li>
      <li>However, we may share ANONYMIZED, AGGREGATED genetic data for research purposes without personal identifiers</li>
    </ul>
    <p><strong>YOU ASSUME ALL RISKS associated with uploading DNA data. Helio/WellnessAI is NOT responsible for:</strong></p>
    <ul>
      <li>Psychological distress from genetic findings</li>
      <li>Family relationship discoveries or disputes</li>
      <li>Insurance or employment discrimination based on genetic information</li>
      <li>Data breaches involving your DNA data</li>
      <li>Misuse of DNA data by third parties</li>
      <li>Legal or ethical implications of genetic testing in your jurisdiction</li>
    </ul>
    <p><strong>HEALTH DATA COLLECTION DISCLAIMER:</strong> All health metrics (steps, heart rate, sleep, calories, etc.) are ESTIMATES based on algorithms and sensors. Accuracy is NOT guaranteed. Helio/WellnessAI is not responsible for inaccuracies in tracking or resulting decisions based on this data.</p>
    
    <h4>6. AI-Generated Content and Technology Limitations</h4>
    <p>Helio/WellnessAI utilizes third-party artificial intelligence services, including but not limited to Google's Gemini AI, for generating responses, recommendations, and insights. You acknowledge and agree to the following:</p>
    <p><strong>AI LIMITATIONS AND DISCLAIMERS:</strong></p>
    <ul>
      <li><strong>No Medical Advice:</strong> AI-generated content is NOT medical advice, NOT clinical guidance, and NOT a substitute for consultation with licensed healthcare professionals</li>
      <li><strong>Accuracy Not Guaranteed:</strong> AI can and does make mistakes, hallucinate information, provide outdated data, misinterpret context, or generate completely incorrect responses</li>
      <li><strong>General Information Only:</strong> AI responses are general in nature and cannot account for your unique medical history, current health status, medications, allergies, genetic factors, or individual circumstances</li>
      <li><strong>Not Personalized Medical Care:</strong> Despite claims of "personalization," AI cannot replicate the expertise, judgment, intuition, or ethical obligations of a licensed medical professional</li>
      <li><strong>Training Data Limitations:</strong> AI is trained on historical data that may be biased, incomplete, culturally insensitive, or not representative of your demographic</li>
      <li><strong>No Liability for AI Errors:</strong> Helio/WellnessAI is NOT responsible for any consequences resulting from following, relying upon, or acting on AI-generated recommendations</li>
      <li><strong>Third-Party AI Services:</strong> We use Google Gemini AI, which is governed by Google's own terms. We have no control over Google's AI model, training data, algorithms, or accuracy</li>
      <li><strong>AI May Malfunction:</strong> AI services may experience outages, errors, bugs, corrupted outputs, inappropriate responses, or complete failures</li>
    </ul>
    <p><strong>YOUR RESPONSIBILITIES WHEN USING AI FEATURES:</strong></p>
    <ul>
      <li>ALWAYS verify AI-generated information with qualified healthcare providers before taking any action</li>
      <li>NEVER rely solely on AI for urgent medical decisions or emergencies</li>
      <li>NEVER use AI recommendations as a replacement for professional medical diagnosis or treatment</li>
      <li>NEVER follow AI advice that contradicts your doctor's instructions</li>
      <li>ALWAYS exercise critical thinking and common sense when evaluating AI responses</li>
      <li>Understand that AI cannot see you, examine you, or truly understand your individual health situation</li>
    </ul>
    <p><strong>BY USING AI FEATURES, YOU RELEASE Helio/WellnessAI AND GOOGLE LLC FROM ALL LIABILITY ARISING FROM AI-GENERATED CONTENT, INCLUDING INCORRECT, HARMFUL, MISLEADING, OR DANGEROUS INFORMATION.</strong></p>
    
    <h4>7. Subscription and Payments</h4>
    <p>Some features may require a paid subscription. Subscription fees are charged in advance on a recurring basis. You can cancel your subscription at any time, but refunds are not provided for partial subscription periods.</p>
    
    <h4>8. Intellectual Property</h4>
    <p>All content, features, and functionality of the App are owned by WellnessAI and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the App.</p>
    
    <h4>9. Third-Party Services</h4>
    <p>The App may integrate with third-party services (e.g., Google Gemini AI, ElevenLabs voice). Your use of these services is subject to their respective terms and conditions.</p>
    
    <h4>10. Limitation of Liability and Release of Claims</h4>
    <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</strong></p>
    <p>Helio/WellnessAI, including all owners, shareholders, investors, parent companies, subsidiaries, affiliates, partners, licensors, service providers (including Google LLC for Gemini AI services, ElevenLabs for voice services, and any other third-party providers), officers, directors, employees, contractors, agents, attorneys, accountants, consultants, successors, and assigns (collectively "Released Parties") SHALL NOT BE LIABLE FOR ANY DAMAGES OR LOSSES OF ANY KIND, including but not limited to:</p>
    <ul>
      <li><strong>Direct damages:</strong> Including monetary losses, data loss, property damage, device damage, or any tangible losses</li>
      <li><strong>Indirect damages:</strong> Including lost profits, lost opportunities, business interruption, loss of goodwill, or reputational harm</li>
      <li><strong>Incidental damages:</strong> Including costs of procurement of substitute goods or services</li>
      <li><strong>Consequential damages:</strong> Including any damages resulting from reliance on the App's information, recommendations, or features</li>
      <li><strong>Punitive or exemplary damages:</strong> Under any legal theory</li>
      <li><strong>Personal injury or death:</strong> Including injuries sustained during exercise, physical activity, or following App recommendations</li>
      <li><strong>Health complications:</strong> Including adverse health outcomes, worsening of existing conditions, delayed diagnosis, misdiagnosis, medication interactions, allergic reactions, or any health deterioration</li>
      <li><strong>Mental or emotional distress:</strong> Including anxiety, depression, stress, or psychological harm</li>
      <li><strong>Data breaches or security incidents:</strong> Including unauthorized access, data theft, identity theft, or privacy violations</li>
      <li><strong>Third-party actions:</strong> Including actions by other users, hackers, or external parties</li>
      <li><strong>Force majeure events:</strong> Including natural disasters, pandemics, wars, terrorism, governmental actions, or other events beyond our control</li>
      <li><strong>Service interruptions:</strong> Including downtime, data loss, corrupted files, or service unavailability</li>
      <li><strong>Inaccurate information:</strong> Including AI errors, miscalculations, wrong nutritional data, incorrect DNA interpretations, or false health insights</li>
      <li><strong>Reliance on App features:</strong> Including medical decisions made based on App data or recommendations</li>
    </ul>
    <p><strong>THIS LIMITATION OF LIABILITY APPLIES REGARDLESS OF THE LEGAL THEORY UPON WHICH LIABILITY IS BASED, INCLUDING BUT NOT LIMITED TO:</strong></p>
    <ul>
      <li>Breach of contract or warranty</li>
      <li>Negligence (including gross negligence)</li>
      <li>Strict liability</li>
      <li>Product liability</li>
      <li>Tort (including misrepresentation)</li>
      <li>Statutory liability</li>
      <li>Any other legal or equitable theory</li>
    </ul>
    <p><strong>EVEN IF Helio/WellnessAI HAS BEEN ADVISED OF, KNEW OF, OR SHOULD HAVE KNOWN OF THE POSSIBILITY OF SUCH DAMAGES.</strong></p>
    <p>To the extent permitted by law, our total aggregate liability to you for all claims arising from or related to the App, under any cause of action or theory of liability, shall not exceed the LESSER of: (a) the total amount you paid to Helio/WellnessAI in subscription fees during the 12 months immediately preceding the claim, OR (b) $100 USD.</p>
    <p>If you paid no subscription fees, our total liability shall be ZERO DOLLARS ($0.00).</p>
    <p><strong>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES. IN SUCH JURISDICTIONS, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.</strong></p>
    
    <h4>11. Indemnification and Hold Harmless Agreement</h4>
    <p><strong>YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS</strong> Helio/WellnessAI and all Released Parties (as defined above) from and against ANY AND ALL claims, demands, liabilities, costs, expenses, losses, damages, and attorney fees arising from or related to:</p>
    <ul>
      <li>Your use or misuse of the App</li>
      <li>Your violation of these Terms of Service</li>
      <li>Your violation of any applicable laws, regulations, or third-party rights</li>
      <li>Your health decisions made based on App data or recommendations</li>
      <li>Injuries, illnesses, or health complications you experience</li>
      <li>Your uploaded content, including DNA data, health information, or user-generated content</li>
      <li>Your interactions with other users or third parties through the App</li>
      <li>Claims by third parties arising from your use of the App</li>
      <li>Any breach of your representations, warranties, or obligations under these Terms</li>
    </ul>
    <p>This indemnification obligation shall survive termination of these Terms and your use of the App.</p>
    
    <h4>12. Assumption of Risk and Waiver</h4>
    <p><strong>YOU EXPRESSLY ACKNOWLEDGE, UNDERSTAND, AND AGREE THAT:</strong></p>
    <ul>
      <li>Use of Helio/WellnessAI involves inherent and unavoidable risks</li>
      <li>Physical activity and exercise recommended or tracked by the App carry risks of injury, including serious injury or death</li>
      <li>Reliance on health information, AI recommendations, or tracking data may lead to adverse health outcomes</li>
      <li>DNA analysis may reveal disturbing or unwanted information about your health, ancestry, or family relationships</li>
      <li>Data security cannot be guaranteed; your information may be compromised despite our security measures</li>
    </ul>
    <p><strong>YOU VOLUNTARILY ASSUME ALL RISKS</strong> associated with using the App, including risks that are known and unknown, foreseen and unforeseen, and you agree that Helio/WellnessAI shall NOT be responsible for any injuries, damages, or losses you may sustain.</p>
    <p><strong>YOU HEREBY WAIVE, RELEASE, AND FOREVER DISCHARGE</strong> all Released Parties from any and all claims, demands, or causes of action arising from your use of the App, to the fullest extent permitted by law.</p>
    
    <h4>13. Termination Rights</h4>
    <p>Helio/WellnessAI reserves the absolute right to terminate, suspend, restrict, or deny access to your account and the App, at any time, for any reason or no reason, with or without notice, and with or without cause. Grounds for termination include, but are not limited to:</p>
    <ul>
      <li>Violation of these Terms of Service</li>
      <li>Fraudulent, abusive, or illegal activity</li>
      <li>Harm to other users, the Company, or third parties</li>
      <li>Suspected security risks or account compromise</li>
      <li>Discontinuation of the Service or specific features</li>
      <li>Business or operational reasons</li>
    </ul>
    <p>Upon termination, you must immediately cease all use of the App and destroy all copies in your possession. Sections of these Terms that by their nature should survive termination shall survive, including but not limited to: disclaimers, limitations of liability, indemnification, and dispute resolution provisions.</p>
    <p><strong>NO REFUNDS:</strong> Subscription fees are non-refundable, even if your account is terminated before the subscription period ends, except where prohibited by law.</p>
    
    <h4>14. Changes to Terms and Acceptance</h4>
    <p>Helio/WellnessAI reserves the right to modify, amend, update, or replace these Terms of Service at any time, at its sole discretion, without prior notice. Changes become effective immediately upon posting to the App or website. We may (but are not obligated to) notify users of material changes via:</p>
    <ul>
      <li>In-app notifications or alerts</li>
      <li>Email to your registered email address</li>
      <li>Posting to our website or social media</li>
    </ul>
    <p><strong>YOUR CONTINUED USE OF THE APP AFTER ANY CHANGES CONSTITUTES YOUR BINDING ACCEPTANCE OF THE REVISED TERMS.</strong> If you do not agree to the revised Terms, you must immediately stop using the App and uninstall it from your device.</p>
    <p>It is YOUR responsibility to review these Terms periodically. We are not responsible for your failure to review updated Terms.</p>
    
    <h4>15. Dispute Resolution, Arbitration, and Class Action Waiver</h4>
    <p><strong>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.</strong></p>
    <p><strong>BINDING ARBITRATION:</strong> Any dispute, controversy, or claim arising out of or relating to these Terms, the App, or your use thereof (including any claimed breach, termination, or interpretation) shall be resolved exclusively through binding arbitration, rather than in court, except where prohibited by law.</p>
    <p>Arbitration shall be conducted by a single arbitrator under the rules of a recognized arbitration organization. The arbitrator's decision shall be final and binding, and judgment may be entered in any court of competent jurisdiction.</p>
    <p><strong>CLASS ACTION WAIVER:</strong> YOU AGREE THAT DISPUTES MUST BE BROUGHT SOLELY ON AN INDIVIDUAL BASIS AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.</p>
    <p><strong>JURY TRIAL WAIVER:</strong> To the fullest extent permitted by law, you and Helio/WellnessAI waive any right to a trial by jury for any disputes.</p>
    <p><strong>TIME LIMITATION ON CLAIMS:</strong> Any claim arising from use of the App must be filed within ONE (1) YEAR of the event giving rise to the claim, or the claim is permanently barred.</p>
    
    <h4>16. Governing Law and Jurisdiction</h4>
    <p>These Terms shall be governed by and construed in accordance with the laws of [INSERT JURISDICTION], without regard to its conflict of law provisions. To the extent arbitration does not apply, you consent to the exclusive jurisdiction and venue of courts located in [INSERT JURISDICTION] for any legal proceedings.</p>
    <p>If you are located outside [INSERT JURISDICTION], you acknowledge that data may be transferred to and processed in countries with different data protection laws than your own. By using the App, you consent to such transfers.</p>
    
    <h4>17. Severability and Entire Agreement</h4>
    <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court or arbitrator, such provision shall be modified to the minimum extent necessary to make it valid and enforceable. If modification is not possible, such provision shall be severed, and the remaining provisions shall continue in full force and effect.</p>
    <p>These Terms, together with our Privacy Policy, GDPR Rights, Medical Disclaimer, and Cookie Policy (collectively, the "Agreement"), constitute the entire agreement between you and Helio/WellnessAI regarding use of the App, and supersede all prior agreements, understandings, representations, and warranties, whether written or oral.</p>
    <p>No waiver of any provision of these Terms shall constitute a waiver of any other provision or any subsequent waiver of the same provision.</p>
    
    <h4>18. Force Majeure</h4>
    <p>Helio/WellnessAI shall not be liable for any failure or delay in performance due to causes beyond our reasonable control, including but not limited to: acts of God, natural disasters, pandemics, epidemics, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, network infrastructure failures, strikes, labor disputes, shortages of materials or equipment, cyberattacks, government regulations, or any other event beyond our control.</p>
    
    <h4>19. No Professional Relationship</h4>
    <p>Your use of Helio/WellnessAI does NOT create any doctor-patient relationship, therapist-client relationship, genetic counselor-client relationship, nutritionist-client relationship, or any other professional relationship between you and the Company or any third parties. We are NOT your healthcare provider and do not assume any duties owed by healthcare providers to patients.</p>
    
    <h4>20. Export Control and Compliance</h4>
    <p>You agree to comply with all applicable export and import laws and regulations. You represent that you are not located in, or a national of, any country subject to economic sanctions or embargoes. You agree not to use the App in violation of any export restrictions.</p>
    
    <h4>21. Contact Information and Legal Notices</h4>
    <p>For questions, concerns, or legal notices regarding these Terms, please contact us at:</p>
    <p><strong>Legal Department - Helio/WellnessAI</strong><br/>
    Email: <strong>legal@wellnessai.app</strong><br/>
    Email: <strong>legal@helio.app</strong><br/>
    Response Time: We will respond to legal inquiries within 30 business days.</p>
    
    <p className="legal-emphasis"><strong>FINAL ACKNOWLEDGMENT: BY CLICKING "I ACCEPT," CREATING AN ACCOUNT, OR USING THE APP, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE IN THEIR ENTIRETY. YOU ACKNOWLEDGE THAT Helio/WellnessAI SHALL NOT BE LIABLE FOR ANY DAMAGES, LOSSES, OR INJURIES OF ANY KIND ARISING FROM YOUR USE OF THE APP.</strong></p>
  </div>
)

const PrivacyPolicy = () => (
  <div className="legal-section">
    <h3>Privacy Policy</h3>
    <p className="legal-update">Last Updated: November 30, 2025</p>
    
    <p className="legal-emphasis"><strong>IMPORTANT: This Privacy Policy describes how Helio/WellnessAI collects, uses, stores, and shares your personal information and health data. While we implement security measures, NO SYSTEM IS 100% SECURE. Helio/WellnessAI CANNOT AND DOES NOT GUARANTEE absolute security of your data and is NOT LIABLE for data breaches, unauthorized access, or any consequences of data compromise.</strong></p>
    
    <h4>1. Information We Collect</h4>
    
    <h5>1.1 Personal Information</h5>
    <ul>
      <li>Name, email address, date of birth, gender</li>
      <li>Profile photo (optional)</li>
      <li>Account credentials (encrypted)</li>
    </ul>
    
    <h5>1.2 Health Data</h5>
    <ul>
      <li>Activity data (steps, workouts, exercise routines)</li>
      <li>Biometric data (heart rate, sleep patterns, weight, height)</li>
      <li>Nutritional information (food logs, water intake)</li>
      <li>DNA data (if voluntarily uploaded by user)</li>
      <li>Mental wellness data (meditation logs, mood tracking)</li>
    </ul>
    
    <h5>1.3 Device Information</h5>
    <ul>
      <li>Device type, operating system, unique device identifiers</li>
      <li>Mobile network information</li>
      <li>IP address and location data (with permission)</li>
      <li>Sensor data (accelerometer, GPS, camera - with permission)</li>
    </ul>
    
    <h5>1.4 Usage Data</h5>
    <ul>
      <li>App interactions, features used, time spent</li>
      <li>AI chat conversations (stored locally, encrypted)</li>
      <li>Gamification achievements and XP progress</li>
    </ul>
    
    <h4>2. How We Use Your Information</h4>
    <p>We use collected information to:</p>
    <ul>
      <li>Provide personalized health recommendations and insights</li>
      <li>Analyze DNA data to generate health risk assessments</li>
      <li>Power AI coaching features using Google Gemini AI</li>
      <li>Track your progress and achievements</li>
      <li>Improve app functionality and user experience</li>
      <li>Send important notifications (with your permission)</li>
      <li>Comply with legal obligations</li>
      <li>Detect and prevent fraud or security issues</li>
    </ul>
    
    <h4>3. Data Storage and Security</h4>
    
    <h5>3.1 Local Storage</h5>
    <p>Most data is stored locally on your device using encrypted localStorage. This includes:</p>
    <ul>
      <li>Activity logs and health metrics</li>
      <li>AI chat history</li>
      <li>Personal preferences</li>
    </ul>
    
    <h5>3.2 Cloud Storage</h5>
    <p>Certain data is stored on secure servers with AES-256-GCM encryption:</p>
    <ul>
      <li>Account information (encrypted)</li>
      <li>DNA analysis results (anonymized)</li>
      <li>Backup data (if enabled)</li>
    </ul>
    
    <h5>3.3 Security Measures</h5>
    <ul>
      <li>End-to-end encryption for sensitive data</li>
      <li>Secure HTTPS connections for all API calls</li>
      <li>Regular security audits and penetration testing</li>
      <li>No API keys or credentials stored in client code</li>
    </ul>
    
    <h4>4. Data Sharing and Third Parties</h4>
    
    <h5>4.1 We DO NOT Share</h5>
    <ul>
      <li>Your DNA data with any third party - NEVER</li>
      <li>Your health data for advertising purposes</li>
      <li>Personal information to data brokers</li>
    </ul>
    
    <h5>4.2 Limited Sharing</h5>
    <p>We only share data with:</p>
    <ul>
      <li><strong>Google Gemini AI:</strong> Anonymous health queries for AI responses (no personal identifiers)</li>
      <li><strong>ElevenLabs:</strong> Text for voice synthesis (no health data included)</li>
      <li><strong>Analytics Services:</strong> Anonymized usage statistics only</li>
      <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
    </ul>
    
    <h4>5. Your Data Rights</h4>
    <p>You have the right to:</p>
    <ul>
      <li><strong>Access:</strong> Request a copy of all your data</li>
      <li><strong>Rectification:</strong> Correct inaccurate data</li>
      <li><strong>Erasure:</strong> Delete your account and all associated data</li>
      <li><strong>Portability:</strong> Export your data in JSON format</li>
      <li><strong>Restriction:</strong> Limit how we process your data</li>
      <li><strong>Objection:</strong> Opt-out of certain data processing</li>
      <li><strong>Withdrawal:</strong> Revoke consent at any time</li>
    </ul>
    
    <h4>6. Children's Privacy</h4>
    <p>WellnessAI is not intended for children under 16. We do not knowingly collect data from children. If we learn we have collected data from a child under 16, we will delete it immediately.</p>
    
    <h4>7. International Data Transfers</h4>
    <p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in compliance with GDPR and international standards.</p>
    
    <h4>8. Data Retention</h4>
    <ul>
      <li><strong>Active accounts:</strong> Data retained as long as account is active</li>
      <li><strong>Inactive accounts:</strong> Data deleted after 24 months of inactivity</li>
      <li><strong>Deleted accounts:</strong> All data permanently deleted within 30 days</li>
      <li><strong>Legal requirements:</strong> Some data may be retained longer if required by law</li>
    </ul>
    
    <h4>9. Cookies and Tracking</h4>
    <p>We use minimal cookies and local storage for essential functionality. See our Cookie Policy for details.</p>
    
    <h4>10. Security Limitations and Disclaimers</h4>
    <p><strong>CRITICAL SECURITY DISCLAIMER:</strong></p>
    <p>While Helio/WellnessAI implements industry-standard security measures (encryption, secure connections, access controls), we make NO GUARANTEES regarding data security. You acknowledge and agree that:</p>
    <ul>
      <li><strong>No system is 100% secure:</strong> Despite our best efforts, data breaches, hacking, unauthorized access, or security incidents may occur</li>
      <li><strong>We are NOT liable for breaches:</strong> Helio/WellnessAI is NOT responsible for unauthorized access to your data by third parties, hackers, malicious actors, or anyone else</li>
      <li><strong>You assume all risks:</strong> By storing sensitive health data and DNA information in the App, you voluntarily assume all risks of data compromise</li>
      <li><strong>Third-party risks:</strong> We cannot control security practices of third-party services (Google, ElevenLabs, device manufacturers, internet service providers)</li>
      <li><strong>Device security:</strong> If your device is lost, stolen, or compromised, your App data may be accessible to others</li>
      <li><strong>Network security:</strong> Data transmitted over public WiFi or unsecured networks may be intercepted</li>
      <li><strong>Legal compulsion:</strong> We may be legally compelled to disclose your data to law enforcement, courts, or government agencies</li>
      <li><strong>Business transfers:</strong> If Helio/WellnessAI is acquired, merged, or goes bankrupt, your data may be transferred to new owners</li>
    </ul>
    <p><strong>YOU RELEASE Helio/WellnessAI FROM ALL LIABILITY arising from data breaches, security incidents, unauthorized access, identity theft, privacy violations, or any other security-related damages.</strong></p>
    
    <h4>11. DNA Data Special Provisions and Enhanced Warnings</h4>
    <p><strong>DNA DATA CARRIES UNIQUE AND SERIOUS RISKS. BY UPLOADING DNA DATA, YOU ACKNOWLEDGE:</strong></p>
    <ul>
      <li><strong>Permanent identification risk:</strong> DNA is permanent and uniquely identifies you. If compromised, you cannot change your DNA</li>
      <li><strong>Family implications:</strong> Your DNA reveals information about your biological relatives who did not consent to testing</li>
      <li><strong>Future implications:</strong> Genetic information may be used in ways not currently known or anticipated</li>
      <li><strong>Insurance and employment:</strong> While illegal in many jurisdictions, genetic discrimination may occur</li>
      <li><strong>Law enforcement:</strong> DNA data could be subpoenaed or used by law enforcement to identify you or relatives</li>
      <li><strong>Research use:</strong> Anonymized DNA data may be used for research purposes</li>
      <li><strong>No deletion guarantee:</strong> While we will delete your account data upon request, backups and anonymized research data may persist</li>
      <li><strong>Third-party terms:</strong> If you uploaded DNA from 23andMe or other services, their terms still apply to that data</li>
    </ul>
    <p><strong>WE NEVER SELL IDENTIFIABLE DNA DATA, BUT:</strong></p>
    <ul>
      <li>We may share anonymized, aggregated genetic data with researchers</li>
      <li>We cannot guarantee anonymization cannot be reversed with future technology</li>
      <li>In legal proceedings or business transfers, DNA data may be disclosed</li>
    </ul>
    <p><strong>Helio/WellnessAI is NOT responsible for any consequences arising from your DNA data upload, including psychological distress, family disputes, discrimination, legal issues, or future uses of genetic information.</strong></p>
    
    <h4>12. Children's Data - Strict Prohibition</h4>
    <p>Helio/WellnessAI is STRICTLY PROHIBITED for children under 16 years of age. We do NOT knowingly collect, store, or process data from children under 16.</p>
    <p>If we discover that a child under 16 has provided personal information, we will delete it immediately. However, we are NOT responsible for verifying user ages or any consequences if a child uses the App without our knowledge.</p>
    <p><strong>Parents/Guardians:</strong> You are responsible for monitoring your children's device usage. Helio/WellnessAI is NOT liable if a minor uses the App in violation of this policy.</p>
    
    <h4>13. Changes to Privacy Policy</h4>
    <p>Helio/WellnessAI reserves the right to modify this Privacy Policy at any time, at our sole discretion. We will make reasonable efforts to notify you of material changes via:</p>
    <ul>
      <li>In-app notifications</li>
      <li>Email to your registered email address</li>
      <li>Posting updates to our website</li>
    </ul>
    <p>However, we are NOT obligated to provide notice, and it is YOUR responsibility to review this Policy periodically. Continued use of the App after changes constitutes acceptance of the revised Policy.</p>
    <p>Changes become effective IMMEDIATELY upon posting, unless otherwise stated.</p>
    
    <h4>14. No Guarantees or Warranties</h4>
    <p>This Privacy Policy describes our intended practices, but we make NO GUARANTEES OR WARRANTIES that:</p>
    <ul>
      <li>We will always follow these practices exactly</li>
      <li>Data will be secure or private</li>
      <li>Unauthorized access will not occur</li>
      <li>Third parties will comply with privacy obligations</li>
      <li>Data will not be lost, corrupted, or compromised</li>
      <li>Privacy laws will protect you in all jurisdictions</li>
    </ul>
    <p><strong>All privacy commitments are subject to applicable law, legal processes, business necessities, and technical limitations.</strong></p>
    
    <h4>15. Limitation of Liability for Privacy Issues</h4>
    <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, Helio/WellnessAI AND ALL RELATED PARTIES ARE NOT LIABLE FOR:</strong></p>
    <ul>
      <li>Data breaches, hacking, or unauthorized access</li>
      <li>Identity theft or fraud arising from data compromise</li>
      <li>Consequences of data disclosure (employment loss, insurance denial, family disputes, psychological harm)</li>
      <li>Privacy law violations by third parties</li>
      <li>Misuse of data by employees, contractors, or partners</li>
      <li>Government surveillance or data requests</li>
      <li>Any damages arising from privacy violations or data security incidents</li>
    </ul>
    
    <h4>16. International Users and Data Transfers</h4>
    <p>Helio/WellnessAI operates globally. Your data may be transferred to, stored in, and processed in countries with DIFFERENT and POTENTIALLY WEAKER data protection laws than your own country.</p>
    <p>By using the App, you CONSENT to international data transfers and acknowledge that foreign governments may have access to your data through legal processes in their jurisdictions.</p>
    <p>We make NO GUARANTEES about compliance with all international privacy laws, and you assume all risks of international data storage.</p>
    
    <h4>17. Contact Information for Privacy Concerns</h4>
    <p>For privacy concerns, data requests, or to exercise your rights, contact our Data Protection Officer at:</p>
    <p><strong>Data Protection Officer - Helio/WellnessAI</strong><br/>
    Email: <strong>privacy@wellnessai.app</strong><br/>
    Email: <strong>dpo@helio.app</strong><br/>
    Response Time: We will respond to legitimate requests within 30 business days, subject to verification of your identity and legal requirements.</p>
    
    <p className="legal-emphasis"><strong>FINAL ACKNOWLEDGMENT: BY USING Helio/WellnessAI, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY, INCLUDING ALL SECURITY DISCLAIMERS AND LIMITATIONS OF LIABILITY. YOU ACCEPT ALL RISKS ASSOCIATED WITH DATA STORAGE AND PRIVACY, AND YOU RELEASE Helio/WellnessAI FROM ALL LIABILITY FOR PRIVACY-RELATED DAMAGES.</strong></p>
  </div>
)

const GDPRRights = () => (
  <div className="legal-section">
    <h3>GDPR Rights & Compliance</h3>
    <p className="legal-update">Last Updated: November 30, 2025</p>
    
    <p className="legal-emphasis"><strong>GDPR COMPLIANCE DISCLAIMER: While Helio/WellnessAI strives to comply with the General Data Protection Regulation (GDPR) and provides tools to exercise your data rights, we make NO GUARANTEES of perfect compliance with all GDPR requirements at all times. Helio/WellnessAI is NOT LIABLE for GDPR violations, penalties, or consequences arising from our data practices, third-party actions, or technical limitations.</strong></p>
    
    <h4>Your Rights Under GDPR (Subject to Limitations)</h4>
    <p>The General Data Protection Regulation (GDPR) provides European Union residents with specific rights regarding their personal data. Helio/WellnessAI provides mechanisms to exercise these rights, but:</p>
    <ul>
      <li>Rights are subject to legal limitations and exceptions</li>
      <li>Technical limitations may affect our ability to fully comply</li>
      <li>Third-party service providers (Google, ElevenLabs) have their own GDPR obligations</li>
      <li>We may refuse requests that are excessive, repetitive, or unfounded</li>
      <li>We require identity verification before fulfilling requests</li>
      <li>Some data may be retained for legal, security, or backup purposes even after deletion requests</li>
    </ul>
    
    <h4>1. Right to Access (Article 15)</h4>
    <p>You have the right to obtain:</p>
    <ul>
      <li>Confirmation that your data is being processed</li>
      <li>A copy of all your personal data</li>
      <li>Information about how your data is used</li>
    </ul>
    <p><strong>How to exercise:</strong> Go to Settings → Privacy → Download My Data, or email privacy@wellnessai.app</p>
    
    <h4>2. Right to Rectification (Article 16)</h4>
    <p>You can correct any inaccurate or incomplete personal data.</p>
    <p><strong>How to exercise:</strong> Edit your profile in-app, or contact privacy@wellnessai.app</p>
    
    <h4>3. Right to Erasure / "Right to be Forgotten" (Article 17)</h4>
    <p>You can request deletion of your personal data when:</p>
    <ul>
      <li>Data is no longer necessary for its original purpose</li>
      <li>You withdraw consent and no other legal basis exists</li>
      <li>You object to processing and there are no overriding grounds</li>
      <li>Data has been unlawfully processed</li>
    </ul>
    <p><strong>How to exercise:</strong> Settings → Account → Delete Account, or email privacy@wellnessai.app</p>
    <p><strong>Timeline:</strong> Complete deletion within 30 days</p>
    
    <h4>4. Right to Restriction of Processing (Article 18)</h4>
    <p>You can request we limit how we use your data when:</p>
    <ul>
      <li>You contest the accuracy of the data</li>
      <li>Processing is unlawful but you don't want data deleted</li>
      <li>We no longer need the data but you need it for legal claims</li>
      <li>You've objected to processing pending verification</li>
    </ul>
    <p><strong>How to exercise:</strong> Email privacy@wellnessai.app with specific restrictions requested</p>
    
    <h4>5. Right to Data Portability (Article 20)</h4>
    <p>You can receive your data in a structured, commonly used, machine-readable format (JSON) and transfer it to another service.</p>
    <p><strong>How to exercise:</strong> Settings → Privacy → Export Data (JSON format)</p>
    <p><strong>What's included:</strong> Profile info, health metrics, activity logs, DNA results, preferences</p>
    
    <h4>6. Right to Object (Article 21)</h4>
    <p>You can object to processing based on legitimate interests or for direct marketing purposes.</p>
    <p><strong>How to exercise:</strong> Settings → Privacy → Data Processing Preferences, or email privacy@wellnessai.app</p>
    
    <h4>7. Rights Related to Automated Decision-Making (Article 22)</h4>
    <p>You have the right not to be subject to decisions based solely on automated processing that produces legal or significant effects. WellnessAI's AI recommendations are advisory only and do not make automated legal decisions about you.</p>
    
    <h4>8. Right to Withdraw Consent (Article 7)</h4>
    <p>Where processing is based on consent, you can withdraw it at any time without affecting the lawfulness of processing before withdrawal.</p>
    <p><strong>How to exercise:</strong> Settings → Privacy → Permissions & Consent</p>
    
    <h4>Legal Basis for Processing</h4>
    <p>We process your data under the following legal bases:</p>
    <ul>
      <li><strong>Consent (Article 6(1)(a)):</strong> For optional features like DNA analysis, location tracking</li>
      <li><strong>Contract Performance (Article 6(1)(b)):</strong> To provide the core app services</li>
      <li><strong>Legal Obligation (Article 6(1)(c)):</strong> To comply with legal requirements</li>
      <li><strong>Legitimate Interests (Article 6(1)(f)):</strong> For fraud prevention, security, app improvement</li>
    </ul>
    
    <h4>Special Categories of Data (Article 9)</h4>
    <p>We process special categories of personal data (health data, genetic data). Legal basis:</p>
    <ul>
      <li><strong>Explicit consent:</strong> You provide explicit opt-in consent</li>
      <li><strong>Health/social care:</strong> Processing necessary for health monitoring purposes</li>
    </ul>
    
    <h4>Data Protection Officer (DPO)</h4>
    <p>Our designated DPO can be reached at:</p>
    <p><strong>Email:</strong> dpo@wellnessai.app</p>
    <p><strong>Response time:</strong> Within 72 hours for urgent matters, 30 days for formal requests</p>
    
    <h4>Right to Lodge a Complaint</h4>
    <p>If you believe your GDPR rights have been violated, you have the right to lodge a complaint with a supervisory authority in your EU member state.</p>
    <p><strong>EU Supervisory Authorities:</strong> <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer">Find your local authority</a></p>
    
    <h4>Data Breach Notification</h4>
    <p>In the event of a data breach affecting your rights and freedoms, we will notify you within 72 hours as required by Article 33.</p>
    
    <h4>International Transfers</h4>
    <p>When transferring data outside the EU, we ensure adequate protection through:</p>
    <ul>
      <li>Standard Contractual Clauses (SCCs)</li>
      <li>Adequacy decisions by the European Commission</li>
      <li>Binding Corporate Rules where applicable</li>
    </ul>
    
    <h4>Data Minimization</h4>
    <p>We only collect and process data that is necessary for the specified purposes. You can use basic features without providing sensitive health data.</p>
    
    <h4>Privacy by Design & Default</h4>
    <p>Our app is built with privacy-first principles:</p>
    <ul>
      <li>Local-first data storage</li>
      <li>End-to-end encryption for sensitive data</li>
      <li>Minimal data collection by default</li>
      <li>Opt-in for sensitive features</li>
    </ul>
    
    <h4>GDPR Limitations and Disclaimers</h4>
    <p><strong>IMPORTANT: Your GDPR rights are NOT absolute and are subject to limitations:</strong></p>
    <ul>
      <li><strong>Legal obligations:</strong> We may retain data required by law despite deletion requests</li>
      <li><strong>Legitimate interests:</strong> We may refuse requests that interfere with fraud prevention, security, or legal defense</li>
      <li><strong>Technical limitations:</strong> Complete data deletion may be technically impossible due to backups, caches, or system architecture</li>
      <li><strong>Third-party control:</strong> Data processed by Google, ElevenLabs, or other providers is subject to their GDPR compliance, not ours</li>
      <li><strong>Anonymized data:</strong> Once data is truly anonymized, it is no longer personal data under GDPR and cannot be deleted</li>
      <li><strong>Time limits:</strong> We have 30 days (extendable to 60 days) to respond to requests; we are not liable for delays</li>
      <li><strong>Identity verification:</strong> We may require extensive proof of identity, which may delay or prevent request fulfillment</li>
      <li><strong>Excessive requests:</strong> We may charge fees or refuse manifestly unfounded or excessive requests</li>
    </ul>
    
    <h4>GDPR Liability Disclaimer</h4>
    <p><strong>Helio/WellnessAI IS NOT LIABLE FOR:</strong></p>
    <ul>
      <li>GDPR violations by third-party service providers</li>
      <li>Penalties, fines, or consequences from supervisory authorities</li>
      <li>Inability to fully delete data due to technical constraints</li>
      <li>Data breaches affecting EU residents</li>
      <li>Consequences of exercising your GDPR rights (e.g., service interruption after deletion)</li>
      <li>Conflicts between GDPR and other jurisdictions' laws</li>
      <li>Changes to GDPR or regulatory interpretations</li>
    </ul>
    
    <h4>Contact and Complaints</h4>
    <p>For GDPR-related inquiries, contact our Data Protection Officer:</p>
    <p><strong>Email:</strong> dpo@wellnessai.app | dpo@helio.app<br/>
    <strong>Response Time:</strong> 30 business days (extendable)</p>
    
    <p>If you believe your GDPR rights have been violated, you have the right to lodge a complaint with your local supervisory authority. However, Helio/WellnessAI is NOT responsible for the outcome of such complaints or any resulting penalties.</p>
    
    <p className="legal-emphasis"><strong>BY USING Helio/WellnessAI AS AN EU RESIDENT, YOU ACKNOWLEDGE THAT GDPR RIGHTS ARE SUBJECT TO LIMITATIONS, TECHNICAL CONSTRAINTS, AND LEGAL EXCEPTIONS. YOU AGREE THAT Helio/WellnessAI SHALL NOT BE LIABLE FOR IMPERFECT GDPR COMPLIANCE OR CONSEQUENCES ARISING FROM GDPR-RELATED MATTERS.</strong></p>
  </div>
)

const MedicalDisclaimer = () => (
  <div className="legal-section">
    <h3>Medical Disclaimer and Health Warning</h3>
    <p className="legal-update">Last Updated: November 30, 2025</p>
    
    <p className="legal-emphasis"><strong>⚠️ CRITICAL WARNING ⚠️</strong><br/>
    <strong>Helio/WellnessAI IS NOT A MEDICAL DEVICE, NOT A DIAGNOSTIC TOOL, NOT A TREATMENT PLATFORM, AND DOES NOT PROVIDE MEDICAL ADVICE, DIAGNOSIS, TREATMENT, OR PROFESSIONAL HEALTHCARE SERVICES OF ANY KIND.</strong></p>
    
    <p className="legal-emphasis"><strong>BY USING THIS APP, YOU ACKNOWLEDGE AND AGREE THAT Helio/WellnessAI, ITS DEVELOPERS, EMPLOYEES, AFFILIATES, PARTNERS, AND ALL RELATED PARTIES ARE NOT RESPONSIBLE FOR ANY HEALTH COMPLICATIONS, INJURIES, ILLNESSES, ADVERSE OUTCOMES, MEDICAL EMERGENCIES, WRONGFUL DEATHS, OR ANY OTHER HEALTH-RELATED DAMAGES ARISING FROM USE OF THIS APPLICATION.</strong></p>
    
    <h4>1. Not a Medical Device - Regulatory Status</h4>
    <p><strong>Helio/WellnessAI is explicitly NOT:</strong></p>
    <ul>
      <li>A medical device as defined by the FDA (Food and Drug Administration) or any other regulatory body</li>
      <li>Cleared, approved, authorized, or endorsed by the FDA, EMA (European Medicines Agency), or any regulatory health authority</li>
      <li>Intended for use in the diagnosis, cure, mitigation, treatment, or prevention of any disease or medical condition</li>
      <li>A clinical-grade monitoring system or medical-grade tracking device</li>
      <li>Suitable for use in clinical decision-making or medical diagnosis</li>
      <li>A substitute for professional medical equipment, examinations, or testing</li>
      <li>Validated, verified, or certified for accuracy by any medical or scientific authority</li>
    </ul>
    
    <h4>2. Not Medical Advice - Information Only</h4>
    <p><strong>ALL INFORMATION PROVIDED BY Helio/WellnessAI, INCLUDING BUT NOT LIMITED TO:</strong></p>
    <ul>
      <li>AI-generated health recommendations, suggestions, or coaching</li>
      <li>DNA analysis results and genetic interpretations</li>
      <li>Nutritional information, calorie estimates, and dietary suggestions</li>
      <li>Exercise recommendations and fitness guidance</li>
      <li>Sleep analysis and sleep quality scores</li>
      <li>Heart rate estimates and cardiovascular insights</li>
      <li>Wellness scores, health ratings, or risk assessments</li>
      <li>Meditation guidance and stress relief techniques</li>
      <li>Food scanning results and ingredient analysis</li>
      <li>Activity tracking data and step counts</li>
    </ul>
    <p><strong>IS PROVIDED FOR INFORMATIONAL, EDUCATIONAL, AND ENTERTAINMENT PURPOSES ONLY.</strong></p>
    <p>This information is NOT intended to be, and shall NOT be construed as, professional medical advice, diagnosis, prognosis, treatment recommendations, cure, prevention, or healthcare services. It is NOT a substitute for consultation with qualified, licensed healthcare professionals.</p>
    
    <h4>3. Mandatory Healthcare Professional Consultation</h4>
    <p><strong>YOU MUST ALWAYS CONSULT WITH QUALIFIED, LICENSED HEALTHCARE PROFESSIONALS BEFORE:</strong></p>
    <ul>
      <li>Starting, modifying, or stopping ANY exercise, fitness, or physical activity program</li>
      <li>Making ANY dietary, nutritional, or eating habit changes</li>
      <li>Taking ANY action based on DNA analysis, genetic testing, or health risk assessments</li>
      <li>Stopping, changing, reducing, or starting ANY prescribed medications or medical treatments</li>
      <li>Making ANY decisions that could affect your health, safety, or wellbeing</li>
      <li>Interpreting ANY health data, metrics, or measurements from the App</li>
      <li>Following ANY recommendations, suggestions, or guidance from the App or its AI features</li>
      <li>Using App data to self-diagnose or self-treat any condition</li>
      <li>Ignoring or delaying professional medical care based on App information</li>
    </ul>
    <p><strong>CONSULT YOUR DOCTOR if you:</strong></p>
    <ul>
      <li>Have any pre-existing medical conditions (heart disease, diabetes, asthma, high blood pressure, etc.)</li>
      <li>Are pregnant, nursing, or planning to become pregnant</li>
      <li>Are taking any medications (prescription or over-the-counter)</li>
      <li>Have any injuries, disabilities, or physical limitations</li>
      <li>Experience any pain, discomfort, dizziness, shortness of breath, or unusual symptoms</li>
      <li>Are over age 40 and have been sedentary</li>
      <li>Have a family history of heart disease, sudden cardiac death, or genetic disorders</li>
      <li>Have allergies, food sensitivities, or dietary restrictions</li>
      <li>Are concerned about any health information displayed in the App</li>
    </ul>
    <p><strong>Helio/WellnessAI is NOT responsible for consequences arising from your failure to consult healthcare professionals.</strong></p>
    
    <h4>3. AI-Generated Content Limitations</h4>
    <p>Our AI coaching features use Google Gemini AI. While we strive for accuracy:</p>
    <ul>
      <li>AI can make mistakes or provide incorrect information</li>
      <li>AI responses are general and not personalized medical advice</li>
      <li>AI cannot replace human medical expertise</li>
      <li>AI may not have access to your complete medical history</li>
      <li>AI recommendations may not be suitable for your specific condition</li>
    </ul>
    
    <h4>4. DNA Analysis Disclaimer</h4>
    <p>If you upload DNA data from services like 23andMe:</p>
    <ul>
      <li>Results are for informational purposes only</li>
      <li>Genetic predisposition does NOT mean you will develop a condition</li>
      <li>Results should be discussed with a genetic counselor or physician</li>
      <li>We are not a clinical diagnostic laboratory</li>
      <li>Results are not FDA-approved or clinically validated</li>
      <li>Genetic data interpretation is complex and evolving</li>
    </ul>
    
    <h4>5. Activity and Fitness Tracking</h4>
    <ul>
      <li>Step counts and activity metrics are estimates and may not be 100% accurate</li>
      <li>Calorie burn calculations are approximations based on general formulas</li>
      <li>Heart rate and biometric readings are not medical-grade</li>
      <li>Do not rely on app data for medical monitoring</li>
    </ul>
    
    <h4>6. Food Scanning and Nutritional Information</h4>
    <ul>
      <li>AI-powered food recognition may misidentify foods</li>
      <li>Nutritional estimates may be inaccurate</li>
      <li>Always verify food information, especially for allergies or dietary restrictions</li>
      <li>Not suitable for managing medical dietary requirements</li>
    </ul>
    
    <h4>7. Mental Health Features</h4>
    <p>Meditation, breathing exercises, and stress relief features are wellness tools, not therapy:</p>
    <ul>
      <li>Not a substitute for professional mental health treatment</li>
      <li>If experiencing mental health crisis, contact emergency services</li>
      <li>For severe anxiety or depression, seek professional help</li>
    </ul>
    
    <h4>8. Emergency Situations</h4>
    <p><strong>DO NOT use this app in medical emergencies.</strong></p>
    <p>If you are experiencing a medical emergency, immediately:</p>
    <ul>
      <li>Call emergency services (911, 112, or your local emergency number)</li>
      <li>Contact your doctor or go to the nearest emergency room</li>
      <li>Do not rely on AI chat or app features for urgent medical issues</li>
    </ul>
    
    <h4>9. No Warranties</h4>
    <p>The app and all content are provided "as is" without warranties of any kind. We do not warrant that:</p>
    <ul>
      <li>The app will be error-free or uninterrupted</li>
      <li>Information will be accurate, complete, or current</li>
      <li>Results will meet your expectations</li>
      <li>Use of the app will improve your health</li>
    </ul>
    
    <h4>10. Assumption of Risk</h4>
    <p>By using WellnessAI, you acknowledge that:</p>
    <ul>
      <li>Physical activity carries inherent risks</li>
      <li>You are solely responsible for your health and safety</li>
      <li>You assume all risks associated with using the app</li>
      <li>You will use the app at your own discretion and risk</li>
    </ul>
    
    <h4>11. Complete Limitation of Liability and Release</h4>
    <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, Helio/WellnessAI AND ALL RELEASED PARTIES (INCLUDING OWNERS, DEVELOPERS, EMPLOYEES, CONTRACTORS, AFFILIATES, PARTNERS, INVESTORS, OFFICERS, DIRECTORS, AGENTS, LICENSORS, SERVICE PROVIDERS INCLUDING GOOGLE LLC AND ELEVENLABS, AND ANY OTHER RELATED ENTITIES) SHALL NOT BE LIABLE, RESPONSIBLE, OR HELD ACCOUNTABLE FOR ANY AND ALL:</strong></p>
    
    <h5>Health-Related Damages:</h5>
    <ul>
      <li>Death, wrongful death, or fatal injuries of any kind</li>
      <li>Permanent disability, paralysis, or loss of bodily function</li>
      <li>Heart attacks, cardiac arrest, strokes, or cardiovascular events</li>
      <li>Injuries from exercise, physical activity, or following fitness recommendations (sprains, fractures, torn ligaments, muscle damage, etc.)</li>
      <li>Worsening of pre-existing medical conditions</li>
      <li>Development of new medical conditions, illnesses, or diseases</li>
      <li>Adverse reactions to dietary changes, food consumption, or nutritional recommendations</li>
      <li>Allergic reactions, food poisoning, or nutritional deficiencies</li>
      <li>Weight gain, weight loss, or eating disorders</li>
      <li>Dehydration, overhydration, or electrolyte imbalances</li>
      <li>Sleep disorders or sleep deprivation</li>
      <li>Mental health deterioration (anxiety, depression, stress, panic attacks)</li>
      <li>Psychological distress from DNA results or health information</li>
      <li>Delayed diagnosis of serious medical conditions</li>
      <li>Missed diagnosis or misdiagnosis based on App data</li>
      <li>Complications from delayed or avoided medical treatment</li>
      <li>Medication interactions or adverse drug reactions</li>
      <li>Surgical complications if decisions were influenced by App information</li>
      <li>Reproductive health issues or pregnancy complications</li>
      <li>Infections, diseases contracted, or health deterioration of any kind</li>
    </ul>
    
    <h5>Data and Technology-Related Damages:</h5>
    <ul>
      <li>Inaccurate, incorrect, misleading, or dangerous information provided by the App</li>
      <li>AI errors, hallucinations, or completely wrong recommendations</li>
      <li>DNA analysis errors or misinterpretation of genetic data</li>
      <li>Nutritional data errors or incorrect calorie/macro calculations</li>
      <li>Incorrect step counts, heart rate readings, or activity tracking</li>
      <li>Food scanner misidentification or allergen detection failures</li>
      <li>Data breaches, hacking, or unauthorized access to your health data</li>
      <li>Loss, corruption, or deletion of your health data or DNA information</li>
      <li>Privacy violations or disclosure of your personal health information</li>
      <li>Identity theft or fraud resulting from App use</li>
      <li>Third-party misuse of your data</li>
    </ul>
    
    <h5>Third-Party and External Factors:</h5>
    <ul>
      <li>Actions or omissions by third-party service providers (Google, ElevenLabs, etc.)</li>
      <li>Healthcare providers' actions influenced by App data</li>
      <li>Insurance denials or premium increases based on App data or DNA results</li>
      <li>Employment discrimination based on genetic information</li>
      <li>Family relationship disputes arising from DNA discoveries</li>
      <li>Legal consequences in jurisdictions where genetic testing is restricted</li>
      <li>Social, psychological, or emotional impacts of health information</li>
    </ul>
    
    <h5>Service and Operational Issues:</h5>
    <ul>
      <li>App malfunctions, crashes, bugs, or technical failures</li>
      <li>Service interruptions, downtime, or unavailability during critical moments</li>
      <li>Incompatibility with your device or operating system</li>
      <li>Battery drain, device damage, or performance issues</li>
      <li>Network connectivity issues affecting App functionality</li>
    </ul>
    
    <p><strong>THIS LIMITATION OF LIABILITY APPLIES EVEN IF:</strong></p>
    <ul>
      <li>Helio/WellnessAI was negligent or grossly negligent</li>
      <li>The App malfunctioned at a critical moment</li>
      <li>We were aware or should have been aware of the possibility of such damages</li>
      <li>You suffered severe, permanent, or life-threatening harm</li>
      <li>The damages were foreseeable</li>
      <li>Other remedies fail of their essential purpose</li>
    </ul>
    
    <p><strong>YOU EXPRESSLY WAIVE, RELEASE, AND FOREVER DISCHARGE Helio/WellnessAI and all Released Parties from ANY AND ALL claims, demands, causes of action, liabilities, costs, or damages of any kind arising from or related to your health, wellbeing, or use of the App.</strong></p>
    
    <h4>12. User Responsibility</h4>
    <p>You are responsible for:</p>
    <ul>
      <li>Verifying all information with healthcare professionals</li>
      <li>Knowing your own health status and limitations</li>
      <li>Stopping any activity that causes pain or discomfort</li>
      <li>Seeking immediate medical attention when needed</li>
      <li>Not sharing medical advice from the app with others</li>
    </ul>
    
    <h4>13. Regulatory Status</h4>
    <p>WellnessAI is not:</p>
    <ul>
      <li>FDA-cleared or approved as a medical device</li>
      <li>CE-marked for medical purposes</li>
      <li>Intended to diagnose, treat, cure, or prevent any disease</li>
      <li>A replacement for medical equipment or monitoring</li>
    </ul>
    
    <h4>14. Pregnant Women and Special Populations</h4>
    <p>If you are pregnant, nursing, have a medical condition, or are taking medications, consult your healthcare provider before using fitness or nutritional features of this app.</p>
    
    <h4>15. Children</h4>
    <p>This app is not intended for use by children under 16. Parents or guardians should supervise any use by minors and consult pediatric healthcare providers.</p>
    
    <h4>16. Third-Party Content</h4>
    <p>Links to third-party websites or content are provided for convenience only. We do not endorse or take responsibility for third-party information.</p>
    
    <h4>17. Updates and Changes</h4>
    <p>Health information and scientific understanding evolve. App content may become outdated. We strive to update information regularly but make no guarantees.</p>
    
    <h4>18. Geographic Limitations</h4>
    <p>Health recommendations may not be suitable for all geographic regions or populations. Consult local healthcare providers familiar with regional health factors.</p>
    
    <h4>19. Your Legal Acknowledgment and Binding Agreement</h4>
    <p className="legal-emphasis"><strong>BY DOWNLOADING, INSTALLING, ACCESSING, OR USING Helio/WellnessAI IN ANY WAY, YOU HEREBY:</strong></p>
    <ul>
      <li><strong>ACKNOWLEDGE</strong> that you have read, understood, and comprehend this entire Medical Disclaimer and Health Warning</li>
      <li><strong>AGREE</strong> to be legally bound by all terms, conditions, disclaimers, and limitations contained herein</li>
      <li><strong>UNDERSTAND</strong> that Helio/WellnessAI is NOT a medical device and does NOT provide medical advice</li>
      <li><strong>ACCEPT</strong> that all information is for informational purposes only and may be inaccurate or harmful</li>
      <li><strong>ASSUME</strong> all risks associated with using the App and making health decisions</li>
      <li><strong>WAIVE</strong> any and all claims against Helio/WellnessAI for health-related damages</li>
      <li><strong>RELEASE</strong> Helio/WellnessAI from all liability for injuries, illnesses, or deaths arising from App use</li>
      <li><strong>AGREE</strong> to consult qualified healthcare professionals before making any health decisions</li>
      <li><strong>CERTIFY</strong> that you are using the App voluntarily, at your own risk, and with full knowledge of the dangers</li>
      <li><strong>CONFIRM</strong> that no one at Helio/WellnessAI has made any representations or warranties contradicting this Disclaimer</li>
    </ul>
    
    <p className="legal-emphasis"><strong>⚠️ FINAL WARNING ⚠️</strong><br/>
    <strong>IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS APP. YOUR USE CONSTITUTES ACCEPTANCE. Helio/WellnessAI AND ALL RELATED PARTIES BEAR ZERO RESPONSIBILITY FOR ANY HEALTH CONSEQUENCES, INJURIES, OR DAMAGES RESULTING FROM YOUR USE OF THIS APPLICATION.</strong></p>
    
    <p className="legal-emphasis"><strong>IF YOU EXPERIENCE A MEDICAL EMERGENCY, IMMEDIATELY CALL 911 (US), 112 (EU), OR YOUR LOCAL EMERGENCY NUMBER. DO NOT RELY ON THIS APP FOR EMERGENCY MEDICAL ASSISTANCE.</strong></p>
  </div>
)

const CookiePolicy = () => (
  <div className="legal-section">
    <h3>Cookie Policy</h3>
    <p className="legal-update">Last Updated: November 30, 2025</p>
    
    <h4>1. What Are Cookies?</h4>
    <p>Cookies are small text files stored on your device when you use websites or apps. WellnessAI uses minimal cookies and local storage to provide essential functionality.</p>
    
    <h4>2. Types of Data Storage We Use</h4>
    
    <h5>2.1 Essential Local Storage (Cannot be disabled)</h5>
    <p>We use browser localStorage to store essential data locally on your device:</p>
    <ul>
      <li><strong>Authentication tokens:</strong> To keep you logged in</li>
      <li><strong>User preferences:</strong> Language, theme, notification settings</li>
      <li><strong>Health data:</strong> Activity logs, workouts, food logs, sleep data</li>
      <li><strong>Gamification data:</strong> XP, levels, achievements</li>
      <li><strong>AI chat history:</strong> Your conversation with the AI coach</li>
    </ul>
    <p><strong>Why essential:</strong> Without this storage, the app cannot function. Data is encrypted and stored locally on your device.</p>
    
    <h5>2.2 Functional Cookies</h5>
    <ul>
      <li><strong>Session cookies:</strong> Temporary cookies that expire when you close the app</li>
      <li><strong>Remember me:</strong> If you choose "Keep me logged in"</li>
    </ul>
    <p><strong>Duration:</strong> Session cookies expire on app close; persistent cookies last up to 30 days</p>
    
    <h5>2.3 Analytics (Optional - Can be disabled)</h5>
    <p>We may use anonymized analytics to improve the app:</p>
    <ul>
      <li>Which features are most used</li>
      <li>App performance metrics</li>
      <li>Crash reports (no personal data)</li>
    </ul>
    <p><strong>Control:</strong> Settings → Privacy → Analytics - Toggle ON/OFF</p>
    
    <h4>3. What We DON'T Use</h4>
    <ul>
      <li>❌ Advertising cookies</li>
      <li>❌ Third-party tracking cookies</li>
      <li>❌ Social media tracking pixels</li>
      <li>❌ Cross-site tracking</li>
      <li>❌ Behavioral profiling cookies</li>
    </ul>
    
    <h4>4. Third-Party Services</h4>
    
    <h5>4.1 Google Gemini AI</h5>
    <p>When you use the AI coach, your queries are sent to Google's Gemini API through our secure server. Google may use cookies according to their privacy policy. We anonymize queries and do not share personal identifiers.</p>
    
    <h5>4.2 ElevenLabs Voice</h5>
    <p>Text-to-speech requests are sent to ElevenLabs API. No health data or personal information is included in voice requests.</p>
    
    <h5>4.3 Capacitor Plugins</h5>
    <p>Native device features (camera, motion sensors, GPS) access device APIs but do not set cookies.</p>
    
    <h4>5. Mobile App Specific Storage</h4>
    <p>As a mobile app, we primarily use:</p>
    <ul>
      <li><strong>Secure Storage:</strong> Encrypted keychain/keystore for sensitive data</li>
      <li><strong>App Sandbox:</strong> Private file storage on your device</li>
      <li><strong>Cache:</strong> Temporary storage for images and assets</li>
    </ul>
    
    <h4>6. How to Manage Storage</h4>
    
    <h5>6.1 In-App Controls</h5>
    <ul>
      <li>Settings → Privacy → Clear Cache</li>
      <li>Settings → Privacy → Clear Chat History</li>
      <li>Settings → Account → Delete All Data</li>
    </ul>
    
    <h5>6.2 Device-Level Controls</h5>
    <p><strong>Android:</strong></p>
    <ul>
      <li>Settings → Apps → WellnessAI → Storage → Clear Data/Cache</li>
    </ul>
    <p><strong>iOS:</strong></p>
    <ul>
      <li>Settings → General → iPhone Storage → WellnessAI → Delete App</li>
    </ul>
    
    <h4>7. Data Retention</h4>
    <ul>
      <li><strong>Active use:</strong> Data stored indefinitely while you use the app</li>
      <li><strong>Cache:</strong> Cleared periodically or when storage is low</li>
      <li><strong>After deletion:</strong> All local data permanently deleted</li>
    </ul>
    
    <h4>8. Children's Privacy</h4>
    <p>We do not knowingly collect data from children under 16. If you are under 16, please do not use this app.</p>
    
    <h4>9. Updates to This Policy</h4>
    <p>We may update this Cookie Policy. We will notify you of changes via in-app notification. Last updated: November 30, 2025.</p>
    
    <h4>10. Your Consent</h4>
    <p>By using WellnessAI, you consent to our use of essential local storage. Optional features requiring additional data storage will ask for your explicit consent.</p>
    
    <h4>11. Contact Us</h4>
    <p>Questions about cookies or data storage? Contact: <strong>privacy@wellnessai.app</strong></p>
    
    <h4>12. Do Not Track (DNT)</h4>
    <p>We respect Do Not Track signals. When DNT is enabled, we minimize data collection to essential functionality only.</p>
  </div>
)

export default LegalModal



