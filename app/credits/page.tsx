'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Star, Gem, Mic, Sparkles, Compass, FileText, Wallet, DollarSign } from 'lucide-react';

/**
 * Credits page - Explains how the credit system works
 * Public page accessible to all users
 */
export default function HowCreditsWorkPage() {
  return (
    <div className="min-h-screen bg-dark-primary-bg text-dark-text-light py-10 px-4 flex flex-col items-center">
      <div className="text-center mb-10 max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4">Unlock Your Potential:</h1>
        <h2 className="text-3xl font-bold mb-4 gradient-text">A Guide to Idea Saver Credits</h2>
        <p className="text-dark-text-muted text-lg mb-6 leading-relaxed">
          Think of them not as a cost, but as a direct investment in your creativity and productivity.
          Every credit you use is a step towards turning a fleeting thought into a tangible result.
        </p>
        <Link href="/pricing" className="text-accent-purple hover:underline text-sm font-semibold">
          <motion.span whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>← Back to Plans</motion.span>
        </Link>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {/* What You Can Achieve Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-dark-secondary-bg border border-dark-border-subtle rounded-xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-dark-text-light">What Can You Achieve With Your Credits?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureItem 
              icon={<Mic className="w-6 h-6" />} 
              title="Convert Voice to Text Instantly" 
              description="Costs 1 credit for every minute of audio, plus 1 credit for an AI-generated title." 
            />
            <FeatureItem 
              icon={<Sparkles className="w-6 h-6" />} 
              title="Expand Your Ideas" 
              description="Turn a spark of inspiration into a detailed draft for just 1 credit." 
            />
            <FeatureItem 
              icon={<Compass className="w-6 h-6" />} 
              title="Summarize in a Snap" 
              description="Extract the essence of long texts for just 1 credit." 
            />
            <FeatureItem 
              icon={<FileText className="w-6 h-6" />} 
              title="Extract Tasks Automatically" 
              description="Let our AI identify actions and create a to-do list for 1 credit." 
            />
            <FeatureItem 
              icon={<Star className="w-6 h-6" />} 
              title="Get Smart Titles" 
              description="This action is bundled with transcription at no extra cost." 
            />
          </div>
        </motion.div>

        {/* How to Boost Your Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-secondary-bg border border-dark-border-subtle rounded-xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-dark-text-light">How to Boost Your Account with Credits</h3>
          <div className="space-y-6 text-dark-text-muted">
            <p className="text-lg">We have flexible options so you never have to stop creating.</p>
            
            <div className="flex items-start space-x-4">
              <Gem className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-dark-text-light mb-2">Start with a Welcome Gift</h4>
                <p>Your journey starts on us! When you sign up, we give you 25 AI Credits completely free.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Star className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-dark-text-light mb-2">The Ultimate Plan: Full Access (Best Deal)</h4>
                <p>Make a one-time purchase to unlock all premium features and receive a massive bundle of 1,500 AI Credits.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <DollarSign className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-dark-text-light mb-2">Credit Packs (Coming Soon)</h4>
                <p>Need more credits without upgrading? Top up your account with our affordable credit packs.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Credit Usage Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-dark-secondary-bg border border-dark-border-subtle rounded-xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-dark-text-light">Real-World Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-tertiary-bg rounded-lg p-4">
              <h4 className="font-semibold text-dark-text-light mb-2">5-minute meeting recording</h4>
              <p className="text-dark-text-muted text-sm mb-3">Transcription + Title Generation</p>
              <div className="flex items-center justify-between">
                <span className="text-dark-text-light">Cost:</span>
                <span className="font-bold text-accent-purple">6 credits</span>
              </div>
            </div>
            
            <div className="bg-dark-tertiary-bg rounded-lg p-4">
              <h4 className="font-semibold text-dark-text-light mb-2">Expand a quick idea</h4>
              <p className="text-dark-text-muted text-sm mb-3">Turn notes into detailed plan</p>
              <div className="flex items-center justify-between">
                <span className="text-dark-text-light">Cost:</span>
                <span className="font-bold text-accent-purple">1 credit</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper component for Feature Items
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="p-2 rounded-lg bg-accent-purple/20 text-accent-purple flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-dark-text-light mb-1">{title}</h4>
        <p className="text-sm text-dark-text-muted">{description}</p>
      </div>
    </div>
  );
}