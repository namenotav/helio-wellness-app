import React from 'react';
import './Onboarding.css';

const Onboarding = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    {
      title: 'Welcome to Helio! 👋',
      description: 'Your AI-powered health companion that helps you track, improve, and gamify your wellness journey.',
      icon: '🌟',
      animation: 'fade-in'
    },
    {
      title: 'Track Everything 📊',
      description: 'Monitor steps, water intake, meals, sleep, and workouts all in one place. Real-time health data at your fingertips.',
      icon: '🏃',
      animation: 'slide-right'
    },
    {
      title: 'AI Coach 🤖',
      description: 'Ask your personal AI anything about health, nutrition, or fitness. Get instant voice responses with Nicole AI.',
      icon: '💬',
      animation: 'slide-left'
    },
    {
      title: 'Food Scanner 📸',
      description: 'Point your camera at any food and instantly get nutritional information. Log meals in seconds!',
      icon: '🍕',
      animation: 'zoom-in'
    },
    {
      title: 'Zen Mode 🧘',
      description: 'Access breathing exercises, guided meditations, stress relief techniques, and gratitude journaling.',
      icon: '☮️',
      animation: 'fade-in'
    },
    {
      title: 'Level Up! 🎮',
      description: 'Earn XP for every activity, unlock achievements, and compete with friends. Health is now a game!',
      icon: '⚡',
      animation: 'bounce'
    },
    {
      title: 'DNA Insights 🧬',
      description: 'Upload your 23andMe data for personalized genetic insights on fitness, nutrition, and health risks.',
      icon: '🔬',
      animation: 'slide-up'
    },
    {
      title: 'You\'re Ready! 🚀',
      description: 'Start your wellness journey today. Remember: consistency beats perfection. You\'ve got this, Champion!',
      icon: '💪',
      animation: 'celebrate'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onComplete();
  };

  const handleSkipNow = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onSkip();
  };

  const step = steps[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className={`onboarding-container ${step.animation}`}>
        <button className="skip-button" onClick={handleSkipNow}>
          Skip Tutorial
        </button>

        <div className="onboarding-content">
          <div className="step-indicator">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            ))}
          </div>

          <div className="step-icon">{step.icon}</div>
          <h1 className="step-title">{step.title}</h1>
          <p className="step-description">{step.description}</p>

          <div className="step-counter">
            {currentStep + 1} of {steps.length}
          </div>
        </div>

        <div className="onboarding-actions">
          {currentStep > 0 && (
            <button className="btn-secondary" onClick={handlePrevious}>
              ← Previous
            </button>
          )}
          
          <button className="btn-primary" onClick={handleNext}>
            {currentStep < steps.length - 1 ? 'Next →' : 'Get Started! 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;



