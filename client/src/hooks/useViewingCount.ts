import { useState, useEffect } from 'react';
import api from '../lib/axios';

export function useViewingCount(propertyId: string, pollInterval: number = 10000) {
  const [viewingCount, setViewingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchViewingCount = async () => {
      try {
        setError(null);
        const response = await api.get(`/api/properties/${propertyId}/viewing-count`);
        setViewingCount(response.data.viewingCount);
      } catch (err) {
        console.error('Failed to fetch viewing count:', err);
        setError('Failed to fetch viewing count');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchViewingCount();

    // Set up polling
    const interval = setInterval(fetchViewingCount, pollInterval);

    return () => {
      clearInterval(interval);
    };
  }, [propertyId, pollInterval]);

  return { viewingCount, loading, error };
}