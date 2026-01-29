export interface Property {
  id: string;
  ownerId: string;
  location: string;
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