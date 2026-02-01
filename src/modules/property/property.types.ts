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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyDto {
  location: string;
  rent: number;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio';
  bedsAvailable?: number;
  totalBeds?: number;
  images?: string[]; // Array of image URLs from Cloudinary
  latitude?: number;
  longitude?: number;
  nightlifeScore?: number;
  transitScore?: number;
  safetyScore?: number;
  quietnessScore?: number;
  foodScore?: number;
  studentFriendlyScore?: number;
}

export interface PropertyWithStats extends Property {
  depositScore?: number;
  realityScore?: number;
  reviewCount?: number;
  flagCount?: number;
  viewingCount?: number; // Real-time viewing indicator
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

export const LIFESTYLE_SCORE_MAP = {
  low: 1,
  medium: 2,
  high: 3
} as const;

export const SCORE_LIFESTYLE_MAP = {
  1: 'low',
  2: 'medium',
  3: 'high'
} as const;