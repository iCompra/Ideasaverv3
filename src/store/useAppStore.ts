import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User interface for the application state
 */
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * Application state interface
 */
interface AppState {
  // User state
  user: User | null;
  credits: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setCredits: (credits: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // User actions
  login: (user: User) => void;
  logout: () => void;
  updateCredits: (amount: number) => void;
}

/**
 * Zustand store for application state management
 * Persists user data and credits to localStorage
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      credits: 0,
      isLoading: false,
      error: null,
      
      // Basic setters
      setUser: (user) => set({ user }),
      setCredits: (credits) => set({ credits: Math.max(0, credits) }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // User actions
      login: (user) => set({ user, error: null }),
      logout: () => set({ user: null, credits: 0, error: null }),
      
      // Credits management
      updateCredits: (amount) => {
        const currentCredits = get().credits;
        const newCredits = Math.max(0, currentCredits + amount);
        set({ credits: newCredits });
      },
    }),
    {
      name: 'idea-saver-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

/**
 * Hook to get user authentication status
 * @returns boolean indicating if user is authenticated
 */
export function useAuth(): boolean {
  return useAppStore((state) => state.user !== null);
}

/**
 * Hook to get user credits with formatted display
 * @returns object with credits value and formatted string
 */
export function useCredits(): { credits: number; formatted: string } {
  const credits = useAppStore((state) => state.credits);
  return {
    credits,
    formatted: credits.toLocaleString(),
  };
}