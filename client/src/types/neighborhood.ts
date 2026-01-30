export interface NeighborhoodData {
  propertyId: string;
  location: string;
  scores: {
    transit: number;
    safety: number;
    nightlife: number;
    quietness: number;
    foodOptions: number;
    studentFriendly: number;
  };
  commuteHubs: CommuteHub[];
  crowdSourcedTips: CrowdSourcedTip[];
  lastUpdated: string;
}

export interface CommuteHub {
  id: string;
  name: string;
  type: 'metro' | 'bus' | 'train' | 'airport' | 'taxi';
  distance: number; // in meters
  walkTime: number; // in minutes
  icon: string;
}

export interface CrowdSourcedTip {
  id: string;
  category: 'transport' | 'food' | 'safety' | 'lifestyle' | 'general';
  tip: string;
  upvotes: number;
  source: 'review' | 'user_submission';
  timestamp: string;
}

export interface RadarChartData {
  subject: string;
  score: number;
  fullMark: 100;
}