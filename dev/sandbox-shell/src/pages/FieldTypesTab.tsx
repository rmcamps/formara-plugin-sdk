/**
 * Tab de Field Types
 * Playground interactivo para probar field types custom
 */

import React, { useState } from 'react';

interface FieldTypesTabProps {
  pluginInfo: any;
}

export default function FieldTypesTab({ pluginInfo }: FieldTypesTabProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [testValue, setTestValue] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any>(null);

  // Cargar field types desde el manifest del plugin
  const fieldTypes: any[] = pluginInfo.fieldTypes || [];
  const pluginName = pluginInfo.name;

  if (fieldTypes.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Field Types Playground</h2>
          <p className="text-gray-600 mb-4">
            Este tab permite probar field types custom de forma interactiva.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-yellow-800">
              ℹ️ Tu plugin no define field types custom. Los field types se detectan automáticamente
              desde <code>manifest.json</code> bajo <code>capabilities.fieldTypes</code>
            </p>
          </div>

          <div className="bg-gray-50 rounded p-4">
            <p className="text-sm font-medium mb-2">Ejemplo de field type:</p>
            <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`// frontend/field-types/cuit.tsx
import { 
  Input,
  type FieldTypeDefinition,
  type FieldPreviewProps,
  type FieldRenderProps 
} from '@formara/plugin-sdk/frontend';
import { z } from 'zod';

const CUITFieldType: FieldTypeDefinition = {
  id: 'cuit',
  label: 'CUIT/CUIL',
  category: 'custom',
  icon: '🇦🇷',
  
  // Preview en editor de formularios
  renderPreview: ({ title }: FieldPreviewProps) => (
    <Input placeholder={title} disabled />
  ),
  
  // Campo interactivo en formulario
  renderField: ({ value, onChange }: FieldRenderProps) => (
    <Input 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder="XX-XXXXXXXX-X"
    />
  ),
  
  // Validación con Zod
  generateZodSchema: (config) => {
    let schema = z.string().refine(validarCUIT, {
      message: 'CUIT inválido'
    });
    return config.required ? schema : schema.optional();
  },
  
  defaultValue: ''
};

export default CUITFieldType;`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Field Types Testing</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Lista de field types */}
          <div>
            <h3 className="font-semibold mb-3">Available Field Types</h3>
            {fieldTypes.map((ft) => (
              <button
                key={ft.id}
                onClick={() => setSelectedType(ft.id)}
                className={`w-full text-left p-3 rounded mb-2 border ${
                  selectedType === ft.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{ft.icon} {ft.label}</div>
                <div className="text-xs text-gray-500">{ft.description}</div>
              </button>
            ))}
          </div>

          {/* Playground del field type seleccionado */}
          <div>
            {selectedType ? (
              <div>
                <h3 className="font-semibold mb-3">Interactive Testing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preview Mode</label>
                    <div className="border rounded p-3 bg-gray-50">
                      {/* TODO: Renderizar renderPreview del field type */}
                      <p className="text-xs text-gray-500">Preview rendering here</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Field Mode</label>
                    <div className="border rounded p-3">
                      {/* TODO: Renderizar renderField del field type */}
                      <input 
                        className="w-full border rounded px-3 py-2"
                        value={testValue}
                        onChange={(e) => setTestValue(e.target.value)}
                        placeholder="Test your field type..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Validation</label>
                    <button 
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      onClick={() => {
                        // TODO: Ejecutar validación del field type
                        setValidationResult({ valid: true, message: 'OK' });
                      }}
                    >
                      Test Validation
                    </button>
                    {validationResult && (
                      <div className={`mt-2 p-2 rounded text-sm ${
                        validationResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {validationResult.valid ? '✓' : '✗'} {validationResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select a field type to test
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


