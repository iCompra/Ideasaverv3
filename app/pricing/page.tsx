'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import { getSupabaseBrowserClient } from '@/src/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast'; // Correct import for Shadcn toast hook
import { Check, Star, Gift, DollarSign, Wallet, Gem } from 'lucide-react';

export default function PricingPage() {
  const { user, profile, isLoading, updateCredits } = useAuth();
  const router = useRouter();
  // Initialize useToast hook
  const { toast } = useToast();

  const [giftCode, setGiftCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isSelectingFreePlan, setIsSelectingFreePlan] = useState(false);

  // CRITICAL: Redirection for new users to enforce plan selection
  useEffect(() => {
    // If auth state is loaded, user is logged in, but NO plan is selected, redirect here.
    if (!isLoading && user && profile?.plan_selected) {
      console.log("User already has a plan, redirecting to /record");
      router.push('/record');
    } else if (!isLoading && !user) {
      console.log("Not logged in, redirecting to /login");
      router.push('/login');
    }
  }, [user, profile, isLoading, router]);


  // --- Function to handle "Continue with Free Plan" ---
  const handleSelectFreePlan = async () => {
    if (!user || !profile || isLoading) {
      toast({ 
        title: "Error", 
        description: "User not loaded.", 
        variant: "destructive" 
      });
      return;
    }

    if (profile.plan_selected) {
      toast({
        title: "Notice",
        description: "You've already selected a plan.",
        variant: "default"
      });
      return;
    }

    setIsSelectingFreePlan(true);
    try {
      console.log("Updating profile for user:", user.id);
      // Update profile in Supabase to mark plan as selected and set free plan
      const { error } = await getSupabaseBrowserClient()
        .from('profiles')
        .update({
          current_plan: 'free',
          plan_selected: true,
          credits: 25 // Grant welcome credits
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error selecting free plan:", error);
        toast({ title: "Error", description: error.message || "Failed to select free plan.", variant: "destructive" });
      } else {
        console.log("Free plan selected successfully!");
        // Update local state in useAuth
        if (typeof updateCredits === 'function') { // Verify updateCredits is a function
            updateCredits(25); // Optimistically update credits
        }
        toast({ title: "Success!", description: "You are now on the Free Plan! Enjoy 25 credits.", variant: "default" });
        router.push('/record'); // Redirect to main app page
      }
    } catch (error: any) {
      console.error("Unexpected error selecting free plan:", error);
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSelectingFreePlan(false);
    }
  };

  // --- Function to handle Gift Code Redemption (from previous prompt) ---
  const handleRedeemCode = async () => {
    if (!user || !profile || isLoading) {
      toast({
        title: 'Error',
        description: 'You must be logged in to redeem a gift code.',
        variant: 'destructive',
      });
      return;
    }
    if (!giftCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a gift code.',
        variant: 'destructive',
      });
      return;
    }

    setIsRedeeming(true);
    try {
      const { data, error } = await getSupabaseBrowserClient().functions.invoke('redeem-gift-code', {
        body: { code: giftCode.trim(), userId: user.id },
      });

      if (error) {
        throw new Error(error.message);
      }
      if (data && data.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success!',
        description: `Gift code redeemed! You now have ${data.newCredits} credits.`,
        variant: 'default',
      });
      if (updateCredits && typeof updateCredits === 'function') {
        updateCredits(data.newCredits);
      }
      setGiftCode('');
    } catch (err: any) {
      console.error('Redeem error:', err);
      toast({
        title: 'Redemption Failed',
        description: err.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  // --- Conditional Rendering for Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark-primary-bg">
        <p className="text-dark-text-light">Loading plans...</p>
      </div>
    );
  }

  // If not logged in, or no profile, redirect to login (should be handled by useAuth for protected routes)
  if (!user || !profile) {
    useEffect(() => {
      router.push('/login'); // If somehow user lands here unauthenticated
    }, [router]);
    return null;
  }

  // --- Main Page Content ---
  const isProUser = profile.has_purchased_app || profile.current_plan === 'full_app_purchase';
  const hasSelectedPlan = profile.plan_selected;

  return (
    <div className="min-h-screen bg-dark-primary-bg text-dark-text-light py-10 px-4 flex flex-col items-center">
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-dark-text-muted text-lg mb-6">
          Unlock Your Potential: A Guide to Idea Saver Credits
        </p>
        {/* Link to How Credits Work page */}
        <a href="/credits" className="text-accent-purple hover:underline text-sm font-semibold">
          How do AI Credits work?
        </a>
      </div>

      {/* Conditional Plan Display (based on isProUser and hasSelectedPlan) */}
      {!isProUser && !hasSelectedPlan && (
        // --- Display for NEW Users (no plan selected yet) ---
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
          {/* Free Plan Card */}
          <div className="bg-dark-secondary-bg p-8 rounded-xl shadow-lg flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-4">Free Plan</h2>
            <p className="text-dark-text-muted mb-6">
              Test out Idea Saver with basic features and a few credits.
            </p>
            <ul className="text-left w-full mb-8 text-dark-text-light space-y-2">
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 25 Welcome Credits</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Voice Recording & Playback</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> AI Transcription & Titling</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Local Storage</li>
            </ul>
            <button
              onClick={handleSelectFreePlan}
              disabled={isSelectingFreePlan}
              className="bg-gradient-to-r from-accent-purple to-accent-blue text-dark-text-light font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              {isSelectingFreePlan ? 'Selecting...' : 'Continue with Free Plan'}
            </button>
          </div>

          {/* Full App Purchase Card (Pro Plan) */}
          <div className="bg-dark-secondary-bg p-8 rounded-xl shadow-lg flex flex-col items-center text-center border-2 border-accent-purple">
            <h2 className="text-2xl font-bold mb-4">Full App Access (Pro)</h2>
            <p className="text-dark-text-muted mb-6">
              Unlock unlimited AI features and cloud sync with a one-time purchase.
            </p>
            <ul className="text-left w-full mb-8 text-dark-text-light space-y-2">
              <li className="flex items-center"><Star className="h-5 w-5 text-yellow-400 mr-2" /> Everything in Free, plus:</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Cloud Sync across devices</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> All advanced AI features (no credit cost)</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Full-text search of your notes (coming soon)</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Priority support</li>
              <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Access to future features & integrations</li>
              <li className="flex items-center"><Gift className="h-5 w-5 text-pink-400 mr-2" /> Massive 1,500 Bonus Credits</li>
            </ul>
            <button
              onClick={() => toast({ title: "Coming Soon!", description: "Payment integration is under development." })}
              className="bg-gradient-to-r from-accent-purple to-accent-blue text-dark-text-light font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              Purchase Full App
            </button>
          </div>
        </div>
      )}

      {/* Display for Existing Free Users (already selected free plan) */}
      {!isProUser && hasSelectedPlan && (
        <div className="text-center mb-10 w-full max-w-xl">
          <h2 className="text-3xl font-bold mb-4">Your Current Plan: Free</h2>
          <p className="text-dark-text-muted mb-8">
            You're currently enjoying the Free Plan. Upgrade to unlock all premium features!
          </p>
          <button
            onClick={() => toast({ title: "Coming Soon!", description: "Payment integration is under development." })}
            className="bg-gradient-to-r from-accent-purple to-accent-blue text-dark-text-light font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Upgrade to Full App Access
          </button>
        </div>
      )}

      {/* Display for Pro Users (Full App Access) */}
      {isProUser && (
        <div className="text-center mb-10 w-full max-w-xl">
          <h2 className="text-3xl font-bold mb-4">You have Full App Access!</h2>
          <p className="text-dark-text-muted mb-8">
            Thank you for supporting Idea Saver! All premium features are unlocked.
          </p>
          <button
            onClick={() => toast({ title: "Thanks!", description: "Donation feature is under development." })}
            className="bg-accent-purple text-dark-text-light font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Make a Donation
          </button>
        </div>
      )}
      
      {/* Credit Packs Section (Always visible for top-ups) */}
      <div className="text-center mb-10 w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-4">Need More Credits?</h2>
        <p className="text-dark-text-muted mb-8">
          Top up your account to keep the ideas flowing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Credit Pack Card Example */}
          <div className="bg-dark-secondary-bg p-6 rounded-xl shadow-lg flex flex-col items-center">
            <Gem className="h-8 w-8 text-yellow-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">100 Credits</h3>
            <p className="text-dark-text-light text-lg mb-4">$4.99 USD</p>
            <button
              onClick={() => toast({ title: "Coming Soon!", description: "Credit pack purchases are under development." })}
              className="bg-dark-tertiary-bg text-dark-text-muted font-semibold py-2 px-6 rounded-lg w-full"
              disabled
            >
              Buy Now (Coming Soon!)
            </button>
          </div>
          {/* Repeat for 500 Credits, 2000 Credits */}
        </div>
      </div>

      {/* Gift Code Redemption Section */}
      <div className="bg-dark-secondary-bg p-8 rounded-xl shadow-lg w-full max-w-md text-center mb-10">
        <h2 className="text-xl font-bold mb-4">Have a Gift Code?</h2>
        <p className="text-dark-text-muted mb-6">Enter your code below to redeem AI credits.</p>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <input
            type="text"
            placeholder="Enter code here"
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value)}
            className="flex-grow p-3 rounded-lg bg-dark-tertiary-bg text-dark-text-light border border-dark-border-subtle focus:border-accent-purple outline-none"
            disabled={isRedeeming}
          />
          <button
            onClick={handleRedeemCode}
            disabled={isRedeeming || !giftCode.trim()}
            className="bg-accent-purple text-dark-text-light px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200"
          >
            {isRedeeming ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
      </div>
    </div>
  );
}