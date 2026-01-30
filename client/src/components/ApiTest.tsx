import React, { useState } from 'react';
import api from '../lib/axios';

const ApiTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await api.get('/');
      setStatus(`✅ Connected! Server response: ${response.data.message}`);
    } catch (error: any) {
      setStatus(`❌ Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-2">API Connection Test</h3>
      <p className="text-sm text-gray-600 mb-3">
        Base URL: {import.meta.env.VITE_API_URL}
      </p>
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      <p className="mt-3 text-sm">{status}</p>
    </div>
  );
};

export default ApiTest;