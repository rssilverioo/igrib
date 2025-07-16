'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Phone } from 'lucide-react';

const MobileAppPrompt = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [hasClosedPrompt, setHasClosedPrompt] = useState(false);

  // Only show on mobile devices
  if (typeof window !== 'undefined' && window.innerWidth >= 1024 || hasClosedPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 z-50"
        >
          <button
            onClick={() => {
              setIsVisible(false);
              setHasClosedPrompt(true);
            }}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Phone className="h-12 w-12 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                {t('mobilePrompt.title')}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {t('mobilePrompt.description')}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href="#" // Add App Store link
              className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              App Store
            </a>
            <a
              href="#" // Add Play Store link
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Play Store
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileAppPrompt;