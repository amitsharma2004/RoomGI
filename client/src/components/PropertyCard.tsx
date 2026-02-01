import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedCounter, ViewingCountBadge } from './';
import type { Property } from '../hooks';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/property/${property.id}`);
  };

  const getScoreColor = (score: number | undefined, type: 'deposit' | 'reality') => {
    if (!score) return 'text-gray-400';
    
    if (type === 'deposit') {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (score >= 4) return 'text-green-600';
      if (score >= 3) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const getWarningLevel = (flagCount: number | undefined) => {
    if (!flagCount || flagCount === 0) return null;
    if (flagCount >= 5) return { level: 'danger', color: 'text-red-600', text: 'High Risk' };
    if (flagCount >= 2) return { level: 'warning', color: 'text-yellow-600', text: 'Caution' };
    return null;
  };

  const warning = getWarningLevel(property.flagCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
      }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
    >
      {/* Property Image */}
      {property.images && property.images.length > 0 && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={property.images[0]}
            alt={`${property.location} property`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            crossOrigin="anonymous"
            onError={(e) => {
              // Hide image container if image fails to load
              (e.target as HTMLImageElement).parentElement?.classList.add('hidden');
            }}
          />
          {property.verified && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 bg-opacity-90">
                ✓ Verified
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header with location and verification */}
        <div className="flex justify-between items-start mb-3">
          <motion.h3 
            className="text-lg font-semibold text-gray-900 truncate flex-1"
            whileHover={{ scale: 1.02 }}
          >
            {property.location}
          </motion.h3>
          <div className="flex items-center gap-2 ml-2">
            {!property.images?.length && property.verified && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                ✓ Verified
              </motion.span>
            )}
            {warning && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 ${warning.color}`}
              >
                ⚠ {warning.text}
              </motion.span>
            )}
          </div>
        </div>

        {/* Rent and Property Type */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-gray-900">
            ₹<AnimatedCounter value={property.rent} />
            <span className="text-sm font-normal text-gray-500">/month</span>
          </div>
          <div className="text-sm text-gray-600 capitalize">
            {property.propertyType}
          </div>
        </div>

        {/* Beds Information */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              <AnimatedCounter value={property.bedsAvailable} />
            </span> available / 
            <span className="font-medium"> {property.totalBeds}</span> total beds
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className={`text-lg font-semibold ${getScoreColor(property.depositScore, 'deposit')}`}>
              {property.depositScore ? (
                <>
                  <AnimatedCounter value={property.depositScore} suffix="%" />
                </>
              ) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Deposit Score</div>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className={`text-lg font-semibold ${getScoreColor(property.realityScore, 'reality')}`}>
              {property.realityScore ? (
                <>
                  <AnimatedCounter value={property.realityScore} suffix="/5" />
                </>
              ) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Reality Score</div>
          </motion.div>
        </div>

        {/* Reviews and Viewing Count */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>
            <AnimatedCounter value={property.reviewCount || 0} /> review{(property.reviewCount || 0) !== 1 ? 's' : ''}
          </span>
          <ViewingCountBadge 
            propertyId={property.id} 
            variant="compact"
            pollInterval={10000}
          />
        </div>

        {/* View Details Button */}
        <motion.button
          onClick={handleViewDetails}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};