import dynamic from 'next/dynamic';
import LoadingSpinner from '@/src/components/ui/LoadingSpinner';

// Dynamically import the main component to handle client-side rendering issues
const LandingPageContent = dynamic(() => import('./LandingPageContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark-primary-bg">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-dark-text-muted mt-4">Loading Idea Saver...</p>
      </div>
    </div>
  )
});

/**
 * Main landing page - Uses dynamic import for WebContainer compatibility
 */
export default function LandingPage() {
  return <LandingPageContent />;
}