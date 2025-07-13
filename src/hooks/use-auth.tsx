// src/hooks/use-auth.tsx

"use client"; 

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateCredits: (newCredits: number) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Always start as true
  const router = useRouter();

  const updateCredits = useCallback((newCredits: number) => {
    setProfile(prevProfile => {
      if (prevProfile) {
        return { ...prevProfile, credits: newCredits };
      }
      return null;
    });
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true); // Set loading while signing out
    await getSupabaseBrowserClient().auth.signOut(); 
    // onAuthStateChange will handle setting user/profile to null and isLoading to false
    router.push('/'); 
  }, [router]);

  useEffect(() => {
   console.log('useAuth: useEffect started');
    const supabase = getSupabaseBrowserClient();
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
     console.log('useAuth: onAuthStateChange event:', event);
      if (!isMounted) return; // Prevent state updates if component unmounted

      console.log('🔐 useAuth: Auth State Change Event:', event, 'Session User ID:', session?.user?.id || 'none');
      setIsLoading(true); // Set loading at the start of any auth state change processing

      if (session?.user) {
        console.log('✅ useAuth: User detected, fetching profile for ID:', session.user.id, 'Email:', session.user.email);
        setUser(session.user); // Set user immediately

        const { data: profileData, error: profileUpsertError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            credits: 25, 
            current_plan: 'free',
            has_purchased_app: false,
            cloud_sync_enabled: false,
            auto_cloud_sync: false,
            deletion_policy_days: 0,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .select('*')
          .single();

        if (!isMounted) return; // Check again after async operation

        if (profileUpsertError) {
          console.error('❌ useAuth: Error upserting user profile:', profileUpsertError);
          setProfile(null);
        } else {
          console.log('✅ useAuth: Profile upserted/fetched successfully:', profileData?.id, 'Credits:', profileData?.credits);
          setProfile(profileData as UserProfile);
        }
      } else {
        console.log('🚪 useAuth: No user detected (logged out or initial load)');
        setUser(null);
        setProfile(null);
      }

      if (isMounted) {
        setIsLoading(false); // Set loading to false only after all state is resolved
        console.log('🔄 useAuth: Auth state processed. isLoading set to false.');
      }
    });

    console.log('🔍 useAuth: onAuthStateChange listener initialized.');

    return () => {
     console.log('useAuth: useEffect cleanup');
      isMounted = false; // Cleanup for unmounted component
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Dependency array is empty: this useEffect runs once on mount.

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isAuthenticated: !!user, updateCredits, signOut }}>
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