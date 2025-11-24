// Profile Setup Component - Avatar & Allergen Configuration
import { useState } from 'react';
import { Camera } from '@capacitor/camera';
import authService from '../services/authService';
import './ProfileSetup.css';

export default function ProfileSetup({ onComplete }) {
  const [step, setStep] = useState(1); // 1=avatar, 2=allergens, 3=basics
  const [selectedAvatar, setSelectedAvatar] = useState('🧘');
  const [photoData, setPhotoData] = useState(null);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState([]);
  const [basicInfo, setBasicInfo] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    goalSteps: '10000'
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
      console.error('Photo capture error:', error);
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

  const handleComplete = async () => {
    // Build allergen severity map
    const severityMap = {};
    selectedAllergens.forEach(allergen => {
      const allergenData = commonAllergens.find(a => a.name === allergen);
      severityMap[allergen] = allergenData?.severity || 'moderate';
    });

    // Update user profile
    await authService.updateProfile({
      avatar: photoData || selectedAvatar,
      photo: photoData,
      age: basicInfo.age ? parseInt(basicInfo.age) : null,
      gender: basicInfo.gender,
      height: basicInfo.height ? parseInt(basicInfo.height) : null,
      weight: basicInfo.weight ? parseInt(basicInfo.weight) : null,
      goalSteps: parseInt(basicInfo.goalSteps),
      allergens: selectedAllergens,
      allergenSeverity: severityMap,
      dietaryPreferences: selectedDiet
    });

    onComplete();
  };

  return (
    <div className="profile-setup-overlay">
      <div className="profile-setup">
        <h2>Complete Your Profile</h2>
        <div className="setup-progress">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}>3</div>
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
            <h3>Basic Info (Optional)</h3>
            <p className="subtitle">Help us personalize your experience</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  placeholder="25"
                  value={basicInfo.age}
                  onChange={(e) => setBasicInfo({...basicInfo, age: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  value={basicInfo.gender}
                  onChange={(e) => setBasicInfo({...basicInfo, gender: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  placeholder="175"
                  value={basicInfo.height}
                  onChange={(e) => setBasicInfo({...basicInfo, height: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={basicInfo.weight}
                  onChange={(e) => setBasicInfo({...basicInfo, weight: e.target.value})}
                />
              </div>

              <div className="form-group full-width">
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
              <button className="complete-btn" onClick={handleComplete}>
                Complete ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
