/**
 * Tab de Actions
 * Muestra las actions del plugin definidas en manifest.json
 */

import React from 'react';

interface ActionsTabProps {
  pluginInfo: any;
}

export default function ActionsTab({ pluginInfo }: ActionsTabProps) {
  const actions = pluginInfo.actions || [];

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
          Botones/comandos que el plugin registra en diferentes contextos.
        </p>

        <div className="space-y-4">
          {actions.map((action: any) => (
            <div key={action.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{action.icon || '⚡'}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{action.label}</h3>
                    <code className="text-xs text-gray-500">{action.id}</code>
                  </div>
                </div>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                  Action
                </span>
              </div>
              
              {action.description && (
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              )}
              
              <div className="text-sm">
                <p className="font-medium mb-1">Contextos:</p>
                <div className="flex gap-2 flex-wrap">
                  {action.contexts?.map((ctx: string) => (
                    <span key={ctx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {ctx}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

