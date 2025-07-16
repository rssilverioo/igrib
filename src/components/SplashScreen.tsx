'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout } from 'lucide-react';

const SplashScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    setIsMobile(window.innerWidth < 768);

    // Only show splash screen on mobile
    if (window.innerWidth >= 768) {
      setIsLoading(false);
      return;
    }

    // Simulate loading time for mobile
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-green-600 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="inline-block mb-4"
            >
              <Sprout className="h-16 w-16 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold text-white">
                igrib
              </h1>
              <p className="text-sm text-gray-200">
                Conectando produtores e compradores
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;