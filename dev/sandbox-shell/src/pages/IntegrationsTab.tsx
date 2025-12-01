/**
 * Tab de Integrations/Automations
 * Muestra los cards de integraciones que el plugin define
 */

import React, { useState } from 'react';

interface IntegrationsTabProps {
  pluginInfo: any;
}

export default function IntegrationsTab({ pluginInfo }: IntegrationsTabProps) {
  const integrations = pluginInfo.integrations || [];
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [showConfig, setShowConfig] = useState(false);

  if (integrations.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Integrations / Automations</h2>
          <p className="text-gray-600 mb-4">
            Tu plugin no define integration cards.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>¿Qué son las integrations?</strong>
            </p>
            <p className="text-sm text-blue-700 mb-2">
              Las integration cards aparecen en /integrations o /automations de Formara
              y permiten al usuario configurar tu plugin.
            </p>
            <p className="text-sm text-blue-700">
              Se definen en <code>manifest.json</code> bajo <code>capabilities.integrations</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Modal de configuración
  if (showConfig && selectedIntegration) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{selectedIntegration.displayName}</h2>
            <button
              onClick={() => {
                setShowConfig(false);
                setSelectedIntegration(null);
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <p className="text-sm text-blue-800">
                📌 Componente de configuración: <code>{selectedIntegration.configComponent}</code>
              </p>
              <p className="text-xs text-blue-600 mt-2">
                El componente real se cargaría aquí. Por ahora, esto es una preview del sandbox.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-semibold mb-2">Props que recibiría el componente:</h3>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`{
  workspaceId: 1,
  onClose: () => { /* cerrar modal */ }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold mb-2">Integrations / Automations ({integrations.length})</h2>
        <p className="text-gray-600 mb-6">
          Cards de integraciones como se verán en Formara. Click para configurar.
        </p>

        <div className="space-y-4">
          {integrations.map((integration: any) => (
            <button
              key={integration.id}
              onClick={() => {
                setSelectedIntegration(integration);
                setShowConfig(true);
              }}
              className="w-full text-left bg-white border rounded-lg p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
            >
              {/* Card con estilo de Formara */}
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{integration.icon || '🔌'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{integration.displayName}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      No configurado
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{integration.description}</p>
                  
                  {/* Info adicional en el card */}
                  <div className="flex gap-3 mt-3 text-xs text-gray-500">
                    {integration.requiresAuth && (
                      <span className="flex items-center gap-1">
                        🔐 Requiere autenticación
                      </span>
                    )}
                    {integration.capabilities?.sync && (
                      <span className="flex items-center gap-1">
                        🔄 Sincronización
                      </span>
                    )}
                    {integration.capabilities?.realtime && (
                      <span className="flex items-center gap-1">
                        ⚡ Tiempo real
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hover indicator */}
              <div className="mt-3 text-sm text-indigo-600 flex items-center gap-2">
                <span>Click para configurar</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Info técnica */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium mb-2">ℹ️ Preview del Sandbox</p>
          <p className="text-gray-600 mb-1">
            Estos cards aparecerán en Formara en <code>/integrations</code> o <code>/automations</code> según su categoría.
          </p>
          <p className="text-gray-600">
            Click en un card para ver el componente de configuración.
          </p>
        </div>
      </div>
    </div>
  );
}

