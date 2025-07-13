'use client';

import { useAuthListener } from '@/src/lib/authListener';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component - Wraps the app to provide authentication context
 * Initializes auth listener and manages global auth state
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth listener
  useAuthListener();
  
  return <>{children}</>;
}