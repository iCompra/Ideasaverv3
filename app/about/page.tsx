'use client';

import { motion } from 'framer-motion';
import { Linkedin, Mail, Code, ExternalLink, Lightbulb, Heart, Sparkles } from 'lucide-react';

/**
 * About page - Information about the developer and app
 * Public page accessible to all users
 */
export default function AboutPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-dark-primary-bg text-dark-text-light py-10 px-4 flex flex-col items-center">
      <div className="text-center mb-10 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">About Idea Saver</h1>
          <p className="text-dark-text-muted text-lg mb-6 leading-relaxed">
            Your personal AI assistant for capturing, structuring, and expanding on your best ideas.
          </p>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {/* Developer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-dark-secondary-bg border border-dark-border-subtle rounded-xl shadow-lg p-8 text-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Lightbulb className="w-16 h-16 text-accent-purple mx-auto" />
            </motion.div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-dark-text-light">Milton Diaz</h2>
          <p className="text-dark-text-muted text-lg mb-6">Sole Developer & Creator</p>
          
          <div className="bg-dark-tertiary-bg rounded-lg p-6 mb-8">
            <p className="text-dark-text-light leading-relaxed max-w-prose mx-auto">
              Hey, I'm Milton — a lifelong tech tinkerer and full-time code wrangler. I like building things that solve problems, 
              break gracefully, and maybe even make life a bit easier. I'm always learning, always debugging, and never too far from a command line.
            </p>
            <div className="flex items-center justify-center mt-4 text-dark-text-muted">
              <Heart className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-sm">Made with passion for creators</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.a 
              href="https://www.linkedin.com/in/milton-diaz-profile" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="bg-accent-purple text-dark-text-light py-3 px-6 rounded-lg flex items-center space-x-2 hover:opacity-90 transition-opacity shadow-lg"
            >
              <Linkedin className="w-5 h-5" />
              <span>Connect on LinkedIn</span>
            </motion.a>
            
            <motion.a 
              href="https://canvasdesk.example.com" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="bg-dark-tertiary-bg text-dark-text-light py-3 px-6 rounded-lg flex items-center space-x-2 hover:bg-dark-secondary-bg transition-colors border border-dark-border-subtle"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Check out CanvasDesk</span>
            </motion.a>
            
            <motion.a 
              href="mailto:milton@example.com"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="bg-dark-tertiary-bg text-dark-text-light py-3 px-6 rounded-lg flex items-center space-x-2 hover:bg-dark-secondary-bg transition-colors border border-dark-border-subtle"
            >
              <Mail className="w-5 h-5" />
              <span>Send an Email</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Tech Stack Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-secondary-bg border border-dark-border-subtle rounded-xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-dark-text-light flex items-center">
            <Code className="w-6 h-6 mr-3 text-accent-purple" />
            Built With Modern Technology
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { name: 'Next.js', description: 'React Framework' },
              { name: 'TypeScript', description: 'Type Safety' },
              { name: 'Supabase', description: 'Backend & Auth' },
              { name: 'Tailwind CSS', description: 'Styling' },
              { name: 'Framer Motion', description: 'Animations' },
              { name: 'Shadcn/UI', description: 'Components' },
              { name: 'Google AI', description: 'Transcription' },
              { name: 'Edge Functions', description: 'AI Processing' }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="bg-dark-tertiary-bg rounded-lg p-3 text-center border border-dark-border-subtle"
              >
                <div className="font-semibold text-dark-text-light text-sm">{tech.name}</div>
                <div className="text-xs text-dark-text-muted mt-1">{tech.description}</div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-dark-text-muted leading-relaxed text-center">
            This application leverages cutting-edge AI technology to provide intelligent voice note processing, 
            all wrapped in a beautiful, responsive interface that works seamlessly across all your devices.
          </p>
        </motion.div>

        {/* App Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-dark-secondary-bg border border-dark-border-subtle rounded-xl shadow-lg p-8 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-accent-purple mr-2" />
            <h3 className="text-2xl font-bold text-dark-text-light">Application Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-dark-tertiary-bg rounded-lg p-4">
              <div className="text-2xl font-bold text-accent-purple mb-1">v1.0.0</div>
              <div className="text-sm text-dark-text-muted">Current Version</div>
            </div>
            <div className="bg-dark-tertiary-bg rounded-lg p-4">
              <div className="text-2xl font-bold text-accent-purple mb-1">{currentYear}</div>
              <div className="text-sm text-dark-text-muted">Year Released</div>
            </div>
            <div className="bg-dark-tertiary-bg rounded-lg p-4">
              <div className="text-2xl font-bold text-accent-purple mb-1">MIT</div>
              <div className="text-sm text-dark-text-muted">Open Source</div>
            </div>
          </div>
          
          <p className="text-dark-text-muted text-sm mb-4">
            Built with ❤️ for creators, entrepreneurs, and anyone who believes ideas deserve to be captured and nurtured.
          </p>
          
          <p className="text-dark-text-muted text-sm">
            © {currentYear} Idea Saver. All Rights Reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}