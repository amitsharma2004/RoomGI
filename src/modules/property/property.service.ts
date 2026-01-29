import { Property, CreatePropertyDto, PropertyWithStats } from './property.types.js';
import { DatabaseService } from '../../database/database.service.js';

const db = new DatabaseService();

export class PropertyService {
  async createProperty(ownerId: string, propertyData: CreatePropertyDto): Promise<Property> {
    return await db.createProperty(ownerId, propertyData);
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return await db.getPropertyById(id);
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return await db.getPropertiesByOwner(ownerId);
  }

  async getAllProperties(): Promise<Property[]> {
    return await db.searchProperties();
  }

  async getPropertyWithStats(id: string): Promise<PropertyWithStats | null> {
    const property = await this.getPropertyById(id);
    if (!property) return null;

    // Get actual stats from database
    const [depositScore, realityScore, flagCount, reviews] = await Promise.all([
      db.calculateDepositScore(id),
      db.calculateRealityScore(id),
      db.getFlagsByProperty(id),
      db.getReviewsByProperty(id)
    ]);

    return {
      ...property,
      depositScore,
      realityScore,
      flagCount,
      reviewCount: reviews.length
    };
  }

  async searchProperties(location?: string, maxRent?: number): Promise<Property[]> {
    return await db.searchProperties(location, maxRent);
  }
}