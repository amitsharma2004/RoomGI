import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

export interface Property {
  id: string;
  ownerId: string;
  location: string;
  rent: number;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio';
  bedsAvailable: number;
  totalBeds: number;
  verified: boolean;
  images: string[]; // Array of image URLs
  latitude?: number;
  longitude?: number;
  nightlifeScore: number;
  transitScore: number;
  safetyScore: number;
  quietnessScore: number;
  foodScore: number;
  studentFriendlyScore: number;
  createdAt: string;
  updatedAt: string;
  depositScore?: number;
  realityScore?: number;
  reviewCount?: number;
  flagCount?: number;
  viewingCount?: number;
}

export interface LifestyleFilters {
  location?: string;
  maxRent?: number;
  nightlife?: 'low' | 'medium' | 'high';
  transit?: 'low' | 'medium' | 'high';
  safety?: 'low' | 'medium' | 'high';
  quietness?: 'low' | 'medium' | 'high';
  food?: 'low' | 'medium' | 'high';
  studentFriendly?: 'low' | 'medium' | 'high';
}

export function useProperties(initialFilters?: LifestyleFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async (searchFilters?: LifestyleFilters) => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/properties';
      const params = new URLSearchParams();

      if (searchFilters) {
        // Check if we have lifestyle filters
        const hasLifestyleFilters = searchFilters.nightlife || searchFilters.transit || 
          searchFilters.safety || searchFilters.quietness || searchFilters.food || 
          searchFilters.studentFriendly;

        if (hasLifestyleFilters) {
          url = '/api/properties/search/by-lifestyle';
        }

        // Add all filters as query params
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      const response = await api.get(fullUrl);
      setProperties(response.data);
    } catch (err) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(initialFilters);
  }, [fetchProperties]); // Only run once on mount

  const refetch = useCallback((newFilters?: LifestyleFilters) => {
    fetchProperties(newFilters);
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    refetch,
    searchByLifestyle: refetch
  };
}