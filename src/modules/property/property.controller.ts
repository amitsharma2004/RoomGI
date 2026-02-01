import { Request, Response } from 'express';
import { PropertyService } from './property.service.js';
import { LifestyleFilters } from './property.types.js';
import { socketService } from '../../socket/socketService.js';
import pool from '../../config/database.js';

export class PropertyController {
  private propertyService = new PropertyService();

  async createProperty(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (user.role !== 'owner') {
        return res.status(403).json({ error: 'Only owners can create properties' });
      }

      const { 
        location, 
        rent, 
        propertyType, 
        bedsAvailable, 
        totalBeds,
        latitude,
        longitude,
        nightlifeScore,
        transitScore,
        safetyScore,
        quietnessScore,
        foodScore,
        studentFriendlyScore
      } = req.body;
      
      if (!location || !rent || !propertyType) {
        return res.status(400).json({ 
          error: 'Location, rent, and property type are required',
          received: { location, rent, propertyType }
        });
      }

      // Extract image URLs from uploaded files
      const images: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file: any) => {
          // Prefer secure_url for HTTPS, fallback to url, then path
          const imageUrl = file.secure_url || file.url;
          if (imageUrl) {
            images.push(imageUrl);
          }
        });
      }

      const property = await this.propertyService.createProperty(user.id, {
        location,
        rent: Number(rent),
        propertyType,
        bedsAvailable: bedsAvailable ? Number(bedsAvailable) : undefined,
        totalBeds: totalBeds ? Number(totalBeds) : undefined,
        images, // Include uploaded images
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        nightlifeScore: nightlifeScore ? Number(nightlifeScore) : undefined,
        transitScore: transitScore ? Number(transitScore) : undefined,
        safetyScore: safetyScore ? Number(safetyScore) : undefined,
        quietnessScore: quietnessScore ? Number(quietnessScore) : undefined,
        foodScore: foodScore ? Number(foodScore) : undefined,
        studentFriendlyScore: studentFriendlyScore ? Number(studentFriendlyScore) : undefined
      });

      res.status(201).json(property);
    } catch (error) {
      console.error('Create property error:', error);
      res.status(400).json({ error: 'Failed to create property' });
    }
  }

  async getProperty(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      console.log(`=== BACKEND: Getting property ${id} ===`);
      
      // Get real-time viewer count from socket service
      const viewingCount = socketService.getViewerCount(id);
      
      const property = await this.propertyService.getPropertyWithStats(id);
      
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
      // Add real-time viewing count
      const result = {
        ...property,
        viewingCount
      };
      res.json(result);
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProperties(req: Request, res: Response) {
    try {
      const { location, maxRent } = req.query;
      
      const properties = await this.propertyService.searchProperties(
        location as string,
        maxRent ? Number(maxRent) : undefined
      );
      
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async searchByLifestyle(req: Request, res: Response) {
    try {
      const filters: LifestyleFilters = {
        location: req.query.location as string,
        maxRent: req.query.maxRent ? Number(req.query.maxRent) : undefined,
        nightlife: req.query.nightlife as 'low' | 'medium' | 'high',
        transit: req.query.transit as 'low' | 'medium' | 'high',
        safety: req.query.safety as 'low' | 'medium' | 'high',
        quietness: req.query.quietness as 'low' | 'medium' | 'high',
        food: req.query.food as 'low' | 'medium' | 'high',
        studentFriendly: req.query.studentFriendly as 'low' | 'medium' | 'high'
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof LifestyleFilters] === undefined) {
          delete filters[key as keyof LifestyleFilters];
        }
      });

      const properties = await this.propertyService.searchPropertiesByLifestyle(filters);
      res.json(properties);
    } catch (error) {
      console.error('Lifestyle search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateAvailability(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { bedsAvailable } = req.body;

      if (typeof bedsAvailable !== 'number' || bedsAvailable < 0) {
        return res.status(400).json({ error: 'Invalid beds available value' });
      }

      // Check if user owns this property
      const property = await this.propertyService.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (property.ownerId !== user.id) {
        return res.status(403).json({ error: 'Only property owner can update availability' });
      }

      if (bedsAvailable > property.totalBeds) {
        return res.status(400).json({ error: 'Available beds cannot exceed total beds' });
      }

      // Update availability
      const updatedProperty = await this.propertyService.updateAvailability(id, bedsAvailable);
      
      // Emit real-time update
      socketService.emitAvailabilityUpdate(id, bedsAvailable);
      
      // Log activity
      await this.propertyService.logActivity(id, 'availability_update', 
        `Availability updated to ${bedsAvailable}/${property.totalBeds} beds`);

      res.json(updatedProperty);
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }



  async getActivity(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      const activities = await this.propertyService.getPropertyActivity(id);
      res.json(activities);
    } catch (error) {
      console.error('Get activity error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMyProperties(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (user.role !== 'owner') {
        return res.status(403).json({ error: 'Only owners can view their properties' });
      }

      const properties = await this.propertyService.getPropertiesByOwner(user.id);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async testCloudinary(req: Request, res: Response) {
    try {
      const { cloudinary } = await import('../../config/cloudinary.js');
      
      // Test Cloudinary connection
      const result = await cloudinary.api.ping();
      
      res.json({
        message: 'Cloudinary connection successful',
        status: result.status,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      });
    } catch (error) {
      console.error('Cloudinary test error:', error);
      res.status(500).json({ 
        error: 'Cloudinary connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Debug endpoint to check raw database data
  async debugProperty(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      // Get raw data from database
      const query = `
        SELECT id, owner_id, location, rent, property_type, beds_available, total_beds,
               images, latitude, longitude,
               nightlife_score, transit_score, safety_score, quietness_score, food_score, student_friendly_score,
               verified, created_at, updated_at
        FROM properties WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (!result.rows[0]) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      const rawData = result.rows[0];
      
      // Also get the processed data
      const processedProperty = await this.propertyService.getPropertyById(id);
      const statsProperty = await this.propertyService.getPropertyWithStats(id);
      
      res.json({
        message: 'Debug data comparison',
        rawData: {
          images: rawData.images,
          imagesType: typeof rawData.images,
          isArray: Array.isArray(rawData.images),
          imagesLength: rawData.images?.length
        },
        processedProperty: {
          images: processedProperty?.images,
          imagesType: typeof processedProperty?.images,
          isArray: Array.isArray(processedProperty?.images),
          imagesLength: processedProperty?.images?.length
        },
        statsProperty: {
          images: statsProperty?.images,
          imagesType: typeof statsProperty?.images,
          isArray: Array.isArray(statsProperty?.images),
          imagesLength: statsProperty?.images?.length
        }
      });
    } catch (error) {
      console.error('Debug property error:', error);
      res.status(500).json({ 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getViewingCount(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const count = socketService.getViewerCount(id);
      res.json({ viewingCount: count });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async bookProperty(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { bedsRequested } = req.body;

      if (!bedsRequested || bedsRequested < 1) {
        return res.status(400).json({ error: 'Invalid beds requested' });
      }

      // Check if property exists and has availability
      const property = await this.propertyService.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Prevent owners from booking their own properties
      if (property.ownerId === user.id) {
        return res.status(403).json({ error: 'You cannot book your own property' });
      }

      if (property.bedsAvailable < bedsRequested) {
        return res.status(400).json({ error: 'Not enough beds available' });
      }

      // Create booking record in database
      const bookingQuery = `
        INSERT INTO bookings (property_id, tenant_id, beds_requested, status, message)
        VALUES ($1, $2, $3, 'pending', 'Booking request submitted')
        RETURNING id, created_at
      `;
      
      const bookingResult = await pool.query(bookingQuery, [id, user.id, bedsRequested]);

      // Log the activity
      await this.propertyService.logActivity(id, 'booking_request', 
        `Booking request: ${bedsRequested} bed${bedsRequested > 1 ? 's' : ''} requested by ${user.email}`);

      // Emit real-time booking activity
      socketService.emitBookingActivity(id, `New booking request for ${bedsRequested} bed${bedsRequested > 1 ? 's' : ''}!`);

      res.json({ 
        message: 'Booking request submitted successfully',
        bookingId: bookingResult.rows[0].id,
        bedsRequested,
        propertyId: id,
        status: 'pending'
      });
    } catch (error) {
      console.error('Book property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logPropertyActivity(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { type, message } = req.body;

      if (!type || !message) {
        return res.status(400).json({ error: 'Type and message are required' });
      }

      // Check if property exists
      const property = await this.propertyService.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Prevent owners from contacting themselves
      if (type === 'contact' && property.ownerId === user.id) {
        return res.status(403).json({ error: 'You cannot contact yourself' });
      }

      // Log the activity with user context
      const activityMessage = `${message} (by ${user.email})`;
      await this.propertyService.logActivity(id, type, activityMessage);

      res.json({ 
        message: 'Activity logged successfully',
        type,
        activityMessage
      });
    } catch (error) {
      console.error('Log activity error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}