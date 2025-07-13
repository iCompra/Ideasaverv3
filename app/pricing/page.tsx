'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import { getSupabaseBrowserClient } from '@/src/lib/supabaseClient';
import { logError } from '@/src/lib/errorLogger';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Gift,
  Loader2
} from 'lucide-react';

/**
 * Pricing page component with gift code redemption functionality
 */
export default function PricingPage() {
  const { user, profile, isLoading: authLoading, updateCredits } = useAuth();
  const router = useRouter();
  const [giftCode, setGiftCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<{ message: string; details: any } | null>(null);

  const { toast } = useToast();
  /**
   * Handle gift code redemption
   */
  const handleRedeemCode = async () => {
    if (!user || !profile) {
      toast({ title: 'Error', description: 'Please log in to redeem a gift code.', variant: 'destructive' });
      return;
    }

    if (!giftCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a gift code.', variant: 'destructive' });
      return;
    }

    setIsRedeeming(true);
    setRedeemError(null);

    try {
      // Call the Supabase Edge Function
      const { data, error } = await getSupabaseBrowserClient().functions.invoke('redeem-gift-code', {
        body: { code: giftCode.trim(), userId: user.id },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Check for errors from the Edge Function's JSON response
      if (data && data.error) {
        throw new Error(data.error);
      }

      // Success - update credits and show toast
      toast({
        title: 'Gift Code Redeemed!',
        description: `You now have ${data.newCredits.toLocaleString()} credits.`,
      });

      // Update the user's credit balance
      await updateCredits(data.newCredits);
      setGiftCode(''); // Clear the input field

    } catch (err: any) {
      logError(err, { 
        action: 'redeemGiftCode',
        userId: user.id,
        code: giftCode.trim()
      });

      setRedeemError({
        message: err.message || 'An unexpected error occurred. Please try again.',
        details: err
      });

      toast({
        title: 'Redemption Failed',
        description: err.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  /**
   * Handle plan selection
   */
  const handleSelectPlan = async (planName: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Placeholder for payment integration
    toast({
        title: 'Plan Selected',
        description: `${planName} plan selected! Payment integration coming soon.`
    });
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      credits: '2,500',
      features: [
        'Voice recording & transcription',
        'Basic AI features',
        'Local storage only',
        'Standard support'
      ],
      popular: false,
      buttonText: 'Current Plan',
      disabled: true
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'month',
      credits: '10,000',
      features: [
        'Everything in Free',
        'Cloud sync & backup',
        'Advanced AI tools',
        'Priority support',
        'Export to multiple formats'
      ],
      popular: true,
      buttonText: 'Upgrade to Pro',
      disabled: false
    },
    {
      name: 'Enterprise',
      price: '$29',
      period: 'month',
      credits: '50,000',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-dark-primary-bg pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-dark-text-light mb-4 gradient-text">
            Choose Your Plan
          </h1>
          <p className="text-lg text-dark-text-muted max-w-2xl mx-auto">
            Start free and upgrade when you need more power. All plans include our core AI features.
          </p>
        </motion.div>

        {/* Gift Code Redemption Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md mx-auto mb-16"
        >
          <div className="card-themed p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Gift className="w-5 h-5 text-accent-purple" />
              <h3 className="text-lg font-semibold text-dark-text-light">Have a Gift Code?</h3>
            </div>
            <p className="text-sm text-dark-text-muted mb-4">
              Redeem your gift code to get free credits instantly.
            </p>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                placeholder="Enter gift code"
                className="input-field flex-1"
                disabled={isRedeeming || authLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleRedeemCode()}
              />
              <motion.button
                onClick={handleRedeemCode}
                disabled={isRedeeming || !giftCode.trim() || authLoading}
                className="btn-gradient px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 focus-ring"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                {isRedeeming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Redeem</span>
                )}
              </motion.button>
            </div>

            {redeemError && (
              <div className="mt-4">
                <ErrorMessage
                  message={redeemError.message}
                  details={redeemError.details}
                  onRetry={() => setRedeemError(null)}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className={`card-themed p-8 relative ${
                plan.popular ? 'ring-2 ring-accent-purple' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-accent-purple to-accent-blue px-4 py-1 rounded-full text-white text-sm font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-dark-text-light mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-3xl font-bold text-dark-text-light">{plan.price}</span>
                  <span className="text-dark-text-muted">/{plan.period}</span>
                </div>
                <div className="mt-2 flex items-center justify-center space-x-1">
                  <Zap className="w-4 h-4 text-accent-purple" />
                  <span className="text-sm text-dark-text-muted">{plan.credits} credits</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-4 h-4 text-accent-purple mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-dark-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={plan.disabled}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus-ring ${
                  plan.popular
                    ? 'btn-gradient'
                    : plan.disabled
                    ? 'bg-dark-tertiary-bg text-dark-text-muted cursor-not-allowed'
                    : 'bg-dark-tertiary-bg text-dark-text-light hover:bg-dark-tertiary-bg/80 border border-dark-border-subtle hover:border-accent-purple/40'
                }`}
                whileTap={{ scale: plan.disabled ? 1 : 0.95 }}
                whileHover={{ scale: plan.disabled ? 1 : 1.02 }}
              >
                {plan.name === 'Enterprise' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>{plan.buttonText}</span>
                  </div>
                ) : (
                  plan.buttonText
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-dark-text-muted text-sm">
            All plans include a 30-day money-back guarantee. 
            <br />
            Need help choosing? <span className="text-accent-purple cursor-pointer hover:underline">Contact our team</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}