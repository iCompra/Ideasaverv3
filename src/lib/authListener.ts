import { useEffect } from 'react';
import { getSupabaseBrowserClient } from './supabaseClient';
import { useAppStore } from '@/src/store/useAppStore';
import { logError, logInfo } from './errorLogger';

/**
 * Custom hook to listen for authentication state changes
 * Updates the global store when user signs in or out
 */
export function useAuthListener() {
  const { setUser, setLoading } = useAppStore();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await getSupabaseBrowserClient().auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url,
          });
          
          logInfo('User session restored', { 
            userId: session.user.id,
            email: session.user.email 
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        logError(error as Error, { 
          action: 'getInitialSession',
          timestamp: new Date().toISOString()
        });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = getSupabaseBrowserClient().auth.onAuthStateChange(
      async (event, session) => {
        try {
          logInfo('Auth state changed', { event, userId: session?.user?.id });
          
          if (event === 'SIGNED_IN' && session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email || '',
              avatar: session.user.user_metadata?.avatar_url,
            });
            
            logInfo('User signed in successfully', { userId: session.user.id });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            logInfo('User signed out');
            // Redirect to home page after logout
            if (typeof window !== 'undefined') {
              // Use router.push instead of window.location.href for smoother navigation
              const currentPath = window.location.pathname;
              if (currentPath !== '/') {
                window.location.href = '/';
              }
            }
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Update user data on token refresh
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email || '',
              avatar: session.user.user_metadata?.avatar_url,
            });
            logInfo('Token refreshed', { userId: session.user.id });
          }
        } catch (error) {
          logError(error as Error, { 
            action: 'authStateChange',
            event,
            userId: session?.user?.id,
            timestamp: new Date().toISOString()
          });
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);
}

/**
 * Hook to check if user is authenticated
 * @returns {boolean} Authentication status
 */
export function useAuth(): boolean {
  const user = useAppStore((state) => state.user);
  return user !== null;
}

/**
 * Hook to require authentication - redirects to login if not authenticated
 * @param redirectTo - Path to redirect to after login (default: current path)
 */
export function useRequireAuth(redirectTo?: string) {
  const user = useAppStore((state) => state.user);
  const isLoading = useAppStore((state) => state.isLoading);
  
  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = window.location.pathname;
      const redirect = redirectTo || '/record';
      
      // Store intended destination for post-login redirect
      if (redirect !== '/login') {
        sessionStorage.setItem('redirectAfterLogin', redirect);
      }
      
      window.location.href = '/login';
    }
  }, [user, isLoading, redirectTo]);
  
  return { user, isLoading };
}