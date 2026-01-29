-- Seed data for Rental Truth Platform (Demo/Testing)

BEGIN;

-- Insert demo users
INSERT INTO users (id, email, password_hash, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'owner1@example.com', '$2b$10$demo_hash_owner1', 'owner'),
('550e8400-e29b-41d4-a716-446655440002', 'owner2@example.com', '$2b$10$demo_hash_owner2', 'owner'),
('550e8400-e29b-41d4-a716-446655440003', 'tenant1@example.com', '$2b$10$demo_hash_tenant1', 'tenant'),
('550e8400-e29b-41d4-a716-446655440004', 'tenant2@example.com', '$2b$10$demo_hash_tenant2', 'tenant'),
('550e8400-e29b-41d4-a716-446655440005', 'tenant3@example.com', '$2b$10$demo_hash_tenant3', 'tenant');

-- Insert demo properties
INSERT INTO properties (id, owner_id, location, rent, property_type, verified) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '123 Main St, Downtown', 1200.00, 'apartment', true),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '456 Oak Ave, Midtown', 1800.00, 'house', false),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '789 Pine St, Uptown', 950.00, 'studio', true),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '321 Elm Dr, Suburbs', 2200.00, 'condo', false);

-- Insert demo reviews
INSERT INTO reviews (user_id, property_id, deposit_status, reality_rating, comment) VALUES
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'yes', 5, 'Great landlord, got full deposit back!'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'yes', 4, 'Good experience overall'),
('550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 'partial', 3, 'Only got half deposit back for minor issues'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'no', 2, 'Landlord kept entire deposit unfairly'),
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'partial', 3, 'Some deposit returned but not all');

-- Insert demo flags
INSERT INTO flags (user_id, property_id, reason, description) VALUES
('550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'false_advertising', 'Photos don''t match actual property'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', 'deposit_scam', 'Landlord refuses to return deposits');

COMMIT;