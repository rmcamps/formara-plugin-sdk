/**
 * Componente base de sandbox para desarrollo de plugins
 * 
 * Este componente proporciona una UI completa para probar:
 * - Field Types: Preview, validación interactiva
 * - Actions: Ejecución con mockups dinámicos
 * - Integrations: Display de cards del manifest
 * 
 * Todo se carga dinámicamente desde el manifest y los fieldTypes pasados como props.
 */

import React, { useState, useEffect } from 'react';
import {
  Tabs as SdkTabs,
  TabsList as SdkTabsList,
  TabsTrigger as SdkTabsTrigger,
  TabsContent as SdkTabsContent,
  Card as SdkCard,
  CardHeader as SdkCardHeader,
  CardTitle as SdkCardTitle,
  CardDescription as SdkCardDescription,
  CardContent as SdkCardContent,
  Button as SdkButton,
  Label as SdkLabel,
  Select as SdkSelect,
  SelectContent as SdkSelectContent,
  SelectItem as SdkSelectItem,
  SelectTrigger as SdkSelectTrigger,
  SelectValue as SdkSelectValue,
} from '../../ui';
import { loadMockups } from './mockup-loader';

// Re-exportar loadMockups para que los plugins puedan usarlo fácilmente
export { loadMockups };

/**
 * Hook para detectar y aplicar el tema según la preferencia del sistema
 */
function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Aplicar el tema al documento inmediatamente
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return { isDark, toggleTheme };
}

/**
 * Componente wrapper para renderField
 * Renderiza el resultado de renderField directamente para que los hooks funcionen correctamente
 */
function FieldWrapper({ renderField, value, onChange, config, disabled }: {
  renderField: (props: any) => React.ReactElement;
  value: any;
  onChange: (val: any) => void;
  config: any;
  disabled: boolean;
}) {
  // Renderizar directamente el resultado de renderField
  // Los hooks dentro de renderField se ejecutarán correctamente porque
  // este componente se renderiza de manera consistente
  return renderField({ value, onChange, config, disabled });
}

export interface DevAppProps {
  /** Nombre del plugin */
  pluginName: string;
  /** Display name del plugin */
  displayName: string;
  /** Versión del plugin */
  version?: string;
  /** Descripción del plugin */
  description?: string;
  /** Field types del plugin (FieldTypeDefinition[]) */
  fieldTypes?: any[];
  /** Actions del plugin (del manifest) */
  actions?: any[];
  /** Integrations del plugin (array de integration objects) */
  integrations?: any[];
  /** Mockups para testing de actions (opcional, si no se proporciona se intenta cargar automáticamente) */
  mockups?: Record<string, { label: string; data: any }>;
  /** URL del backend del plugin */
  backendUrl?: string;
  /** Componentes UI adicionales (tabs, cards, etc.) */
  uiComponents?: {
    Tabs?: any;
    TabsList?: any;
    TabsTrigger?: any;
    TabsContent?: any;
    Card?: any;
    CardHeader?: any;
    CardTitle?: any;
    CardDescription?: any;
    CardContent?: any;
    Button?: any;
    Label?: any;
    Select?: any;
    SelectContent?: any;
    SelectItem?: any;
    SelectTrigger?: any;
    SelectValue?: any;
  };
  /** Mapeo de action.id a endpoint del backend (opcional, usa convención por defecto) */
  actionEndpoints?: Record<string, { method: string; path: string }>;
  /** Componentes de configuración de integrations (opcional) */
  integrationComponents?: Record<string, React.ComponentType<any>>;
}

export function DevApp({
  pluginName,
  displayName,
  version = '1.0.0',
  description = '',
  fieldTypes = [],
  actions = [],
  integrations = [],
  mockups: providedMockups = {},
  backendUrl = 'http://localhost:4001',
  uiComponents = {},
  actionEndpoints,
  integrationComponents: providedIntegrationComponents = {},
}: DevAppProps) {
  // Configurar backendUrl globalmente para que api-adapter lo use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__PLUGIN_BACKEND_URL__ = backendUrl;
      // También extraer el puerto para compatibilidad con código antiguo
      try {
        const url = new URL(backendUrl);
        (window as any).__PLUGIN_BACKEND_PORT__ = url.port || (url.protocol === 'https:' ? '443' : '80');
      } catch (e) {
        // Si backendUrl no es una URL válida, intentar extraer puerto manualmente
        const portMatch = backendUrl.match(/:(\d+)/);
        if (portMatch) {
          (window as any).__PLUGIN_BACKEND_PORT__ = portMatch[1];
        }
      }
    }
  }, [backendUrl]);
  
  // Usar mockups proporcionados
  // NOTA: Para cargar mockups automáticamente, los plugins deben llamar loadMockups() en su dev.tsx
  // porque import.meta.glob se resuelve en build-time desde donde está el código, no desde donde se importa.
  // Ejemplo en dev.tsx: import { DevApp, loadMockups } from '@formara/plugin-sdk/sandbox/frontend';
  //                     const mockups = loadMockups(); // Luego pasar a DevApp
  const mockups = providedMockups;
  
  // Extraer automáticamente componentes de configuración de las integraciones
  // Si una integración tiene configComponent, se extrae automáticamente
  // Esto permite pasar integrations directamente sin tener que mapear manualmente
  const autoExtractedComponents = integrations.reduce((acc, integration: any) => {
    if (integration.configComponent) {
      acc[integration.id] = integration.configComponent;
    }
    return acc;
  }, {} as Record<string, React.ComponentType<any>>);
  
  // Combinar componentes extraídos automáticamente con los proporcionados explícitamente
  // Los proporcionados explícitamente tienen prioridad (override)
  const integrationComponents = {
    ...autoExtractedComponents,
    ...providedIntegrationComponents,
  };
  
  // Estado interno para actions (si se cargan automáticamente)
  const [loadedActions, setLoadedActions] = useState<any[]>(actions);
  const [loadingActions, setLoadingActions] = useState(false);
  
  const [selectedTab, setSelectedTab] = useState('field-types');
  const [selectedFieldType, setSelectedFieldType] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);
  const [customJson, setCustomJson] = useState<string>('');
  const [customJsonError, setCustomJsonError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<any>(null);
  const [fieldValue, setFieldValue] = useState<any>('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [integrationSubView, setIntegrationSubView] = useState<string | null>(null);
  const { isDark, toggleTheme } = useTheme();

  // Actualizar título del documento
  useEffect(() => {
    document.title = `${displayName} - Dev Environment`;
  }, [displayName]);

  // Cargar actions automáticamente desde el backend si no se proporcionaron
  useEffect(() => {
    // Solo cargar si actions está vacío y hay backendUrl
    if (actions.length === 0 && backendUrl) {
      setLoadingActions(true);
      const loadActions = async () => {
        try {
          const response = await fetch(`${backendUrl}/api/plugins/${pluginName}/actions`);
          if (response.ok) {
            const data = await response.json();
            setLoadedActions(data.actions || []);
            if (process.env.NODE_ENV === 'development') {
              console.log(`[DevApp] ✅ ${data.actions?.length || 0} actions cargadas automáticamente desde backend`);
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[DevApp] ⚠️ No se pudieron cargar actions del backend (${response.status})`);
            }
            setLoadedActions([]);
          }
        } catch (error: any) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[DevApp] ⚠️ Error cargando actions: ${error.message}`);
          }
          setLoadedActions([]);
        } finally {
          setLoadingActions(false);
        }
      };
      loadActions();
    } else {
      // Si se proporcionaron actions, usarlas directamente
      setLoadedActions(actions);
    }
  }, [actions, backendUrl, pluginName]);

  // Verificar estado del backend
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setBackendStatus('offline');
        }
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Resetear mockup cuando cambia la action
  useEffect(() => {
    setSelectedMockup(null);
    if (selectedAction && Object.keys(mockups).length > 0) {
      const firstMockupKey = Object.keys(mockups)[0];
      setSelectedMockup(firstMockupKey);
    }
  }, [selectedAction, mockups]);
  
  // Log para debugging (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && Object.keys(mockups).length > 0) {
      console.log(`[DevApp] ${Object.keys(mockups).length} mockups disponibles`);
    }
  }, [mockups]);

  // Renderizar contenido según tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'field-types':
        return renderFieldTypes();
      case 'actions':
        return renderActions();
      case 'integrations':
        // Las integraciones se renderizan directamente en TabsContent
        return null;
      default:
        return <div>Tab no implementado: {selectedTab}</div>;
    }
  };

  // Renderizar Field Types con validación interactiva
  const renderFieldTypes = () => {
    if (!selectedFieldType) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          Seleccioná un Field Type del menú lateral
        </div>
      );
    }

    // Mostrar resumen si se selecciona la opción especial
    if (selectedFieldType === '__RESUMEN_FIELD_TYPES__') {
      return (
        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📚 Resumen: Field Types</h3>
          </div>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Qué son los Field Types?</h4>
              <p className="text-sm">
                Los Field Types son tipos de campo personalizados que extienden las capacidades de Formara. 
                Permiten agregar validaciones específicas, componentes UI personalizados y comportamientos especiales 
                para diferentes tipos de datos (ej: CUIT, CAE, IBAN, etc.).
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Para qué sirven?</h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Validación automática de datos según reglas específicas</li>
                <li>Componentes UI personalizados para mejor UX</li>
                <li>Formateo automático de valores (ej: CUIT con guiones)</li>
                <li>Integración con servicios externos para validación</li>
                <li>Hints para IA que mejoran la extracción de datos</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Cómo se muestran y usan en Formara?</h4>
              <p className="text-sm mb-2">
                Los Field Types aparecen en el selector de tipos de campo cuando se crea o edita un formulario. 
                Una vez seleccionado, el campo se comporta según la definición del Field Type:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Se muestra el componente UI personalizado al llenar el formulario</li>
                <li>Se valida automáticamente según las reglas definidas</li>
                <li>Se formatea el valor según el tipo (ej: CUIT: 20-12345678-9)</li>
                <li>La IA usa los hints para mejor extracción de documentos</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Cómo se agregan y programan en el plugin?</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-mono mb-2">1. Crear el componente del Field Type:</p>
                <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto">
{`plugins/mi-plugin/frontend/field-types/
  └── mi-tipo.tsx`}
                </pre>
                <p className="text-sm font-mono mt-4 mb-2">2. Exportar en frontend/index.ts:</p>
                <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto">
{`export const fieldTypes = [
  MiFieldType,
  // ...
];`}
                </pre>
                <p className="text-sm mt-4">
                  El Field Type debe implementar la interfaz <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">FieldTypeDefinition</code> 
                  con métodos como <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">renderPreview</code>, 
                  <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">renderField</code>, 
                  <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">validate</code>, etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const fieldType = fieldTypes.find((ft) => ft.id === selectedFieldType);
    if (!fieldType) return null;

    // fieldType ya es el FieldTypeDefinition completo, no necesita .component
    const FieldComponent = fieldType;
    const Button = uiComponents.Button || (({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ));
    const Label = uiComponents.Label || (({ children, htmlFor, ...props }: any) => (
      <label htmlFor={htmlFor} {...props}>{children}</label>
    ));

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{FieldComponent.label}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{FieldComponent.description}</p>
          {FieldComponent.aiHint && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
              <strong>AI Hint:</strong> {FieldComponent.aiHint}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Vista Previa</h4>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            {FieldComponent.renderPreview && FieldComponent.renderPreview({
              title: FieldComponent.label,
              description: FieldComponent.description,
              config: {},
              onChange: (desc: string) => console.log('Description changed:', desc),
            })}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Campo Interactivo</h4>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 space-y-4">
            <div>
              <Label htmlFor="field-input" className="mb-2 block text-gray-900 dark:text-gray-100">
                {FieldComponent.label}
              </Label>
              <FieldWrapper
                renderField={FieldComponent.renderField || (() => <div>No renderField disponible</div>)}
                value={fieldValue}
                onChange={(val: any) => {
                  setFieldValue(val);
                  setValidationResult(null);
                }}
                config={{ required: true, placeholder: `Ingresá ${FieldComponent.label}` }}
                disabled={false}
              />
            </div>
            <Button
              onClick={() => {
                if (FieldComponent.validate) {
                  const result = FieldComponent.validate(fieldValue, { required: true });
                  setValidationResult(result);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Validar Campo
            </Button>
            {validationResult && (
              <div
                className={`p-3 rounded ${
                  validationResult.valid
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-300'
                }`}
              >
                <p className="font-medium">
                  {validationResult.valid ? '✅ Válido' : '❌ Inválido'}
                </p>
                <p className="text-sm">{validationResult.message || validationResult.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar Actions con ejecución y mockups
  const renderActions = () => {
    if (!selectedAction) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          Seleccioná una Action del menú lateral
        </div>
      );
    }

    // Mostrar resumen si se selecciona la opción especial
    if (selectedAction === '__RESUMEN_ACTIONS__') {
      return (
        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📚 Resumen: Actions</h3>
          </div>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Qué son las Actions?</h4>
              <p className="text-sm">
                Las Actions son comandos ejecutables que permiten realizar operaciones sobre documentos o registros de formularios. 
                Pueden validar datos, consultar servicios externos, generar archivos, o realizar cualquier operación que requiera lógica del backend.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Para qué sirven?</h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Validar datos contra servicios externos (ej: CUIT contra AFIP)</li>
                <li>Generar documentos o archivos (ej: facturas PDF)</li>
                <li>Consultar APIs externas y actualizar registros</li>
                <li>Realizar transformaciones de datos complejas</li>
                <li>Integrar con servicios de terceros</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Cómo se muestran y usan en Formara?</h4>
              <p className="text-sm mb-2">
                Las Actions aparecen como botones en diferentes contextos de Formara:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>En la barra de herramientas de documentos o registros</li>
                <li>En menús contextuales al hacer clic derecho</li>
                <li>Como botones en vistas de detalle</li>
                <li>Se ejecutan con el contexto del documento o registro actual</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Cómo se agregan y programan en el plugin?</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-mono mb-2">1. Definir la action en backend/actions.ts:</p>
                <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto">
{`export const actions: ActionDefinition[] = [
  {
    id: 'mi-action',
    label: 'Mi Action',
    description: 'Descripción...',
    contexts: ['document', 'form-record'],
    handler: async (data: ActionContextData) => {
      // Lógica de la action
      return { success: true, message: '...' };
    }
  }
];`}
                </pre>
                <p className="text-sm font-mono mt-4 mb-2">2. Crear endpoint en backend/routes.ts (opcional, para testing):</p>
                <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto">
{`pluginRouter.post('/mi-action', async (req, res) => {
  // Endpoint para testing en dev environment
  res.json({ success: true });
});`}
                </pre>
                <p className="text-sm mt-4">
                  Las actions se cargan automáticamente desde el backend en el dev environment. 
                  En producción, se registran automáticamente cuando el plugin se carga.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const action = loadedActions.find((a: any) => a.id === selectedAction);
    if (!action) return null;

    const isCustom = selectedMockup === '__CUSTOM__';
    const currentMockup = isCustom 
      ? (customJson ? { label: 'Custom JSON', data: (() => {
          try {
            return JSON.parse(customJson);
          } catch (e) {
            return null;
          }
        })() } : null)
      : (selectedMockup ? mockups[selectedMockup] : null);
    const Button = uiComponents.Button || (({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ));
    const Label = uiComponents.Label || (({ children, htmlFor, ...props }: any) => (
      <label htmlFor={htmlFor} {...props}>{children}</label>
    ));
    // Si hay componentes UI del SDK, usarlos. Si no, usar select nativo simple
    const hasSdkSelect = uiComponents.Select && uiComponents.SelectTrigger && uiComponents.SelectContent;
    
    const Select = uiComponents.Select;
    const SelectTrigger = uiComponents.SelectTrigger;
    const SelectValue = uiComponents.SelectValue;
    const SelectContent = uiComponents.SelectContent;
    const SelectItem = uiComponents.SelectItem;

    // Determinar endpoint usando:
    // 1. Mapeo personalizado (actionEndpoints prop)
    // 2. Campo 'endpoint' o 'path' en el manifest de la action
    // 3. Convención estándar: /api/plugins/{pluginName}/{actionId}
    const getActionEndpoint = (actionId: string, actionData: any) => {
      // 1. Mapeo personalizado (override)
      if (actionEndpoints && actionEndpoints[actionId]) {
        return actionEndpoints[actionId];
      }
      
      // 2. Campo en el manifest
      if (actionData?.endpoint) {
        return {
          method: actionData.endpoint.method || 'POST',
          path: actionData.endpoint.path,
        };
      }
      if (actionData?.path) {
        return {
          method: 'POST',
          path: actionData.path,
        };
      }
      
      // 3. Convención estándar: /api/plugins/{pluginName}/{actionId}
      return {
        method: 'POST',
        path: `/api/plugins/${pluginName}/${actionId}`,
      };
    };

    const endpoint = getActionEndpoint(action.id, action);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {action.icon || '⚡'} {action.label}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{action.description || ''}</p>
          {action.contexts && action.contexts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                Contextos: {action.contexts.join(', ')}
              </span>
            </div>
          )}
        </div>

        {Object.keys(mockups).length > 0 && (
          <div>
            <Label htmlFor="mockup-select" className="mb-2 block text-gray-900 dark:text-gray-100">
              Seleccioná datos de prueba
            </Label>
            {hasSdkSelect ? (
              <div className="relative">
                <Select value={selectedMockup || ''} onValueChange={(value: string) => {
                  setSelectedMockup(value);
                  if (value !== '__CUSTOM__') {
                    setCustomJson('');
                    setCustomJsonError(null);
                  }
                }}>
                  <SelectTrigger className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Seleccioná un mockup" />
                  </SelectTrigger>
                  <SelectContent className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50">
                    {Object.entries(mockups).map(([key, mockup]) => (
                      <SelectItem key={key} value={key} className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 cursor-pointer">
                        {mockup.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="__CUSTOM__" className="hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 cursor-pointer border-t border-gray-200 dark:border-gray-700 mt-1">
                      ✏️ -CUSTOM-
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <select
                id="mockup-select"
                value={selectedMockup || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedMockup(value);
                  if (value !== '__CUSTOM__') {
                    setCustomJson('');
                    setCustomJsonError(null);
                  }
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Seleccioná un mockup</option>
                {Object.entries(mockups).map(([key, mockup]) => (
                  <option key={key} value={key}>
                    {mockup.label}
                  </option>
                ))}
                <option value="__CUSTOM__">✏️ -CUSTOM-</option>
              </select>
            )}
          </div>
        )}

        {isCustom && (
          <div className="space-y-2">
            <Label htmlFor="custom-json" className="block text-gray-900 dark:text-gray-100">
              Escribí tu JSON personalizado
            </Label>
            <textarea
              id="custom-json"
              value={customJson}
              onChange={(e) => {
                const value = e.target.value;
                setCustomJson(value);
                if (value.trim()) {
                  try {
                    JSON.parse(value);
                    setCustomJsonError(null);
                  } catch (err: any) {
                    setCustomJsonError(err.message || 'JSON inválido');
                  }
                } else {
                  setCustomJsonError(null);
                }
              }}
              placeholder='{"key": "value"}'
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm min-h-[200px] resize-y"
              style={{ fontFamily: 'monospace' }}
            />
            {customJsonError && (
              <div className="p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300">
                ❌ Error de JSON: {customJsonError}
              </div>
            )}
            {customJson && !customJsonError && (
              <div className="p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-300">
                ✅ JSON válido
              </div>
            )}
          </div>
        )}

        {currentMockup && !isCustom && (
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {currentMockup.label || 'Datos de Entrada'}
            </h4>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
              <div className="p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words font-mono">
                  {JSON.stringify(currentMockup.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={async () => {
            if (!currentMockup) {
              setActionResult({
                success: false,
                error: isCustom 
                  ? 'Escribí un JSON válido para ejecutar la action'
                  : 'Seleccioná un mockup para ejecutar la action',
              });
              return;
            }
            
            if (isCustom && customJsonError) {
              setActionResult({
                success: false,
                error: 'El JSON tiene errores. Corregí los errores antes de ejecutar.',
              });
              return;
            }

            setActionResult({ loading: true });

            try {
              if (!endpoint.path) {
                setActionResult({
                  success: false,
                  error: 'Endpoint no disponible',
                  data: {
                    message: 'Esta action no tiene endpoint HTTP configurado aún.',
                    action: action.id
                  }
                });
                return;
              }

              const response = await fetch(`${backendUrl}${endpoint.path}`, {
                method: endpoint.method,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentMockup.data),
              });

              const result = await response.json();

              if (response.ok) {
                setActionResult({
                  success: true,
                  message: `Action "${action.label}" ejecutada correctamente`,
                  data: {
                    ...result,
                    _timestamp: new Date().toISOString(),
                    _action: action.id,
                  },
                });
              } else {
                setActionResult({
                  success: false,
                  error: result.error || result.message || 'Error desconocido',
                  data: result,
                });
              }
            } catch (error: any) {
              setActionResult({
                success: false,
                error: error.message || 'Error de conexión con el backend',
              });
            }
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={!currentMockup || actionResult?.loading}
        >
          {actionResult?.loading ? '⏳ Ejecutando...' : '▶️ Ejecutar Action (Backend Real)'}
        </Button>

        {actionResult && !actionResult.loading && (
          <div>
            <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Resultado</h4>
            <div
              className={`p-4 border rounded-lg ${
                actionResult.success
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
              }`}
            >
              <p className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                {actionResult.success ? '✅ Éxito' : '❌ Error'}
              </p>
              <p className="text-sm mb-3 text-gray-700 dark:text-gray-300">{actionResult.message || actionResult.error}</p>
              {actionResult.data && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-900 dark:text-gray-100">{JSON.stringify(actionResult.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {actionResult?.loading && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span>Ejecutando...</span>
            </div>
          </div>
         )}
      </div>
    );
  };

  // Integraciones que deben mostrar vista de detalle en lugar de modal
  const routeIntegrations: Record<string, string> = {
    'afip-facturacion': 'afip-facturacion',
    'embeds': 'embeds',
    'google-sheets': 'google-sheets',
    'webhooks': 'webhooks'
  };

  // Mapeo de colores por categoría (igual que Formara core)
  const categoryColors: Record<string, string> = {
    storage: 'bg-lime-50 dark:bg-lime-900/30',
    automation: 'bg-purple-50 dark:bg-purple-900/30',
    communication: 'bg-blue-50 dark:bg-blue-900/30',
    analytics: 'bg-pink-50 dark:bg-pink-900/30',
    other: 'bg-gray-50 dark:bg-gray-800'
  };

  // Componente Card para integraciones (similar a Formara core)
  const IntegrationCard = ({ integration, onClick }: { integration: any; onClick: () => void }) => {
    const color = categoryColors[integration.category || 'other'] || 'bg-gray-50 dark:bg-gray-800';
    const title = `${integration.icon || '🔌'} ${integration.displayName}`;
    const badge = 'No configurado'; // En standalone siempre "No configurado"

    return (
      <button
        onClick={onClick}
        className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left shadow-sm ${color} transition hover:shadow`}
      >
        <div className="text-base font-semibold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {title}
        </div>
        {integration.description && (
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">{integration.description}</div>
        )}
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {badge}
          </span>
        )}
      </button>
    );
  };

  // Renderizar grid de cards de integraciones (igual que Formara core)
  const renderIntegrationsGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card de Resumen siempre al inicio */}
        <button
          onClick={() => {
            setSelectedIntegration('__RESUMEN_INTEGRATIONS__');
            setIntegrationSubView('resumen');
          }}
          className="rounded-xl border-2 border-blue-300 dark:border-blue-600 p-4 text-left shadow-sm bg-blue-50 dark:bg-blue-900/30 transition hover:shadow"
        >
          <div className="text-base font-semibold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            📚 Resumen: Integrations
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Guía completa</div>
        </button>
        {integrations.map((integration: any) => {
          const route = routeIntegrations[integration.id];
          
          return (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onClick={() => {
                if (route) {
                  // Para rutas especiales, mostrar vista de detalle
                  setIntegrationSubView(route);
                  setSelectedIntegration(integration.id);
                } else {
                  // Para otras, abrir modal
                  setSelectedIntegration(integration.id);
                  setIntegrationModalOpen(true);
                }
              }}
            />
          );
        })}
      </div>
    );
  };

  // Renderizar vista de detalle para integraciones con ruta (como afip-facturacion)
  const renderIntegrationDetail = () => {
    // Mostrar resumen si se selecciona la opción especial
    if (selectedIntegration === '__RESUMEN_INTEGRATIONS__' && integrationSubView === 'resumen') {
      return (
        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📚 Resumen: Integrations</h3>
          </div>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Qué son las Integrations?</h4>
              <p className="text-sm">
                Las Integrations son cards configurables que aparecen en la página "Integrar" de Formara. 
                Permiten a los usuarios configurar conexiones con servicios externos o funcionalidades avanzadas del plugin.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Para qué sirven?</h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Configurar conexiones con servicios externos (ej: Google Sheets, WhatsApp, Signatura)</li>
                <li>Gestionar certificados y credenciales (ej: AFIP, APIs)</li>
                <li>Configurar webhooks y automatizaciones</li>
                <li>Activar funcionalidades avanzadas del plugin</li>
                <li>Personalizar comportamiento del plugin por workspace</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Cómo se muestran y usan en Formara?</h4>
              <p className="text-sm mb-2">
                Las Integrations aparecen como cards en la página <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">/integrations</code> de Formara:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Cada card muestra el icono, nombre y descripción de la integration</li>
                <li>Al hacer clic, se abre un modal o vista de detalle con el componente de configuración</li>
                <li>El componente permite configurar la integration (credenciales, opciones, etc.)</li>
                <li>Las categorías determinan dónde aparecen: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">automation</code> va a Automatizar, el resto a Integrar</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Cómo se agregan y programan en el plugin?</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-mono mb-2">1. Crear el componente de configuración:</p>
                <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto">
{`plugins/mi-plugin/frontend/components/
  └── MiIntegrationConfig.tsx`}
                </pre>
                <p className="text-sm font-mono mt-4 mb-2">2. Exportar en frontend/index.ts:</p>
                <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto">
{`import MiIntegrationConfig from './components/MiIntegrationConfig';

export const integrations = [
  {
    id: 'mi-integration',
    displayName: 'Mi Integración',
    description: 'Descripción...',
    icon: '🔌',
    category: 'other',
    configComponent: MiIntegrationConfig
  }
];`}
                </pre>
                <p className="text-sm mt-4">
                  El componente debe aceptar props <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">workspaceId</code> 
                  y <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">onClose</code>. 
                  Las integrations se cargan automáticamente en build-time desde todos los plugins.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (!selectedIntegration || !integrationSubView) return null;

    const integration = integrations.find((i: any) => i.id === selectedIntegration);
    if (!integration) return null;

    const IntegrationComponent = integrationComponents[integration.id];

    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => {
              setIntegrationSubView(null);
              setSelectedIntegration(null);
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline mb-3"
          >
            ← Volver a integraciones
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {integration.icon || '🔌'} {integration.displayName}
          </h2>
        </div>
        {IntegrationComponent ? (
          <IntegrationComponent
            workspaceId={1}
            backendUrl={backendUrl}
            onClose={() => {
              setIntegrationSubView(null);
              setSelectedIntegration(null);
            }}
          />
        ) : (
          <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/30">
            <p className="text-sm text-yellow-900 dark:text-yellow-300">
              Esta integración no tiene componente de configuración personalizado disponible.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Renderizar modal de integración
  const renderIntegrationModal = () => {
    if (!integrationModalOpen || !selectedIntegration) return null;

    const integration = integrations.find((i: any) => i.id === selectedIntegration);
    if (!integration) return null;

    const IntegrationComponent = integrationComponents[integration.id];

    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={() => setIntegrationModalOpen(false)} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-lg border bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {integration.icon || '🔌'} {integration.displayName}
              </h2>
              <button
                onClick={() => setIntegrationModalOpen(false)}
                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cerrar
              </button>
            </div>
            <div className="p-6">
              {IntegrationComponent ? (
                <IntegrationComponent
                  workspaceId={1}
                  backendUrl={backendUrl}
                  onClose={() => setIntegrationModalOpen(false)}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{integration.description || ''}</p>
                  <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/30">
                    <p className="text-sm text-yellow-900 dark:text-yellow-300">
                      Esta integración no tiene componente de configuración personalizado disponible en el
                      entorno de desarrollo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componentes UI con fallbacks - usar SDK UI por defecto
  const Tabs = uiComponents.Tabs || SdkTabs;
  const TabsList = uiComponents.TabsList || SdkTabsList;
  const TabsTrigger = uiComponents.TabsTrigger || SdkTabsTrigger;
  const TabsContent = uiComponents.TabsContent || SdkTabsContent;
  const Card = uiComponents.Card || SdkCard;
  const CardHeader = uiComponents.CardHeader || SdkCardHeader;
  const CardTitle = uiComponents.CardTitle || SdkCardTitle;
  const CardDescription = uiComponents.CardDescription || SdkCardDescription;
  const CardContent = uiComponents.CardContent || SdkCardContent;
  const Button = uiComponents.Button || SdkButton;
  const Label = uiComponents.Label || SdkLabel;
  const Select = uiComponents.Select || SdkSelect;
  const SelectContent = uiComponents.SelectContent || SdkSelectContent;
  const SelectItem = uiComponents.SelectItem || SdkSelectItem;
  const SelectTrigger = uiComponents.SelectTrigger || SdkSelectTrigger;
  const SelectValue = uiComponents.SelectValue || SdkSelectValue;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayName} - Dev Environment</h1>
            {version && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                v{version} {description && `- ${description}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className={`px-3 py-1 rounded text-sm ${
              backendStatus === 'online' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              backendStatus === 'offline' 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
            }`}>
              Backend: {backendStatus}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {backendUrl}
            </span>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            {fieldTypes.length > 0 && (
              <TabsTrigger value="field-types" onClick={() => setSelectedTab('field-types')}>
                Field Types ({fieldTypes.length})
              </TabsTrigger>
            )}
            {loadedActions.length > 0 && (
              <TabsTrigger value="actions" onClick={() => setSelectedTab('actions')}>
                Actions ({loadedActions.length})
              </TabsTrigger>
            )}
            {integrations.length > 0 && (
              <TabsTrigger value="integrations" onClick={() => setSelectedTab('integrations')}>
                Integrations ({integrations.length})
              </TabsTrigger>
            )}
          </TabsList>

          {fieldTypes.length > 0 && (
            <TabsContent value="field-types">
              <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: '1fr 3fr' }}>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Field Types</CardTitle>
                      <CardDescription>{fieldTypes.length} tipos disponibles</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Opción Resumen siempre al inicio */}
                        <button
                          onClick={() => {
                            setSelectedFieldType('__RESUMEN_FIELD_TYPES__');
                            setFieldValue('');
                            setValidationResult(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded transition-all border-2 ${
                            selectedFieldType === '__RESUMEN_FIELD_TYPES__'
                              ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          style={selectedFieldType === '__RESUMEN_FIELD_TYPES__' ? {
                            backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                            borderColor: isDark ? '#60a5fa' : '#2563eb',
                            borderWidth: '2px',
                          } : undefined}
                        >
                          <div className="font-medium text-sm">📚 Resumen: Field Types</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Guía completa</div>
                        </button>
                        {fieldTypes.map((ft) => (
                          <button
                            key={ft.id}
                            onClick={() => {
                              setSelectedFieldType(ft.id);
                              setFieldValue('');
                              setValidationResult(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded transition-all border-2 ${
                              selectedFieldType === ft.id
                                ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            style={selectedFieldType === ft.id ? {
                              backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                              borderColor: isDark ? '#60a5fa' : '#2563eb',
                              borderWidth: '2px',
                            } : undefined}
                          >
                            <div className="font-medium text-sm">{ft.label}</div>
                            {ft.category && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{ft.category}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardContent className="p-6">{renderTabContent()}</CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {loadedActions.length > 0 && (
            <TabsContent value="actions">
              <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: '1fr 3fr' }}>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                      <CardDescription>
                        {loadingActions ? 'Cargando...' : `${loadedActions.length} acciones disponibles`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Opción Resumen siempre al inicio */}
                        <button
                          onClick={() => {
                            setSelectedAction('__RESUMEN_ACTIONS__');
                            setSelectedMockup(null);
                            setCustomJson('');
                            setCustomJsonError(null);
                            setActionResult(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded transition-all border-2 ${
                            selectedAction === '__RESUMEN_ACTIONS__'
                              ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          style={selectedAction === '__RESUMEN_ACTIONS__' ? {
                            backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                            borderColor: isDark ? '#60a5fa' : '#2563eb',
                            borderWidth: '2px',
                          } : undefined}
                        >
                          <div className="font-medium text-sm">📚 Resumen: Actions</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Guía completa</div>
                        </button>
                        {loadedActions.map((action: any) => (
                          <button
                            key={action.id}
                            onClick={() => {
                              setSelectedAction(action.id);
                              setSelectedMockup(null);
                              setCustomJson('');
                              setCustomJsonError(null);
                              setActionResult(null);
                              if (Object.keys(mockups).length > 0) {
                                const firstMockupKey = Object.keys(mockups)[0];
                                setSelectedMockup(firstMockupKey);
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded transition-all border-2 ${
                              selectedAction === action.id
                                ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            style={selectedAction === action.id ? {
                              backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                              borderColor: isDark ? '#60a5fa' : '#2563eb',
                              borderWidth: '2px',
                            } : undefined}
                          >
                            <div className="font-medium text-sm">
                              {action.icon || '⚡'} {action.label}
                            </div>
                            {action.contexts && action.contexts.length > 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {action.contexts.join(', ')}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardContent className="p-6">{renderTabContent()}</CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {integrations.length > 0 && (
            <TabsContent value="integrations">
              <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: '1fr 3fr' }}>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrations</CardTitle>
                      <CardDescription>{integrations.length} integraciones disponibles</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Opción Resumen siempre al inicio */}
                        <button
                          onClick={() => {
                            setSelectedIntegration('__RESUMEN_INTEGRATIONS__');
                            setIntegrationSubView('resumen');
                          }}
                          className={`w-full text-left px-3 py-2 rounded transition-all border-2 ${
                            selectedIntegration === '__RESUMEN_INTEGRATIONS__' && integrationSubView === 'resumen'
                              ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          style={selectedIntegration === '__RESUMEN_INTEGRATIONS__' && integrationSubView === 'resumen' ? {
                            backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                            borderColor: isDark ? '#60a5fa' : '#2563eb',
                            borderWidth: '2px',
                          } : undefined}
                        >
                          <div className="font-medium text-sm">📚 Resumen: Integrations</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Guía completa</div>
                        </button>
                        {integrations.map((integration: any) => {
                          const route = routeIntegrations[integration.id];
                          return (
                            <button
                              key={integration.id}
                              onClick={() => {
                                if (route) {
                                  setIntegrationSubView(route);
                                  setSelectedIntegration(integration.id);
                                } else {
                                  setSelectedIntegration(integration.id);
                                  setIntegrationModalOpen(true);
                                }
                              }}
                              className={`w-full text-left px-3 py-2 rounded transition-all border-2 ${
                                selectedIntegration === integration.id && (integrationSubView === route || integrationModalOpen)
                                  ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                              style={selectedIntegration === integration.id && (integrationSubView === route || integrationModalOpen) ? {
                                backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                borderColor: isDark ? '#60a5fa' : '#2563eb',
                                borderWidth: '2px',
                              } : undefined}
                            >
                              <div className="font-medium text-sm">
                                {integration.icon || '🔌'} {integration.displayName}
                              </div>
                              {integration.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{integration.description}</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardContent className="p-6">
                      {integrationSubView ? (
                        renderIntegrationDetail()
                      ) : (
                        <>
                          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Integraciones</h2>
                          {renderIntegrationsGrid()}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      {renderIntegrationModal()}
    </div>
  );
}
