import { Request, Response } from 'express';
import { PropertyService } from './property.service.js';
import { PropertyActivityService } from './property-activity.service.js';

export class PropertyController {
  private propertyService = new PropertyService();
  private activityService = new PropertyActivityService();

  async createProperty(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (user.role !== 'owner') {
        return res.status(403).json({ error: 'Only owners can create properties' });
      }

      const { location, rent, propertyType, totalBeds, bedsAvailable } = req.body;
      
      if (!location || !rent || !propertyType || !totalBeds) {
        return res.status(400).json({ error: 'Location, rent, property type, and total beds are required' });
      }

      const property = await this.propertyService.createProperty(user.id, {
        location,
        rent: Number(rent),
        propertyType,
        totalBeds: Number(totalBeds),
        bedsAvailable: bedsAvailable ? Number(bedsAvailable) : Number(totalBeds)
      });

      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create property' });
    }
  }

  async getProperty(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      // Get active viewers count from socket service (will be injected)
      const activeViewers = (req as any).socketService?.getActiveViewers(id) || 0;
      
      const property = await this.propertyService.getPropertyWithActivity(id, activeViewers);
      
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      res.json(property);
    } catch (error) {
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

  async updateAvailability(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const propertyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { bedsAvailable } = req.body;

      if (user.role !== 'owner') {
        return res.status(403).json({ error: 'Only owners can update availability' });
      }

      if (bedsAvailable === undefined || bedsAvailable < 0) {
        return res.status(400).json({ error: 'Valid beds available count is required' });
      }

      const updatedProperty = await this.propertyService.updateAvailability(
        propertyId, 
        user.id, 
        { bedsAvailable: Number(bedsAvailable) }
      );

      if (!updatedProperty) {
        return res.status(404).json({ error: 'Property not found or unauthorized' });
      }

      // Broadcast the update via socket
      const socketService = (req as any).socketService;
      if (socketService) {
        socketService.broadcastAvailabilityUpdate(
          propertyId, 
          updatedProperty.bedsAvailable, 
          updatedProperty.totalBeds
        );
      }

      res.json(updatedProperty);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPropertyActivity(req: Request, res: Response) {
    try {
      const propertyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const activities = await this.activityService.getPropertyActivity(propertyId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Demo endpoint for mock booking
  async mockBooking(req: Request, res: Response) {
    try {
      const propertyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { bedsToBook } = req.body;

      if (!bedsToBook || bedsToBook < 1) {
        return res.status(400).json({ error: 'Valid number of beds to book is required' });
      }

      const success = await this.propertyService.mockBooking(propertyId, Number(bedsToBook));

      if (!success) {
        return res.status(400).json({ error: 'Booking failed - insufficient beds available' });
      }

      // Broadcast the booking activity
      const socketService = (req as any).socketService;
      if (socketService) {
        socketService.broadcastBookingActivity(propertyId, Number(bedsToBook));
      }

      // Get updated property info
      const updatedProperty = await this.propertyService.getPropertyById(propertyId);
      if (updatedProperty) {
        socketService?.broadcastAvailabilityUpdate(
          propertyId, 
          updatedProperty.bedsAvailable, 
          updatedProperty.totalBeds
        );
      }

      res.json({ success: true, message: `${bedsToBook} bed(s) booked successfully` });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Demo endpoint to generate mock activity
  async generateMockActivity(req: Request, res: Response) {
    try {
      const propertyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      await this.activityService.generateMockActivity(propertyId);
      res.json({ success: true, message: 'Mock activity generated' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}