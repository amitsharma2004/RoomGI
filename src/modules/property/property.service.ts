import { Property, CreatePropertyDto, PropertyWithStats } from './property.types.js';

export class PropertyService {
  private properties: Property[] = []; // In-memory storage for demo

  async createProperty(ownerId: string, propertyData: CreatePropertyDto): Promise<Property> {
    const property: Property = {
      id: `prop_${Date.now()}`,
      ownerId,
      location: propertyData.location,
      rent: propertyData.rent,
      propertyType: propertyData.propertyType,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.properties.push(property);
    return property;
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return this.properties.find(p => p.id === id) || null;
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return this.properties.filter(p => p.ownerId === ownerId);
  }

  async getAllProperties(): Promise<Property[]> {
    return this.properties;
  }

  async getPropertyWithStats(id: string): Promise<PropertyWithStats | null> {
    const property = await this.getPropertyById(id);
    if (!property) return null;

    // TODO: Calculate actual stats from reviews and flags
    return {
      ...property,
      depositScore: 85, // Mock data
      realityScore: 4.2,
      flagCount: 0,
      reviewCount: 3
    };
  }

  async searchProperties(location?: string, maxRent?: number): Promise<Property[]> {
    let results = this.properties;

    if (location) {
      results = results.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (maxRent) {
      results = results.filter(p => p.rent <= maxRent);
    }

    return results;
  }
}