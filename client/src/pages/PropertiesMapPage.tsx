import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';
import { MapContainer } from '../components/MapContainer';
import { PropertyMarker } from '../components/PropertyMarker';
import { FilterBar } from '../components';
import { useProperties } from '../hooks';
import type { LifestyleFilters } from '../hooks';

// Bangalore center coordinates
const BANGALORE_CENTER: [number, number] = [12.9716, 77.5946];

// Custom cluster group component
const ClusterGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    clusterGroupRef.current = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        let color = '#3b82f6'; // blue
        
        if (count >= 10) {
          size = 'large';
          color = '#ef4444'; // red
        } else if (count >= 5) {
          size = 'medium';
          color = '#f59e0b'; // yellow
        }
        
        return L.divIcon({
          html: `
            <div style="
              background-color: ${color};
              color: white;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: ${size === 'large' ? '14px' : size === 'medium' ? '12px' : '10px'};
              width: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'};
              height: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'};
            ">${count}</div>
          `,
          className: 'custom-cluster-marker',
          iconSize: [
            size === 'large' ? 50 : size === 'medium' ? 40 : 30,
            size === 'large' ? 50 : size === 'medium' ? 40 : 30
          ]
        });
      }
    });

    map.addLayer(clusterGroupRef.current);

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map]);

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            clusterGroup: clusterGroupRef.current 
          });
        }
        return child;
      })}
    </>
  );
};

export const PropertiesMapPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LifestyleFilters>({});
  const { properties, loading, error, searchByLifestyle } = useProperties();

  const handleApplyFilters = useCallback((newFilters: LifestyleFilters) => {
    setFilters(newFilters);
    // Apply filters immediately when they change
    searchByLifestyle(newFilters);
  }, [searchByLifestyle]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    // Reload all properties without filters
    searchByLifestyle({});
  }, [searchByLifestyle]);

  // Filter properties that have coordinates
  const mappableProperties = properties.filter(p => p.latitude && p.longitude);

  return (
    <div className="relative h-screen w-full">
      {/* Map */}
      <MapContainer
        center={BANGALORE_CENTER}
        zoom={12}
        className="h-full w-full"
      >
        <ClusterGroup>
          {mappableProperties.map((property) => (
            <PropertyMarker key={property.id} property={property} />
          ))}
        </ClusterGroup>
      </MapContainer>

      {/* Filter Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white hover:bg-gray-50 text-gray-900 font-medium py-2 px-4 rounded-lg shadow-lg border border-gray-200 transition-colors duration-200 flex items-center gap-2"
        >
          <span>🔍</span>
          Filters
          {Object.keys(filters).length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
              {Object.keys(filters).length}
            </span>
          )}
        </button>
        <a
          href="/properties"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
        >
          📋 List View
        </a>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-16 left-4 z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Filter Properties</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <FilterBar
            onApplyFilters={handleApplyFilters}
            initialFilters={filters}
            compact={true}
          />
          
          {Object.keys(filters).length > 0 && (
            <button
              onClick={handleClearFilters}
              className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-md text-sm transition-colors duration-200"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900">{mappableProperties.length}</span>
            <span className="text-gray-600"> properties</span>
          </div>
          <div>
            <span className="font-medium text-green-600">
              {mappableProperties.filter(p => p.bedsAvailable > 0).length}
            </span>
            <span className="text-gray-600"> available</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};