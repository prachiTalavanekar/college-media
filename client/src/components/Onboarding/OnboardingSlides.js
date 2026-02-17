import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, MessageCircle, Shield, GraduationCap, Sparkles, Heart, Zap } from 'lucide-react';

const OnboardingSlides = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      icon: Users,
      title: "Connect with Your Campus",
      subtitle: "Build meaningful connections",
      description: "Join your college community and connect with students, teachers, and alumni from your department and beyond.",
      gradient: "from-blue-600 via-blue-500 to-blue-400",
      bgColor: "bg-gradient-to-br from-blue-50 to-slate-50",
      illustration: "👥",
      features: ["Find classmates", "Connect with alumni", "Join study groups"]
    },
    {
      id: 2,
      icon: MessageCircle,
      title: "Share & Discover",
      subtitle: "Your academic journey matters",
      description: "Share updates, discover opportunities, and stay connected with everything happening on your campus.",
      gradient: "from-blue-700 via-blue-600 to-blue-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      illustration: "💡",
      features: ["Share achievements", "Discover events", "Academic discussions"]
    },
    {
      id: 3,
      icon: Shield,
      title: "Safe & Verified",
      subtitle: "Your privacy is protected",
      description: "Only verified college members can join, ensuring a safe and authentic academic environment for everyone.",
      gradient: "from-blue-800 via-blue-700 to-blue-600",
      bgColor: "bg-gradient-to-br from-slate-50 to-blue-50",
      illustration: "🛡️",
      features: ["Verified members only", "Privacy controls", "Safe environment"]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Complete onboarding and redirect to login
      onComplete();
      navigate('/login');
    }
  };

  const handleSkip = () => {
    // Skip onboarding and redirect to login
    onComplete();
    navigate('/login');
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  // Animation variants - Optimized for performance
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const slideVariants = {
    initial: { 
      x: 50, 
      opacity: 0
    },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      x: -50, 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const illustrationVariants = {
    initial: { 
      scale: 0.9, 
      opacity: 0
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    initial: { 
      y: 20, 
      opacity: 0 
    },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const featureVariants = {
    initial: { 
      opacity: 0
    },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    initial: { 
      opacity: 0
    },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.2
      }
    },
    hover: { 
      scale: 1.02,
      transition: {
        duration: 0.1
      }
    },
    tap: { 
      scale: 0.98
    }
  };

  const floatingElementVariants = {
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-white no-tap-highlight flex flex-col hide-scrollbar"
      style={{ overflowY: 'auto', overflowX: 'hidden' }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <motion.div 
        className="flex-shrink-0 flex justify-between items-center p-4 md:p-6 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50 safe-area-top"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.1
        }}
      >
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ 
              rotate: 5,
              scale: 1.05
            }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.div>
          <span className="font-bold text-gray-900 text-base md:text-lg">CampusConnect</span>
        </motion.div>
        <motion.button 
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-700 font-medium px-3 md:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
          whileHover={{ 
            scale: 1.02,
            backgroundColor: "rgba(243, 244, 246, 1)"
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Skip
        </motion.button>
      </motion.div>

      {/* Main Content - Scrollable */}
      <div 
        className={`flex-1 ${currentSlideData.bgColor} relative hide-scrollbar`}
        style={{ overflowY: 'auto', overflowX: 'hidden' }}
      >
        {/* Animated Background Decorations - Simplified */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-24 -right-24 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.25, 0.2]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.03, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Scrollable Content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={currentSlide}
            className="relative z-10 flex flex-col items-center px-6 md:px-8 py-8 min-h-full"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Spacer for centering on larger screens */}
            <div className="flex-1 min-h-[2rem]"></div>
            
            {/* Illustration - Simplified */}
            <motion.div className="mb-6 relative flex-shrink-0" variants={illustrationVariants}>
              <motion.div 
                className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${currentSlideData.gradient} flex items-center justify-center shadow-2xl`}
                whileHover={{ 
                  scale: 1.03,
                  transition: { 
                    duration: 0.2
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-5xl md:text-7xl filter drop-shadow-lg">
                  {currentSlideData.illustration}
                </div>
              </motion.div>
              
              {/* Simplified floating elements */}
              <motion.div 
                className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-blue-400 rounded-full shadow-lg"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute -bottom-3 -left-3 w-3 h-3 md:w-4 md:h-4 bg-blue-300 rounded-full shadow-lg"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </motion.div>

            {/* Content */}
            <motion.div 
              className="text-center max-w-sm space-y-4 md:space-y-6 flex-shrink-0"
              variants={contentVariants}
            >
              <motion.div variants={contentVariants}>
                <motion.h2 
                  className="text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight"
                  variants={contentVariants}
                >
                  {currentSlideData.title}
                </motion.h2>
                <motion.p 
                  className="text-base md:text-lg font-semibold text-blue-600 mb-3 md:mb-4"
                  variants={contentVariants}
                >
                  {currentSlideData.subtitle}
                </motion.p>
                <motion.p 
                  className="text-gray-600 text-sm md:text-base leading-relaxed allow-select"
                  variants={contentVariants}
                >
                  {currentSlideData.description}
                </motion.p>
              </motion.div>

              {/* Features List - Simplified */}
              <motion.div className="space-y-2 md:space-y-3" variants={contentVariants}>
                {currentSlideData.features.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center justify-center space-x-3 text-xs md:text-sm text-gray-700"
                    variants={featureVariants}
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentSlideData.gradient}`} />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Call to Action for final slide */}
              {currentSlide === slides.length - 1 && (
                <motion.div 
                  className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-100"
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 150,
                    damping: 20,
                    delay: 0.8
                  }}
                >
                  <motion.p 
                    className="text-blue-800 text-xs md:text-sm font-medium text-center"
                    animate={{
                      scale: [1, 1.01, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Ready to connect with your campus community?
                  </motion.p>
                  <motion.p 
                    className="text-blue-600 text-xs text-center mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    Sign up with your college email to get started
                  </motion.p>
                </motion.div>
              )}
            </motion.div>

            {/* Spacer for centering on larger screens */}
            <div className="flex-1 min-h-[2rem]"></div>
            
            {/* Extra spacing for bottom navigation */}
            <div className="h-32 flex-shrink-0"></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation - Fixed */}
      <motion.div 
        className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 md:p-6 safe-area-bottom"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.25, 0.46, 0.45, 0.94], 
          delay: 0.4 
        }}
      >
        {/* Progress Dots - Simplified */}
        <motion.div 
          className="flex justify-center space-x-3 mb-4 md:mb-6"
          variants={contentVariants}
        >
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide 
                  ? `w-6 md:w-8 h-3 bg-gradient-to-r ${currentSlideData.gradient}` 
                  : 'w-3 h-3 bg-gray-300 hover:bg-blue-200'
              }`}
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.1 }
              }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </motion.div>

        {/* Navigation Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={nextSlide}
            className={`flex items-center space-x-3 bg-gradient-to-r ${currentSlideData.gradient} text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg shadow-xl min-w-[180px] md:min-w-[200px] justify-center button-glow`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <span>{currentSlide === slides.length - 1 ? 'Join CampusConnect' : 'Continue'}</span>
            <motion.div
              animate={{ x: [0, 2, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <ChevronRight size={18} className="ml-1" />
            </motion.div>
          </motion.button>
        </div>

        {/* Slide Counter */}
        <motion.div 
          className="text-center mt-3 md:mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <span className="text-xs md:text-sm text-blue-600 font-medium">
            {currentSlide + 1} of {slides.length}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingSlides;