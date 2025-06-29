'use client';

import { useEffect, useState } from 'react';

interface TestResult {
  success: boolean;
  data: any;
  error: string | null;
}

export default function TestConnectionPage() {
  const [results, setResults] = useState<{
    restApi: TestResult;
    directClient: TestResult;
    config: {
      url: string | undefined;
      anonKey: string;
      serviceKey: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing connection to Supabase...');
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to test connection');
      }
      
      console.log('Connection test results:', data);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Connection test failed:', errorMessage, err);
      setError(errorMessage);
      
      // Auto-retry logic (up to 3 times)
      if (retryCount < 3) {
        const delay = 1000 * (retryCount + 1); // 1s, 2s, 3s
        console.log(`Retrying in ${delay}ms...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, [retryCount]);

  const renderConnectionStatus = (result: TestResult, title: string) => (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          result.success 
            ? 'bg-green-100 text-green-800' 
            : loading 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-red-100 text-red-800'
        }`}>
          {loading ? 'Testing...' : result.success ? 'Connected' : 'Failed'}
        </span>
      </div>
      
      {error && !loading && (
        <div className="mt-2 p-3 bg-red-50 text-red-700 rounded text-sm">
          <p className="font-medium">Error:</p>
          <p className="mt-1 font-mono break-all">{error}</p>
        </div>
      )}
      
      {result.error && !loading && (
        <div className="mt-2 p-3 bg-yellow-50 text-yellow-700 rounded text-sm">
          <p className="font-medium">Details:</p>
          <p className="mt-1 font-mono break-all">{result.error}</p>
        </div>
      )}
      
      {result.data && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-600 mb-1">Response:</p>
          <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Connection Test</h1>
          <p className="text-gray-600">
            Testing connection to your Supabase instance
          </p>
        </div>

        <div className="space-y-6">
          {/* Configuration Card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Configuration</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Current Supabase connection settings
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Supabase URL</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono break-all">
                    {results?.config?.url || 'Not set'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Anon Key</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono break-all">
                    {results?.config?.anonKey || 'Not set'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Service Key</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono break-all">
                    {results?.config?.serviceKey || 'Not set'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Connection Tests */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Connection Tests</h2>
            
            {/* REST API Test */}
            {renderConnectionStatus(
              results?.restApi || { success: false, data: null, error: null },
              'REST API Connection'
            )}
            
            {/* Direct Client Test */}
            {renderConnectionStatus(
              results?.directClient || { success: false, data: null, error: null },
              'Direct Client Connection'
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={testConnection}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </>
              ) : (
                'Test Again'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
