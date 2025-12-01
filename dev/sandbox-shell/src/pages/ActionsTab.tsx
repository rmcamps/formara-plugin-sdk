/**
 * Tab de Actions
 * Permite ejecutar actions del plugin con datos de prueba
 */

import React, { useState } from 'react';

interface ActionsTabProps {
  pluginInfo: any;
}

export default function ActionsTab({ pluginInfo }: ActionsTabProps) {
  const actions = pluginInfo.actions || [];
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [selectedMock, setSelectedMock] = useState<string>('custom');
  const [contextData, setContextData] = useState<string>('{}');
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  
  // Mocks de datos de prueba (por ahora hardcoded, luego desde archivo)
  const mockData: Record<string, any> = {
    'document-sample': {
      context: 'document',
      document: {
        id: 1,
        name: 'Factura de prueba.pdf',
        type: 'upload',
        status: 'processed',
        extractedData: {
          cuit: '30-71511463-8',
          total: 12100
        },
        fields: {
          cuit: '30-71511463-8',
          razonSocial: 'Empresa de Prueba SA',
          total: 12100
        }
      },
      userId: 1
    },
    'form-record-sample': {
      context: 'record',
      formRecord: {
        id: 1,
        formId: 1,
        workspaceId: 1,
        data: {
          tipoComprobante: 11,
          letraComprobante: 'C',
          cuitEmisor: '30-71511463-8',
          razonSocialEmisor: 'Empresa de Prueba SA',
          subtotal: 10000,
          ivaTotal: 2100,
          total: 12100,
          items: [
            {
              descripcion: 'Producto de prueba',
              cantidad: 1,
              precioUnitario: 10000,
              subtotal: 10000,
              iva: 2100
            }
          ]
        }
      },
      userId: 1
    }
  };
  
  const executeAction = async () => {
    if (!selectedAction) return;
    
    setExecuting(true);
    setResult(null);
    
    try {
      let data;
      if (selectedMock === 'custom') {
        data = JSON.parse(contextData);
      } else {
        data = mockData[selectedMock];
      }
      
      const response = await fetch(`http://localhost:3001/sandbox/execute-action/${selectedAction.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const actionResult = await response.json();
      setResult(actionResult);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Error ejecutando action'
      });
    } finally {
      setExecuting(false);
    }
  };

  if (actions.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <p className="text-gray-600 mb-4">
            Tu plugin no define actions.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>¿Qué son las actions?</strong>
            </p>
            <p className="text-sm text-blue-700 mb-2">
              Las actions son botones/comandos que aparecen en diferentes contextos de Formara
              (documentos, formularios, registros) para ejecutar funcionalidad del plugin.
            </p>
            <p className="text-sm text-blue-700">
              Se definen en <code>manifest.json</code> bajo <code>capabilities.actions</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Actions ({actions.length})</h2>
        <p className="text-gray-600 mb-6">
          Ejecuta actions del plugin con datos de prueba.
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/* Lista de actions */}
          <div>
            <h3 className="font-semibold mb-3">Available Actions</h3>
            {actions.map((action: any) => (
              <button
                key={action.id}
                onClick={() => {
                  setSelectedAction(action);
                  setResult(null);
                  // Auto-seleccionar mock según contexto
                  if (action.contexts?.includes('document')) {
                    setSelectedMock('document-sample');
                    setContextData(JSON.stringify(mockData['document-sample'], null, 2));
                  } else if (action.contexts?.includes('record')) {
                    setSelectedMock('form-record-sample');
                    setContextData(JSON.stringify(mockData['form-record-sample'], null, 2));
                  }
                }}
                className={`w-full text-left p-3 rounded mb-2 border ${
                  selectedAction?.id === action.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{action.icon || '⚡'}</span>
                  <div className="font-medium">{action.label}</div>
                </div>
                <code className="text-xs text-gray-500">{action.id}</code>
                {action.description && (
                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                )}
                <div className="flex gap-1 mt-2">
                  {action.contexts?.map((ctx: string) => (
                    <span key={ctx} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                      {ctx}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Playground de acción seleccionada */}
          <div>
            {selectedAction ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Testing: {selectedAction.label}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedAction.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Datos de prueba:</label>
                  <select
                    value={selectedMock}
                    onChange={(e) => {
                      setSelectedMock(e.target.value);
                      if (e.target.value !== 'custom') {
                        setContextData(JSON.stringify(mockData[e.target.value], null, 2));
                      }
                    }}
                    className="w-full border rounded px-3 py-2 text-sm mb-2"
                  >
                    <option value="document-sample">📄 Documento de prueba</option>
                    <option value="form-record-sample">📝 Registro de formulario</option>
                    <option value="custom">✏️ Custom (editar JSON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Context Data (JSON):</label>
                  <textarea
                    value={contextData}
                    onChange={(e) => setContextData(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-xs font-mono"
                    rows={12}
                  />
                </div>

                <button
                  onClick={executeAction}
                  disabled={executing}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {executing ? '⏳ Ejecutando...' : `▶️ Ejecutar ${selectedAction.label}`}
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
                          {result.success ? 'Éxito' : 'Error'}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{result.message}</p>
                      {result.error && (
                        <p className="text-sm text-red-700 mb-2">Error: {result.error}</p>
                      )}
                      {result.data && (
                        <details className="text-xs">
                          <summary className="cursor-pointer font-medium mb-1">Ver datos</summary>
                          <pre className="mt-2 bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      {result.download && (
                        <div className="mt-2">
                          <a
                            href={result.download.url}
                            download={result.download.filename}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            📥 Descargar: {result.download.filename}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Selecciona una action para ejecutarla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

