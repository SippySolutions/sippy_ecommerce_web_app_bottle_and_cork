import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';

const UpdateDialog = ({ 
  isOpen, 
  updateInfo, 
  onUpdate, 
  onDismiss, 
  onLater 
}) => {
  if (!isOpen || !updateInfo || !Capacitor.isNativePlatform()) {
    return null;
  }

  const isForced = updateInfo.isForced;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={!isForced ? onDismiss : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <div className={`text-4xl mb-2 ${isForced ? 'text-red-500' : 'text-blue-500'}`}>
                {isForced ? '⚠️' : '🚀'}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isForced ? 'Update Required' : 'Update Available'}
              </h3>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-2">
                {updateInfo.updateMessage || 'A new version is available with improvements and bug fixes.'}
              </p>
              
              <div className="text-xs text-gray-500 mb-3">
                <span className="font-medium">Latest Version:</span> {updateInfo.latestVersion}
              </div>

              {/* Features list */}
              {updateInfo.features && updateInfo.features.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">What's New:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {updateInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Force update warning */}
              {isForced && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-red-700">
                    <strong>Important:</strong> This update is required to continue using the app.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {!isForced && (
                <button
                  onClick={onLater}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Later
                </button>
              )}
              <button
                onClick={onUpdate}
                className={`${isForced ? 'w-full' : 'flex-1'} ${
                  isForced 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white px-4 py-2 rounded-lg font-medium transition-colors`}
              >
                {isForced ? 'Update Now' : 'Update'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateDialog;
