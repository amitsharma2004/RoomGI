import { PropertyActivity } from './property.types.js';
import pool from '../../config/database.js';

export class PropertyActivityService {
  async createActivity(
    propertyId: string, 
    activityType: 'booking' | 'view' | 'availability_update',
    metadata: Record<string, any>
  ): Promise<PropertyActivity> {
    const query = `
      INSERT INTO property_activity (property_id, activity_type, metadata, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, property_id as "propertyId", activity_type as "activityType", metadata, created_at as "createdAt"
    `;

    const result = await pool.query(query, [propertyId, activityType, JSON.stringify(metadata)]);
    return result.rows[0];
  }

  async getPropertyActivity(propertyId: string, limit: number = 10): Promise<PropertyActivity[]> {
    const query = `
      SELECT 
        id, 
        property_id as "propertyId", 
        activity_type as "activityType", 
        metadata, 
        created_at as "createdAt"
      FROM property_activity 
      WHERE property_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;

    const result = await pool.query(query, [propertyId, limit]);
    return result.rows.map(row => ({
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));
  }

  async getRecentBookings(propertyId: string, hours: number = 24): Promise<PropertyActivity[]> {
    const query = `
      SELECT 
        id, 
        property_id as "propertyId", 
        activity_type as "activityType", 
        metadata, 
        created_at as "createdAt"
      FROM property_activity 
      WHERE property_id = $1 
        AND activity_type = 'booking'
        AND created_at >= NOW() - INTERVAL '${hours} hours'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [propertyId]);
    return result.rows.map(row => ({
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));
  }

  // Mock data generation for demo
  async generateMockActivity(propertyId: string): Promise<void> {
    const mockActivities = [
      {
        type: 'booking' as const,
        metadata: { bedsBooked: 2, userType: 'student' },
        minutesAgo: 5
      },
      {
        type: 'booking' as const,
        metadata: { bedsBooked: 1, userType: 'professional' },
        minutesAgo: 15
      },
      {
        type: 'view' as const,
        metadata: { viewDuration: 120, source: 'search' },
        minutesAgo: 2
      },
      {
        type: 'availability_update' as const,
        metadata: { previousBeds: 8, newBeds: 6 },
        minutesAgo: 30
      }
    ];

    for (const activity of mockActivities) {
      const query = `
        INSERT INTO property_activity (property_id, activity_type, metadata, created_at)
        VALUES ($1, $2, $3, NOW() - INTERVAL '${activity.minutesAgo} minutes')
      `;

      await pool.query(query, [
        propertyId, 
        activity.type, 
        JSON.stringify(activity.metadata)
      ]);
    }
  }
}