import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Check if onboarding was completed in this session
    const sessionOnboardingCompleted = sessionStorage.getItem('onboarding_completed');
    
    if (!user && !sessionOnboardingCompleted && !onboardingCompleted) {
      // Skip splash screen, go directly to onboarding slides
      setShowOnboarding(true);
    } else if (sessionOnboardingCompleted) {
      setOnboardingCompleted(true);
    }

    // Clear session storage when user logs in (so onboarding shows again after logout)
    if (user && sessionOnboardingCompleted) {
      sessionStorage.removeItem('onboarding_completed');
    }
  }, [user, onboardingCompleted]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
    // Mark onboarding as completed for this session
    sessionStorage.setItem('onboarding_completed', 'true');
  };

  const resetOnboarding = () => {
    setOnboardingCompleted(false);
    setShowOnboarding(true);
    sessionStorage.removeItem('onboarding_completed');
  };

  const value = {
    showOnboarding,
    onboardingCompleted,
    completeOnboarding,
    resetOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};