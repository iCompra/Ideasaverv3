/**
 * LoadingSpinner component - Reusable loading indicator
 * Displays animated spinner for loading states
 */
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
    </div>
  );
}