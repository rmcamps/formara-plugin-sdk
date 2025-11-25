import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useState, useEffect } from 'react';
import { Tabs as SdkTabs, TabsList as SdkTabsList, TabsTrigger as SdkTabsTrigger, TabsContent as SdkTabsContent, Card as SdkCard, CardHeader as SdkCardHeader, CardTitle as SdkCardTitle, CardDescription as SdkCardDescription, CardContent as SdkCardContent, Button as SdkButton, Label as SdkLabel, Select as SdkSelect, SelectContent as SdkSelectContent, SelectItem as SdkSelectItem, SelectTrigger as SdkSelectTrigger, SelectValue as SdkSelectValue, } from '../../ui';
import { loadMockups } from './mockup-loader';
// Re-exportar loadMockups para que los plugins puedan usarlo fácilmente
export { loadMockups };
/**
 * Hook para detectar y aplicar el tema según la preferencia del sistema
 */
function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined')
            return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        // Aplicar el tema al documento inmediatamente
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        // Escuchar cambios en la preferencia del sistema
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
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
function FieldWrapper({ renderField, value, onChange, config, disabled }) {
    // Renderizar directamente el resultado de renderField
    // Los hooks dentro de renderField se ejecutarán correctamente porque
    // este componente se renderiza de manera consistente
    return renderField({ value, onChange, config, disabled });
}
export function DevApp({ pluginName, displayName, version = '1.0.0', description = '', fieldTypes = [], actions = [], integrations = [], mockups: providedMockups = {}, backendUrl = 'http://localhost:4001', uiComponents = {}, actionEndpoints, integrationComponents: providedIntegrationComponents = {}, }) {
    // Configurar backendUrl globalmente para que api-adapter lo use
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.__PLUGIN_BACKEND_URL__ = backendUrl;
            // También extraer el puerto para compatibilidad con código antiguo
            try {
                const url = new URL(backendUrl);
                window.__PLUGIN_BACKEND_PORT__ = url.port || (url.protocol === 'https:' ? '443' : '80');
            }
            catch (e) {
                // Si backendUrl no es una URL válida, intentar extraer puerto manualmente
                const portMatch = backendUrl.match(/:(\d+)/);
                if (portMatch) {
                    window.__PLUGIN_BACKEND_PORT__ = portMatch[1];
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
    const autoExtractedComponents = integrations.reduce((acc, integration) => {
        if (integration.configComponent) {
            acc[integration.id] = integration.configComponent;
        }
        return acc;
    }, {});
    // Combinar componentes extraídos automáticamente con los proporcionados explícitamente
    // Los proporcionados explícitamente tienen prioridad (override)
    const integrationComponents = {
        ...autoExtractedComponents,
        ...providedIntegrationComponents,
    };
    // Estado interno para actions (si se cargan automáticamente)
    const [loadedActions, setLoadedActions] = useState(actions);
    const [loadingActions, setLoadingActions] = useState(false);
    const [selectedTab, setSelectedTab] = useState('field-types');
    const [selectedFieldType, setSelectedFieldType] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [selectedMockup, setSelectedMockup] = useState(null);
    const [customJson, setCustomJson] = useState('');
    const [customJsonError, setCustomJsonError] = useState(null);
    const [actionResult, setActionResult] = useState(null);
    const [fieldValue, setFieldValue] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
    const [integrationSubView, setIntegrationSubView] = useState(null);
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
                    }
                    else {
                        if (process.env.NODE_ENV === 'development') {
                            console.warn(`[DevApp] ⚠️ No se pudieron cargar actions del backend (${response.status})`);
                        }
                        setLoadedActions([]);
                    }
                }
                catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`[DevApp] ⚠️ Error cargando actions: ${error.message}`);
                    }
                    setLoadedActions([]);
                }
                finally {
                    setLoadingActions(false);
                }
            };
            loadActions();
        }
        else {
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
                }
                else {
                    setBackendStatus('offline');
                }
            }
            catch (error) {
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
                return _jsxs("div", { children: ["Tab no implementado: ", selectedTab] });
        }
    };
    // Renderizar Field Types con validación interactiva
    const renderFieldTypes = () => {
        if (!selectedFieldType) {
            return (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: "Seleccion\u00E1 un Field Type del men\u00FA lateral" }));
        }
        // Mostrar resumen si se selecciona la opción especial
        if (selectedFieldType === '__RESUMEN_FIELD_TYPES__') {
            return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsx("div", { children: _jsx("h3", { className: "text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100", children: "\uD83D\uDCDA Resumen: Field Types" }) }), _jsxs("div", { className: "space-y-4 text-gray-700 dark:text-gray-300", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFQu\u00E9 son los Field Types?" }), _jsx("p", { className: "text-sm", children: "Los Field Types son tipos de campo personalizados que extienden las capacidades de Formara. Permiten agregar validaciones espec\u00EDficas, componentes UI personalizados y comportamientos especiales para diferentes tipos de datos (ej: CUIT, CAE, IBAN, etc.)." })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFPara qu\u00E9 sirven?" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "Validaci\u00F3n autom\u00E1tica de datos seg\u00FAn reglas espec\u00EDficas" }), _jsx("li", { children: "Componentes UI personalizados para mejor UX" }), _jsx("li", { children: "Formateo autom\u00E1tico de valores (ej: CUIT con guiones)" }), _jsx("li", { children: "Integraci\u00F3n con servicios externos para validaci\u00F3n" }), _jsx("li", { children: "Hints para IA que mejoran la extracci\u00F3n de datos" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se muestran y usan en Formara?" }), _jsx("p", { className: "text-sm mb-2", children: "Los Field Types aparecen en el selector de tipos de campo cuando se crea o edita un formulario. Una vez seleccionado, el campo se comporta seg\u00FAn la definici\u00F3n del Field Type:" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "Se muestra el componente UI personalizado al llenar el formulario" }), _jsx("li", { children: "Se valida autom\u00E1ticamente seg\u00FAn las reglas definidas" }), _jsx("li", { children: "Se formatea el valor seg\u00FAn el tipo (ej: CUIT: 20-12345678-9)" }), _jsx("li", { children: "La IA usa los hints para mejor extracci\u00F3n de documentos" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se agregan y programan en el plugin?" }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700", children: [_jsx("p", { className: "text-sm font-mono mb-2", children: "1. Crear el componente del Field Type:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `plugins/mi-plugin/frontend/field-types/
  └── mi-tipo.tsx` }), _jsx("p", { className: "text-sm font-mono mt-4 mb-2", children: "2. Exportar en frontend/index.ts:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `export const fieldTypes = [
  MiFieldType,
  // ...
];` }), _jsxs("p", { className: "text-sm mt-4", children: ["El Field Type debe implementar la interfaz ", _jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "FieldTypeDefinition" }), "con m\u00E9todos como ", _jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "renderPreview" }), ",", _jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "renderField" }), ",", _jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "validate" }), ", etc."] })] })] })] })] }));
        }
        const fieldType = fieldTypes.find((ft) => ft.id === selectedFieldType);
        if (!fieldType)
            return null;
        // fieldType ya es el FieldTypeDefinition completo, no necesita .component
        const FieldComponent = fieldType;
        const Button = uiComponents.Button || (({ children, onClick, ...props }) => (_jsx("button", { onClick: onClick, ...props, children: children })));
        const Label = uiComponents.Label || (({ children, htmlFor, ...props }) => (_jsx("label", { htmlFor: htmlFor, ...props, children: children })));
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100", children: FieldComponent.label }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: FieldComponent.description }), FieldComponent.aiHint && (_jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800", children: [_jsx("strong", { children: "AI Hint:" }), " ", FieldComponent.aiHint] }))] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-medium mb-3 text-gray-900 dark:text-gray-100", children: "Vista Previa" }), _jsx("div", { className: "p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800", children: FieldComponent.renderPreview && FieldComponent.renderPreview({
                                title: FieldComponent.label,
                                description: FieldComponent.description,
                                config: {},
                                onChange: (desc) => console.log('Description changed:', desc),
                            }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-medium mb-3 text-gray-900 dark:text-gray-100", children: "Campo Interactivo" }), _jsxs("div", { className: "p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "field-input", className: "mb-2 block text-gray-900 dark:text-gray-100", children: FieldComponent.label }), _jsx(FieldWrapper, { renderField: FieldComponent.renderField || (() => _jsx("div", { children: "No renderField disponible" })), value: fieldValue, onChange: (val) => {
                                                setFieldValue(val);
                                                setValidationResult(null);
                                            }, config: { required: true, placeholder: `Ingresá ${FieldComponent.label}` }, disabled: false })] }), _jsx(Button, { onClick: () => {
                                        if (FieldComponent.validate) {
                                            const result = FieldComponent.validate(fieldValue, { required: true });
                                            setValidationResult(result);
                                        }
                                    }, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Validar Campo" }), validationResult && (_jsxs("div", { className: `p-3 rounded ${validationResult.valid
                                        ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-300'
                                        : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-300'}`, children: [_jsx("p", { className: "font-medium", children: validationResult.valid ? '✅ Válido' : '❌ Inválido' }), _jsx("p", { className: "text-sm", children: validationResult.message || validationResult.error })] }))] })] })] }));
    };
    // Renderizar Actions con ejecución y mockups
    const renderActions = () => {
        if (!selectedAction) {
            return (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: "Seleccion\u00E1 una Action del men\u00FA lateral" }));
        }
        // Mostrar resumen si se selecciona la opción especial
        if (selectedAction === '__RESUMEN_ACTIONS__') {
            return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsx("div", { children: _jsx("h3", { className: "text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100", children: "\uD83D\uDCDA Resumen: Actions" }) }), _jsxs("div", { className: "space-y-4 text-gray-700 dark:text-gray-300", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFQu\u00E9 son las Actions?" }), _jsx("p", { className: "text-sm", children: "Las Actions son comandos ejecutables que permiten realizar operaciones sobre documentos o registros de formularios. Pueden validar datos, consultar servicios externos, generar archivos, o realizar cualquier operaci\u00F3n que requiera l\u00F3gica del backend." })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFPara qu\u00E9 sirven?" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "Validar datos contra servicios externos (ej: CUIT contra AFIP)" }), _jsx("li", { children: "Generar documentos o archivos (ej: facturas PDF)" }), _jsx("li", { children: "Consultar APIs externas y actualizar registros" }), _jsx("li", { children: "Realizar transformaciones de datos complejas" }), _jsx("li", { children: "Integrar con servicios de terceros" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se muestran y usan en Formara?" }), _jsx("p", { className: "text-sm mb-2", children: "Las Actions aparecen como botones en diferentes contextos de Formara:" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "En la barra de herramientas de documentos o registros" }), _jsx("li", { children: "En men\u00FAs contextuales al hacer clic derecho" }), _jsx("li", { children: "Como botones en vistas de detalle" }), _jsx("li", { children: "Se ejecutan con el contexto del documento o registro actual" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se agregan y programan en el plugin?" }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700", children: [_jsx("p", { className: "text-sm font-mono mb-2", children: "1. Definir la action en backend/actions.ts:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `export const actions: ActionDefinition[] = [
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
];` }), _jsx("p", { className: "text-sm font-mono mt-4 mb-2", children: "2. Crear endpoint en backend/routes.ts (opcional, para testing):" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `pluginRouter.post('/mi-action', async (req, res) => {
  // Endpoint para testing en dev environment
  res.json({ success: true });
});` }), _jsx("p", { className: "text-sm mt-4", children: "Las actions se cargan autom\u00E1ticamente desde el backend en el dev environment. En producci\u00F3n, se registran autom\u00E1ticamente cuando el plugin se carga." })] })] })] })] }));
        }
        const action = loadedActions.find((a) => a.id === selectedAction);
        if (!action)
            return null;
        const isCustom = selectedMockup === '__CUSTOM__';
        const currentMockup = isCustom
            ? (customJson ? { label: 'Custom JSON', data: (() => {
                    try {
                        return JSON.parse(customJson);
                    }
                    catch (e) {
                        return null;
                    }
                })() } : null)
            : (selectedMockup ? mockups[selectedMockup] : null);
        const Button = uiComponents.Button || (({ children, onClick, ...props }) => (_jsx("button", { onClick: onClick, ...props, children: children })));
        const Label = uiComponents.Label || (({ children, htmlFor, ...props }) => (_jsx("label", { htmlFor: htmlFor, ...props, children: children })));
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
        const getActionEndpoint = (actionId, actionData) => {
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
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100", children: [action.icon || '⚡', " ", action.label] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-2", children: action.description || '' }), action.contexts && action.contexts.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: _jsxs("span", { className: "text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded", children: ["Contextos: ", action.contexts.join(', ')] }) }))] }), Object.keys(mockups).length > 0 && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "mockup-select", className: "mb-2 block text-gray-900 dark:text-gray-100", children: "Seleccion\u00E1 datos de prueba" }), hasSdkSelect ? (_jsx("div", { className: "relative", children: _jsxs(Select, { value: selectedMockup || '', onValueChange: (value) => {
                                    setSelectedMockup(value);
                                    if (value !== '__CUSTOM__') {
                                        setCustomJson('');
                                        setCustomJsonError(null);
                                    }
                                }, children: [_jsx(SelectTrigger, { className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800", children: _jsx(SelectValue, { placeholder: "Seleccion\u00E1 un mockup" }) }), _jsxs(SelectContent, { className: "absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50", children: [Object.entries(mockups).map(([key, mockup]) => (_jsx(SelectItem, { value: key, className: "hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 cursor-pointer", children: mockup.label }, key))), _jsx(SelectItem, { value: "__CUSTOM__", className: "hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 cursor-pointer border-t border-gray-200 dark:border-gray-700 mt-1", children: "\u270F\uFE0F -CUSTOM-" })] })] }) })) : (_jsxs("select", { id: "mockup-select", value: selectedMockup || '', onChange: (e) => {
                                const value = e.target.value;
                                setSelectedMockup(value);
                                if (value !== '__CUSTOM__') {
                                    setCustomJson('');
                                    setCustomJsonError(null);
                                }
                            }, className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100", children: [_jsx("option", { value: "", children: "Seleccion\u00E1 un mockup" }), Object.entries(mockups).map(([key, mockup]) => (_jsx("option", { value: key, children: mockup.label }, key))), _jsx("option", { value: "__CUSTOM__", children: "\u270F\uFE0F -CUSTOM-" })] }))] })), isCustom && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "custom-json", className: "block text-gray-900 dark:text-gray-100", children: "Escrib\u00ED tu JSON personalizado" }), _jsx("textarea", { id: "custom-json", value: customJson, onChange: (e) => {
                                const value = e.target.value;
                                setCustomJson(value);
                                if (value.trim()) {
                                    try {
                                        JSON.parse(value);
                                        setCustomJsonError(null);
                                    }
                                    catch (err) {
                                        setCustomJsonError(err.message || 'JSON inválido');
                                    }
                                }
                                else {
                                    setCustomJsonError(null);
                                }
                            }, placeholder: '{"key": "value"}', className: "w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm min-h-[200px] resize-y", style: { fontFamily: 'monospace' } }), customJsonError && (_jsxs("div", { className: "p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300", children: ["\u274C Error de JSON: ", customJsonError] })), customJson && !customJsonError && (_jsx("div", { className: "p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-300", children: "\u2705 JSON v\u00E1lido" }))] })), currentMockup && !isCustom && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 dark:text-gray-100", children: currentMockup.label || 'Datos de Entrada' }), _jsx("div", { className: "border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 overflow-hidden", children: _jsx("div", { className: "p-4 max-h-96 overflow-y-auto", children: _jsx("pre", { className: "text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words font-mono", children: JSON.stringify(currentMockup.data, null, 2) }) }) })] })), _jsx(Button, { onClick: async () => {
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
                            }
                            else {
                                setActionResult({
                                    success: false,
                                    error: result.error || result.message || 'Error desconocido',
                                    data: result,
                                });
                            }
                        }
                        catch (error) {
                            setActionResult({
                                success: false,
                                error: error.message || 'Error de conexión con el backend',
                            });
                        }
                    }, className: "w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", disabled: !currentMockup || actionResult?.loading, children: actionResult?.loading ? '⏳ Ejecutando...' : '▶️ Ejecutar Action (Backend Real)' }), actionResult && !actionResult.loading && (_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-medium mb-3 text-gray-900 dark:text-gray-100", children: "Resultado" }), _jsxs("div", { className: `p-4 border rounded-lg ${actionResult.success
                                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'}`, children: [_jsx("p", { className: "font-medium mb-2 text-gray-900 dark:text-gray-100", children: actionResult.success ? '✅ Éxito' : '❌ Error' }), _jsx("p", { className: "text-sm mb-3 text-gray-700 dark:text-gray-300", children: actionResult.message || actionResult.error }), actionResult.data && (_jsx("div", { className: "bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-64 overflow-auto", children: _jsx("pre", { className: "text-xs text-gray-900 dark:text-gray-100", children: JSON.stringify(actionResult.data, null, 2) }) }))] })] })), actionResult?.loading && (_jsx("div", { className: "p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800", children: _jsxs("div", { className: "flex items-center gap-2 text-gray-900 dark:text-gray-100", children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400" }), _jsx("span", { children: "Ejecutando..." })] }) }))] }));
    };
    // Integraciones que deben mostrar vista de detalle en lugar de modal
    const routeIntegrations = {
        'afip-facturacion': 'afip-facturacion',
        'embeds': 'embeds',
        'google-sheets': 'google-sheets',
        'webhooks': 'webhooks'
    };
    // Mapeo de colores por categoría (igual que Formara core)
    const categoryColors = {
        storage: 'bg-lime-50 dark:bg-lime-900/30',
        automation: 'bg-purple-50 dark:bg-purple-900/30',
        communication: 'bg-blue-50 dark:bg-blue-900/30',
        analytics: 'bg-pink-50 dark:bg-pink-900/30',
        other: 'bg-gray-50 dark:bg-gray-800'
    };
    // Componente Card para integraciones (similar a Formara core)
    const IntegrationCard = ({ integration, onClick }) => {
        const color = categoryColors[integration.category || 'other'] || 'bg-gray-50 dark:bg-gray-800';
        const title = `${integration.icon || '🔌'} ${integration.displayName}`;
        const badge = 'No configurado'; // En standalone siempre "No configurado"
        return (_jsxs("button", { onClick: onClick, className: `rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left shadow-sm ${color} transition hover:shadow`, children: [_jsx("div", { className: "text-base font-semibold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2", children: title }), integration.description && (_jsx("div", { className: "text-xs text-gray-600 dark:text-gray-300 mb-2", children: integration.description })), badge && (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300", children: badge }))] }));
    };
    // Renderizar grid de cards de integraciones (igual que Formara core)
    const renderIntegrationsGrid = () => {
        return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("button", { onClick: () => {
                        setSelectedIntegration('__RESUMEN_INTEGRATIONS__');
                        setIntegrationSubView('resumen');
                    }, className: "rounded-xl border-2 border-blue-300 dark:border-blue-600 p-4 text-left shadow-sm bg-blue-50 dark:bg-blue-900/30 transition hover:shadow", children: [_jsx("div", { className: "text-base font-semibold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2", children: "\uD83D\uDCDA Resumen: Integrations" }), _jsx("div", { className: "text-xs text-gray-600 dark:text-gray-300 mb-2", children: "Gu\u00EDa completa" })] }), integrations.map((integration) => {
                    const route = routeIntegrations[integration.id];
                    return (_jsx(IntegrationCard, { integration: integration, onClick: () => {
                            if (route) {
                                // Para rutas especiales, mostrar vista de detalle
                                setIntegrationSubView(route);
                                setSelectedIntegration(integration.id);
                            }
                            else {
                                // Para otras, abrir modal
                                setSelectedIntegration(integration.id);
                                setIntegrationModalOpen(true);
                            }
                        } }, integration.id));
                })] }));
    };
    // Renderizar vista de detalle para integraciones con ruta (como afip-facturacion)
    const renderIntegrationDetail = () => {
        // Mostrar resumen si se selecciona la opción especial
        if (selectedIntegration === '__RESUMEN_INTEGRATIONS__' && integrationSubView === 'resumen') {
            return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsx("div", { children: _jsx("h3", { className: "text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100", children: "\uD83D\uDCDA Resumen: Integrations" }) }), _jsxs("div", { className: "space-y-4 text-gray-700 dark:text-gray-300", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFQu\u00E9 son las Integrations?" }), _jsx("p", { className: "text-sm", children: "Las Integrations son cards configurables que aparecen en la p\u00E1gina \"Integrar\" de Formara. Permiten a los usuarios configurar conexiones con servicios externos o funcionalidades avanzadas del plugin." })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFPara qu\u00E9 sirven?" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "Configurar conexiones con servicios externos (ej: Google Sheets, WhatsApp, Signatura)" }), _jsx("li", { children: "Gestionar certificados y credenciales (ej: AFIP, APIs)" }), _jsx("li", { children: "Configurar webhooks y automatizaciones" }), _jsx("li", { children: "Activar funcionalidades avanzadas del plugin" }), _jsx("li", { children: "Personalizar comportamiento del plugin por workspace" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se muestran y usan en Formara?" }), _jsxs("p", { className: "text-sm mb-2", children: ["Las Integrations aparecen como cards en la p\u00E1gina ", _jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "/integrations" }), " de Formara:"] }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "Cada card muestra el icono, nombre y descripci\u00F3n de la integration" }), _jsx("li", { children: "Al hacer clic, se abre un modal o vista de detalle con el componente de configuraci\u00F3n" }), _jsx("li", { children: "El componente permite configurar la integration (credenciales, opciones, etc.)" }), _jsxs("li", { children: ["Las categor\u00EDas determinan d\u00F3nde aparecen: ", _jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "automation" }), " va a Automatizar, el resto a Integrar"] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se agregan y programan en el plugin?" }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700", children: [_jsx("p", { className: "text-sm font-mono mb-2", children: "1. Crear el componente de configuraci\u00F3n:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `plugins/mi-plugin/frontend/components/
  └── MiIntegrationConfig.tsx` }), _jsx("p", { className: "text-sm font-mono mt-4 mb-2", children: "2. Exportar en frontend/index.ts:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `import MiIntegrationConfig from './components/MiIntegrationConfig';

export const integrations = [
  {
    id: 'mi-integration',
    displayName: 'Mi Integración',
    description: 'Descripción...',
    icon: '🔌',
    category: 'other',
    configComponent: MiIntegrationConfig
  }
];` }), _jsxs("p", { className: "text-sm mt-4", children: ["El componente debe aceptar props ", _jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "workspaceId" }), "y ", _jsx("code", { className: "bg-gray-200 dark:bg-gray-700 px-1 rounded", children: "onClose" }), ". Las integrations se cargan autom\u00E1ticamente en build-time desde todos los plugins."] })] })] })] })] }));
        }
        if (!selectedIntegration || !integrationSubView)
            return null;
        const integration = integrations.find((i) => i.id === selectedIntegration);
        if (!integration)
            return null;
        const IntegrationComponent = integrationComponents[integration.id];
        return (_jsxs("div", { children: [_jsxs("div", { className: "mb-4", children: [_jsx("button", { onClick: () => {
                                setIntegrationSubView(null);
                                setSelectedIntegration(null);
                            }, className: "text-sm text-gray-600 dark:text-gray-400 hover:underline mb-3", children: "\u2190 Volver a integraciones" }), _jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: [integration.icon || '🔌', " ", integration.displayName] })] }), IntegrationComponent ? (_jsx(IntegrationComponent, { workspaceId: 1, backendUrl: backendUrl, onClose: () => {
                        setIntegrationSubView(null);
                        setSelectedIntegration(null);
                    } })) : (_jsx("div", { className: "p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/30", children: _jsx("p", { className: "text-sm text-yellow-900 dark:text-yellow-300", children: "Esta integraci\u00F3n no tiene componente de configuraci\u00F3n personalizado disponible." }) }))] }));
    };
    // Renderizar modal de integración
    const renderIntegrationModal = () => {
        if (!integrationModalOpen || !selectedIntegration)
            return null;
        const integration = integrations.find((i) => i.id === selectedIntegration);
        if (!integration)
            return null;
        const IntegrationComponent = integrationComponents[integration.id];
        return (_jsxs("div", { className: "fixed inset-0 z-50", children: [_jsx("div", { className: "absolute inset-0 bg-black/40", onClick: () => setIntegrationModalOpen(false) }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-3xl rounded-lg border bg-white dark:bg-gray-800 shadow-xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: [integration.icon || '🔌', " ", integration.displayName] }), _jsx("button", { onClick: () => setIntegrationModalOpen(false), className: "rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300", children: "Cerrar" })] }), _jsx("div", { className: "p-6", children: IntegrationComponent ? (_jsx(IntegrationComponent, { workspaceId: 1, backendUrl: backendUrl, onClose: () => setIntegrationModalOpen(false) })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: integration.description || '' }), _jsx("div", { className: "p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/30", children: _jsx("p", { className: "text-sm text-yellow-900 dark:text-yellow-300", children: "Esta integraci\u00F3n no tiene componente de configuraci\u00F3n personalizado disponible en el entorno de desarrollo." }) })] })) })] }) })] }));
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: [displayName, " - Dev Environment"] }), version && (_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-300 mt-1", children: ["v", version, " ", description && `- ${description}`] }))] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: toggleTheme, className: "p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors", title: isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro', children: isDark ? '☀️' : '🌙' }), _jsxs("div", { className: `px-3 py-1 rounded text-sm ${backendStatus === 'online'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                            backendStatus === 'offline'
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}`, children: ["Backend: ", backendStatus] }), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: backendUrl })] })] }), _jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { children: [fieldTypes.length > 0 && (_jsxs(TabsTrigger, { value: "field-types", onClick: () => setSelectedTab('field-types'), children: ["Field Types (", fieldTypes.length, ")"] })), loadedActions.length > 0 && (_jsxs(TabsTrigger, { value: "actions", onClick: () => setSelectedTab('actions'), children: ["Actions (", loadedActions.length, ")"] })), integrations.length > 0 && (_jsxs(TabsTrigger, { value: "integrations", onClick: () => setSelectedTab('integrations'), children: ["Integrations (", integrations.length, ")"] }))] }), fieldTypes.length > 0 && (_jsx(TabsContent, { value: "field-types", children: _jsxs("div", { className: "grid gap-4 mt-4", style: { gridTemplateColumns: '1fr 3fr' }, children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Field Types" }), _jsxs(CardDescription, { children: [fieldTypes.length, " tipos disponibles"] })] }), _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: [_jsxs("button", { onClick: () => {
                                                                        setSelectedFieldType('__RESUMEN_FIELD_TYPES__');
                                                                        setFieldValue('');
                                                                        setValidationResult(null);
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedFieldType === '__RESUMEN_FIELD_TYPES__'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedFieldType === '__RESUMEN_FIELD_TYPES__' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm", children: "\uD83D\uDCDA Resumen: Field Types" }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Gu\u00EDa completa" })] }), fieldTypes.map((ft) => (_jsxs("button", { onClick: () => {
                                                                        setSelectedFieldType(ft.id);
                                                                        setFieldValue('');
                                                                        setValidationResult(null);
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedFieldType === ft.id
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedFieldType === ft.id ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm", children: ft.label }), ft.category && (_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: ft.category }))] }, ft.id)))] }) })] }) }), _jsx("div", { children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: renderTabContent() }) }) })] }) })), loadedActions.length > 0 && (_jsx(TabsContent, { value: "actions", children: _jsxs("div", { className: "grid gap-4 mt-4", style: { gridTemplateColumns: '1fr 3fr' }, children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Actions" }), _jsx(CardDescription, { children: loadingActions ? 'Cargando...' : `${loadedActions.length} acciones disponibles` })] }), _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: [_jsxs("button", { onClick: () => {
                                                                        setSelectedAction('__RESUMEN_ACTIONS__');
                                                                        setSelectedMockup(null);
                                                                        setCustomJson('');
                                                                        setCustomJsonError(null);
                                                                        setActionResult(null);
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedAction === '__RESUMEN_ACTIONS__'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedAction === '__RESUMEN_ACTIONS__' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm", children: "\uD83D\uDCDA Resumen: Actions" }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Gu\u00EDa completa" })] }), loadedActions.map((action) => (_jsxs("button", { onClick: () => {
                                                                        setSelectedAction(action.id);
                                                                        setSelectedMockup(null);
                                                                        setCustomJson('');
                                                                        setCustomJsonError(null);
                                                                        setActionResult(null);
                                                                        if (Object.keys(mockups).length > 0) {
                                                                            const firstMockupKey = Object.keys(mockups)[0];
                                                                            setSelectedMockup(firstMockupKey);
                                                                        }
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedAction === action.id
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedAction === action.id ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsxs("div", { className: "font-medium text-sm", children: [action.icon || '⚡', " ", action.label] }), action.contexts && action.contexts.length > 0 && (_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: action.contexts.join(', ') }))] }, action.id)))] }) })] }) }), _jsx("div", { children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: renderTabContent() }) }) })] }) })), integrations.length > 0 && (_jsx(TabsContent, { value: "integrations", children: _jsxs("div", { className: "grid gap-4 mt-4", style: { gridTemplateColumns: '1fr 3fr' }, children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Integrations" }), _jsxs(CardDescription, { children: [integrations.length, " integraciones disponibles"] })] }), _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: [_jsxs("button", { onClick: () => {
                                                                        setSelectedIntegration('__RESUMEN_INTEGRATIONS__');
                                                                        setIntegrationSubView('resumen');
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedIntegration === '__RESUMEN_INTEGRATIONS__' && integrationSubView === 'resumen'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedIntegration === '__RESUMEN_INTEGRATIONS__' && integrationSubView === 'resumen' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm", children: "\uD83D\uDCDA Resumen: Integrations" }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Gu\u00EDa completa" })] }), integrations.map((integration) => {
                                                                    const route = routeIntegrations[integration.id];
                                                                    return (_jsxs("button", { onClick: () => {
                                                                            if (route) {
                                                                                setIntegrationSubView(route);
                                                                                setSelectedIntegration(integration.id);
                                                                            }
                                                                            else {
                                                                                setSelectedIntegration(integration.id);
                                                                                setIntegrationModalOpen(true);
                                                                            }
                                                                        }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedIntegration === integration.id && (integrationSubView === route || integrationModalOpen)
                                                                            ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedIntegration === integration.id && (integrationSubView === route || integrationModalOpen) ? {
                                                                            backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                            borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                            borderWidth: '2px',
                                                                        } : undefined, children: [_jsxs("div", { className: "font-medium text-sm", children: [integration.icon || '🔌', " ", integration.displayName] }), integration.description && (_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: integration.description }))] }, integration.id));
                                                                })] }) })] }) }), _jsx("div", { children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: integrationSubView ? (renderIntegrationDetail()) : (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100", children: "Integraciones" }), renderIntegrationsGrid()] })) }) }) })] }) }))] })] }), renderIntegrationModal()] }));
}
