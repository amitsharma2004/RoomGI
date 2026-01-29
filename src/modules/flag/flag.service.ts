import { Flag, CreateFlagDto, FLAG_REASONS } from './flag.types.js';
import { DatabaseService } from '../../database/database.service.js';

const db = new DatabaseService();

export class FlagService {
  async createFlag(userId: string, flagData: CreateFlagDto): Promise<Flag> {
    // Validate reason
    if (!FLAG_REASONS.includes(flagData.reason as any)) {
      throw new Error('Invalid flag reason');
    }

    return await db.createFlag(userId, flagData.propertyId, flagData.reason, flagData.description);
  }

  async getFlagsByProperty(propertyId: string): Promise<number> {
    return await db.getFlagsByProperty(propertyId);
  }

  async getPropertyWarningLevel(propertyId: string): Promise<'none' | 'warning' | 'danger'> {
    const flagCount = await this.getFlagsByProperty(propertyId);
    
    if (flagCount >= 5) return 'danger';
    if (flagCount >= 2) return 'warning';
    return 'none';
  }

  getAvailableReasons(): string[] {
    return [...FLAG_REASONS];
  }
}