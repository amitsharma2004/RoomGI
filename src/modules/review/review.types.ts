export interface Review {
  id: string;
  userId: string;
  propertyId: string;
  depositStatus: 'yes' | 'partial' | 'no';
  realityRating: number; // 1-5
  comment?: string;
  createdAt: Date;
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