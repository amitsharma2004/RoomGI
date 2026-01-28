import { Request, Response } from 'express';
import { PropertyService } from './property.service.js';

export class PropertyController {
  private propertyService = new PropertyService();

  async createProperty(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (user.role !== 'owner') {
        return res.status(403).json({ error: 'Only owners can create properties' });
      }

      const { location, rent, propertyType } = req.body;
      
      if (!location || !rent || !propertyType) {
        return res.status(400).json({ error: 'Location, rent, and property type are required' });
      }

      const property = await this.propertyService.createProperty(user.id, {
        location,
        rent: Number(rent),
        propertyType
      });

      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create property' });
    }
  }

  async getProperty(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const property = await this.propertyService.getPropertyWithStats(id);
      
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
}