// Onboarding Tutorial Component
import { useState, useEffect } from 'react';
import './OnboardingTutorial.css';

export default function OnboardingTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      title: 'Welcome to WellnessAI! 👋',
      message: 'Your AI-powered health companion with Samsung-level step tracking accuracy.',
      icon: '🎉'
    },
    {
      title: 'Track Your Steps 👣',
      message: 'Keep your phone in your pocket. We\'ll count your steps automatically with 95%+ accuracy.',
      icon: '👟'
    },
    {
      title: 'Weekly Progress 📊',
      message: 'See your step count for each day of the week. Steps reset daily but history is preserved.',
      icon: '📅'
    },
    {
      title: 'AI Health Coach 🤖',
      message: 'Ask me anything about health! Powered by Google Gemini AI for personalized advice.',
      icon: '💬'
    },
    {
      title: 'Food Scanner 📸',
      message: 'Take photos of food to get instant calorie counts and nutrition info. Great for allergen detection!',
      icon: '🍔'
    },
    {
      title: 'All Set! 🚀',
      message: 'Start walking to see your steps count up. Keep your phone with you for best accuracy.',
      icon: '✨'
    }
  ];

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('has_seen_onboarding', 'true');
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-icon">{step.icon}</div>
        <h2>{step.title}</h2>
        <p>{step.message}</p>

        <div className="onboarding-progress">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-buttons">
          {!isLastStep && (
            <button onClick={handleSkip} className="skip-btn">
              Skip
            </button>
          )}
          <button onClick={handleNext} className="next-btn">
            {isLastStep ? 'Get Started!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}



