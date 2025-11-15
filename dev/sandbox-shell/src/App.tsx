/**
 * Sandbox Shell para desarrollo de plugins
 * 
 * Provee una UI interactiva para probar plugins sin el core de Formara
 */

import React, { useState } from 'react';
import ConfigurationTab from './pages/ConfigurationTab';
import FieldTypesTab from './pages/FieldTypesTab';
import ActionsTab from './pages/ActionsTab';
import HooksTab from './pages/HooksTab';
import IntegrationsTab from './pages/IntegrationsTab';
import APITestTab from './pages/APITestTab';
import './App.css';

type Tab = 'config' | 'fieldtypes' | 'actions' | 'hooks' | 'integrations' | 'api';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('config');
  const [pluginInfo, setPluginInfo] = useState<any>(null);
  
  // Cargar configuración del plugin desde el backend sandbox
  React.useEffect(() => {
    fetch('http://localhost:3001/sandbox/plugin-info')
      .then(r => r.json())
      .then(setPluginInfo)
      .catch(err => console.error('Error loading plugin info:', err));
  }, []);
  
  if (!pluginInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Cargando información del plugin...</p>
          <p className="text-sm text-gray-500">Asegúrate que el backend esté corriendo en :3001</p>
        </div>
      </div>
    );
  }
  
  const pluginName = pluginInfo.name;
  const pluginDisplayName = pluginInfo.displayName || pluginInfo.name;

  return (
    <div className="sandbox-shell">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🧪 Formara Plugin Sandbox</h1>
          <div className="plugin-info">
            <span className="plugin-badge">{pluginDisplayName}</span>
            <span className="status-badge">Development</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ Configuration
        </button>
        <button
          className={`tab ${activeTab === 'fieldtypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('fieldtypes')}
        >
          🎨 Field Types
          {pluginInfo.fieldTypes?.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
              {pluginInfo.fieldTypes.length}
            </span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          ⚡ Actions
          {pluginInfo.actions?.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
              {pluginInfo.actions.length}
            </span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'hooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('hooks')}
        >
          🪝 Hooks
          {pluginInfo.hooks?.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
              {pluginInfo.hooks.length}
            </span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          🔗 Integrations
          {pluginInfo.integrations?.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              {pluginInfo.integrations.length}
            </span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          🔌 API Test
        </button>
      </div>

      {/* Content */}
      <main className="content">
        {activeTab === 'config' && <ConfigurationTab pluginInfo={pluginInfo} />}
        {activeTab === 'fieldtypes' && <FieldTypesTab pluginInfo={pluginInfo} />}
        {activeTab === 'actions' && <ActionsTab pluginInfo={pluginInfo} />}
        {activeTab === 'hooks' && <HooksTab pluginInfo={pluginInfo} />}
        {activeTab === 'integrations' && <IntegrationsTab pluginInfo={pluginInfo} />}
        {activeTab === 'api' && <APITestTab pluginInfo={pluginInfo} />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Formara Plugin SDK v1.0.0 • Development Mode</p>
      </footer>
    </div>
  );
}

export default App;


