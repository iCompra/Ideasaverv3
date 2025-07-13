import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  details?: any;
  onRetry?: () => void;
}

/**
 * ErrorMessage component - Displays error messages with optional retry functionality
 * Features smooth animations and collapsible technical details
 */
export default function ErrorMessage({ message, details, onRetry }: ErrorMessageProps) {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  /**
   * Format error details for display
   */
  const formatDetails = (details: any): string => {
    if (!details) return 'No additional details available';
    
    if (typeof details === 'string') return details;
    
    if (details instanceof Error) {
      return `${details.name}: ${details.message}\n\nStack Trace:\n${details.stack || 'No stack trace available'}`;
    }
    
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return details.toString();
    }
  };

  return (
    <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Error Title */}
          <h3 className="text-red-400 font-bold text-sm mb-2">Error</h3>
          
          {/* User-Friendly Message */}
          <p className="text-red-200 text-sm mb-3 leading-relaxed">{message}</p>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center text-sm text-red-300 hover:text-red-200 underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 rounded"
              >
                Try Again
              </button>
            )}
            
            {details && (
              <button
                onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                className="inline-flex items-center space-x-1 text-sm text-red-300 hover:text-red-200 underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 rounded"
              >
                <span>{isDetailsVisible ? 'Hide Details' : 'Show Details'}</span>
                {isDetailsVisible ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {/* Collapsible Technical Details with Animation */}
          <AnimatePresence>
            {details && isDetailsVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  duration: 0.3, 
                  ease: 'easeInOut'
                }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-3 bg-red-950/50 border border-red-600/30 rounded">
                  <h4 className="text-red-300 text-xs font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Technical Details:
                  </h4>
                  <pre className="text-red-200 text-xs whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">
                    {formatDetails(details)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}