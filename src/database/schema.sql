-- Rental Truth Platform Database Schema

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('tenant', 'owner')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(500) NOT NULL,
    rent DECIMAL(10,2) NOT NULL,
    property_type VARCHAR(20) CHECK (property_type IN ('apartment', 'house', 'condo', 'studio')) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    deposit_status VARCHAR(10) CHECK (deposit_status IN ('yes', 'partial', 'no')) NOT NULL,
    reality_rating INTEGER CHECK (reality_rating >= 1 AND reality_rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id) -- One review per user per property
);

-- Flags table (for scam/red-flag reporting)
CREATE TABLE flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_flags_property_id ON flags(property_id);
CREATE INDEX idx_properties_location ON properties USING gin(to_tsvector('english', location));

-- Views for common queries
CREATE VIEW property_stats AS
SELECT 
    p.id,
    p.location,
    p.rent,
    p.property_type,
    p.verified,
    COUNT(r.id) as review_count,
    AVG(r.reality_rating) as avg_reality_rating,
    AVG(CASE 
        WHEN r.deposit_status = 'yes' THEN 100
        WHEN r.deposit_status = 'partial' THEN 50
        WHEN r.deposit_status = 'no' THEN 0
    END) as deposit_score,
    COUNT(f.id) as flag_count
FROM properties p
LEFT JOIN reviews r ON p.id = r.property_id
LEFT JOIN flags f ON p.id = f.property_id
GROUP BY p.id, p.location, p.rent, p.property_type, p.verified;