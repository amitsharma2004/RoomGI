import { NeighborhoodData, CommuteHub, CrowdSourcedTip } from './neighborhood.types.js';
import { DatabaseService } from '../../database/database.service.js';

const db = new DatabaseService();

export class NeighborhoodService {
  async getNeighborhoodData(propertyId: string): Promise<NeighborhoodData | null> {
    try {
      // Get property details first
      const property = await db.getPropertyById(propertyId);
      if (!property) {
        return null;
      }

      // In a real implementation, you would:
      // 1. Call Google Places API for nearby amenities
      // 2. Use transit APIs for commute data
      // 3. Analyze reviews for crowd-sourced tips
      // 4. Calculate scores based on real data

      // For now, we'll generate realistic mock data based on property location
      const neighborhoodData = this.generateMockNeighborhoodData(property.id, property.location);
      
      return neighborhoodData;
    } catch (error) {
      console.error('Error fetching neighborhood data:', error);
      return null;
    }
  }

  private generateMockNeighborhoodData(propertyId: string, location: string): NeighborhoodData {
    // Generate scores based on location keywords
    const scores = this.generateScoresFromLocation(location);
    
    // Generate mock commute hubs
    const commuteHubs = this.generateMockCommuteHubs(location);
    
    // Generate mock crowd-sourced tips
    const crowdSourcedTips = this.generateMockTips(location);

    return {
      propertyId,
      location,
      scores,
      commuteHubs,
      crowdSourcedTips,
      lastUpdated: new Date().toISOString()
    };
  }

  private generateScoresFromLocation(location: string): NeighborhoodData['scores'] {
    const locationLower = location.toLowerCase();
    
    // Base scores
    let transit = 60;
    let safety = 70;
    let nightlife = 50;
    let quietness = 60;
    let foodOptions = 65;
    let studentFriendly = 55;

    // Adjust scores based on location keywords
    if (locationLower.includes('koramangala') || locationLower.includes('indiranagar')) {
      transit += 20;
      nightlife += 25;
      foodOptions += 20;
      studentFriendly += 25;
      quietness -= 15;
    }
    
    if (locationLower.includes('whitefield') || locationLower.includes('electronic city')) {
      transit -= 10;
      safety += 15;
      quietness += 20;
      studentFriendly += 10;
      nightlife -= 10;
    }
    
    if (locationLower.includes('mg road') || locationLower.includes('brigade road')) {
      transit += 25;
      nightlife += 30;
      foodOptions += 25;
      quietness -= 20;
      safety -= 5;
    }
    
    if (locationLower.includes('hsr') || locationLower.includes('btm')) {
      transit += 15;
      safety += 10;
      foodOptions += 15;
      studentFriendly += 20;
    }

    // Ensure scores are within 0-100 range
    return {
      transit: Math.max(0, Math.min(100, transit + Math.random() * 10 - 5)),
      safety: Math.max(0, Math.min(100, safety + Math.random() * 10 - 5)),
      nightlife: Math.max(0, Math.min(100, nightlife + Math.random() * 10 - 5)),
      quietness: Math.max(0, Math.min(100, quietness + Math.random() * 10 - 5)),
      foodOptions: Math.max(0, Math.min(100, foodOptions + Math.random() * 10 - 5)),
      studentFriendly: Math.max(0, Math.min(100, studentFriendly + Math.random() * 10 - 5))
    };
  }

  private generateMockCommuteHubs(location: string): CommuteHub[] {
    const locationLower = location.toLowerCase();
    const hubs: CommuteHub[] = [];

    // Generate hubs based on location
    if (locationLower.includes('koramangala')) {
      hubs.push(
        {
          id: '1',
          name: 'Koramangala Metro Station',
          type: 'metro',
          distance: 300,
          walkTime: 4,
          icon: '🚇'
        },
        {
          id: '2',
          name: 'Forum Mall Bus Stop',
          type: 'bus',
          distance: 150,
          walkTime: 2,
          icon: '🚌'
        },
        {
          id: '3',
          name: 'Silk Board Junction',
          type: 'bus',
          distance: 800,
          walkTime: 10,
          icon: '🚌'
        }
      );
    } else if (locationLower.includes('indiranagar')) {
      hubs.push(
        {
          id: '4',
          name: 'Indiranagar Metro Station',
          type: 'metro',
          distance: 200,
          walkTime: 3,
          icon: '🚇'
        },
        {
          id: '5',
          name: '100 Feet Road Bus Stop',
          type: 'bus',
          distance: 100,
          walkTime: 1,
          icon: '🚌'
        }
      );
    } else if (locationLower.includes('whitefield')) {
      hubs.push(
        {
          id: '6',
          name: 'Whitefield Railway Station',
          type: 'train',
          distance: 1200,
          walkTime: 15,
          icon: '🚆'
        },
        {
          id: '7',
          name: 'ITPL Bus Stop',
          type: 'bus',
          distance: 600,
          walkTime: 8,
          icon: '🚌'
        }
      );
    } else {
      // Default hubs for other locations
      hubs.push(
        {
          id: '8',
          name: 'Nearest Metro Station',
          type: 'metro',
          distance: 500,
          walkTime: 6,
          icon: '🚇'
        },
        {
          id: '9',
          name: 'Local Bus Stop',
          type: 'bus',
          distance: 200,
          walkTime: 3,
          icon: '🚌'
        }
      );
    }

    return hubs;
  }

  private generateMockTips(location: string): CrowdSourcedTip[] {
    const locationLower = location.toLowerCase();
    const tips: CrowdSourcedTip[] = [];

    // Generate location-specific tips
    if (locationLower.includes('koramangala')) {
      tips.push(
        {
          id: '1',
          category: 'food',
          tip: 'Amazing street food at 5th Block market, especially the dosas!',
          upvotes: 23,
          source: 'review',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          category: 'transport',
          tip: 'Uber/Ola pickup point near Forum Mall is always busy, book 5 mins early',
          upvotes: 18,
          source: 'user_submission',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          category: 'lifestyle',
          tip: 'Great co-working spaces and cafes for remote work',
          upvotes: 31,
          source: 'review',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
    } else if (locationLower.includes('indiranagar')) {
      tips.push(
        {
          id: '4',
          category: 'food',
          tip: 'Toit brewery is a must-visit for craft beer lovers',
          upvotes: 45,
          source: 'review',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          category: 'safety',
          tip: 'Well-lit streets and good police patrolling, safe for night walks',
          upvotes: 27,
          source: 'user_submission',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
    } else {
      // Default tips
      tips.push(
        {
          id: '6',
          category: 'general',
          tip: 'Local grocery stores are well-stocked and reasonably priced',
          upvotes: 12,
          source: 'review',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '7',
          category: 'transport',
          tip: 'Auto rickshaws are easily available during peak hours',
          upvotes: 8,
          source: 'user_submission',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
    }

    return tips;
  }
}