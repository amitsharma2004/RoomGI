import { Request, Response } from 'express';
import { NeighborhoodService } from './neighborhood.service.js';

export class NeighborhoodController {
  private neighborhoodService = new NeighborhoodService();

  async getNeighborhoodData(req: Request, res: Response) {
    try {
      const propertyId = Array.isArray(req.params.propertyId) 
        ? req.params.propertyId[0] 
        : req.params.propertyId;

      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }

      const neighborhoodData = await this.neighborhoodService.getNeighborhoodData(propertyId);

      if (!neighborhoodData) {
        return res.status(404).json({ error: 'Property not found or neighborhood data unavailable' });
      }

      res.json(neighborhoodData);
    } catch (error) {
      console.error('Error fetching neighborhood data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}