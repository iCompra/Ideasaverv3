// src/hooks/use-auth.tsx

"use client"; 

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/src/lib/supabaseClient'; 

interface UserProfile {
  id: string;
  email: string;
  credits: number;
  current_plan: 'free' | 'full_app_purchase';
  has_purchased_app: boolean;
  cloud_sync_enabled: boolean;
  auto_cloud_sync: boolean;
  deletion_policy_days: number;
  created_at: string;
  plan_selected: boolean;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateCredits: (newCredits: number) => void;
  signOut: () => Promise<void>;
  refetchProfile: (additionalData?: Partial<UserProfile>) => Promise<void>; // CRITICAL: refetchProfile accepts optional data
  updateProfile: (updateData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true, set to false only after initial load/profile check
  const router = useRouter();
  const pathname = usePathname();

  // CRITICAL: Define handleProfileUpsert with optional additionalData parameter
  const handleProfileUpsert = useCallback(async (userId: string, userEmail: string, additionalData: Partial<UserProfile> = {}): Promise<UserProfile | null> => {
    console.log('useAuth: Calling /api/profile for ID:', userId, 'Email:', userEmail, 'Additional Data:', additionalData);
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, userEmail, ...additionalData }), // CRITICAL: Spread additionalData
        });
        const result = await response.json();
        console.log('useAuth: Response from /api/profile:', response.status, result);

        if (!response.ok || result.error) {
            console.error('❌ useAuth: Error from /api/profile API response:', result.error || 'Unknown API error');
            return null; // Indicate profile fetch/upsert failed
        } else {
            console.log('✅ useAuth: Profile upserted/fetched successfully via API. Profile ID:', result.profile?.id, 'Credits:', result.profile?.credits);
            return result.profile as UserProfile;
        }
    } catch (fetchError: any) {
        console.error('❌ useAuth: Network/Fetch error calling /api/profile:', fetchError);
        return null; // Indicate profile fetch/upsert failed due to network
    }
  }, []);

  const updateCredits = useCallback((newCredits: number) => {
    setProfile(prevProfile => {
      if (prevProfile) {
        return { ...prevProfile, credits: newCredits };
      }
      return null;
    });
  }, []);

  const signOut = useCallback(async () => { 
    setIsLoading(true); // Indicate loading for sign out action
    await getSupabaseBrowserClient().auth.signOut(); 
    router.push('/'); // Redirect after explicit sign out
  }, [router]);

  // CRITICAL: Add refetchProfile function to force profile re-fetch
  const refetchProfile = useCallback(async (additionalData: Partial<UserProfile> = {}) => {
    if (user && user.id && user.email) {
      console.log('🔄 useAuth: Forcing profile re-fetch/update for user:', user.id, 'with data:', additionalData);
      const fetchedProfile = await handleProfileUpsert(user.id, user.email, additionalData);
      setProfile(fetchedProfile);
      console.log('🔄 useAuth: Profile re-fetch completed. New profile state:', fetchedProfile);
    } else {
      console.log('⚠️ useAuth: Cannot refetch profile, no user logged in or missing user data.');
    }
  }, [user, handleProfileUpsert]);

  // CRITICAL: Add updateProfile function for direct profile updates
  const updateProfile = useCallback(async (updateData: Partial<UserProfile>) => {
    if (user && user.id && user.email) {
      console.log('🔄 useAuth: Updating profile for user:', user.id, 'with data:', updateData);
      const updatedProfile = await handleProfileUpsert(user.id, user.email, updateData);
      if (updatedProfile) {
        setProfile(updatedProfile);
        console.log('✅ useAuth: Profile updated successfully:', updatedProfile);
      }
    } else {
      console.log('⚠️ useAuth: Cannot update profile, no user logged in or missing user data.');
    }
  }, [user, handleProfileUpsert]);

  useEffect(() => {
    console.log('useAuth: useEffect started');
    
    const initializeAuthAndProfile = async () => {
        console.log('🔍 useAuth: Starting initial auth and profile initialization...');
        setIsLoading(true); // Ensure loading is true at start

        const { data: { session }, error: sessionError } = await getSupabaseBrowserClient().auth.getSession();
        
        if (sessionError) {
            console.error('❌ useAuth: Error getting initial session:', sessionError);
            setUser(null);
            setProfile(null);
        } else if (session?.user) {
            console.log('✅ useAuth: Initial session found for user:', session.user.id);
            setUser(session.user);
            const fetchedProfile = await handleProfileUpsert(session.user.id, session.user.email || '');
            setProfile(fetchedProfile);
        } else {
            console.log('🚪 useAuth: No initial session found.');
            setUser(null);
            setProfile(null);
        }
        setIsLoading(false); // Set to false ONLY after initial session & profile check
        console.log('🔄 useAuth: Initial auth initialization complete. isLoading set to false.');
    };

    initializeAuthAndProfile(); // Call on component mount

    // Listener for subsequent auth state changes (login/logout actions, token refreshes)
    const { data: authListener } = getSupabaseBrowserClient().auth.onAuthStateChange(async (event, session) => {
        console.log('useAuth: onAuthStateChange event:', event);
        console.log('🔐 Auth State Change Event (from listener):', event, 'User ID:', session?.user?.id || 'none');
        
        if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ useAuth (listener): User signed in. Re-fetching profile via API Route...');
            setUser(session.user);
            const fetchedProfile = await handleProfileUpsert(session.user.id, session.user.email || '');
            setProfile(fetchedProfile);
            setIsLoading(false); // Ensure loading is off after a successful sign-in process
        } else if (event === 'SIGNED_OUT') {
            console.log('🚪 useAuth (listener): User signed out. Clearing state.');
            setUser(null);
            setProfile(null);
            setIsLoading(false); // Ensure loading is off after sign-out
        }
        // For other events (e.g., TOKEN_REFRESHED), the state should already be consistent, no re-fetch needed
    });

    return () => {
      console.log('useAuth: useEffect cleanup');
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [handleProfileUpsert]); // Include handleProfileUpsert in dependencies

  // --- CRITICAL: Secondary useEffect for REDIRECTION based on profile state ---
  // This runs whenever user, profile, or isLoading changes.
  // This is the centralized redirection logic.
  useEffect(() => {
    if (!isLoading) { // Ensure authentication state is stable
      if (user && profile) { // If authenticated and profile loaded
        if (!profile.plan_selected) { // If user hasn't selected a plan
          if (pathname !== '/pricing') { // Only redirect if not already on pricing page
            console.log(`🔀 useAuth (global redirect): User has no plan selected. Redirecting from ${pathname} to /pricing.`);
            router.push('/pricing');
          }
        } else { // User has a plan selected
          if (pathname === '/login' || pathname === '/' || pathname === '/pricing') {
             console.log(`🔀 useAuth (global redirect): User authenticated with plan. Redirecting from ${pathname} to /record.`);
             router.push('/record');
          }
        }
      } else if (!user) { // If not authenticated
        const protectedRoutes = ['/record', '/settings', '/history', '/pricing'];
        // If on a protected route, redirect to login.
        if (protectedRoutes.includes(pathname)) {
          console.log(`🔀 useAuth (global redirect): Unauthenticated user. Redirecting from ${pathname} to /login.`);
          router.push('/login');
        }
      }
    }
  }, [user, profile, isLoading, pathname, router]); // Depend on all state variables and router

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isAuthenticated: !!user, updateCredits, signOut, refetchProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};