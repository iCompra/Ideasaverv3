'use client';

import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  details?: any;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, details, onRetry }: ErrorMessageProps) {
  return (
    <motion.div
      className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {details && (
            <pre className="mt-2 text-xs text-red-400/70 bg-red-900/20 p-2 rounded-md overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
        {onRetry && (
          <button onClick={onRetry} className="text-red-400 hover:text-red-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}