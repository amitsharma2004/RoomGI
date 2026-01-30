import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Property } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../lib/socket';
import { useToast, ToastContainer, NeighborhoodDNA, ReviewsSection } from '../components';
import type { ActivityItem } from '../types/activity';
import api from '../lib/axios';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'activity'>('overview');
  const [viewerCount, setViewerCount] = useState(0);
  const [lastBookedTime, setLastBookedTime] = useState<string>('');
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Socket connection and cleanup
  useEffect(() => {
    if (!id) return;

    socketService.connect();

    // Join property room
    socketService.viewProperty(id);

    // Set up event listeners
    socketService.onViewerCountUpdated((data) => {
      if (data.propertyId === id) {
        setViewerCount(data.count);
      }
    });

    socketService.onAvailabilityUpdated((data) => {
      if (data.propertyId === id) {
        setProperty(prev => prev ? { ...prev, bedsAvailable: data.bedsAvailable } : null);
        addToast(`Only ${data.bedsAvailable} bed${data.bedsAvailable !== 1 ? 's' : ''} left!`, 'warning');
      }
    });

    socketService.onBookingActivity((data) => {
      if (data.propertyId === id) {
        setLastBookedTime(data.timestamp);
        addToast(data.message, 'info');
      }
    });

    return () => {
      socketService.leaveProperty(id);
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [id, addToast]);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/api/properties/${id}`);
        setProperty(response.data);
        setViewerCount(response.data.viewingCount || 0);
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
      addToast('Availability updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update availability', 'error');
      console.error('Error updating availability:', err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const getUrgencyLevel = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio <= 0.2) return { level: 'high', color: 'bg-red-500', textColor: 'text-red-600' };
    if (ratio <= 0.5) return { level: 'medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { level: 'low', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const getViewerUrgencyColor = (count: number) => {
    if (count > 5) return 'text-red-600 bg-red-100';
    if (count > 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
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
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            {error || 'Property not found'}
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const urgency = getUrgencyLevel(property.bedsAvailable, property.totalBeds);
  const isOwner = user?.role === 'owner' && user?.id === property.ownerId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/properties')}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Properties
      </button>

      {/* Header with Viewer Count */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.location}</h1>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-blue-600">
              ₹{property.rent.toLocaleString()}/month
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
              {property.propertyType}
            </span>
            {property.verified && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
        
        {viewerCount > 0 && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getViewerUrgencyColor(viewerCount)}`}>
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            <span>🔴 {viewerCount} people viewing now</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery (Mock) */}
          <div className="bg-gray-200 rounded-lg h-64 mb-6 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🏠</div>
              <p>Property Images</p>
              <p className="text-sm">(Gallery coming soon)</p>
            </div>
          </div>

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
            <ReviewsSection propertyId={id!} />
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
        </div>

        {/* Right Column - Availability Card */}
        <div className="space-y-6">
          {/* Availability Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
            
            {/* Beds Available */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Beds Available</span>
                <span className={`font-bold text-lg ${urgency.textColor}`}>
                  {property.bedsAvailable}/{property.totalBeds}
                </span>
              </div>
              
              {/* Urgency Meter */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full ${urgency.color} transition-all duration-300`}
                  style={{ width: `${(property.bedsAvailable / property.totalBeds) * 100}%` }}
                ></div>
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
                  <button
                    onClick={() => {
                      const input = document.getElementById('availability-input') as HTMLInputElement;
                      const newValue = parseInt(input.value);
                      if (newValue >= 0 && newValue <= property.totalBeds) {
                        handleUpdateAvailability(newValue);
                      }
                    }}
                    disabled={updatingAvailability}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {updatingAvailability ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Banner */}
          {lastBookedTime && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-orange-600">🔥</span>
                <span className="text-orange-800 font-medium">
                  Booked {formatTimeAgo(lastBookedTime)}
                </span>
              </div>
            </div>
          )}

          {/* Trust Scores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Scores</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Deposit Return</span>
                <span className="font-bold text-green-600">
                  {property.depositScore || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Reality Rating</span>
                <span className="font-bold text-green-600">
                  {property.realityScore || 0}/5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Reviews</span>
                <span className="font-bold text-gray-700">
                  {property.reviewCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200">
              Contact Owner
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200">
              Book Now
            </button>
            {!isOwner && (
              <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md transition-colors duration-200">
                Write Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};