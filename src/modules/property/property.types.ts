export interface Property {
  id: string;
  ownerId: string;
  location: string;
  rent: number;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio';
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyDto {
  location: string;
  rent: number;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio';
}

export interface PropertyWithStats extends Property {
  depositScore?: number;
  realityScore?: number;
  flagCount?: number;
  reviewCount?: number;
}