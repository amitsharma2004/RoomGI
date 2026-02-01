-- Add images column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_images ON properties USING GIN(images);

-- Update existing properties with sample image URLs (optional for demo)
UPDATE properties 
SET images = ARRAY[
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
] 
WHERE (images = '{}' OR images IS NULL) AND RANDOM() < 0.7;