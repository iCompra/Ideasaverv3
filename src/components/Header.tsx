'use client';

import { useState } from 'react';
import { useAuth } from '@/src/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { User, LogOut, Lightbulb, Coins, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import Link from 'next/link';

/**
 * Header component - Premium navigation bar with conditional rendering
 * Shows different content based on authentication status
 */
export default function Header() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items based on authentication status
  const authenticatedNavItems = [
    { name: 'Record', href: '/record' },
    { name: 'History', href: '/history' },
    { name: 'Settings', href: '/settings' },
  ];

  const publicNavItems = [
    { name: 'Pricing', href: '/pricing' },
    { name: 'How Credits Work', href: '/credits' },
    { name: 'About', href: '/about' },
  ];

  const navigationItems = user ? authenticatedNavItems : publicNavItems;

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-dark-primary-bg/50 backdrop-blur-lg border-b border-dark-border-subtle/30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <motion.div 
                  className="p-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue shadow-lg"
                  whileHover={{ 
                    boxShadow: "0 8px 25px rgba(138, 43, 226, 0.4)",
                    scale: 1.05 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Lightbulb className="w-5 h-5 text-white" />
                </motion.div>
                {/* Subtle glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue opacity-20 blur-md"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground gradient-text">
                  Idea Saver
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Capture your thoughts
                </p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item, index) => (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative cursor-pointer"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.name}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-purple to-accent-blue rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Language Selector */}
            <LanguageSelector />

            {user ? (
              <>
                {/* Credits Display */}
                <motion.div 
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border border-primary/20 rounded-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {profile ? profile.credits.toLocaleString() : '0'}
                  </span>
                </motion.div>

                {/* Desktop User Menu */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-card border border-border rounded-lg">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full border border-primary/20"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                      {user.name || user.email}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={signOut}
                    className="flex items-center space-x-2 px-3 py-2 text-dark-text-muted hover:text-dark-text-light hover:bg-dark-secondary-bg/50 rounded-lg transition-all duration-200 focus-ring"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Out</span>
                  </motion.button>
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-foreground hover:bg-muted/50 rounded-lg transition-colors focus-ring"
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isMobileMenuOpen ? 'close' : 'menu'}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </>
            ) : (
              /* Sign In Button for Unauthenticated Users */
              <Link href="/login">
                <motion.button
                  className="btn-gradient px-6 py-2 rounded-lg text-sm font-medium focus-ring"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden mt-4 pt-4 border-t border-border"
            >
              <div className="space-y-4">
                {/* Mobile User Info */}
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-primary/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                        {authLoading || !profile ? '...' : profile.credits.toLocaleString()}
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border border-primary/20 rounded-lg">
                    <Coins className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {profile ? profile.credits.toLocaleString() : '0'}
                    </span>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div className="grid grid-cols-2 gap-2">
                  {navigationItems.map((item, index) => (
                    <Link key={item.name} href={item.href}>
                      <motion.div
                        className="p-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.name}
                      </motion.div>
                    </Link>
                  ))}
                </div>

                {/* Mobile Sign Out */}
                <motion.button
                  onClick={signOut}
                  className="w-full flex items-center justify-center space-x-2 p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 focus-ring"
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu for Unauthenticated Users */}
        <AnimatePresence>
          {isMobileMenuOpen && !user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden mt-4 pt-4 border-t border-border"
            >
              <div className="space-y-2">
                {publicNavItems.map((item, index) => (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      className="block p-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                ))}
                <Link href="/login">
                  <motion.button
                    className="w-full btn-gradient py-3 px-4 rounded-lg text-sm font-medium mt-4 focus-ring"
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}