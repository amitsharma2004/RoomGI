export interface Review {
  id: string;
  userId: string;
  propertyId: string;
  depositStatus: 'yes' | 'partial' | 'no';
  realityRating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface CreateReviewDto {
  propertyId: string;
  depositStatus: 'yes' | 'partial' | 'no';
  realityRating: number;
  comment?: string;
}

export interface ReviewWithUser extends Review {
  userEmail: string;
}

export interface ReviewStats {
  depositScore: number;
  realityScore: number;
  totalReviews: number;
  depositBreakdown: {
    yes: number;
    partial: number;
    no: number;
  };
}