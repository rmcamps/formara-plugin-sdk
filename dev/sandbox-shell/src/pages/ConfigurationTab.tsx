/**
 * Tab de Configuración
 * Muestra el componente de configuración del plugin
 */

import React, { useEffect, useState } from 'react';

interface ConfigurationTabProps {
  pluginInfo: any;
}

export default function ConfigurationTab({ pluginInfo }: ConfigurationTabProps) {
  const pluginName = pluginInfo.name;
  const [ConfigComponent, setConfigComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Cargar dinámicamente el componente del plugin
    // Por ahora, mostrar instrucciones
    setLoading(false);
  }, [pluginName]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Cargando componente de configuración...</p>
      </div>
    );
  }

  if (!ConfigComponent) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Configuration Component</h2>
          <p className="text-gray-600 mb-4">
            Este tab muestra el componente de configuración de tu plugin.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Para developers:</strong>
            </p>
            <p className="text-sm text-blue-700">
              Tu componente debe exportarse en <code>frontend/components/TuConfig.tsx</code>
              y será cargado dinámicamente aquí para testing visual.
            </p>
          </div>

          <div className="bg-gray-50 rounded p-4">
            <p className="text-sm font-medium mb-2">Ejemplo de uso:</p>
            <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`// frontend/components/MiConfig.tsx
import { api, useAuth, authHeaders, Input } from '@formara/plugin-sdk/frontend';

export default function MiConfig({ workspaceId }) {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch(api('/api/plugins/mi-plugin/items'), {
      headers: authHeaders(token)
    })
      .then(r => r.json())
      .then(setData);
  }, []);
  
  return <div>Tu UI aquí</div>;
}`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow">
        <ConfigComponent workspaceId={1} />
      </div>
    </div>
  );
}


