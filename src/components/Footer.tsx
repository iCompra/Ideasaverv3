'use client';

import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';

/**
 * Footer component - Premium footer with theme-aware styling
 * Features responsive design and subtle animations
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Terms of Service', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Support', href: '#' },
  ];

  return (
    <motion.footer 
      className="bg-dark-primary-bg/80 backdrop-blur-sm border-t border-dark-border-subtle/30 mt-auto"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          {/* Left side - Copyright and Made with Love */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 text-dark-text-muted text-xs">
              <span>© {currentYear} Idea Saver</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>Made with</span>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Heart className="w-3 h-3 text-accent-purple fill-current" />
                </motion.div>
                <span>for creators</span>
              </span>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center space-x-4">
            {footerLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="text-xs text-dark-text-muted hover:text-accent-purple transition-colors duration-200 flex items-center space-x-1 group"
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span>{link.name}</span>
                <ExternalLink className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </motion.a>
            ))}
          </div>

          {/* Right side - Version */}
          <div className="flex items-center space-x-2">
            <motion.div 
              className="px-2 py-1 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border border-primary/20 rounded-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs font-mono text-dark-text-light">v1.0.0</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}