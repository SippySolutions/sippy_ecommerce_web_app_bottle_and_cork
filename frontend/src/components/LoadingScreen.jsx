import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ onLoadingComplete, cmsData = null, serverHealthCheck = null, error = null }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [isVisible, setIsVisible] = useState(true);
  const [serverStatus, setServerStatus] = useState('connecting');
  const [retryCount, setRetryCount] = useState(0);

  // Loading phases with different messages
  const loadingPhases = [
    { progress: 20, text: 'Connecting to server...' },
    { progress: 40, text: 'Loading store data...' },
    { progress: 60, text: 'Preparing your experience...' },
    { progress: 80, text: 'Almost ready...' },
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
              return prev + 2;
            });
          }, 50);

          // Update loading text
          setLoadingText(phase.text);

          // Move to next phase after a delay
          phaseTimeout = setTimeout(() => {
            currentPhase++;
            updateProgress();
          }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5s
        } else {
          // Loading complete
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              onLoadingComplete();
            }, 500);
          }, 800);
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
    animate: { opacity: 1 },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.5 }
    }
  };

  const logoVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'blur(10px)'
          }}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
              backgroundSize: '50px 50px'
            }} />
          </div>

          <div className="relative z-10 text-center px-6 max-w-md w-full">
            {/* Store Logo */}
            <motion.div
              className="mb-8"
              variants={logoVariants}
              initial="initial"
              animate="animate"
            >
              {cmsData?.logo ? (
                <img
                  src={cmsData.logo}
                  alt="Store Logo"
                  className="h-24 w-auto mx-auto drop-shadow-2xl"
                  style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
                />
              ) : (
                <div className="h-24 w-24 mx-auto bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-4xl font-bold text-white">🏪</div>
                </div>
              )}
            </motion.div>

            {/* Store Name */}
            {cmsData?.storeInfo?.name && (
              <motion.h1
                className="text-2xl font-bold text-white mb-2 drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {cmsData.storeInfo.name}
              </motion.h1>
            )}

            {/* Loading Text */}
            <motion.p
              className="text-white/90 text-lg mb-8 font-medium"
              key={loadingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loadingText}
            </motion.p>

            {/* Progress Bar Container */}
            <div className="relative">
              {/* Background Bar */}
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                {/* Progress Fill */}
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
                    backgroundSize: '200% 100%'
                  }}
                  variants={progressBarVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Progress Percentage */}
              <motion.div
                className="mt-3 text-white/80 text-sm font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {progress}%
              </motion.div>
            </div>

            {/* Animated Loading Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white/60 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>            {/* Server Status Indicator */}
            <motion.div
              className="mt-6 text-xs text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {serverStatus === 'error' ? (
                <div className="text-center">
                  <span className="flex items-center justify-center space-x-2 text-red-300 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Server connection failed</span>
                  </span>
                  {retryCount < 3 && (
                    <div className="text-yellow-300 text-xs mb-2">
                      Retrying... ({retryCount + 1}/3)
                    </div>
                  )}
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white text-sm transition-colors backdrop-blur-sm border border-white/30"
                  >
                    Refresh Page
                  </button>
                  <div className="mt-2 text-xs text-white/50">
                    Free tier servers may take time to start up
                  </div>
                </div>
              ) : serverStatus === 'connecting' ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span>Waking up server...</span>
                </span>
              ) : progress < 40 ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span>Server starting...</span>
                </span>
              ) : progress < 80 ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span>Server responding...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Ready to serve!</span>
                </span>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
