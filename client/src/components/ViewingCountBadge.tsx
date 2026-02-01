import React from 'react';
import { motion } from 'framer-motion';
import { useViewingCount } from '../hooks';
import { LiveIndicator } from './LiveIndicator';

interface ViewingCountBadgeProps {
  propertyId: string;
  pollInterval?: number;
  variant?: 'compact' | 'full';
  className?: string;
}

export const ViewingCountBadge: React.FC<ViewingCountBadgeProps> = ({ 
  propertyId, 
  pollInterval = 10000,
  variant = 'compact',
  className = ''
}) => {
  const { viewingCount, loading, error } = useViewingCount(propertyId, pollInterval);

  if (loading || error || viewingCount === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium ${className}`}
      >
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        {viewingCount}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={className}
    >
      <LiveIndicator 
        count={viewingCount} 
        label="viewing now" 
        variant="viewers"
      />
    </motion.div>
  );
};