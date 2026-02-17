import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import OnboardingSlides from './OnboardingSlides';

const OnboardingWrapper = ({ children }) => {
  const { user } = useAuth();
  const { 
    showOnboarding, 
    onboardingCompleted,
    completeOnboarding 
  } = useOnboarding();
  
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOnboardingComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      completeOnboarding();
      setIsTransitioning(false);
    }, 300);
  };

  // For authenticated users, always show the app
  if (user) {
    return (
      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    );
  }

  // For non-authenticated users, show onboarding slides directly
  if (!user) {
    // Show onboarding slides
    if (showOnboarding) {
      return <OnboardingSlides onComplete={handleOnboardingComplete} />;
    }

    // After onboarding is completed, show login/register pages
    if (onboardingCompleted) {
      return (
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </div>
      );
    }
  }

  // Fallback - show app content
  return (
    <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {children}
    </div>
  );
};

export default OnboardingWrapper;