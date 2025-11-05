import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ onLoadingComplete, serverHealthCheck = null, error = null, cmsData = null }) => {
  const storeName = cmsData?.storeInfo?.name || 'Store';
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [isVisible, setIsVisible] = useState(true);
  const [serverStatus, setServerStatus] = useState('connecting');
  const [retryCount, setRetryCount] = useState(0);

  // Faster loading phases - minimal and customer-focused
  const loadingPhases = [
    { progress: 30, text: 'Opening store...' },
    { progress: 60, text: 'Preparing products...' },
    { progress: 90, text: 'Almost ready...' },
    { progress: 100, text: 'Welcome!' }
  ];
  useEffect(() => {
    // Handle error state
    if (error) {
      setLoadingText('Connection failed');
      setServerStatus('error');
      return;
    }

    // Handle server health check
    if (serverHealthCheck) {
      serverHealthCheck()
        .then(() => {
          setServerStatus('connected');
          startLoadingSequence();
        })
        .catch((err) => {
          console.error('Server health check failed:', err);
          setServerStatus('error');
          setLoadingText('Server not responding');
          
          // Retry logic for free tier servers
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              setServerStatus('connecting');
              setLoadingText('Retrying connection...');
            }, 3000);
          }
        });
    } else {
      startLoadingSequence();
    }

    function startLoadingSequence() {
      let currentPhase = 0;
      let progressInterval;
      let phaseTimeout;

      const updateProgress = () => {
        if (currentPhase < loadingPhases.length) {
          const phase = loadingPhases[currentPhase];
            // Smoothly animate to next progress point
          progressInterval = setInterval(() => {
            setProgress(prev => {
              if (prev >= phase.progress) {
                clearInterval(progressInterval);
                return phase.progress;
              }
              return prev + 3;
            });
          }, 30);

          // Update loading text
          setLoadingText(phase.text);

          // Move to next phase after a shorter delay
          phaseTimeout = setTimeout(() => {
            currentPhase++;
            updateProgress();
          }, 600 + Math.random() * 400); // Random delay between 0.6-1s        } else {
          // Loading complete - faster completion
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              onLoadingComplete();
            }, 200);
          }, 300);
        }
      };

      // Start loading sequence
      updateProgress();

      return () => {
        clearInterval(progressInterval);
        clearTimeout(phaseTimeout);
      };
    }
  }, [onLoadingComplete, serverHealthCheck, error, retryCount]);
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }
    }
  };

  const progressBarVariants = {
    initial: { width: 0 },
    animate: { width: `${progress}%` }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Removed subtle background pattern for solid white background */}

          <div className="relative z-10 text-center px-6 max-w-sm w-full">            {/* Simple Store Logo */}
            <motion.div
              className="mb-6"
              variants={logoVariants}
              initial="initial"
              animate="animate"
            >
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-2xl">🏪</div>
              </div>
            </motion.div>

            {/* Simple Store Name */}
            <motion.h1
              className="text-xl font-semibold text-gray-800 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {storeName}
            </motion.h1>

            {/* Loading Text */}
            <motion.p
              className="text-gray-600 text-sm mb-6 font-medium"
              key={loadingText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {loadingText}
            </motion.p>

            {/* Simple Progress Bar */}
            <div className="relative mb-4">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gray-800 rounded-full"
                  variants={progressBarVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Simple loading dots */}
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            {/* Customer-friendly status indicator */}
            {serverStatus === 'error' ? (
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-red-500 text-sm mb-3 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Having trouble connecting</span>
                </div>
                {retryCount < 3 && (
                  <div className="text-gray-500 text-xs mb-3">
                    Retrying... ({retryCount + 1}/3)
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  Retry
                </motion.button>
                <div className="mt-2 text-xs text-gray-500">
                  Store may be starting up
                </div>
              </motion.div>            ) : (
              <div className="mt-4">
                {progress < 100 && (
                  <div className="text-xs text-gray-500">
                    Getting everything ready for you...
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
