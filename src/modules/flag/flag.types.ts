export interface Flag {
  id: string;
  userId: string;
  propertyId: string;
  reason: string;
  description?: string;
  createdAt: Date;
}

export interface CreateFlagDto {
  propertyId: string;
  reason: string;
  description?: string;
}

export const FLAG_REASONS = [
  'false_advertising',
  'deposit_scam',
  'unsafe_conditions',
  'harassment',
  'discrimination',
  'illegal_fees',
  'maintenance_issues',
  'other'
] as const;

export type FlagReason = typeof FLAG_REASONS[number];