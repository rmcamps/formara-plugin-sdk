/**
 * Tab de Hooks
 * Muestra los hooks del plugin definidos en manifest.json
 */

import React from 'react';

interface HooksTabProps {
  pluginInfo: any;
}

export default function HooksTab({ pluginInfo }: HooksTabProps) {
  const hooks = pluginInfo.hooks || [];

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
          Eventos del sistema a los que el plugin reacciona automáticamente.
        </p>

        <div className="space-y-4">
          {hooks.map((hook: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{hook.id}</h3>
                  <code className="text-xs text-gray-500">{hook.event}</code>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  Hook
                </span>
              </div>
              
              {hook.description && (
                <p className="text-sm text-gray-600 mb-3">{hook.description}</p>
              )}
              
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-medium">Evento:</span>{' '}
                  <span className="text-gray-600">{hook.event}</span>
                </div>
                {hook.priority && (
                  <div>
                    <span className="font-medium">Prioridad:</span>{' '}
                    <span className="text-gray-600">{hook.priority}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

