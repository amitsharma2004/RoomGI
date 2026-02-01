import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Property } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useViewingCount } from '../hooks';
import { socketService } from '../lib/socket';
import { NeighborhoodDNA, ReviewsSection, LiveIndicator, AnimatedCounter, PropertyDetailSkeleton } from '../components';
import { PropertyDetailMiniMap } from '../components/PropertyDetailMiniMap';
import type { ActivityItem } from '../types/activity';
import api from '../lib/axios';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'activity'>('overview');
  const [lastBookedTime, setLastBookedTime] = useState<string>('');
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Use the viewing count hook for real-time updates
  const { viewingCount } = useViewingCount(id || '', 5000); // Poll every 5 seconds

  // Socket connection and cleanup
  useEffect(() => {
    if (!id) return;

    socketService.connect();

    // Join property room
    socketService.viewProperty(id);

    // Set up event listeners
    socketService.onAvailabilityUpdated((data) => {
      if (data.propertyId === id) {
        setProperty(prev => prev ? { ...prev, bedsAvailable: data.bedsAvailable } : null);
        toast(`Only ${data.bedsAvailable} bed${data.bedsAvailable !== 1 ? 's' : ''} left!`, {
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        });
      }
    });

    socketService.onBookingActivity((data) => {
      if (data.propertyId === id) {
        setLastBookedTime(data.timestamp);
        toast(data.message, {
          icon: '🔥',
          style: {
            background: '#DBEAFE',
            color: '#1E40AF',
          },
        });
      }
    });

    return () => {
      socketService.leaveProperty(id);
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [id]);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/api/properties/${id}`);
        setProperty(response.data);
      } catch (err) {
        setError('Failed to load property details');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Fetch activity feed
  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      
      try {
        const response = await api.get(`/api/properties/${id}/activity`);
        setActivityFeed(response.data);
        
        // Set last booked time from activity
        const lastBooking = response.data.find((item: ActivityItem) => item.type === 'booking');
        if (lastBooking) {
          setLastBookedTime(lastBooking.timestamp);
        }
      } catch (err) {
        console.error('Error fetching activity:', err);
      }
    };

    if (activeTab === 'activity') {
      fetchActivity();
    }
  }, [id, activeTab]);

  const handleUpdateAvailability = async (newAvailability: number) => {
    if (!id || !property) return;

    try {
      setUpdatingAvailability(true);
      await api.patch(`/api/properties/${id}/availability`, {
        bedsAvailable: newAvailability
      });
      
      setProperty(prev => prev ? { ...prev, bedsAvailable: newAvailability } : null);
      toast.success('Availability updated successfully!');
    } catch (err) {
      toast.error('Failed to update availability');
      console.error('Error updating availability:', err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleContactOwner = async () => {
    if (!property) return;
    
    // Prevent owners from contacting themselves
    if (user?.id === property.ownerId) {
      toast.error("You can't contact yourself!");
      return;
    }
    
    try {
      // Log the contact attempt
      await api.post(`/api/properties/${id}/activity`, {
        type: 'contact',
        message: 'Tenant contacted owner'
      });
      
      toast.success('Contact request sent! Owner will be notified.');
      
      // In a real app, this would open a contact modal or send an email
      // For now, we'll just show a success message
    } catch (err) {
      toast.error('Failed to contact owner');
      console.error('Error contacting owner:', err);
    }
  };

  const handleBookNow = async () => {
    if (!property || property.bedsAvailable === 0) {
      toast.error('No beds available for booking');
      return;
    }
    
    // Prevent owners from booking their own properties
    if (user?.id === property.ownerId) {
      toast.error("You can't book your own property!");
      return;
    }
    
    try {
      // Create a booking request
      await api.post(`/api/properties/${id}/book`, {
        bedsRequested: 1 // Default to 1 bed
      });
      
      toast.success('Booking request submitted! Owner will contact you soon.');
      
      // Update local state to reflect the booking
      setProperty(prev => prev ? { 
        ...prev, 
        bedsAvailable: prev.bedsAvailable - 1 
      } : null);
      
      // Log the booking activity
      await api.post(`/api/properties/${id}/activity`, {
        type: 'booking',
        message: 'New booking request received'
      });
      
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit booking request');
      console.error('Error booking property:', err);
    }
  };

  const handleWriteReview = () => {
    // Scroll to the reviews section and focus on the review form
    setActiveTab('reviews');
    
    // Scroll to reviews section after tab change
    setTimeout(() => {
      const reviewsSection = document.querySelector('[data-tab="reviews"]');
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    toast('Switched to reviews section. Share your experience!', {
      icon: '📝',
      style: {
        background: '#F3F4F6',
        color: '#374151',
      },
    });
  };

  const getUrgencyLevel = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio <= 0.2) return { level: 'high', color: 'bg-red-500', textColor: 'text-red-600' };
    if (ratio <= 0.5) return { level: 'medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { level: 'low', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            {error || 'Property not found'}
          </div>
          <motion.button
            onClick={() => navigate('/properties')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Back to Properties
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const urgency = getUrgencyLevel(property.bedsAvailable, property.totalBeds);
  const isOwner = user?.role === 'owner' && user?.id === property.ownerId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/properties')}
        whileHover={{ x: -5 }}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Properties
      </motion.button>

      {/* Header with Viewer Count */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4"
      >
        <div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {property.location}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-4">
            <motion.span 
              className="text-2xl font-bold text-blue-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              ₹<AnimatedCounter value={property.rent} />/month
            </motion.span>
            <motion.span 
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {property.propertyType}
            </motion.span>
            {property.verified && (
              <motion.span 
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                ✓ Verified
              </motion.span>
            )}
          </div>
        </div>
        
        {viewingCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <LiveIndicator 
              count={viewingCount} 
              label="people viewing now" 
              variant="viewers"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          {/* Image Gallery */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            {property.images && property.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.images.map((imageUrl, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="relative group overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                  >
                    <img
                      src={imageUrl}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      crossOrigin="anonymous"
                      onLoad={(e) => {
                        // Remove background when image loads successfully
                        (e.target as HTMLImageElement).parentElement?.classList.remove('bg-gray-100');
                        (e.target as HTMLImageElement).parentElement?.classList.add('bg-white');
                      }}
                      onError={(e) => {
                        // Fallback for broken images
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://via.placeholder.com/400x240/f3f4f6/9ca3af?text=Image+Not+Available';
                        img.parentElement?.classList.add('bg-gray-100');
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <motion.div 
                    className="text-4xl mb-2"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🏠
                  </motion.div>
                  <p>No Images Available</p>
                  <p className="text-sm">Owner hasn't uploaded images yet</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Neighborhood DNA Component */}
          <div className="mb-6">
            <NeighborhoodDNA propertyId={id!} />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity Feed
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Property Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Property Type:</span>
                    <span className="ml-2 font-medium capitalize">{property.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Beds:</span>
                    <span className="ml-2 font-medium">{property.totalBeds}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Available Beds:</span>
                    <span className="ml-2 font-medium">{property.bedsAvailable}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rent:</span>
                    <span className="ml-2 font-medium">₹{property.rent.toLocaleString()}/month</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700">
                  This is a beautiful {property.propertyType} located in {property.location}. 
                  Perfect for students and working professionals. The property offers modern amenities 
                  and is well-connected to major transport hubs.
                </p>
              </div>

              {/* Location Map */}
              {property.latitude && property.longitude && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                  <PropertyDetailMiniMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    location={property.location}
                    className="h-64 w-full rounded-lg"
                  />
                </div>
              )}

              {/* Lifestyle Scores */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lifestyle Factors</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Nightlife', score: property.nightlifeScore },
                    { label: 'Transit Access', score: property.transitScore },
                    { label: 'Safety', score: property.safetyScore },
                    { label: 'Quietness', score: property.quietnessScore },
                    { label: 'Food Scene', score: property.foodScore },
                    { label: 'Student Friendly', score: property.studentFriendlyScore }
                  ].map(({ label, score }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-gray-700">{label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${star <= score ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div data-tab="reviews">
              <ReviewsSection propertyId={id!} />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Timeline</h2>
              {activityFeed.length > 0 ? (
                <div className="space-y-4">
                  {activityFeed.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-gray-900">{item.message}</p>
                        <p className="text-sm text-gray-500">{formatTimeAgo(item.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No activity yet</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Right Column - Availability Card */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Availability Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
            
            {/* Beds Available */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Beds Available</span>
                <span className={`font-bold text-lg ${urgency.textColor}`}>
                  <AnimatedCounter value={property.bedsAvailable} />/{property.totalBeds}
                </span>
              </div>
              
              {/* Urgency Meter */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <motion.div
                  className={`h-3 rounded-full ${urgency.color} transition-all duration-300`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(property.bedsAvailable / property.totalBeds) * 100}%` }}
                  transition={{ delay: 0.8, duration: 1 }}
                ></motion.div>
              </div>
              <p className={`text-sm ${urgency.textColor} font-medium`}>
                {urgency.level === 'high' && 'High Demand - Book Soon!'}
                {urgency.level === 'medium' && 'Moderate Availability'}
                {urgency.level === 'low' && 'Good Availability'}
              </p>
            </div>

            {/* Last Booked */}
            <div className="mb-4">
              <span className="text-gray-700">Last booked:</span>
              <span className="ml-2 font-medium">{formatTimeAgo(lastBookedTime)}</span>
            </div>

            {/* Owner Controls */}
            {isOwner && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Update Availability</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={property.totalBeds}
                    defaultValue={property.bedsAvailable}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    id="availability-input"
                  />
                  <motion.button
                    onClick={() => {
                      const input = document.getElementById('availability-input') as HTMLInputElement;
                      const newValue = parseInt(input.value);
                      if (newValue >= 0 && newValue <= property.totalBeds) {
                        handleUpdateAvailability(newValue);
                      }
                    }}
                    disabled={updatingAvailability}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {updatingAvailability ? 'Updating...' : 'Update'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent Activity Banner */}
          {lastBookedTime && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-orange-50 border border-orange-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <motion.span 
                  className="text-orange-600"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  🔥
                </motion.span>
                <span className="text-orange-800 font-medium">
                  Booked {formatTimeAgo(lastBookedTime)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Trust Scores */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Scores</h3>
            <div className="space-y-3">
              <motion.div 
                className="flex justify-between items-center"
                whileHover={{ x: 5 }}
              >
                <span className="text-gray-700">Deposit Return</span>
                <span className="font-bold text-green-600">
                  <AnimatedCounter value={property.depositScore || 0} suffix="%" />
                </span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center"
                whileHover={{ x: 5 }}
              >
                <span className="text-gray-700">Reality Rating</span>
                <span className="font-bold text-green-600">
                  <AnimatedCounter value={property.realityScore || 0} suffix="/5" />
                </span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center"
                whileHover={{ x: 5 }}
              >
                <span className="text-gray-700">Reviews</span>
                <span className="font-bold text-gray-700">
                  <AnimatedCounter value={property.reviewCount || 0} />
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Only show Contact Owner and Book Now buttons if user is not the owner */}
            {user?.id !== property.ownerId && (
              <>
                <motion.button 
                  onClick={() => handleContactOwner()}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
                >
                  Contact Owner
                </motion.button>
                <motion.button 
                  onClick={() => handleBookNow()}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
                >
                  Book Now
                </motion.button>
              </>
            )}
            
            {/* Show owner message if user is the owner */}
            {user?.id === property.ownerId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-blue-800 font-medium mb-1">This is your property</div>
                <div className="text-blue-600 text-sm">You can manage availability above</div>
              </div>
            )}
            
            {/* Write Review button - available for all users except owners */}
            {user?.id !== property.ownerId && (
              <motion.button 
                onClick={() => handleWriteReview()}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md transition-colors duration-200"
              >
                Write Review
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};