import { Property, CreatePropertyDto, PropertyWithStats, LifestyleFilters, LIFESTYLE_SCORE_MAP } from './property.types.js';
import { DatabaseService } from '../../database/database.service.js';
import { ActivityItem } from '../../types/activity.js';

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

  async getAllProperties(): Promise<PropertyWithStats[]> {
    const properties = await db.searchProperties();
    return await this.enrichPropertiesWithStats(properties);
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

  async searchProperties(location?: string, maxRent?: number): Promise<PropertyWithStats[]> {
    const properties = await db.searchProperties(location, maxRent);
    return await this.enrichPropertiesWithStats(properties);
  }

  async searchPropertiesByLifestyle(filters: LifestyleFilters): Promise<PropertyWithStats[]> {
    const properties = await db.searchPropertiesByLifestyle(filters);
    return await this.enrichPropertiesWithStats(properties);
  }

  async updateAvailability(propertyId: string, bedsAvailable: number): Promise<Property | null> {
    return await db.updatePropertyAvailability(propertyId, bedsAvailable);
  }

  async logActivity(propertyId: string, type: string, message: string): Promise<void> {
    await db.logPropertyActivity(propertyId, type, message);
  }

  async getPropertyActivity(propertyId: string): Promise<ActivityItem[]> {
    return await db.getPropertyActivity(propertyId);
  }



  private async enrichPropertiesWithStats(properties: Property[]): Promise<PropertyWithStats[]> {
    const enrichedProperties = await Promise.all(
      properties.map(async (property) => {
        const [depositScore, realityScore, flagCount, reviews] = await Promise.all([
          db.calculateDepositScore(property.id),
          db.calculateRealityScore(property.id),
          db.getFlagsByProperty(property.id),
          db.getReviewsByProperty(property.id)
        ]);

        return {
          ...property,
          depositScore,
          realityScore,
          flagCount,
          reviewCount: reviews.length
        };
      })
    );

    return enrichedProperties;
  }
}