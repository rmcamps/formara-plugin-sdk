/**
 * Tab de testing de API
 * Cliente REST para probar endpoints del plugin
 */

import React, { useState } from 'react';

interface APITestTabProps {
  pluginInfo: any;
}

export default function APITestTab({ pluginInfo }: APITestTabProps) {
  const pluginName = pluginInfo.name;
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState(`/api/plugins/${pluginName}/config`);
  const [body, setBody] = useState('{\n  "workspaceId": 1\n}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const executeRequest = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const url = `http://localhost:3001${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setResponse({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">API Testing</h2>
        <p className="text-gray-600 mb-6">
          Prueba los endpoints de tu plugin directamente desde aquí.
        </p>

        <div className="space-y-4">
          {/* Method + Endpoint */}
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="/api/plugins/mi-plugin/..."
            />
            
            <button
              onClick={executeRequest}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Request Body */}
          {method !== 'GET' && (
            <div>
              <label className="block text-sm font-medium mb-1">Request Body (JSON)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 border rounded font-mono text-sm"
                rows={6}
              />
            </div>
          )}

          {/* Response */}
          {response && (
            <div>
              <label className="block text-sm font-medium mb-1">Response</label>
              <div className={`p-4 rounded ${
                response.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                {response.status && (
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      response.status < 300 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">{response.timestamp}</span>
                  </div>
                )}
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(response.data || response.error, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Quick examples */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Quick Examples:</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setMethod('GET');
                  setEndpoint(`/api/plugins/${pluginName}/config?workspaceId=1`);
                }}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Get Config
              </button>
              <button
                onClick={() => {
                  setMethod('GET');
                  setEndpoint('/health');
                }}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Health Check
              </button>
              <button
                onClick={() => {
                  setMethod('POST');
                  setEndpoint(`/api/plugins/${pluginName}/config`);
                  setBody('{\n  "workspaceId": 1,\n  "config": {}\n}');
                }}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Save Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
