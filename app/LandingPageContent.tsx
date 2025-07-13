'use client'; // CRITICAL: Mark as client component, as it uses hooks and framer-motion

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mic, 
  Sparkles, 
  Compass, 
  Cloud, 
  Mail, 
  FileText,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { LavaLamp } from '@/components/ui/fluid-blob';
import { useAuth } from '@/src/hooks/use-auth'; // CRITICAL: Use useAuth instead of useAppStore

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-dark-secondary-bg border border-dark-border-subtle rounded-xl p-6 hover:bg-dark-secondary-bg/80 transition-all duration-300 group hover:scale-105 hover:shadow-xl"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 text-accent-purple group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-dark-text-light">{title}</h3>
      </div>
      <p className="text-dark-text-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}

interface DataPrivacyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function DataPrivacyCard({ icon, title, description, delay = 0 }: DataPrivacyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex items-start space-x-4 p-4 bg-dark-secondary-bg border border-dark-border-subtle rounded-xl mb-4 hover:bg-dark-secondary-bg/80 transition-all duration-300"
    >
      <div className="p-2 rounded-lg bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 text-accent-purple flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-semibold text-dark-text-light mb-2">{title}</h4>
        <p className="text-sm text-dark-text-muted leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/**
 * Public Landing Page Content - Showcases Idea Saver with LavaLamp background
 * Accessible to all users (logged in or out)
 * ENFORCES bg-dark-primary-bg and proper layout
 */
export default function LandingPageContent() {
  const { user, isLoading } = useAuth(); // Use useAuth for user state
  const router = useRouter();

  const handlePrimaryAction = () => {
    // Based on user authentication status, redirect to record or login
    if (!isLoading && user) { // Ensure user state is stable before redirecting
      router.push('/record');
    } else if (!isLoading && !user) {
      router.push('/login');
    }
    // If isLoading, do nothing, the UI will show loading or let useAuth handle initial redirect
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-auto bg-dark-primary-bg">
      {/* LavaLamp Background - Full Screen */}
      <LavaLamp />

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 pt-24 pb-16 md:pt-32 md:pb-24 max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mb-20 md:mb-24"
        >
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg mb-6 mix-blend-exclusion">
            From Passing Thought
            <br />
            to Finished Plan
          </h1>
          
          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed mb-12 mix-blend-exclusion"
          >
            Idea Saver is more than a voice recorder. It's your personal AI assistant for capturing, structuring, and expanding on your best ideas.
          </motion.p>

          {/* Call-to-Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full"
          >
            <motion.button
              onClick={handlePrimaryAction}
              className="btn-gradient py-4 px-8 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 group w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{user ? 'Continue Recording' : 'Start Saving Ideas'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            <Link href="/pricing">
              <motion.button
                className="bg-dark-secondary-bg border-2 border-accent-purple text-dark-text-light font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-dark-secondary-bg/80 w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                View Plans
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-dark-text-muted mt-8"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-accent-purple" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-accent-purple" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-accent-purple" />
              <span>Privacy first</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Core Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-full mb-24 mt-20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-text-light mb-4 gradient-text">
            Powerful Features
          </h2>
          <p className="text-dark-text-muted mb-16 max-w-2xl mx-auto text-lg">
            Everything you need to capture, organize, and expand your ideas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4 lg:px-0">
            <FeatureCard
              icon={<Mic className="w-6 h-6" />}
              title="Instant Voice Capture"
              description="Record your voice notes, thoughts, and meetings effortlessly. High-quality audio is saved directly on your device."
              delay={0.1}
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI-Powered Transcription"
              description="Convert your audio into accurate, readable text in seconds. Our AI also automatically generates a smart title for each note."
              delay={0.2}
            />
            <FeatureCard
              icon={<Compass className="w-6 h-6" />}
              title="Advanced Content Tools"
              description="Go beyond transcription. Summarize long notes, expand on ideas, create project plans, and extract to-do lists with a single click."
              delay={0.3}
            />
            <FeatureCard
              icon={<Cloud className="w-6 h-6" />}
              title="Secure Cloud Sync"
              description="With our Pro plan, securely back up your notes and transcriptions to the cloud and access them from any device, anytime."
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Data Privacy Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="w-full max-w-4xl mt-24"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-text-light mb-4 gradient-text">
            Your Data, Your Control
          </h2>
          <p className="text-dark-text-muted mb-16 max-w-2xl mx-auto text-lg">
            We believe in transparency. Here's exactly how your data is used to power the app.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-0">
            <DataPrivacyCard
              icon={<Mail className="w-5 h-5" />}
              title="Your Email Address"
              description="Used strictly for account creation, authentication, and password resets. We do not send marketing emails or share your address."
              delay={0.1}
            />
            <DataPrivacyCard
              icon={<Mic className="w-5 h-5" />}
              title="Your Voice Recordings"
              description="Audio is sent to Google's AI models for transcription. This data is used only for this purpose and is not stored unless you enable Cloud Sync."
              delay={0.2}
            />
            <DataPrivacyCard
              icon={<FileText className="w-5 h-5" />}
              title="Your Transcriptions & Notes"
              description="Stored locally on your device by default. If you enable Cloud Sync (a Pro feature), they are stored securely in your private cloud database."
              delay={0.3}
            />
            <DataPrivacyCard
              icon={<Cloud className="w-5 h-5" />}
              title="Cloud Storage (Optional)"
              description="Only activated when you choose Pro plan. All data is encrypted and stored in your private database. You can export or delete anytime."
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-24 mb-16 text-center"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-dark-text-light mb-4">
            Ready to capture your next big idea?
          </h3>
          <p className="text-dark-text-muted mb-12 max-w-xl mx-auto text-lg">
            Join thousands of creators, entrepreneurs, and thinkers who trust Idea Saver with their most valuable thoughts.
          </p>
          <motion.button
            onClick={handlePrimaryAction}
            className="btn-gradient py-4 px-12 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 mx-auto group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}