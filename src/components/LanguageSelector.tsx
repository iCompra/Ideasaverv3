'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { changeLanguage } from '@/src/lib/i18n';

/**
 * LanguageSelector component - Premium language switcher with theme-aware styling
 * Features smooth animations and responsive design
 */
export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <div className="w-20 h-10 rounded-lg bg-card border border-border animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-all duration-300 focus-ring"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-foreground" />
        <span className="text-sm font-medium text-foreground hidden sm:inline">
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ 
                duration: 0.2, 
                ease: [0.4, 0, 0.2, 1],
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="absolute top-full mt-2 right-0 z-20 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-[140px] backdrop-blur-sm"
            >
              {languages.map((language, index) => (
                <motion.button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                    currentLanguage.code === language.code 
                      ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                      : 'text-foreground'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{language.name}</span>
                    <span className="text-xs text-muted-foreground">{language.code.toUpperCase()}</span>
                  </div>
                  {currentLanguage.code === language.code && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-primary rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}