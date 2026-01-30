import { Property, CreatePropertyDto, PropertyWithStats, UpdateAvailabilityDto, PropertyWithActivity, PropertyWithNeighborhood, LifestyleSearchFilters } from './property.types.js';
import { PropertyActivityService } from './property-activity.service.js';
import { NeighborhoodService } from './neighborhood.service.js';
import pool from '../../config/database.js';
import { logger } from '../../utils/index.js';

export class PropertyService {
  private activityService = new PropertyActivityService();
  private neighborhoodService = new NeighborhoodService();
  private mockProperties: Property[] = []; // Fallback storage
  private useMockData = false;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with sample data for demo
    this.mockProperties = [
      {
        id: '1',
        ownerId: 'owner_1',
        location: 'Downtown Manhattan, NYC',
        lat: 40.7589,
        lng: -73.9851,
        rent: 3500,
        propertyType: 'apartment',
        totalBeds: 8,
        bedsAvailable: 6,
        verified: true,
        lastBookedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        ownerId: 'owner_2',
        location: 'Brooklyn Heights, NYC',
        lat: 40.6962,
        lng: -73.9936,
        rent: 2800,
        propertyType: 'house',
        totalBeds: 12,
        bedsAvailable: 3,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        ownerId: 'owner_3',
        location: 'Mission District, San Francisco',
        lat: 37.7599,
        lng: -122.4148,
        rent: 4200,
        propertyType: 'condo',
        totalBeds: 6,
        bedsAvailable: 2,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private async executeQuery(query: string, params: any[] = []): Promise<any> {
    try {
      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      if (!this.useMockData) {
        logger.warn('Database query failed, switching to mock data mode');
        this.useMockData = true;
      }
      throw error;
    }
  }

  async createProperty(ownerId: string, propertyData: CreatePropertyDto): Promise<Property> {
    if (this.useMockData) {
      const property: Property = {
        id: `prop_${Date.now()}`,
        ownerId,
        location: propertyData.location,
        rent: propertyData.rent,
        propertyType: propertyData.propertyType,
        totalBeds: propertyData.totalBeds,
        bedsAvailable: propertyData.bedsAvailable ?? propertyData.totalBeds,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockProperties.push(property);
      return property;
    }

    try {
      const query = `
        INSERT INTO properties (owner_id, location, rent, property_type, total_beds, beds_available, verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
        RETURNING 
          id, 
          owner_id as "ownerId", 
          location, 
          rent, 
          property_type as "propertyType", 
          total_beds as "totalBeds",
          beds_available as "bedsAvailable",
          verified, 
          last_booked_at as "lastBookedAt",
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;

      const bedsAvailable = propertyData.bedsAvailable ?? propertyData.totalBeds;
      const result = await this.executeQuery(query, [
        ownerId,
        propertyData.location,
        propertyData.rent,
        propertyData.propertyType,
        propertyData.totalBeds,
        bedsAvailable
      ]);

      return result.rows[0];
    } catch (error) {
      // Fallback to mock data
      return this.createProperty(ownerId, propertyData);
    }
  }

  async getPropertyById(id: string): Promise<Property | null> {
    if (this.useMockData) {
      return this.mockProperties.find(p => p.id === id) || null;
    }

    try {
      const query = `
        SELECT 
          id, 
          owner_id as "ownerId", 
          location, 
          rent, 
          property_type as "propertyType", 
          total_beds as "totalBeds",
          beds_available as "bedsAvailable",
          verified, 
          last_booked_at as "lastBookedAt",
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM properties 
        WHERE id = $1
      `;

      const result = await this.executeQuery(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      return this.mockProperties.find(p => p.id === id) || null;
    }
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    if (this.useMockData) {
      return this.mockProperties.filter(p => p.ownerId === ownerId);
    }

    try {
      const query = `
        SELECT 
          id, 
          owner_id as "ownerId", 
          location, 
          rent, 
          property_type as "propertyType", 
          total_beds as "totalBeds",
          beds_available as "bedsAvailable",
          verified, 
          last_booked_at as "lastBookedAt",
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM properties 
        WHERE owner_id = $1
      `;

      const result = await this.executeQuery(query, [ownerId]);
      return result.rows;
    } catch (error) {
      return this.mockProperties.filter(p => p.ownerId === ownerId);
    }
  }

  async getAllProperties(): Promise<Property[]> {
    if (this.useMockData) {
      return [...this.mockProperties];
    }

    try {
      const query = `
        SELECT 
          id, 
          owner_id as "ownerId", 
          location, 
          rent, 
          property_type as "propertyType", 
          total_beds as "totalBeds",
          beds_available as "bedsAvailable",
          verified, 
          last_booked_at as "lastBookedAt",
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM properties 
        ORDER BY created_at DESC
      `;

      const result = await this.executeQuery(query);
      return result.rows;
    } catch (error) {
      return [...this.mockProperties];
    }
  }

  async updateAvailability(propertyId: string, ownerId: string, updateData: UpdateAvailabilityDto): Promise<Property | null> {
    if (this.useMockData) {
      const property = this.mockProperties.find(p => p.id === propertyId && p.ownerId === ownerId);
      if (!property) return null;
      
      property.bedsAvailable = updateData.bedsAvailable;
      property.updatedAt = new Date();
      return property;
    }

    try {
      // First verify ownership
      const property = await this.getPropertyById(propertyId);
      if (!property || property.ownerId !== ownerId) {
        return null;
      }

      const query = `
        UPDATE properties 
        SET beds_available = $1, updated_at = NOW()
        WHERE id = $2 AND owner_id = $3
        RETURNING 
          id, 
          owner_id as "ownerId", 
          location, 
          rent, 
          property_type as "propertyType", 
          total_beds as "totalBeds",
          beds_available as "bedsAvailable",
          verified, 
          last_booked_at as "lastBookedAt",
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;

      const result = await this.executeQuery(query, [updateData.bedsAvailable, propertyId, ownerId]);
      
      if (result.rows[0]) {
        // Log the activity (will also fallback to mock if needed)
        try {
          await this.activityService.createActivity(propertyId, 'availability_update', {
            previousBeds: property.bedsAvailable,
            newBeds: updateData.bedsAvailable,
            updatedBy: ownerId
          });
        } catch (error) {
          logger.warn('Failed to log activity, continuing without logging');
        }
      }

      return result.rows[0] || null;
    } catch (error) {
      // Fallback to mock data
      const property = this.mockProperties.find(p => p.id === propertyId && p.ownerId === ownerId);
      if (!property) return null;
      
      property.bedsAvailable = updateData.bedsAvailable;
      property.updatedAt = new Date();
      return property;
    }
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

  async getPropertyWithActivity(id: string, activeViewers: number = 0): Promise<PropertyWithActivity | null> {
    const propertyWithStats = await this.getPropertyWithStats(id);
    if (!propertyWithStats) return null;

    const urgencyLevel = propertyWithStats.bedsAvailable <= 2 ? 'critical' : 'normal';

    return {
      ...propertyWithStats,
      urgencyLevel,
      activeViewers
    };
  }

  async searchProperties(location?: string, maxRent?: number): Promise<Property[]> {
    if (this.useMockData) {
      let results = [...this.mockProperties];

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

    try {
      let query = `
        SELECT 
          id, 
          owner_id as "ownerId", 
          location, 
          rent, 
          property_type as "propertyType", 
          total_beds as "totalBeds",
          beds_available as "bedsAvailable",
          verified, 
          last_booked_at as "lastBookedAt",
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM properties 
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 0;

      if (location) {
        paramCount++;
        query += ` AND location ILIKE $${paramCount}`;
        params.push(`%${location}%`);
      }

      if (maxRent) {
        paramCount++;
        query += ` AND rent <= $${paramCount}`;
        params.push(maxRent);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await this.executeQuery(query, params);
      return result.rows;
    } catch (error) {
      return this.searchProperties(location, maxRent);
    }
  }

  // Mock booking for demo purposes
  async mockBooking(propertyId: string, bedsToBook: number): Promise<boolean> {
    if (this.useMockData) {
      const property = this.mockProperties.find(p => p.id === propertyId);
      if (!property || property.bedsAvailable < bedsToBook) {
        return false;
      }

      property.bedsAvailable -= bedsToBook;
      property.lastBookedAt = new Date();
      property.updatedAt = new Date();
      return true;
    }

    try {
      const property = await this.getPropertyById(propertyId);
      if (!property || property.bedsAvailable < bedsToBook) {
        return false;
      }

      const query = `
        UPDATE properties 
        SET beds_available = beds_available - $1, last_booked_at = NOW(), updated_at = NOW()
        WHERE id = $2 AND beds_available >= $1
      `;

      const result = await this.executeQuery(query, [bedsToBook, propertyId]);
      
      if (result.rowCount && result.rowCount > 0) {
        // Log the booking activity
        try {
          await this.activityService.createActivity(propertyId, 'booking', {
            bedsBooked: bedsToBook,
            timestamp: new Date()
          });
        } catch (error) {
          logger.warn('Failed to log booking activity');
        }
        return true;
      }

      return false;
    } catch (error) {
      // Fallback to mock booking
      return this.mockBooking(propertyId, bedsToBook);
    }
  }

  // Get current mode for debugging
  public isMockMode(): boolean {
    return this.useMockData;
  }

  // Neighborhood DNA Analysis
  async getPropertyNeighborhood(propertyId: string): Promise<PropertyWithNeighborhood | null> {
    const property = await this.getPropertyWithActivity(propertyId);
    if (!property) return null;

    // If property has coordinates, analyze neighborhood
    if (property.lat && property.lng) {
      const neighborhoodDNA = await this.neighborhoodService.analyzeNeighborhood(property.lat, property.lng);
      return {
        ...property,
        neighborhoodDNA
      };
    }

    // Return property without neighborhood data if no coordinates
    return property;
  }

  async searchPropertiesByLifestyle(filters: LifestyleSearchFilters): Promise<PropertyWithNeighborhood[]> {
    // Get all properties first
    const properties = await this.getAllProperties();
    const results: PropertyWithNeighborhood[] = [];

    for (const property of properties) {
      if (!property.lat || !property.lng) continue;

      // Get neighborhood analysis
      const neighborhoodDNA = await this.neighborhoodService.analyzeNeighborhood(property.lat, property.lng);
      
      // Apply filters
      if (this.matchesLifestyleFilters(neighborhoodDNA, filters)) {
        const propertyWithActivity = await this.getPropertyWithActivity(property.id);
        if (propertyWithActivity) {
          results.push({
            ...propertyWithActivity,
            lat: property.lat,
            lng: property.lng,
            neighborhoodDNA
          });
        }
      }
    }

    return results;
  }

  private matchesLifestyleFilters(dna: any, filters: LifestyleSearchFilters): boolean {
    // Transit filter (e.g., 'min-80' means minimum 80 score)
    if (filters.transit) {
      const match = filters.transit.match(/min-(\d+)/);
      if (match) {
        const minScore = parseInt(match[1]);
        if (dna.transitScore < minScore) return false;
      }
    }

    // Nightlife filter
    if (filters.nightlife) {
      const score = dna.lifestyleProfile.nightlife;
      if (filters.nightlife === 'low' && score > 30) return false;
      if (filters.nightlife === 'medium' && (score < 30 || score > 70)) return false;
      if (filters.nightlife === 'high' && score < 70) return false;
    }

    // Safety filter
    if (filters.safety) {
      const score = dna.safetyScore;
      if (filters.safety === 'low' && score > 40) return false;
      if (filters.safety === 'medium' && (score < 40 || score > 70)) return false;
      if (filters.safety === 'high' && score < 70) return false;
    }

    // Quietness filter
    if (filters.quietness) {
      const score = dna.lifestyleProfile.quietness;
      if (filters.quietness === 'low' && score > 40) return false;
      if (filters.quietness === 'medium' && (score < 40 || score > 70)) return false;
      if (filters.quietness === 'high' && score < 70) return false;
    }

    // Food options filter
    if (filters.foodOptions) {
      const score = dna.lifestyleProfile.foodOptions;
      if (filters.foodOptions === 'low' && score > 40) return false;
      if (filters.foodOptions === 'medium' && (score < 40 || score > 70)) return false;
      if (filters.foodOptions === 'high' && score < 70) return false;
    }

    // Student friendly filter
    if (filters.studentFriendly) {
      const score = dna.lifestyleProfile.studentFriendly;
      if (filters.studentFriendly === 'low' && score > 40) return false;
      if (filters.studentFriendly === 'medium' && (score < 40 || score > 70)) return false;
      if (filters.studentFriendly === 'high' && score < 70) return false;
    }

    return true;
  }

  // Add coordinates to existing property
  async updatePropertyCoordinates(propertyId: string, ownerId: string, lat: number, lng: number): Promise<Property | null> {
    try {
      const query = `
        UPDATE properties 
        SET lat = $1, lng = $2, updated_at = NOW()
        WHERE id = $3 AND owner_id = $4
        RETURNING 
          id, 
          owner_id as "ownerId", 
          location, 
          lat,
          lng,
          rent, 
          property_type as "propertyType", 
          total_beds as "totalBeds",
          beds_available as "bedsAvailable",
          verified, 
          last_booked_at as "lastBookedAt",
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;

      const result = await pool.query(query, [lat, lng, propertyId, ownerId]);
      return result.rows[0] || null;
    } catch (error) {
      // Mock mode fallback
      const property = this.mockProperties.find(p => p.id === propertyId && p.ownerId === ownerId);
      if (property) {
        property.lat = lat;
        property.lng = lng;
        property.updatedAt = new Date();
        return property;
      }
      return null;
    }
  }
}