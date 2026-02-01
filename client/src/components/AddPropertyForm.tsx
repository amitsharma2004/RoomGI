import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CoordinatePicker } from './CoordinatePicker';
import api from '../lib/axios';

interface AddPropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    location: '',
    rent: '',
    propertyType: 'apartment' as 'apartment' | 'house' | 'condo' | 'studio',
    bedsAvailable: '',
    totalBeds: '',
    latitude: '',
    longitude: '',
    nightlifeScore: 2,
    transitScore: 2,
    safetyScore: 2,
    quietnessScore: 2,
    foodScore: 2,
    studentFriendlyScore: 2
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Score') ? Number(value) : value
    }));
  };

  const handleCoordinateChange = (lat: string, lng: string) => {
    // Basic validation for coordinates (India bounds approximately)
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (lat && lng) {
      // Check if coordinates are within reasonable bounds (India: 6-37°N, 68-97°E)
      if (latitude < 6 || latitude > 37 || longitude < 68 || longitude > 97) {
        toast('⚠️ Location seems to be outside India. Please verify the coordinates.', {
          icon: '🗺️',
          duration: 5000,
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        });
      }
    }
    
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location || !formData.rent || !formData.propertyType) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Encourage setting location but don't make it required
    if (!formData.latitude || !formData.longitude) {
      toast('💡 Tip: Adding a map location helps tenants find your property easier!', {
        icon: '📍',
        duration: 4000,
        style: {
          background: '#FEF3C7',
          color: '#92400E',
        },
      });
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          submitData.append(key, value.toString());
        }
      });

      // Add images
      images.forEach(image => {
        submitData.append('images', image);
      });

      console.log('Submitting form data:', formData);
      console.log('Submitting images:', images.length);
      console.log('FormData entries:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const response = await api.post('/api/properties', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Property creation response:', response.data);
      toast.success('Property created successfully!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating property:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Property</h2>
      <p className="text-gray-600 mb-6">
        Fill in the details below to list your property. Adding photos and map location helps attract more tenants.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Koramangala, Bangalore"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Rent (₹) *
            </label>
            <input
              type="number"
              name="rent"
              value={formData.rent}
              onChange={handleInputChange}
              placeholder="25000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Beds
            </label>
            <input
              type="number"
              name="totalBeds"
              value={formData.totalBeds}
              onChange={handleInputChange}
              placeholder="3"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Beds
            </label>
            <input
              type="number"
              name="bedsAvailable"
              value={formData.bedsAvailable}
              onChange={handleInputChange}
              placeholder="2"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Location Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Location on Map (Optional)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Click on the map to pin the exact location of your property. This helps tenants find your property easily.
          </p>
          
          {/* Benefits callout */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-0.5">💡</div>
              <div className="text-sm text-blue-800">
                <strong>Why add location?</strong>
                <ul className="mt-1 text-xs text-blue-700 space-y-1">
                  <li>• Tenants can see exact property location</li>
                  <li>• Helps with commute planning</li>
                  <li>• Shows nearby amenities and transport</li>
                  <li>• Increases property visibility in searches</li>
                </ul>
              </div>
            </div>
          </div>
          
          <CoordinatePicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onCoordinateChange={handleCoordinateChange}
            className="h-80 w-full rounded-lg border border-gray-300"
          />
          {formData.latitude && formData.longitude && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <div className="text-green-600">✓</div>
                <div className="text-sm text-green-800">
                  <strong>Location set:</strong> {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                </div>
              </div>
              <div className="text-xs text-green-600 mt-1">
                This location will be shown to potential tenants on the property detail page.
              </div>
            </div>
          )}
        </div>

        {/* Lifestyle Scores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Neighborhood Lifestyle Scores (1-3 scale)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Nightlife Score
              </label>
              <select
                name="nightlifeScore"
                value={formData.nightlifeScore}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Transit Access
              </label>
              <select
                name="transitScore"
                value={formData.transitScore}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Safety Score
              </label>
              <select
                name="safetyScore"
                value={formData.safetyScore}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Quietness Score
              </label>
              <select
                name="quietnessScore"
                value={formData.quietnessScore}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Food Scene
              </label>
              <select
                name="foodScore"
                value={formData.foodScore}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Student Friendly
              </label>
              <select
                name="studentFriendlyScore"
                value={formData.studentFriendlyScore}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Images (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="text-4xl text-gray-400 mb-2">📷</div>
              <p className="text-gray-600">
                Click to upload images or drag and drop
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, WebP up to 5MB each (max 10 images)
              </p>
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
          >
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
};