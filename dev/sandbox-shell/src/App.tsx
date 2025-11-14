/**
 * Sandbox Shell para desarrollo de plugins
 * 
 * Provee una UI interactiva para probar plugins sin el core de Formara
 */

import React, { useState } from 'react';
import ConfigurationTab from './pages/ConfigurationTab';
import FieldTypesTab from './pages/FieldTypesTab';
import APITestTab from './pages/APITestTab';
import './App.css';

type Tab = 'config' | 'fieldtypes' | 'api';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('config');
  
  // TODO: Cargar plugin config desde sandbox.config.js
  const pluginName = 'mi-plugin';
  const pluginDisplayName = 'Mi Plugin';

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
        {activeTab === 'config' && <ConfigurationTab pluginName={pluginName} />}
        {activeTab === 'fieldtypes' && <FieldTypesTab pluginName={pluginName} />}
        {activeTab === 'api' && <APITestTab pluginName={pluginName} />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Formara Plugin SDK v1.0.0 • Development Mode</p>
      </footer>
    </div>
  );
}

export default App;

