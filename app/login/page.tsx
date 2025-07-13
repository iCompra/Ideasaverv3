'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseReady } from '@/src/lib/supabaseClient';
import { useAuth } from '@/src/hooks/use-auth';
import { logError } from '@/src/lib/errorLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import ErrorMessage from '@/src/components/ui/ErrorMessage';
import LoadingSpinner from '@/src/components/ui/LoadingSpinner';
import { toast } from 'sonner';
/**
 * Login page component with premium design and theme-aware styling
 * Features smooth animations and enhanced UX
 */
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; details: any } | null>(null);
   
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // --- CRITICAL: Redirection for authenticated users on login page ---
  useEffect(() => {
    if (!authLoading && user) {
      // If user is authenticated and loading is complete, redirect to /record
      console.log('LoginPage: User authenticated, redirecting to /record');
      router.push('/record');
    }
  }, [user, authLoading, router]);
  /**
   * Check Supabase configuration on component mount
   */
  useEffect(() => {
    if (!isSupabaseReady()) {
      setError({
        message: 'Supabase is not configured. Please check your environment variables.',
        details: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
      });
    }
  }, []);

  // Show loading if auth state is pending OR user is already authenticated (and redirecting)
  if (authLoading || user) {
    console.log('LoginPage: Is loading or User is present, rendering redirect/loading...');
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark-primary-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">
            {authLoading ? 'Loading authentication...' : 'Redirecting to your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Clear error when switching tabs or changing form values
   */
  useEffect(() => {
    if (isSupabaseReady()) {
      setError(null);
    }
  }, [activeTab, email, password]);

  /**
   * Handle form validation
   */
  const validateForm = (): boolean => {
    if (!isSupabaseReady()) {
      setError({
        message: 'Supabase is not configured. Please check your environment variables.',
        details: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
      });
      return false;
    }

    if (!email || !password) {
      setError({
        message: 'Please fill in all fields',
        details: `Missing: ${!email ? 'email' : ''} ${!password ? 'password' : ''}`
      });
      return false;
    }
    
    if (password.length < 6) {
      setError({
        message: 'Password must be at least 6 characters long',
        details: `Current password length: ${password.length}`
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError({
        message: 'Please enter a valid email address',
        details: `Invalid email format: ${email}`
      });
      return false;
    }
    
    return true;
  };

  /**
   * Handle user sign up
   */
  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: signUpError } = await getSupabaseBrowserClient().auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (data.user) {
        toast({
          title: 'Account Created!',
          description: 'Please check your email to confirm your account before signing in.'
        });
        setActiveTab('signin');
      }
    } catch (error) {
      logError(error as Error, { 
        action: 'signUp', 
        email,
        timestamp: new Date().toISOString()
      });

      let friendlyMessage = 'An unexpected error occurred during sign up.';
      
      if (error instanceof Error) {
        if (error.message.includes('User already registered')) {
          friendlyMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Password should be at least')) {
          friendlyMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Invalid email')) {
          friendlyMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('signup is disabled')) {
          friendlyMessage = 'Account registration is currently disabled. Please contact support.';
        }
      }
      
      setError({
        message: friendlyMessage,
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user sign in
   */
  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: signInError } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (data.user) {
        // Success! The useAuth hook will handle user state updates
        // The useEffect above will handle redirection to /record
        console.log('LoginPage: Sign-in successful, useEffect will handle redirect');
      }
    } catch (error) {
      let friendlyMessage = 'An unexpected error occurred during sign in.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Invalid email or password. Please try again.';
          // Log as info since this is expected user behavior, not a system error
          console.info('Sign-in attempt with invalid credentials:', { email, timestamp: new Date().toISOString() });
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please check your email and click the confirmation link before signing in.';
          console.info('Sign-in attempt with unconfirmed email:', { email, timestamp: new Date().toISOString() });
        } else if (error.message.includes('Too many requests')) {
          friendlyMessage = 'Too many sign-in attempts. Please wait a moment and try again.';
          console.warn('Rate limit exceeded for sign-in:', { email, timestamp: new Date().toISOString() });
        } else if (error.message.includes('signup is disabled')) {
          friendlyMessage = 'Sign-in is currently disabled. Please contact support.';
          console.warn('Sign-in attempted while disabled:', { email, timestamp: new Date().toISOString() });
        } else {
          // Only log unexpected errors as actual errors
          logError(error as Error, { 
            action: 'signIn', 
            email,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      setError({
        message: friendlyMessage,
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Google OAuth sign in
   */
  const handleGoogleSignIn = async () => {
    if (!isSupabaseReady()) {
      setError({
        message: 'Supabase is not configured. Please check your environment variables.',
        details: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { error: oauthError } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (oauthError) {
        throw oauthError;
      }
    } catch (error) {
      logError(error as Error, { 
        action: 'googleSignIn',
        timestamp: new Date().toISOString()
      });

      let friendlyMessage = 'An unexpected error occurred with Google sign in.';
      
      if (error instanceof Error) {
        if (error.message.includes('OAuth')) {
          friendlyMessage = 'Google sign in is not available. Please use email and password.';
        } else if (error.message.includes('popup')) {
          friendlyMessage = 'Please allow popups for Google sign in to work.';
        }
      }
      
      setError({
        message: friendlyMessage,
        details: error
      });
      setIsLoading(false);
    }
  };

  /**
   * Handle retry for error states
   */
  const handleRetry = () => {
    setError(null);
    setEmail('');
    setPassword('');
  };

  // --- Only render the login/signup form if NOT loading and NOT authenticated ---
  console.log('LoginPage: Rendering login/signup form.');

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2 gradient-text">
            Welcome to Idea Saver
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account or create a new one
          </p>
        </motion.div>

        <motion.div 
          className="card-themed p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Supabase Configuration Warning */}
          {!isSupabaseReady() && (
            <motion.div 
              className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-yellow-400 font-medium mb-2 text-sm">⚠️ Configuration Required</h3>
              <p className="text-yellow-200 text-xs leading-relaxed">
                Supabase is not configured. Please update your environment variables.
              </p>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            {['signin', 'signup'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab as 'signin' | 'signup')}
                disabled={!isSupabaseReady()}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                whileTap={{ scale: 0.98 }}
                layout
              >
                {tab === 'signin' ? 'Sign In' : 'Sign Up'}
              </motion.button>
            ))}
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="Enter your email"
                  disabled={isLoading || !isSupabaseReady()}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 w-full"
                  placeholder="Enter your password"
                  disabled={isLoading || !isSupabaseReady()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              onClick={activeTab === 'signin' ? handleSignIn : handleSignUp}
              disabled={isLoading || !isSupabaseReady()}
              className="btn-gradient w-full py-3 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus-ring"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                activeTab === 'signin' ? 'Sign In' : 'Sign Up'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-muted-foreground text-sm">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Google Sign In */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading || !isSupabaseReady()}
            className="w-full bg-card hover:bg-muted/50 disabled:bg-muted/30 disabled:cursor-not-allowed border-2 border-primary/20 hover:border-primary/40 text-foreground font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 focus-ring"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </motion.button>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ErrorMessage 
                  message={error.message} 
                  details={error.details}
                  onRetry={handleRetry} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}