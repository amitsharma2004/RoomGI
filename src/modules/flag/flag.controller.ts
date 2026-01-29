import { Request, Response } from 'express';
import { FlagService } from './flag.service.js';

export class FlagController {
  private flagService = new FlagService();

  async createFlag(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { propertyId, reason, description } = req.body;
      
      if (!propertyId || !reason) {
        return res.status(400).json({ 
          error: 'Property ID and reason are required' 
        });
      }

      const flag = await this.flagService.createFlag(user.id, {
        propertyId,
        reason,
        description
      });

      res.status(201).json(flag);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid flag reason')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(400).json({ error: 'Failed to create flag' });
    }
  }

  async getPropertyFlags(req: Request, res: Response) {
    try {
      const propertyId = Array.isArray(req.params.propertyId) 
        ? req.params.propertyId[0] 
        : req.params.propertyId;
      
      const [flagCount, warningLevel] = await Promise.all([
        this.flagService.getFlagsByProperty(propertyId),
        this.flagService.getPropertyWarningLevel(propertyId)
      ]);

      res.json({ 
        propertyId,
        flagCount, 
        warningLevel,
        message: this.getWarningMessage(warningLevel, flagCount)
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getFlagReasons(req: Request, res: Response) {
    try {
      const reasons = this.flagService.getAvailableReasons();
      res.json({ reasons });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private getWarningMessage(level: string, count: number): string {
    switch (level) {
      case 'danger':
        return `HIGH RISK: This property has ${count} reports. Exercise extreme caution.`;
      case 'warning':
        return `CAUTION: This property has ${count} reports. Please review carefully.`;
      default:
        return count > 0 
          ? `${count} report(s) - No significant concerns at this time.`
          : 'No reports for this property.';
    }
  }
}