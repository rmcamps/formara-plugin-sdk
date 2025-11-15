/**
 * Tab de Hooks
 * Permite probar hooks del plugin disparando eventos mock
 */

import React, { useState } from 'react';

interface HooksTabProps {
  pluginInfo: any;
}

export default function HooksTab({ pluginInfo }: HooksTabProps) {
  const hooks = pluginInfo.hooks || [];
  const [selectedHook, setSelectedHook] = useState<any>(null);
  const [selectedMock, setSelectedMock] = useState<string>('file-processed');
  const [eventData, setEventData] = useState<string>('{}');
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  
  // Mocks de eventos del sistema
  const mockEvents: Record<string, any> = {
    'file-processed': {
      event: 'file.processed',
      data: {
        file: {
          id: 1,
          name: 'documento-prueba.pdf',
          type: 'upload',
          status: 'processed',
          workspaceId: 1,
          extractedData: {
            cliente: 'Juan Pérez',
            cuit: '20-12345678-9',
            total: 12100
          }
        },
        user: { id: 1, email: 'dev@formara.local' },
        workspace: { id: 1, name: 'Test Workspace' }
      }
    },
    'form-record-created': {
      event: 'form.record.created',
      data: {
        record: {
          id: 1,
          formId: 1,
          data: {
            nombre: 'Cliente Ejemplo',
            cuit: '30-71511463-8',
            total: 5000
          }
        },
        form: {
          id: 1,
          name: 'Formulario de Prueba',
          schema: {},
          workspaceId: 1
        },
        user: { id: 1, email: 'dev@formara.local' }
      }
    },
    'form-record-updated': {
      event: 'form.record.updated',
      data: {
        record: {
          id: 1,
          formId: 1,
          data: {
            nombre: 'Cliente Actualizado',
            estado: 'aprobado'
          }
        },
        form: { id: 1, name: 'Formulario', workspaceId: 1 },
        previousData: {
          nombre: 'Cliente Ejemplo',
          estado: 'pendiente'
        }
      }
    }
  };
  
  const dispatchHook = async () => {
    if (!selectedHook) return;
    
    setExecuting(true);
    setResult(null);
    
    try {
      let data;
      if (selectedMock === 'custom') {
        data = JSON.parse(eventData);
      } else {
        data = mockEvents[selectedMock];
      }
      
      const response = await fetch(`http://localhost:3001/sandbox/dispatch-hook/${selectedHook.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const hookResult = await response.json();
      setResult(hookResult);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Error disparando hook'
      });
    } finally {
      setExecuting(false);
    }
  };

  if (hooks.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Hooks</h2>
          <p className="text-gray-600 mb-4">
            Tu plugin no define hooks.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>¿Qué son los hooks?</strong>
            </p>
            <p className="text-sm text-blue-700 mb-2">
              Los hooks permiten a tu plugin reaccionar a eventos del sistema
              (archivos procesados, formularios creados, etc.) para ejecutar lógica automáticamente.
            </p>
            <p className="text-sm text-blue-700">
              Se definen en <code>manifest.json</code> bajo <code>capabilities.hooks</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Hooks ({hooks.length})</h2>
        <p className="text-gray-600 mb-6">
          Dispara eventos mock para probar cómo reacciona el plugin.
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/* Lista de hooks */}
          <div>
            <h3 className="font-semibold mb-3">Available Hooks</h3>
            {hooks.map((hook: any, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedHook(hook);
                  setResult(null);
                  // Auto-seleccionar mock según evento
                  const eventKey = hook.event.replace('.', '-');
                  if (mockEvents[eventKey]) {
                    setSelectedMock(eventKey);
                    setEventData(JSON.stringify(mockEvents[eventKey], null, 2));
                  }
                }}
                className={`w-full text-left p-3 rounded mb-2 border ${
                  selectedHook?.id === hook.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium mb-1">{hook.id}</div>
                <code className="text-xs text-gray-500">{hook.event}</code>
                {hook.description && (
                  <p className="text-xs text-gray-600 mt-1">{hook.description}</p>
                )}
                {hook.priority && (
                  <div className="mt-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      Prioridad: {hook.priority}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Playground de hook seleccionado */}
          <div>
            {selectedHook ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Testing Hook: {selectedHook.id}</h3>
                  <p className="text-sm text-gray-600 mb-1">Evento: <code>{selectedHook.event}</code></p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Evento de prueba:</label>
                  <select
                    value={selectedMock}
                    onChange={(e) => {
                      setSelectedMock(e.target.value);
                      if (e.target.value !== 'custom') {
                        setEventData(JSON.stringify(mockEvents[e.target.value], null, 2));
                      }
                    }}
                    className="w-full border rounded px-3 py-2 text-sm mb-2"
                  >
                    <option value="file-processed">📄 file.processed</option>
                    <option value="form-record-created">📝 form.record.created</option>
                    <option value="form-record-updated">✏️ form.record.updated</option>
                    <option value="custom">🔧 Custom (editar JSON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Event Data (JSON):</label>
                  <textarea
                    value={eventData}
                    onChange={(e) => setEventData(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-xs font-mono"
                    rows={12}
                  />
                </div>

                <button
                  onClick={dispatchHook}
                  disabled={executing}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {executing ? '⏳ Disparando...' : `🔔 Disparar Hook`}
                </button>

                {result && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Resultado:</label>
                    <div className={`p-4 rounded border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{result.success ? '✅' : '❌'}</span>
                        <span className="font-medium">
                          {result.success ? 'Hook ejecutado' : 'Error'}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{result.message}</p>
                      {result.error && (
                        <p className="text-sm text-red-700">{result.error}</p>
                      )}
                      {result.data && (
                        <details className="text-xs mt-2">
                          <summary className="cursor-pointer font-medium">Ver datos del resultado</summary>
                          <pre className="mt-2 bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Selecciona un hook para probarlo
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

