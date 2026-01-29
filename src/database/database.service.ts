import pool from '../config/database.js';
import { User, LoginDto, RegisterDto } from '../modules/auth/auth.types.js';
import { Property, CreatePropertyDto } from '../modules/property/property.types.js';
import { Review, CreateReviewDto } from '../modules/review/review.types.js';

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
      INSERT INTO properties (owner_id, location, rent, property_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, owner_id, location, rent, property_type, verified, created_at, updated_at
    `;
    
    const result = await pool.query(query, [
      ownerId,
      propertyData.location,
      propertyData.rent,
      propertyData.propertyType
    ]);
    
    return {
      ...result.rows[0],
      ownerId: result.rows[0].owner_id,
      propertyType: result.rows[0].property_type,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const query = `
      SELECT id, owner_id, location, rent, property_type, verified, created_at, updated_at
      FROM properties WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (!result.rows[0]) return null;
    
    return {
      ...result.rows[0],
      ownerId: result.rows[0].owner_id,
      propertyType: result.rows[0].property_type,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    const query = `
      SELECT id, owner_id, location, rent, property_type, verified, created_at, updated_at
      FROM properties WHERE owner_id = $1
    `;
    const result = await pool.query(query, [ownerId]);
    
    return result.rows.map(row => ({
      ...row,
      ownerId: row.owner_id,
      propertyType: row.property_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async searchProperties(location?: string, maxRent?: number): Promise<Property[]> {
    let query = `
      SELECT id, owner_id, location, rent, property_type, verified, created_at, updated_at
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
    
    return result.rows.map(row => ({
      ...row,
      ownerId: row.owner_id,
      propertyType: row.property_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
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