'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

/**
 * ThemeToggle component - Premium theme switcher with smooth animations
 * Features fluid transitions and theme-aware styling
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-card border border-border animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-all duration-300 focus-ring"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-primary/10"
        animate={{
          opacity: isDark ? 0.3 : 0.1,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Icon container with rotation animation */}
      <motion.div
        className="relative w-5 h-5 text-foreground"
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0.9,
        }}
        transition={{ 
          duration: 0.5, 
          ease: [0.4, 0, 0.2, 1],
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
      >
        {/* Moon and Sun icons with crossfade */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5,
          }}
          transition={{ duration: 0.3 }}
        >
          <Moon className="w-5 h-5" />
        </motion.div>
        
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <Sun className="w-5 h-5" />
        </motion.div>
      </motion.div>
      
      {/* Subtle pulse effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg border border-primary/20"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ display: 'none' }}
        whileHover={{ display: 'block' }}
      />
    </motion.button>
  );
}