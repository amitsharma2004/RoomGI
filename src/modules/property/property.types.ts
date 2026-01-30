export interface Property {
  id: string;
  ownerId: string;
  location: string;
  lat?: number;
  lng?: number;
  rent: number;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio';
  verified: boolean;
  bedsAvailable: number;
  totalBeds: number;
  lastBookedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyDto {
  location: string;
  lat?: number;
  lng?: number;
  rent: number;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio';
  totalBeds: number;
  bedsAvailable?: number;
}

export interface PropertyWithStats extends Property {
  depositScore?: number;
  realityScore?: number;
  flagCount?: number;
  reviewCount?: number;
}

export interface UpdateAvailabilityDto {
  bedsAvailable: number;
}

export interface PropertyActivity {
  id: string;
  propertyId: string;
  activityType: 'booking' | 'view' | 'availability_update';
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface PropertyWithActivity extends PropertyWithStats {
  bedsAvailable: number;
  totalBeds: number;
  lastBookedAt?: Date;
  urgencyLevel: 'critical' | 'normal';
  activeViewers: number;
}

export interface ViewerInfo {
  socketId: string;
  joinedAt: Date;
}

// Neighborhood DNA System Types
export interface NeighborhoodDNA {
  transitScore: number; // 0-100
  safetyScore: number; // 0-100
  lifestyleProfile: {
    nightlife: number; // 0-100
    quietness: number; // 0-100
    foodOptions: number; // 0-100
    studentFriendly: number; // 0-100
  };
  commuteHubs: CommuteHub[];
  crowdSourcedTips: string[];
  lastAnalyzed: Date;
}

export interface CommuteHub {
  name: string;
  type: 'bus_station' | 'subway_station' | 'train_station' | 'light_rail_station';
  walkingDistance: number; // in meters
  walkingTime: number; // in minutes
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface LifestyleSearchFilters {
  nightlife?: 'low' | 'medium' | 'high';
  transit?: string; // e.g., 'min-80'
  safety?: 'low' | 'medium' | 'high';
  quietness?: 'low' | 'medium' | 'high';
  foodOptions?: 'low' | 'medium' | 'high';
  studentFriendly?: 'low' | 'medium' | 'high';
}

export interface PropertyWithNeighborhood extends PropertyWithActivity {
  lat?: number;
  lng?: number;
  neighborhoodDNA?: NeighborhoodDNA;
}

// Google Places API Types
export interface PlaceResult {
  place_id: string;
  name: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  rating?: number;
}