import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import type { NeighborhoodData, RadarChartData, CommuteHub, CrowdSourcedTip } from '../types/neighborhood';
import api from '../lib/axios';

interface NeighborhoodDNAProps {
  propertyId: string;
}

export const NeighborhoodDNA: React.FC<NeighborhoodDNAProps> = ({ propertyId }) => {
  const [data, setData] = useState<NeighborhoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    const fetchNeighborhoodData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/properties/${propertyId}/neighborhood`);
        setData(response.data);
      } catch (err) {
        setError('Failed to load neighborhood data');
        console.error('Error fetching neighborhood data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchNeighborhoodData();
    }
  }, [propertyId]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getRadarData = (scores: NeighborhoodData['scores']): RadarChartData[] => {
    return [
      { subject: 'Transit', score: scores.transit, fullMark: 100 },
      { subject: 'Safety', score: scores.safety, fullMark: 100 },
      { subject: 'Nightlife', score: scores.nightlife, fullMark: 100 },
      { subject: 'Quietness', score: scores.quietness, fullMark: 100 },
      { subject: 'Food', score: scores.foodOptions, fullMark: 100 }
    ];
  };

  const getCommuteIcon = (type: CommuteHub['type']): string => {
    const icons = {
      metro: '🚇',
      bus: '🚌',
      train: '🚆',
      airport: '✈️',
      taxi: '🚕'
    };
    return icons[type] || '🚶';
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatWalkTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min walk`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m walk`;
  };

  const toggleAccordion = (category: string) => {
    setActiveAccordion(activeAccordion === category ? null : category);
  };

  const groupTipsByCategory = (tips: CrowdSourcedTip[]) => {
    return tips.reduce((acc, tip) => {
      if (!acc[tip.category]) {
        acc[tip.category] = [];
      }
      acc[tip.category].push(tip);
      return acc;
    }, {} as Record<string, CrowdSourcedTip[]>);
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      transport: '🚌',
      food: '🍽️',
      safety: '🛡️',
      lifestyle: '🎯',
      general: '💡'
    };
    return icons[category as keyof typeof icons] || '💡';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 shadow-2xl">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="h-6 bg-gray-700 rounded w-48"></div>
          </div>
          
          {/* Radar Chart Skeleton */}
          <div className="h-64 bg-gray-700/30 rounded-lg mb-6 flex items-center justify-center">
            <div className="text-gray-500">Loading neighborhood analysis...</div>
          </div>
          
          {/* Score Cards Skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-20 bg-gray-700/30 rounded-lg"></div>
            <div className="h-20 bg-gray-700/30 rounded-lg"></div>
          </div>
          
          {/* Commute Hubs Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-700/30 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 shadow-2xl">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🏘️</div>
          <p>{error || 'No neighborhood data available'}</p>
        </div>
      </div>
    );
  }

  const radarData = getRadarData(data.scores);
  const groupedTips = groupTipsByCategory(data.crowdSourcedTips);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-purple-500/30 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">DNA</span>
        </div>
        <h3 className="text-xl font-bold text-white">Neighborhood DNA</h3>
        {data.scores.studentFriendly > 80 && (
          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-full">
            🎓 Student Friendly
          </span>
        )}
      </div>

      {/* Radar Chart */}
      <div className="mb-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#6B7280', fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${getScoreBgColor(data.scores.transit)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(data.scores.transit)}`}>
              {data.scores.transit}
            </div>
            <div className="text-gray-300 text-sm">Transit Score</div>
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${getScoreBgColor(data.scores.safety)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(data.scores.safety)}`}>
              {data.scores.safety}
            </div>
            <div className="text-gray-300 text-sm">Safety Score</div>
          </div>
        </div>
      </div>

      {/* Commute Hubs */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">🚇 Commute Hubs</h4>
        <div className="space-y-2">
          {data.commuteHubs.slice(0, 5).map((hub) => (
            <div key={hub.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getCommuteIcon(hub.type)}</span>
                <div>
                  <div className="text-white font-medium">{hub.name}</div>
                  <div className="text-gray-400 text-sm">
                    {formatDistance(hub.distance)} • {formatWalkTime(hub.walkTime)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crowd Sourced Tips */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">💡 Local Insights</h4>
        <div className="space-y-2">
          {Object.entries(groupedTips).map(([category, tips]) => (
            <div key={category} className="border border-gray-700/30 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleAccordion(category)}
                className="w-full p-3 bg-gray-800/30 hover:bg-gray-800/50 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span>{getCategoryIcon(category)}</span>
                  <span className="text-white font-medium capitalize">
                    {category} ({tips.length})
                  </span>
                </div>
                <span className={`text-gray-400 transform transition-transform ${
                  activeAccordion === category ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </button>
              
              {activeAccordion === category && (
                <div className="p-3 bg-gray-800/20 border-t border-gray-700/30">
                  <div className="space-y-2">
                    {tips.slice(0, 3).map((tip) => (
                      <div key={tip.id} className="p-2 bg-gray-700/20 rounded text-sm">
                        <div className="text-gray-200">{tip.tip}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>👍 {tip.upvotes}</span>
                          <span>•</span>
                          <span>{tip.source === 'review' ? 'From review' : 'User tip'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};