/**
 * Tab de Integrations/Automations
 * Muestra los cards de integraciones que el plugin define
 */

import React from 'react';

interface IntegrationsTabProps {
  pluginInfo: any;
}

export default function IntegrationsTab({ pluginInfo }: IntegrationsTabProps) {
  const integrations = pluginInfo.integrations || [];

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

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Integrations / Automations ({integrations.length})</h2>
        <p className="text-gray-600 mb-6">
          Cards que aparecen en /integrations o /automations para configurar el plugin.
        </p>

        <div className="space-y-4">
          {integrations.map((integration: any) => (
            <div key={integration.id} className="border-2 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Card preview como se vería en Formara */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{integration.icon || '🔌'}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{integration.displayName}</h3>
                  <p className="text-gray-600 text-sm">{integration.description}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    integration.category === 'automation' 
                      ? 'bg-purple-100 text-purple-700'
                      : integration.category === 'storage'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {integration.category || 'other'}
                  </span>
                  {integration.requiresAuth && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                      Requiere Auth
                    </span>
                  )}
                </div>
              </div>

              {/* Detalles técnicos */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">ID:</span>
                    <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                      {integration.id}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Component:</span>
                    <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                      {integration.configComponent || 'N/A'}
                    </code>
                  </div>
                </div>

                {integration.capabilities && (
                  <div>
                    <span className="font-medium">Capabilities:</span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {Object.entries(integration.capabilities).map(([key, value]) => 
                        value && (
                          <span key={key} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                            {key}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {integration.hooks && integration.hooks.length > 0 && (
                  <div>
                    <span className="font-medium">Events:</span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {integration.hooks.map((hook: string) => (
                        <span key={hook} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-mono">
                          {hook}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(integration.website || integration.docsUrl) && (
                  <div className="flex gap-4">
                    {integration.website && (
                      <a href={integration.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                        🌐 Website
                      </a>
                    )}
                    {integration.docsUrl && (
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                        📚 Docs
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Preview note */}
              <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
                <p className="text-blue-800">
                  📌 Este card aparecerá en <strong>/{integration.category === 'automation' ? 'automations' : 'integrations'}</strong> cuando el plugin esté instalado en Formara.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

