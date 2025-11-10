'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoadingStore } from '@/hooks/use-loading-store';

export function TopLoadingBar() {
  const { count } = useLoadingStore();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setVisible(true);
      let value = 0;
      const interval = setInterval(() => {
        value = Math.min(value + Math.random() * 10, 90);
        setProgress(value);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [count]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 h-[8px] bg-primary z-[9999] shadow-md"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          exit={{ opacity: 0 }}
          transition={{ ease: 'easeInOut', duration: 0.2 }}
        />
      )}
    </AnimatePresence>
  );
}
