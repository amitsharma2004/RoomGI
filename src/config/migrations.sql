-- Database migrations for real-time availability engine

-- Create properties table with availability fields and coordinates
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    lat DECIMAL(10, 8), -- Latitude with precision for GPS coordinates
    lng DECIMAL(11, 8), -- Longitude with precision for GPS coordinates
    rent INTEGER NOT NULL,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('apartment', 'house', 'condo', 'studio')),
    total_beds INTEGER NOT NULL DEFAULT 1,
    beds_available INTEGER NOT NULL DEFAULT 1,
    verified BOOLEAN DEFAULT FALSE,
    last_booked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create property_activity table for tracking activities
CREATE TABLE IF NOT EXISTS property_activity (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('booking', 'view', 'availability_update')),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(rent);
CREATE INDEX IF NOT EXISTS idx_properties_beds_available ON properties(beds_available);
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties(lat, lng);
CREATE INDEX IF NOT EXISTS idx_property_activity_property_id ON property_activity(property_id);
CREATE INDEX IF NOT EXISTS idx_property_activity_type ON property_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_property_activity_created_at ON property_activity(created_at);

-- Insert sample data for demo with coordinates
INSERT INTO properties (owner_id, location, lat, lng, rent, property_type, total_beds, beds_available, verified) VALUES
('owner_1', 'Downtown Manhattan, NYC', 40.7589, -73.9851, 3500, 'apartment', 8, 6, true),
('owner_2', 'Brooklyn Heights, NYC', 40.6962, -73.9936, 2800, 'house', 12, 3, true),
('owner_3', 'Mission District, San Francisco', 37.7599, -122.4148, 4200, 'condo', 6, 2, true),
('owner_1', 'Capitol Hill, Seattle', 47.6205, -122.3212, 2200, 'studio', 4, 4, false),
('owner_4', 'Back Bay, Boston', 42.3505, -71.0759, 3800, 'apartment', 10, 1, true)
ON CONFLICT DO NOTHING;

-- Insert sample activity data
INSERT INTO property_activity (property_id, activity_type, metadata, created_at) VALUES
(1, 'booking', '{"bedsBooked": 2, "userType": "student"}', NOW() - INTERVAL '5 minutes'),
(1, 'view', '{"viewDuration": 120, "source": "search"}', NOW() - INTERVAL '2 minutes'),
(2, 'booking', '{"bedsBooked": 1, "userType": "professional"}', NOW() - INTERVAL '15 minutes'),
(2, 'availability_update', '{"previousBeds": 4, "newBeds": 3}', NOW() - INTERVAL '30 minutes'),
(3, 'booking', '{"bedsBooked": 3, "userType": "group"}', NOW() - INTERVAL '1 hour'),
(3, 'view', '{"viewDuration": 300, "source": "direct"}', NOW() - INTERVAL '10 minutes')
ON CONFLICT DO NOTHING;