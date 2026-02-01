import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, Layout, ErrorBoundary, AddPropertyForm } from './components';
import { LoginPage, RegisterPage, HomePage, PropertiesPage, PropertiesMapPage, PropertyDetailPage, OwnerDashboard, NotFoundPage } from './pages';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : 
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginPage />
            </motion.div>
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? <Navigate to="/" replace /> : 
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterPage />
            </motion.div>
          } 
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HomePage />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PropertiesPage />
              </motion.div>
            </Layout>
          }
        />
        <Route
          path="/properties/map"
          element={
            <Layout>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <PropertiesMapPage />
              </motion.div>
            </Layout>
          }
        />
        <Route
          path="/property/:id"
          element={
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PropertyDetailPage />
              </motion.div>
            </Layout>
          }
        />
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute requiredRole="owner">
              <Layout>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <OwnerDashboard />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-property"
          element={
            <ProtectedRoute requiredRole="owner">
              <Layout>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                  <AddPropertyForm 
                    onSuccess={() => window.location.href = '/owner/dashboard'}
                    onCancel={() => window.history.back()}
                  />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Catch-all route for 404 */}
        <Route
          path="*"
          element={
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <NotFoundPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="h-screen w-full bg-gray-50">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
