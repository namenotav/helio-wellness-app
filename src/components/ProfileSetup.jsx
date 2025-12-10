// Profile Setup Component - Avatar & Allergen Configuration
import { useState } from 'react';
import { Camera } from '@capacitor/camera';
import authService from '../services/authService';
import syncService from '../services/syncService';
import firestoreService from '../services/firestoreService';
import healthAvatarService from '../services/healthAvatarService';
import './ProfileSetup.css';

export default function ProfileSetup({ onComplete }) {
  // Load existing user data
  const currentUser = authService.getCurrentUser();
  const existingProfile = currentUser?.profile || {};

  const [step, setStep] = useState(1); // 1=avatar, 2=allergens, 3=basics, 4=medical, 5=lifestyle
  const [selectedAvatar, setSelectedAvatar] = useState(existingProfile.avatar || '🧘');
  const [photoData, setPhotoData] = useState(existingProfile.photo || null);
  const [selectedAllergens, setSelectedAllergens] = useState(existingProfile.allergens || []);
  const [selectedDiet, setSelectedDiet] = useState(existingProfile.dietaryPreferences || []);
  const [basicInfo, setBasicInfo] = useState({
    fullName: existingProfile.fullName || '',
    age: existingProfile.age ? String(existingProfile.age) : '',
    gender: existingProfile.gender || '',
    height: existingProfile.height ? String(existingProfile.height) : '',
    weight: existingProfile.weight ? String(existingProfile.weight) : '',
    goalSteps: existingProfile.goalSteps ? String(existingProfile.goalSteps) : '10000',
    bloodType: existingProfile.bloodType || ''
  });
  const [medicalInfo, setMedicalInfo] = useState({
    conditions: existingProfile.medicalConditions || [],
    medications: existingProfile.medications || [],
    injuries: existingProfile.injuries || [],
    surgeries: existingProfile.surgeries || '',
    familyHistory: existingProfile.familyHistory || []
  });
  const [lifestyleInfo, setLifestyleInfo] = useState({
    fitnessLevel: existingProfile.fitnessLevel || '',
    exerciseFrequency: existingProfile.exerciseFrequency || '',
    sleepHours: existingProfile.sleepHours ? String(existingProfile.sleepHours) : '',
    stressLevel: existingProfile.stressLevel || '',
    smoker: existingProfile.smoker || false,
    alcoholFrequency: existingProfile.alcoholFrequency || '',
    waterIntake: existingProfile.waterIntake || '',
    workType: existingProfile.workType || ''
  });

  const avatars = ['🧘', '🏃', '💪', '🧗', '🚴', '🏊', '⛹️', '🤸', '🤾', '🏋️', '🤺', '⛷️'];
  
  const commonAllergens = [
    { name: 'gluten', icon: '🌾', severity: 'moderate' },
    { name: 'dairy', icon: '🥛', severity: 'moderate' },
    { name: 'nuts', icon: '🥜', severity: 'severe' },
    { name: 'shellfish', icon: '🦐', severity: 'severe' },
    { name: 'eggs', icon: '🥚', severity: 'moderate' },
    { name: 'soy', icon: '🫘', severity: 'moderate' },
    { name: 'fish', icon: '🐟', severity: 'severe' },
    { name: 'sesame', icon: '🌰', severity: 'moderate' }
  ];

  const dietPreferences = [
    { name: 'vegetarian', icon: '🥗' },
    { name: 'vegan', icon: '🌱' },
    { name: 'keto', icon: '🥑' },
    { name: 'paleo', icon: '🍖' },
    { name: 'halal', icon: '☪️' },
    { name: 'kosher', icon: '✡️' }
  ];

  const handleTakePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'base64',
        source: 'CAMERA'
      });
      setPhotoData(`data:image/jpeg;base64,${photo.base64String}`);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Photo capture error:', error);
    }
  };

  const toggleAllergen = (allergen) => {
    if (selectedAllergens.includes(allergen.name)) {
      setSelectedAllergens(selectedAllergens.filter(a => a !== allergen.name));
    } else {
      setSelectedAllergens([...selectedAllergens, allergen.name]);
    }
  };

  const toggleDiet = (diet) => {
    if (selectedDiet.includes(diet.name)) {
      setSelectedDiet(selectedDiet.filter(d => d !== diet.name));
    } else {
      setSelectedDiet([...selectedDiet, diet.name]);
    }
  };

  const medicalConditions = [
    { name: 'diabetes', icon: '🩸' },
    { name: 'hypertension', icon: '💔' },
    { name: 'asthma', icon: '🫁' },
    { name: 'arthritis', icon: '🦴' },
    { name: 'heart-disease', icon: '❤️' },
    { name: 'thyroid', icon: '🦋' },
    { name: 'migraine', icon: '🤕' },
    { name: 'anxiety', icon: '😰' },
    { name: 'depression', icon: '😔' }
  ];

  const familyHistoryConditions = [
    'diabetes', 'heart-disease', 'cancer', 'alzheimers', 'stroke', 'hypertension'
  ];

  const toggleCondition = (condition) => {
    if (medicalInfo.conditions.includes(condition)) {
      setMedicalInfo({...medicalInfo, conditions: medicalInfo.conditions.filter(c => c !== condition)});
    } else {
      setMedicalInfo({...medicalInfo, conditions: [...medicalInfo.conditions, condition]});
    }
  };

  const toggleFamilyHistory = (condition) => {
    if (medicalInfo.familyHistory.includes(condition)) {
      setMedicalInfo({...medicalInfo, familyHistory: medicalInfo.familyHistory.filter(c => c !== condition)});
    } else {
      setMedicalInfo({...medicalInfo, familyHistory: [...medicalInfo.familyHistory, condition]});
    }
  };

  const handleComplete = async () => {
    try {
      if(import.meta.env.DEV)console.log('🔧 Starting profile completion...');
      
      // Build allergen severity map
      const severityMap = {};
      selectedAllergens.forEach(allergen => {
        const allergenData = commonAllergens.find(a => a.name === allergen);
        severityMap[allergen] = allergenData?.severity || 'moderate';
      });

      // Calculate BMI for storage
      const heightM = basicInfo.height / 100;
      const bmi = basicInfo.weight / (heightM * heightM);

      if(import.meta.env.DEV)console.log('💾 Saving profile to authService...');
      if(import.meta.env.DEV)console.log('📝 Form data before save:');
      if(import.meta.env.DEV)console.log('  basicInfo:', basicInfo);
      if(import.meta.env.DEV)console.log('  lifestyleInfo:', lifestyleInfo);
      if(import.meta.env.DEV)console.log('  medicalInfo:', medicalInfo);
      if(import.meta.env.DEV)console.log('  selectedAllergens:', selectedAllergens);
      
      // Update user profile with COMPREHENSIVE data
      await authService.updateProfile({
      // Avatar & Identity
      avatar: photoData || selectedAvatar,
      photo: photoData,
      fullName: basicInfo.fullName || '',
      
      // Basic Metrics
      age: basicInfo.age ? parseInt(basicInfo.age) : undefined,
      gender: basicInfo.gender || '',
      height: basicInfo.height ? parseInt(basicInfo.height) : undefined,
      weight: basicInfo.weight ? parseInt(basicInfo.weight) : undefined,
      bmi: bmi && !isNaN(bmi) ? parseFloat(bmi.toFixed(1)) : undefined,
      bloodType: basicInfo.bloodType || '',
      goalSteps: basicInfo.goalSteps ? parseInt(basicInfo.goalSteps) : 10000,
      
      // Diet & Allergens
      allergens: selectedAllergens,
      allergenSeverity: severityMap,
      dietaryPreferences: selectedDiet,
      
      // Medical History
      medicalConditions: medicalInfo.conditions,
      medications: medicalInfo.medications,
      injuries: medicalInfo.injuries,
      surgeries: medicalInfo.surgeries,
      familyHistory: medicalInfo.familyHistory,
      
      // Lifestyle
      fitnessLevel: lifestyleInfo.fitnessLevel || '',
      exerciseFrequency: lifestyleInfo.exerciseFrequency || '',
      sleepHours: lifestyleInfo.sleepHours ? parseInt(lifestyleInfo.sleepHours) : undefined,
      stressLevel: lifestyleInfo.stressLevel || '',
      smoker: lifestyleInfo.smoker || false,
      alcoholFrequency: lifestyleInfo.alcoholFrequency || '',
      waterIntake: lifestyleInfo.waterIntake || '',
      workType: lifestyleInfo.workType || '',
      
      // Completion
      profileCompleted: true,
      profileCompletedDate: new Date().toISOString()
    });

      if(import.meta.env.DEV)console.log('📦 Initializing tracking data stores...');
      
      // Initialize tracking data in cloud + localStorage if empty
      try {
        const userId = authService.getCurrentUser()?.uid;
        if (!(await firestoreService.get('stepHistory', userId))) {
      await firestoreService.save('stepHistory', {}, userId);
    }
    if (!(await firestoreService.get('foodLog', userId))) {
      await firestoreService.save('foodLog', [], userId);
    }
    if (!(await firestoreService.get('workoutHistory', userId))) {
      await firestoreService.save('workoutHistory', [], userId);
    }
    if (!(await firestoreService.get('sleepLog', userId))) {
      await firestoreService.save('sleepLog', [], userId);
    }
    if (!(await firestoreService.get('waterLog', userId))) {
      await firestoreService.save('waterLog', [], userId);
    }
        if (!(await firestoreService.get('weeklySteps', userId))) {
          await firestoreService.save('weeklySteps', [], userId);
        }
      } catch (syncError) {
        if(import.meta.env.DEV)console.warn('⚠️ Warning initializing data stores (non-critical):', syncError);
      }

      if(import.meta.env.DEV)console.log('✅ Complete health profile saved:', {
        name: basicInfo.fullName,
        bmi: bmi?.toFixed(1),
        conditions: medicalInfo.conditions.length,
        allergens: selectedAllergens.length,
        fitnessLevel: lifestyleInfo.fitnessLevel
      });

      // Clear avatar cache so it recalculates with new profile data
      if(import.meta.env.DEV)console.log('🧹 Clearing avatar cache...');
      healthAvatarService.clearCache();

      if(import.meta.env.DEV)console.log('✅ Profile setup complete! Calling onComplete...');
      onComplete();
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ ERROR saving profile:', error);
      alert('Error saving profile: ' + error.message + '\n\nPlease try again or contact support.');
    }
  };

  return (
    <div className="profile-setup-overlay">
      <div className="profile-setup">
        <button className="modal-close" onClick={onComplete} style={{
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
          zIndex: 10
        }}>×</button>
        
        <h2>🧬 Complete Your Health Profile</h2>
        <div className="setup-progress">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}>3</div>
          <div className={`progress-line ${step >= 4 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 4 ? 'active' : ''}`}>4</div>
          <div className={`progress-line ${step >= 5 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 5 ? 'active' : ''}`}>5</div>
        </div>

        {step === 1 && (
          <div className="setup-step">
            <h3>Choose Your Avatar</h3>
            
            {photoData ? (
              <div className="photo-preview">
                <img src={photoData} alt="Profile" />
                <button className="change-photo" onClick={handleTakePhoto}>
                  Change Photo
                </button>
              </div>
            ) : (
              <>
                <div className="avatar-grid">
                  {avatars.map(avatar => (
                    <button
                      key={avatar}
                      className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
                
                <button className="take-photo-btn" onClick={handleTakePhoto}>
                  📷 Or Take a Photo
                </button>
              </>
            )}

            <button className="next-btn" onClick={() => setStep(2)}>
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <h3>Your Allergens & Diet</h3>
            <p className="subtitle">Select any allergens you need to avoid</p>
            
            <div className="allergen-grid">
              {commonAllergens.map(allergen => (
                <button
                  key={allergen.name}
                  className={`allergen-card ${selectedAllergens.includes(allergen.name) ? 'selected' : ''}`}
                  onClick={() => toggleAllergen(allergen)}
                >
                  <span className="allergen-icon">{allergen.icon}</span>
                  <span className="allergen-name">{allergen.name}</span>
                  {allergen.severity === 'severe' && <span className="severity-badge">⚠️</span>}
                </button>
              ))}
            </div>

            <h4>Dietary Preferences (Optional)</h4>
            <div className="diet-grid">
              {dietPreferences.map(diet => (
                <button
                  key={diet.name}
                  className={`diet-card ${selectedDiet.includes(diet.name) ? 'selected' : ''}`}
                  onClick={() => toggleDiet(diet)}
                >
                  <span className="diet-icon">{diet.icon}</span>
                  <span className="diet-name">{diet.name}</span>
                </button>
              ))}
            </div>

            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="next-btn" onClick={() => setStep(3)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="setup-step">
            <h3>📊 Basic Information</h3>
            <p className="subtitle">Essential data for your Health Avatar calculations</p>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={basicInfo.fullName}
                  onChange={(e) => setBasicInfo({...basicInfo, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  placeholder="25"
                  value={basicInfo.age}
                  onChange={(e) => setBasicInfo({...basicInfo, age: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <select
                  value={basicInfo.gender}
                  onChange={(e) => setBasicInfo({...basicInfo, gender: e.target.value})}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label>Height (cm) *</label>
                <input
                  type="number"
                  placeholder="175"
                  value={basicInfo.height}
                  onChange={(e) => setBasicInfo({...basicInfo, height: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Weight (kg) *</label>
                <input
                  type="number"
                  placeholder="70"
                  value={basicInfo.weight}
                  onChange={(e) => setBasicInfo({...basicInfo, weight: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Blood Type</label>
                <select
                  value={basicInfo.bloodType}
                  onChange={(e) => setBasicInfo({...basicInfo, bloodType: e.target.value})}
                >
                  <option value="">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label>Daily Step Goal</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={basicInfo.goalSteps}
                  onChange={(e) => setBasicInfo({...basicInfo, goalSteps: e.target.value})}
                />
              </div>
            </div>

            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="next-btn" onClick={() => setStep(4)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="setup-step">
            <h3>🏥 Medical History</h3>
            <p className="subtitle">Helps calculate accurate health predictions (all optional)</p>
            
            <h4>Existing Conditions</h4>
            <div className="condition-grid">
              {medicalConditions.map(condition => (
                <button
                  key={condition.name}
                  className={`condition-card ${medicalInfo.conditions.includes(condition.name) ? 'selected' : ''}`}
                  onClick={() => toggleCondition(condition.name)}
                >
                  <span className="condition-icon">{condition.icon}</span>
                  <span className="condition-name">{condition.name}</span>
                </button>
              ))}
            </div>

            <h4>Current Medications</h4>
            <textarea
              className="medications-input"
              placeholder="List any medications you're currently taking (optional)"
              value={medicalInfo.medications.join('\n')}
              onChange={(e) => setMedicalInfo({...medicalInfo, medications: e.target.value.split('\n').filter(m => m.trim())})}
              rows="3"
            />

            <h4>Family History</h4>
            <p className="subtitle-small">Select any conditions in your immediate family</p>
            <div className="family-history-grid">
              {familyHistoryConditions.map(condition => (
                <button
                  key={condition}
                  className={`family-history-btn ${medicalInfo.familyHistory.includes(condition) ? 'selected' : ''}`}
                  onClick={() => toggleFamilyHistory(condition)}
                >
                  {condition}
                </button>
              ))}
            </div>

            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button className="next-btn" onClick={() => setStep(5)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="setup-step">
            <h3>🏃 Lifestyle & Habits</h3>
            <p className="subtitle">Critical for accurate health projections</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Current Fitness Level</label>
                <select
                  value={lifestyleInfo.fitnessLevel}
                  onChange={(e) => setLifestyleInfo({...lifestyleInfo, fitnessLevel: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="sedentary">Sedentary (little exercise)</option>
                  <option value="lightly-active">Lightly Active (1-2 days/week)</option>
                  <option value="moderately-active">Moderately Active (3-5 days/week)</option>
                  <option value="very-active">Very Active (6-7 days/week)</option>
                  <option value="athlete">Athlete (training daily)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Exercise Frequency</label>
                <select
                  value={lifestyleInfo.exerciseFrequency}
                  onChange={(e) => setLifestyleInfo({...lifestyleInfo, exerciseFrequency: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="never">Never</option>
                  <option value="1-2-week">1-2 times/week</option>
                  <option value="3-4-week">3-4 times/week</option>
                  <option value="5-6-week">5-6 times/week</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div className="form-group">
                <label>Average Sleep Hours</label>
                <input
                  type="number"
                  placeholder="7"
                  value={lifestyleInfo.sleepHours}
                  onChange={(e) => setLifestyleInfo({...lifestyleInfo, sleepHours: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Stress Level</label>
                <select
                  value={lifestyleInfo.stressLevel}
                  onChange={(e) => setLifestyleInfo({...lifestyleInfo, stressLevel: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very-high">Very High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Smoking Status</label>
                <select
                  value={lifestyleInfo.smoker}
                  onChange={(e) => setLifestyleInfo({...lifestyleInfo, smoker: e.target.value === 'true'})}
                >
                  <option value="false">Non-smoker</option>
                  <option value="true">Smoker</option>
                </select>
              </div>

              <div className="form-group">
                <label>Alcohol Consumption</label>
                <select
                  value={lifestyleInfo.alcoholFrequency}
                  onChange={(e) => setLifestyleInfo({...lifestyleInfo, alcoholFrequency: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="never">Never</option>
                  <option value="rarely">Rarely (1-2/month)</option>
                  <option value="social">Social (1-2/week)</option>
                  <option value="regular">Regular (3-5/week)</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div className="form-group">
                <label>Daily Water Intake</label>
                <select
                  value={lifestyleInfo.waterIntake}
                  onChange={(e) => setLifestyleInfo({...lifestyleInfo, waterIntake: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="low">Low (&lt;4 glasses)</option>
                  <option value="moderate">Moderate (4-6 glasses)</option>
                  <option value="good">Good (7-8 glasses)</option>
                  <option value="excellent">Excellent (8+ glasses)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Work Type</label>
                <select
                  value={lifestyleInfo.workType}
                  onChange={(e) => setLifestyleInfo({...lifestyleInfo, workType: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="sedentary">Sedentary (desk job)</option>
                  <option value="light-activity">Light Activity</option>
                  <option value="moderate-activity">Moderate Activity</option>
                  <option value="physical">Physical Labor</option>
                  <option value="very-physical">Very Physical</option>
                </select>
              </div>
            </div>

            <div className="completion-summary">
              <h4>✅ Profile Summary</h4>
              <p>Your comprehensive health profile will power:</p>
              <ul>
                <li>🧬 Personalized Health Avatar</li>
                <li>📊 Accurate BMI & health score calculations</li>
                <li>🔮 Future health predictions</li>
                <li>🎯 Custom exercise & meal recommendations</li>
                <li>💊 Allergen warnings & food safety</li>
                <li>🏥 Emergency medical data package</li>
              </ul>
            </div>

            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(4)}>
                ← Back
              </button>
              <button className="complete-btn" onClick={handleComplete}>
                Complete Profile ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



