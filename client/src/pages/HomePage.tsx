import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 mb-6">
              Find Your
              <br />
              <span className="text-4xl md:text-6xl">Perfect Home</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover verified rental properties with authentic reviews from real tenants.
              <br />
              <span className="font-semibold text-blue-600">Transparency you can trust.</span>
            </p>

            {/* User Greeting */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-md mx-auto border border-gray-200 shadow-lg">
              <div className="text-lg text-gray-700">
                Welcome, <span className="font-semibold text-blue-600">{user?.email?.split('@')[0]}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Logged in as <span className="font-medium capitalize text-slate-600">{user?.role}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/properties')}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  Browse Properties
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>
              
              <button
                onClick={() => navigate('/properties/map')}
                className="group bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-gray-200"
              >
                <span className="flex items-center gap-2">
                  Map View
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Verified Reviews</h3>
            <p className="text-gray-600">
              Authentic reviews from verified tenants who have actually lived in these properties.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Deposit Transparency</h3>
            <p className="text-gray-600">
              See deposit return rates and understand which properties have trustworthy landlords.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Lifestyle Matching</h3>
            <p className="text-gray-600">
              Filter properties by lifestyle factors like safety, nightlife, transit access, and more.
            </p>
          </div>
        </div>

        {/* Role-specific Content */}
        {user?.role === 'owner' ? (
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                List Your Property
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Join our platform and connect with quality tenants through transparent listings.
              </p>
              <button
                onClick={() => navigate('/owner/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                Find Your Next Home
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Browse verified properties with comprehensive reviews and detailed information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/properties')}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Browsing
                </button>
                <button
                  onClick={() => navigate('/properties/map')}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
                >
                  Explore Map
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Section */}
        <div className="mt-16 bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Trusted by Students and Professionals
            </h2>
            <p className="text-gray-600">
              Join our growing community of transparent rental experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Verified Properties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">5000+</div>
              <div className="text-gray-600">Authentic Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-lg mb-4">
            Experience the future of transparent rental property search
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-gray-400">
            <span>• Verified Reviews</span>
            <span>• Transparent Ratings</span>
            <span>• Trusted Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;