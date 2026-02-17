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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run once on mount
    if (isInitialized) return;

    const localOnboardingCompleted = localStorage.getItem('onboarding_completed');
    
    if (!user && !localOnboardingCompleted) {
      setShowOnboarding(true);
      setOnboardingCompleted(false);
    } else if (localOnboardingCompleted) {
      setShowOnboarding(false);
      setOnboardingCompleted(true);
    }

    setIsInitialized(true);
  }, [isInitialized, user]);

  // Separate effect to handle user login/logout
  useEffect(() => {
    if (!isInitialized) return;

    if (user) {
      // User logged in - hide onboarding and clear the flag
      localStorage.removeItem('onboarding_completed');
      setShowOnboarding(false);
      setOnboardingCompleted(false);
    }
  }, [user, isInitialized]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
    localStorage.setItem('onboarding_completed', 'true');
  };

  const resetOnboarding = () => {
    setOnboardingCompleted(false);
    setShowOnboarding(true);
    localStorage.removeItem('onboarding_completed');
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