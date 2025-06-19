import React from 'react';
import { motion } from 'framer-motion';

const InlineLoader = ({ 
  text = 'Loading...', 
  size = 'md', 
  showProgress = false, 
  progress = 0,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Universal Liquors branded spinner */}
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} border-2 border-gray-200 border-t-gray-800 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Small brand indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs">🍷</div>
        </div>
      </div>

      {/* Loading text */}
      <motion.p
        className={`text-gray-600 font-medium ${textSizeClasses[size]}`}
        key={text}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {text}
      </motion.p>

      {/* Optional progress bar */}
      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-800 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Animated dots */}
      <div className="flex justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-gray-400 rounded-full"
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
    </div>
  );
};

export default InlineLoader;
