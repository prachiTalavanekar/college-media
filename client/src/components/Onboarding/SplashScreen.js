import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoScale, setLogoScale] = useState(0);

  useEffect(() => {
    // Animate logo entrance
    setTimeout(() => setLogoScale(1), 100);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      scale: 1.1,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  const logoVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  };

  const textVariants = {
    initial: { y: 30, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  const particleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 1], 
      opacity: [0, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const loadingVariants = {
    initial: { scaleY: 0.3 },
    animate: { 
      scaleY: [0.3, 1, 0.3],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 flex items-center justify-center mobile-app-container hide-scrollbar no-tap-highlight"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <motion.div 
              className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-32 right-16 w-24 h-24 bg-blue-200 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-400 rounded-full blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </div>

          <motion.div className="text-center relative z-10" variants={textVariants}>
            {/* Animated Logo */}
            <div className="mb-8 relative">
              <motion.div 
                className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
                variants={logoVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <GraduationCap className="w-14 h-14 text-blue-600" />
                </motion.div>
              </motion.div>
              
              {/* Animated floating particles around logo */}
              <motion.div 
                className="absolute -top-2 -right-2 w-4 h-4 bg-blue-300 rounded-full"
                variants={particleVariants}
                animate="animate"
              />
              <motion.div 
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full"
                variants={particleVariants}
                animate="animate"
                style={{ animationDelay: '0.5s' }}
              />
              <motion.div 
                className="absolute top-1/2 -right-3 w-2 h-2 bg-blue-200 rounded-full"
                variants={particleVariants}
                animate="animate"
                style={{ animationDelay: '1s' }}
              />
            </div>

            {/* Animated App Name */}
            <motion.div className="mb-4" variants={textVariants}>
              <motion.h1 
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100 mb-2 tracking-tight"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                CampusConnect
              </motion.h1>
              <motion.div 
                className="w-24 h-1 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full mx-auto mb-3"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 1, delay: 0.8 }}
              />
              <motion.p 
                className="text-blue-100 text-lg font-medium tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Your Academic Social Network
              </motion.p>
            </motion.div>

            {/* Modern Animated Loading */}
            <motion.div 
              className="mt-12 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 bg-blue-200 rounded-full"
                    variants={loadingVariants}
                    animate="animate"
                    style={{
                      height: [32, 24, 40, 16, 28][index],
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;