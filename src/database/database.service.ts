import pool from '../config/database.js';
import { User, LoginDto, RegisterDto } from '../modules/auth/auth.types.js';
import { Property, CreatePropertyDto, LifestyleFilters, LIFESTYLE_SCORE_MAP } from '../modules/property/property.types.js';
import { Review, CreateReviewDto } from '../modules/review/review.types.js';
import { ActivityItem } from '../types/activity.js';
import { logger } from '../utils/logger.js';

export class DatabaseService {
  // User operations
  async createUser(userData: RegisterDto): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at, updated_at
    `;
    
    const result = await pool.query(query, [
      userData.email,
      userData.password, // In production, hash this!
      userData.role
    ]);
    
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT id, email, role, created_at, updated_at FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT id, email, role, created_at, updated_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Property operations
  async createProperty(ownerId: string, propertyData: CreatePropertyDto): Promise<Property> {
    const query = `
      INSERT INTO properties (
        owner_id, location, rent, property_type, beds_available, total_beds,
        images, latitude, longitude,
        nightlife_score, transit_score, safety_score, quietness_score, food_score, student_friendly_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, owner_id, location, rent, property_type, beds_available, total_beds,
                images, latitude, longitude,
                nightlife_score, transit_score, safety_score, quietness_score, food_score, student_friendly_score,
                verified, created_at, updated_at
    `;
    
    const imagesToStore = propertyData.images || [];
    
    const result = await pool.query(query, [
      ownerId,
      propertyData.location,
      propertyData.rent,
      propertyData.propertyType,
      propertyData.bedsAvailable || 1,
      propertyData.totalBeds || 1,
      imagesToStore, // Store images array
      propertyData.latitude || null,
      propertyData.longitude || null,
      propertyData.nightlifeScore || 2,
      propertyData.transitScore || 2,
      propertyData.safetyScore || 2,
      propertyData.quietnessScore || 2,
      propertyData.foodScore || 2,
      propertyData.studentFriendlyScore || 2
    ]);
    
    return this.mapPropertyFromDb(result.rows[0]);
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const query = `
      SELECT id, owner_id, location, rent, property_type, beds_available, total_beds,
             images, latitude, longitude,
             nightlife_score, transit_score, safety_score, quietness_score, food_score, student_friendly_score,
             verified, created_at, updated_at
      FROM properties WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (!result.rows[0]) return null;
    
    return this.mapPropertyFromDb(result.rows[0]);
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    const query = `
      SELECT id, owner_id, location, rent, property_type, beds_available, total_beds,
             images, latitude, longitude,
             nightlife_score, transit_score, safety_score, quietness_score, food_score, student_friendly_score,
             verified, created_at, updated_at
      FROM properties WHERE owner_id = $1
    `;
    const result = await pool.query(query, [ownerId]);
    
    return result.rows.map(row => this.mapPropertyFromDb(row));
  }

  async searchProperties(location?: string, maxRent?: number): Promise<Property[]> {
    let query = `
      SELECT id, owner_id, location, rent, property_type, beds_available, total_beds,
             images, latitude, longitude,
             nightlife_score, transit_score, safety_score, quietness_score, food_score, student_friendly_score,
             verified, created_at, updated_at
      FROM properties WHERE 1=1
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

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    return result.rows.map(row => this.mapPropertyFromDb(row));
  }

  async searchPropertiesByLifestyle(filters: LifestyleFilters): Promise<Property[]> {
    let query = `
      SELECT id, owner_id, location, rent, property_type, beds_available, total_beds,
             images, latitude, longitude,
             nightlife_score, transit_score, safety_score, quietness_score, food_score, student_friendly_score,
             verified, created_at, updated_at
      FROM properties WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters.location) {
      paramCount++;
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${filters.location}%`);
    }

    if (filters.maxRent) {
      paramCount++;
      query += ` AND rent <= $${paramCount}`;
      params.push(filters.maxRent);
    }

    // Add lifestyle filters
    const lifestyleFilters = [
      { key: 'nightlife', column: 'nightlife_score' },
      { key: 'transit', column: 'transit_score' },
      { key: 'safety', column: 'safety_score' },
      { key: 'quietness', column: 'quietness_score' },
      { key: 'food', column: 'food_score' },
      { key: 'studentFriendly', column: 'student_friendly_score' }
    ];

    lifestyleFilters.forEach(({ key, column }) => {
      const filterValue = filters[key as keyof LifestyleFilters];
      if (filterValue && typeof filterValue === 'string') {
        const scoreValue = LIFESTYLE_SCORE_MAP[filterValue as keyof typeof LIFESTYLE_SCORE_MAP];
        if (scoreValue) {
          paramCount++;
          query += ` AND ${column} >= $${paramCount}`;
          params.push(scoreValue);
        }
      }
    });

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    return result.rows.map(row => this.mapPropertyFromDb(row));
  }

  async updatePropertyAvailability(propertyId: string, bedsAvailable: number): Promise<Property | null> {
    const query = `
      UPDATE properties 
      SET beds_available = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, owner_id, location, rent, property_type, beds_available, total_beds,
                nightlife_score, transit_score, safety_score, quietness_score, food_score, student_friendly_score,
                verified, created_at, updated_at
    `;
    
    const result = await pool.query(query, [bedsAvailable, propertyId]);
    
    if (!result.rows[0]) return null;
    
    return this.mapPropertyFromDb(result.rows[0]);
  }

  async logPropertyActivity(propertyId: string, type: string, message: string): Promise<void> {
    // For now, we'll create a simple activity log table structure
    // In a real implementation, you'd want a proper activities table
    const query = `
      INSERT INTO property_activities (property_id, type, message, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING
    `;
    
    try {
      await pool.query(query, [propertyId, type, message]);
    } catch (error) {
      // Table might not exist yet, that's okay for now
      console.log('Activity logging skipped - table not found');
    }
  }

  async getPropertyActivity(propertyId: string): Promise<ActivityItem[]> {
    // Mock activity data for now since we don't have the table yet
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        propertyId,
        type: 'booking',
        message: 'New booking received for 1 bed',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
      },
      {
        id: '2',
        propertyId,
        type: 'view',
        message: '5 people viewed this property',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
      },
      {
        id: '3',
        propertyId,
        type: 'inquiry',
        message: 'New inquiry from potential tenant',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
      }
    ];

    return mockActivities;
  }

  private mapPropertyFromDb(row: any): Property {
    const images = Array.isArray(row.images) ? row.images : [];
    
    return {
      id: row.id,
      ownerId: row.owner_id,
      location: row.location,
      rent: parseFloat(row.rent),
      propertyType: row.property_type,
      bedsAvailable: row.beds_available,
      totalBeds: row.total_beds,
      images: images, // Handle PostgreSQL array
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      nightlifeScore: row.nightlife_score,
      transitScore: row.transit_score,
      safetyScore: row.safety_score,
      quietnessScore: row.quietness_score,
      foodScore: row.food_score,
      studentFriendlyScore: row.student_friendly_score,
      verified: row.verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Review operations
  async createReview(userId: string, reviewData: CreateReviewDto): Promise<Review> {
    const query = `
      INSERT INTO reviews (user_id, property_id, deposit_status, reality_rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, property_id, deposit_status, reality_rating, comment, created_at
    `;
    
    const result = await pool.query(query, [
      userId,
      reviewData.propertyId,
      reviewData.depositStatus,
      reviewData.realityRating,
      reviewData.comment
    ]);
    
    return {
      ...result.rows[0],
      userId: result.rows[0].user_id,
      propertyId: result.rows[0].property_id,
      depositStatus: result.rows[0].deposit_status,
      realityRating: result.rows[0].reality_rating,
      createdAt: result.rows[0].created_at
    };
  }

  async getReviewsByProperty(propertyId: string): Promise<Review[]> {
    const query = `
      SELECT id, user_id, property_id, deposit_status, reality_rating, comment, created_at
      FROM reviews WHERE property_id = $1 ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [propertyId]);
    
    return result.rows.map(row => ({
      ...row,
      userId: row.user_id,
      propertyId: row.property_id,
      depositStatus: row.deposit_status,
      realityRating: row.reality_rating,
      createdAt: row.created_at
    }));
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    const query = `
      SELECT id, user_id, property_id, deposit_status, reality_rating, comment, created_at
      FROM reviews WHERE user_id = $1 ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    
    return result.rows.map(row => ({
      ...row,
      userId: row.user_id,
      propertyId: row.property_id,
      depositStatus: row.deposit_status,
      realityRating: row.reality_rating,
      createdAt: row.created_at
    }));
  }

  async calculateDepositScore(propertyId: string): Promise<number> {
    const query = `
      SELECT AVG(CASE 
        WHEN deposit_status = 'yes' THEN 100
        WHEN deposit_status = 'partial' THEN 50
        WHEN deposit_status = 'no' THEN 0
      END) as score
      FROM reviews WHERE property_id = $1
    `;
    const result = await pool.query(query, [propertyId]);
    return Math.round(result.rows[0]?.score || 0);
  }

  async calculateRealityScore(propertyId: string): Promise<number> {
    const query = 'SELECT AVG(reality_rating) as score FROM reviews WHERE property_id = $1';
    const result = await pool.query(query, [propertyId]);
    return Math.round((result.rows[0]?.score || 0) * 10) / 10;
  }

  // Flag operations
  async createFlag(userId: string, propertyId: string, reason: string, description?: string) {
    const query = `
      INSERT INTO flags (user_id, property_id, reason, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, property_id, reason, description, created_at
    `;
    
    const result = await pool.query(query, [userId, propertyId, reason, description]);
    return result.rows[0];
  }

  async getFlagsByProperty(propertyId: string) {
    const query = 'SELECT COUNT(*) as count FROM flags WHERE property_id = $1';
    const result = await pool.query(query, [propertyId]);
    return parseInt(result.rows[0].count);
  }
}