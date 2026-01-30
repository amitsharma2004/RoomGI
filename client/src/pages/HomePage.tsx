import React from 'react';
import { useAuth } from '../context/AuthContext';
import ApiTest from '../components/ApiTest';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="h-full w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        <div className="text-center h-full flex flex-col justify-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to PropertyApp
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Hello, {user?.email}! You're logged in as a {user?.role}.
          </p>
          
          {/* API Test Component */}
          <div className="max-w-md mx-auto mb-8">
            <ApiTest />
          </div>
          
          {user?.role === 'owner' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">
                Property Owner Dashboard
              </h2>
              <p className="text-blue-700 mb-4">
                Manage your properties, view reviews, and track performance.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-blue-600">• Add new properties</p>
                <p className="text-sm text-blue-600">• View property analytics</p>
                <p className="text-sm text-blue-600">• Manage tenant reviews</p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-green-900 mb-4">
                Tenant Dashboard
              </h2>
              <p className="text-green-700 mb-4">
                Browse properties, read reviews, and find your perfect home.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-green-600">• Search available properties</p>
                <p className="text-sm text-green-600">• Read neighborhood reviews</p>
                <p className="text-sm text-green-600">• View property details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;