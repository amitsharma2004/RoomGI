import axios from 'axios';
import NodeCache from 'node-cache';
import { NeighborhoodDNA, CommuteHub, PlaceResult } from './property.types.js';
import { logger } from '../../utils/index.js';

export class NeighborhoodService {
  private cache: NodeCache;
  private googleApiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    // Cache for 24 hours (86400 seconds)
    this.cache = new NodeCache({ stdTTL: 86400 });
    this.googleApiKey = process.env.GOOGLE_PLACES_API_KEY || 'demo_key';
  }

  async analyzeNeighborhood(lat: number, lng: number): Promise<NeighborhoodDNA> {
    const cacheKey = `neighborhood_${lat}_${lng}`;
    
    // Check cache first
    const cached = this.cache.get<NeighborhoodDNA>(cacheKey);
    if (cached) {
      logger.info(`Returning cached neighborhood analysis for ${lat}, ${lng}`);
      return cached;
    }

    try {
      logger.info(`Analyzing neighborhood for coordinates: ${lat}, ${lng}`);

      // If no API key, return mock data
      if (this.googleApiKey === 'demo_key') {
        return this.generateMockNeighborhoodDNA(lat, lng);
      }

      // Fetch nearby places for analysis
      const [transitPlaces, safetyPlaces, nightlifePlaces, foodPlaces, studentPlaces] = await Promise.all([
        this.getNearbyPlaces(lat, lng, ['bus_station', 'subway_station', 'train_station', 'light_rail_station'], 1000),
        this.getNearbyPlaces(lat, lng, ['police', 'hospital', 'fire_station'], 2000),
        this.getNearbyPlaces(lat, lng, ['night_club', 'bar', 'casino'], 1000),
        this.getNearbyPlaces(lat, lng, ['restaurant', 'meal_takeaway', 'cafe', 'food'], 500),
        this.getNearbyPlaces(lat, lng, ['university', 'school', 'library', 'student_housing'], 1500)
      ]);

      // Calculate scores
      const transitScore = this.calculateTransitScore(transitPlaces);
      const safetyScore = this.calculateSafetyScore(safetyPlaces);
      const nightlifeScore = this.calculateNightlifeScore(nightlifePlaces);
      const quietnessScore = this.calculateQuietnessScore(nightlifePlaces);
      const foodOptionsScore = this.calculateFoodScore(foodPlaces);
      const studentFriendlyScore = this.calculateStudentScore(studentPlaces);

      // Get commute hubs
      const commuteHubs = this.getCommuteHubs(transitPlaces, lat, lng);

      // Generate crowd-sourced tips (mock for now)
      const crowdSourcedTips = this.generateCrowdSourcedTips(transitScore, safetyScore, nightlifeScore);

      const dna: NeighborhoodDNA = {
        transitScore,
        safetyScore,
        lifestyleProfile: {
          nightlife: nightlifeScore,
          quietness: quietnessScore,
          foodOptions: foodOptionsScore,
          studentFriendly: studentFriendlyScore
        },
        commuteHubs,
        crowdSourcedTips,
        lastAnalyzed: new Date()
      };

      // Cache the result
      this.cache.set(cacheKey, dna);
      logger.info(`Neighborhood analysis completed and cached for ${lat}, ${lng}`);

      return dna;
    } catch (error) {
      logger.error('Error analyzing neighborhood:', error);
      // Return mock data on error
      return this.generateMockNeighborhoodDNA(lat, lng);
    }
  }

  private async getNearbyPlaces(lat: number, lng: number, types: string[], radius: number): Promise<PlaceResult[]> {
    try {
      const typeQuery = types.join('|');
      const url = `${this.baseUrl}/nearbysearch/json`;
      
      const response = await axios.get(url, {
        params: {
          location: `${lat},${lng}`,
          radius,
          type: typeQuery,
          key: this.googleApiKey
        }
      });

      return response.data.results || [];
    } catch (error) {
      logger.error(`Error fetching nearby places for types ${types.join(', ')}:`, error);
      return [];
    }
  }

  private calculateTransitScore(transitPlaces: PlaceResult[]): number {
    // Algorithm: transitScore = min(100, 20 + (count * 15))
    const count = transitPlaces.length;
    return Math.min(100, 20 + (count * 15));
  }

  private calculateSafetyScore(safetyPlaces: PlaceResult[]): number {
    // More safety facilities = higher score
    const count = safetyPlaces.length;
    return Math.min(100, 30 + (count * 20));
  }

  private calculateNightlifeScore(nightlifePlaces: PlaceResult[]): number {
    // More nightlife venues = higher nightlife score
    const count = nightlifePlaces.length;
    return Math.min(100, count * 25);
  }

  private calculateQuietnessScore(nightlifePlaces: PlaceResult[]): number {
    // Algorithm: quietness = nightlife count === 0 ? 90 : max(0, 100 - (count * 20))
    const count = nightlifePlaces.length;
    return count === 0 ? 90 : Math.max(0, 100 - (count * 20));
  }

  private calculateFoodScore(foodPlaces: PlaceResult[]): number {
    // More food options = higher score
    const count = foodPlaces.length;
    return Math.min(100, 10 + (count * 8));
  }

  private calculateStudentScore(studentPlaces: PlaceResult[]): number {
    // More student-related facilities = higher score
    const count = studentPlaces.length;
    return Math.min(100, 15 + (count * 12));
  }

  private getCommuteHubs(transitPlaces: PlaceResult[], lat: number, lng: number): CommuteHub[] {
    return transitPlaces
      .slice(0, 3) // Get nearest 3
      .map(place => {
        const distance = this.calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
        const walkingTime = Math.round(distance / 80); // Assume 80m/min walking speed

        return {
          name: place.name,
          type: this.getTransitType(place.types),
          walkingDistance: Math.round(distance),
          walkingTime,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          }
        };
      });
  }

  private getTransitType(types: string[]): 'bus_station' | 'subway_station' | 'train_station' | 'light_rail_station' {
    if (types.includes('subway_station')) return 'subway_station';
    if (types.includes('train_station')) return 'train_station';
    if (types.includes('light_rail_station')) return 'light_rail_station';
    return 'bus_station';
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula for distance in meters
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private generateCrowdSourcedTips(transitScore: number, safetyScore: number, nightlifeScore: number): string[] {
    const tips: string[] = [];

    if (transitScore > 80) {
      tips.push("Excellent public transport connections - you can get anywhere easily!");
    } else if (transitScore < 40) {
      tips.push("Limited public transport - consider having a car or bike");
    }

    if (safetyScore > 80) {
      tips.push("Very safe area with good emergency services nearby");
    } else if (safetyScore < 50) {
      tips.push("Be extra cautious, especially at night");
    }

    if (nightlifeScore > 70) {
      tips.push("Great nightlife scene - perfect for social butterflies!");
      tips.push("Can get noisy on weekends");
    } else if (nightlifeScore < 30) {
      tips.push("Quiet area, great for families and early sleepers");
    }

    // Add some generic tips
    tips.push("Check local Facebook groups for insider tips");
    tips.push("Walk around at different times to get a feel for the area");

    return tips;
  }

  private generateMockNeighborhoodDNA(lat: number, lng: number): NeighborhoodDNA {
    // Generate realistic mock data based on coordinates
    const seed = Math.abs(lat + lng) * 1000;
    const random = (seed % 100) / 100;

    const transitScore = Math.round(30 + (random * 70));
    const safetyScore = Math.round(40 + (random * 60));
    const nightlifeScore = Math.round(random * 100);
    const quietnessScore = nightlifeScore === 0 ? 90 : Math.max(0, 100 - (nightlifeScore * 0.8));

    return {
      transitScore,
      safetyScore,
      lifestyleProfile: {
        nightlife: nightlifeScore,
        quietness: Math.round(quietnessScore),
        foodOptions: Math.round(20 + (random * 80)),
        studentFriendly: Math.round(10 + (random * 90))
      },
      commuteHubs: [
        {
          name: "Metro Station",
          type: 'subway_station',
          walkingDistance: Math.round(200 + (random * 800)),
          walkingTime: Math.round(3 + (random * 10)),
          coordinates: { lat: lat + 0.001, lng: lng + 0.001 }
        },
        {
          name: "Bus Stop",
          type: 'bus_station',
          walkingDistance: Math.round(100 + (random * 300)),
          walkingTime: Math.round(1 + (random * 4)),
          coordinates: { lat: lat - 0.0005, lng: lng + 0.0005 }
        }
      ],
      crowdSourcedTips: this.generateCrowdSourcedTips(transitScore, safetyScore, nightlifeScore),
      lastAnalyzed: new Date()
    };
  }

  // Clear cache for testing
  clearCache(): void {
    this.cache.flushAll();
    logger.info('Neighborhood analysis cache cleared');
  }
}