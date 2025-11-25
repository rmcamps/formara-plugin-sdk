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
export function DevApp({ pluginName, displayName, version = '1.0.0', description = '', fieldTypes = [], actions = [], hooks = [], schemas = [], templates = [], cards = [], mockups: providedMockups = {}, backendUrl = 'http://localhost:4001', uiComponents = {}, actionEndpoints, cardComponents: providedCardComponents = {}, }) {
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
    // Agrupar cards por location
    const cardsByLocation = {
        generate: (cards || []).filter((c) => c && c.location === 'generate'),
        distribute: (cards || []).filter((c) => c && c.location === 'distribute'),
        automations: (cards || []).filter((c) => c && c.location === 'automations'),
        integrations: (cards || []).filter((c) => c && c.location === 'integrations'),
    };
    // Extraer automáticamente componentes de configuración de las cards
    // Si una card tiene configComponent, se extrae automáticamente
    const autoExtractedCardComponents = cards.reduce((acc, card) => {
        if (card.configComponent) {
            acc[card.id] = card.configComponent;
        }
        return acc;
    }, {});
    // Combinar componentes extraídos automáticamente con los proporcionados explícitamente
    // Los proporcionados explícitamente tienen prioridad (override)
    const cardComponents = {
        ...autoExtractedCardComponents,
        ...providedCardComponents,
    };
    // Estado interno para actions (si se cargan automáticamente)
    const [loadedActions, setLoadedActions] = useState(actions);
    const [loadingActions, setLoadingActions] = useState(false);
    const [selectedTab, setSelectedTab] = useState('field-types');
    const [selectedCardSection, setSelectedCardSection] = useState('resumen');
    const [selectedFieldType, setSelectedFieldType] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedHook, setSelectedHook] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedCardLocation, setSelectedCardLocation] = useState(null);
    const [selectedMockup, setSelectedMockup] = useState(null);
    const [customJson, setCustomJson] = useState('');
    const [customJsonError, setCustomJsonError] = useState(null);
    const [actionResult, setActionResult] = useState(null);
    const [fieldValue, setFieldValue] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [cardSubView, setCardSubView] = useState(null);
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
    // Seleccionar automáticamente RESUMEN cuando no hay selección en Field Types
    useEffect(() => {
        if (selectedTab === 'field-types' && selectedFieldType === null) {
            setSelectedFieldType('__RESUMEN_FIELD_TYPES__');
        }
    }, [selectedTab, selectedFieldType]);
    // Seleccionar automáticamente RESUMEN cuando no hay selección en Actions
    useEffect(() => {
        if (selectedTab === 'actions' && selectedAction === null) {
            setSelectedAction('__RESUMEN_ACTIONS__');
        }
    }, [selectedTab, selectedAction]);
    // Seleccionar automáticamente RESUMEN cuando no hay selección en Hooks
    useEffect(() => {
        if (selectedTab === 'hooks' && selectedHook === null) {
            setSelectedHook('__RESUMEN_HOOKS__');
        }
    }, [selectedTab, selectedHook]);
    // Seleccionar automáticamente RESUMEN cuando no hay selección en Templates
    useEffect(() => {
        if (selectedTab === 'templates' && selectedTemplate === null) {
            setSelectedTemplate('__RESUMEN_TEMPLATES__');
        }
    }, [selectedTab, selectedTemplate]);
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
            case 'hooks':
                return renderHooks();
            case 'templates':
                return renderTemplates();
            case 'generate':
            case 'distribute':
            case 'automations':
            case 'integrations':
                // Las cards se renderizan directamente en TabsContent
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
    // Cards que deben mostrar vista de detalle en lugar de modal
    const routeCards = {
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
        document: 'bg-green-50 dark:bg-green-900/30',
        email: 'bg-blue-50 dark:bg-blue-900/30',
        payment: 'bg-yellow-50 dark:bg-yellow-900/30',
        invoice: 'bg-purple-50 dark:bg-purple-900/30',
        whatsapp: 'bg-green-50 dark:bg-green-900/30',
        sms: 'bg-yellow-50 dark:bg-yellow-900/30',
        signature: 'bg-purple-50 dark:bg-purple-900/30',
        campaign: 'bg-pink-50 dark:bg-pink-900/30',
        other: 'bg-gray-50 dark:bg-gray-800'
    };
    // Renderizar Hooks
    const renderHooks = () => {
        if (!selectedHook) {
            return (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: "Seleccion\u00E1 un Hook del men\u00FA lateral" }));
        }
        // Mostrar resumen si se selecciona la opción especial
        if (selectedHook === '__RESUMEN_HOOKS__') {
            return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsx("div", { children: _jsx("h3", { className: "text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100", children: "\uD83D\uDCDA Resumen: Hooks" }) }), _jsxs("div", { className: "space-y-4 text-gray-700 dark:text-gray-300", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFQu\u00E9 son los Hooks?" }), _jsx("p", { className: "text-sm", children: "Los Hooks son funciones que se ejecutan autom\u00E1ticamente cuando ocurren eventos espec\u00EDficos en Formara. Permiten que los plugins reaccionen a eventos del sistema como la creaci\u00F3n de documentos, actualizaci\u00F3n de registros, procesamiento de archivos, etc." })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFPara qu\u00E9 sirven?" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "Validar datos autom\u00E1ticamente cuando se crean o actualizan registros" }), _jsx("li", { children: "Procesar archivos autom\u00E1ticamente cuando se suben" }), _jsx("li", { children: "Ejecutar acciones en respuesta a eventos del sistema" }), _jsx("li", { children: "Integrar con servicios externos cuando ocurren eventos espec\u00EDficos" }), _jsx("li", { children: "Modificar o enriquecer datos antes de guardarlos" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se muestran y usan en Formara?" }), _jsx("p", { className: "text-sm mb-2", children: "Los Hooks se ejecutan autom\u00E1ticamente en segundo plano cuando ocurren los eventos definidos:" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "Se registran en el manifest del plugin con el evento y prioridad" }), _jsx("li", { children: "Se ejecutan autom\u00E1ticamente cuando ocurre el evento correspondiente" }), _jsx("li", { children: "Pueden modificar datos, validar, o disparar acciones adicionales" }), _jsx("li", { children: "Se ejecutan en el orden de prioridad definido" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se agregan y programan en el plugin?" }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700", children: [_jsx("p", { className: "text-sm font-mono mb-2", children: "1. Definir el hook en el manifest.json:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `"hooks": [
  {
    "id": "mi-hook",
    "event": "form.record.created",
    "priority": 50
  }
]` }), _jsx("p", { className: "text-sm font-mono mt-4 mb-2", children: "2. Implementar el handler en backend/routes.ts:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `export const hooks = {
  'mi-hook': async (data) => {
    // Lógica del hook
    return { success: true };
  }
};` })] })] })] })] }));
        }
        const hook = hooks.find((h) => h.id === selectedHook);
        if (!hook)
            return null;
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100", children: hook.id }), hook.event && (_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-2", children: ["Evento: ", hook.event] })), hook.priority !== undefined && (_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: ["Prioridad: ", hook.priority] }))] }), _jsx("div", { className: "p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800", children: _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Detalles del hook: ", hook.id] }) })] }));
    };
    // Renderizar Templates (schemas y templates)
    const renderTemplates = () => {
        if (!selectedTemplate) {
            return (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: "Seleccion\u00E1 un Template del men\u00FA lateral" }));
        }
        // Mostrar resumen si se selecciona la opción especial
        if (selectedTemplate === '__RESUMEN_TEMPLATES__') {
            return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsx("div", { children: _jsx("h3", { className: "text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100", children: "\uD83D\uDCDA Resumen: Templates" }) }), _jsxs("div", { className: "space-y-4 text-gray-700 dark:text-gray-300", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFQu\u00E9 son los Templates?" }), _jsx("p", { className: "text-sm", children: "Los Templates son formularios y documentos predefinidos que los plugins pueden agregar a Formara. Incluyen schemas (formularios) y templates de documentos que enriquecen las capacidades del sistema." })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFPara qu\u00E9 sirven?" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsxs("li", { children: [_jsx("strong", { children: "Schemas (Formularios):" }), " Agregar formularios predefinidos que los usuarios pueden usar"] }), _jsxs("li", { children: [_jsx("strong", { children: "Templates (Documentos):" }), " Agregar plantillas de documentos que se pueden generar"] }), _jsx("li", { children: "Proporcionar estructuras de datos comunes para diferentes casos de uso" }), _jsx("li", { children: "Facilitar la creaci\u00F3n r\u00E1pida de formularios y documentos especializados" }), _jsx("li", { children: "Compartir configuraciones est\u00E1ndar entre workspaces" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se muestran y usan en Formara?" }), _jsx("p", { className: "text-sm mb-2", children: "Los Templates aparecen en las secciones correspondientes de Formara:" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsx("li", { children: "Los Schemas aparecen en la secci\u00F3n de Formularios (/forms)" }), _jsx("li", { children: "Los Templates de documentos aparecen en la secci\u00F3n de Templates (/templates)" }), _jsx("li", { children: "Los usuarios pueden crear nuevos formularios o documentos basados en estos templates" }), _jsx("li", { children: "Se pueden personalizar seg\u00FAn las necesidades del workspace" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se agregan y programan en el plugin?" }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700", children: [_jsx("p", { className: "text-sm font-mono mb-2", children: "1. Agregar schemas en la carpeta schemas/ del plugin:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `plugins/mi-plugin/schemas/
  └── mi-formulario.json` }), _jsx("p", { className: "text-sm font-mono mt-4 mb-2", children: "2. Agregar templates en la carpeta templates/ del plugin:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `plugins/mi-plugin/templates/
  └── mi-documento.json` }), _jsx("p", { className: "text-sm font-mono mt-4 mb-2", children: "3. Referenciarlos en el manifest.json:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `"capabilities": {
  "schemas": ["mi-formulario"],
  "templates": ["mi-documento"]
}` })] })] })] })] }));
        }
        // Buscar el template seleccionado (puede ser schema o template)
        const allTemplates = [
            ...schemas.map((s, i) => ({ ...s, id: `schema-${i}`, type: 'schema' })),
            ...templates.map((t, i) => ({ ...t, id: `template-${i}`, type: 'template' }))
        ];
        const template = allTemplates.find((t) => t.id === selectedTemplate);
        if (!template)
            return null;
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100", children: template.name || template.title || (template.type === 'schema' ? 'Schema' : 'Template') }), template.description && (_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: template.description })), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-4", children: ["Tipo: ", template.type === 'schema' ? 'Schema (Formulario)' : 'Template (Documento)'] })] }), _jsx("div", { className: "p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800", children: _jsx("pre", { className: "text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto", children: JSON.stringify(template, null, 2) }) })] }));
    };
    // Componente Card genérico para todas las locations
    const CardComponent = ({ card, onClick }) => {
        const color = categoryColors[card.category || 'other'] || 'bg-gray-50 dark:bg-gray-800';
        const title = `${card.icon || '🔌'} ${card.displayName}`;
        const badge = 'No configurado'; // En standalone siempre "No configurado"
        return (_jsxs("button", { onClick: onClick, className: `rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left shadow-sm ${color} transition hover:shadow`, children: [_jsx("div", { className: "text-base font-semibold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2", children: title }), card.description && (_jsx("div", { className: "text-xs text-gray-600 dark:text-gray-300 mb-2", children: card.description })), badge && (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300", children: badge }))] }));
    };
    // Renderizar resumen para una location de cards
    const renderCardsSummary = (locationName, displayName, description) => {
        return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsx("div", { children: _jsxs("h3", { className: "text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100", children: ["\uD83D\uDCDA Resumen: ", displayName] }) }), _jsxs("div", { className: "space-y-4 text-gray-700 dark:text-gray-300", children: [_jsxs("div", { children: [_jsxs("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: ["\u00BFQu\u00E9 son las Cards de ", displayName, "?"] }), _jsx("p", { className: "text-sm", children: description })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFPara qu\u00E9 sirven?" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [locationName === 'generate' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "Generar documentos autom\u00E1ticamente desde datos de formularios" }), _jsx("li", { children: "Crear archivos PDF, Word, Excel u otros formatos" }), _jsx("li", { children: "Transformar datos en documentos estructurados" }), _jsx("li", { children: "Integrar con servicios de generaci\u00F3n de documentos" })] })), locationName === 'distribute' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "Enviar documentos por email, WhatsApp, o otros canales" }), _jsx("li", { children: "Distribuir documentos a m\u00FAltiples destinatarios" }), _jsx("li", { children: "Programar env\u00EDos autom\u00E1ticos" }), _jsx("li", { children: "Integrar con servicios de comunicaci\u00F3n" })] })), locationName === 'automations' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "Automatizar flujos de trabajo complejos" }), _jsx("li", { children: "Conectar m\u00FAltiples acciones en secuencia" }), _jsx("li", { children: "Ejecutar tareas basadas en condiciones" }), _jsx("li", { children: "Integrar con servicios externos de automatizaci\u00F3n" })] })), locationName === 'integrations' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "Conectar Formara con servicios externos (APIs, bases de datos, etc.)" }), _jsx("li", { children: "Sincronizar datos entre sistemas" }), _jsx("li", { children: "Importar y exportar informaci\u00F3n" }), _jsx("li", { children: "Proporcionar funcionalidades adicionales a los usuarios" })] }))] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se muestran y usan en Formara?" }), _jsxs("p", { className: "text-sm mb-2", children: ["Las Cards de ", displayName, " aparecen en la secci\u00F3n correspondiente de Formara:"] }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 ml-4", children: [_jsxs("li", { children: ["Se muestran como tarjetas en la p\u00E1gina de ", displayName] }), _jsx("li", { children: "Los usuarios pueden configurarlas y activarlas" }), _jsx("li", { children: "Pueden tener componentes de configuraci\u00F3n personalizados" }), _jsx("li", { children: "Se integran con el sistema de autenticaci\u00F3n y permisos" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se agregan y programan en el plugin?" }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700", children: [_jsx("p", { className: "text-sm font-mono mb-2", children: "1. Definir la card en el manifest.json:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `"cards": [
  {
    "id": "mi-card",
    "location": "${locationName}",
    "displayName": "Mi Card",
    "description": "Descripción de la card"
  }
]` }), _jsx("p", { className: "text-sm font-mono mt-4 mb-2", children: "2. Exportar en frontend/index.ts:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `export const cards = [
  {
    id: 'mi-card',
    location: '${locationName}',
    displayName: 'Mi Card',
    configComponent: MiCardConfig,
    // ...
  }
];` })] })] })] })] }));
    };
    // Renderizar grid de cards por location
    const renderCardsGrid = (locationCards, locationName) => {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: locationCards.map((card) => {
                const route = routeCards[card.id];
                return (_jsx(CardComponent, { card: card, onClick: () => {
                        if (route) {
                            // Para rutas especiales, mostrar vista de detalle
                            setCardSubView(route);
                            setSelectedCard(card.id);
                            setSelectedCardLocation(locationName);
                        }
                        else {
                            // Para otras, abrir modal
                            setSelectedCard(card.id);
                            setSelectedCardLocation(locationName);
                            setCardModalOpen(true);
                        }
                    } }, card.id));
            }) }));
    };
    // Renderizar vista de detalle para cards con ruta
    const renderCardDetail = () => {
        if (!selectedCard || !selectedCardLocation || !cardSubView)
            return null;
        const locationCards = cardsByLocation[selectedCardLocation] || [];
        const card = locationCards.find((c) => c.id === selectedCard);
        if (!card)
            return null;
        const CardComponent = cardComponents[card.id];
        return (_jsxs("div", { children: [_jsxs("div", { className: "mb-4", children: [_jsx("button", { onClick: () => {
                                setCardSubView(null);
                                setSelectedCard(null);
                                setSelectedCardLocation(null);
                            }, className: "text-sm text-gray-600 dark:text-gray-400 hover:underline mb-3", children: "\u2190 Volver" }), _jsxs("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: [card.icon || '🔌', " ", card.displayName] })] }), CardComponent ? (_jsx(CardComponent, { workspaceId: 1, backendUrl: backendUrl, onClose: () => {
                        setCardSubView(null);
                        setSelectedCard(null);
                        setSelectedCardLocation(null);
                    } })) : (_jsx("div", { className: "p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/30", children: _jsx("p", { className: "text-sm text-yellow-900 dark:text-yellow-300", children: "Esta card no tiene componente de configuraci\u00F3n personalizado disponible." }) }))] }));
    };
    // Renderizar modal de card
    const renderCardModal = () => {
        if (!cardModalOpen || !selectedCard || !selectedCardLocation)
            return null;
        const locationCards = cardsByLocation[selectedCardLocation] || [];
        const card = locationCards.find((c) => c.id === selectedCard);
        if (!card)
            return null;
        const CardComponent = cardComponents[card.id];
        return (_jsxs("div", { className: "fixed inset-0 z-50", children: [_jsx("div", { className: "absolute inset-0 bg-black/40", onClick: () => setCardModalOpen(false) }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-3xl rounded-lg border bg-white dark:bg-gray-800 shadow-xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: [card.icon || '🔌', " ", card.displayName] }), _jsx("button", { onClick: () => setCardModalOpen(false), className: "rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300", children: "Cerrar" })] }), _jsx("div", { className: "p-6", children: CardComponent ? (_jsx(CardComponent, { workspaceId: 1, backendUrl: backendUrl, onClose: () => setCardModalOpen(false) })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: card.description || '' }), _jsx("div", { className: "p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/30", children: _jsx("p", { className: "text-sm text-yellow-900 dark:text-yellow-300", children: "Esta card no tiene componente de configuraci\u00F3n personalizado disponible en el entorno de desarrollo." }) })] })) })] }) })] }));
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
                                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}`, children: ["Backend: ", backendStatus] }), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: backendUrl })] })] }), _jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { children: [_jsxs(TabsTrigger, { value: "field-types", onClick: () => setSelectedTab('field-types'), children: ["Field Types", fieldTypes.length > 0 && (_jsx("span", { className: "ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: fieldTypes.length }))] }), _jsxs(TabsTrigger, { value: "actions", onClick: () => setSelectedTab('actions'), children: ["Actions", loadedActions.length > 0 && (_jsx("span", { className: "ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: loadedActions.length }))] }), _jsxs(TabsTrigger, { value: "hooks", onClick: () => setSelectedTab('hooks'), children: ["Hooks", hooks.length > 0 && (_jsx("span", { className: "ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: hooks.length }))] }), _jsxs(TabsTrigger, { value: "templates", onClick: () => setSelectedTab('templates'), children: ["Templates", (schemas.length + templates.length) > 0 && (_jsx("span", { className: "ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: schemas.length + templates.length }))] }), _jsxs(TabsTrigger, { value: "cards", onClick: () => setSelectedTab('cards'), children: ["Cards", (cardsByLocation.generate.length + cardsByLocation.distribute.length + cardsByLocation.automations.length + cardsByLocation.integrations.length) > 0 && (_jsx("span", { className: "ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: cardsByLocation.generate.length + cardsByLocation.distribute.length + cardsByLocation.automations.length + cardsByLocation.integrations.length }))] })] }), _jsx(TabsContent, { value: "cards", children: _jsxs("div", { className: "grid gap-4 mt-4", style: { gridTemplateColumns: '1fr 3fr' }, children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Cards" }), _jsx(CardDescription, { children: "Navegaci\u00F3n de cards" })] }), _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: [_jsxs("button", { onClick: () => setSelectedCardSection('resumen'), className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedCardSection === 'resumen'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedCardSection === 'resumen' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm flex items-center justify-between", children: _jsx("span", { children: "\uD83D\uDCDA Resumen" }) }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Gu\u00EDa completa" })] }), _jsx("button", { onClick: () => setSelectedCardSection('generate'), className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedCardSection === 'generate'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedCardSection === 'generate' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: _jsxs("div", { className: "font-medium text-sm flex items-center justify-between", children: [_jsx("span", { children: "\uD83D\uDCC4 Generate" }), cardsByLocation.generate.length > 0 && (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: cardsByLocation.generate.length }))] }) }), _jsx("button", { onClick: () => setSelectedCardSection('distribute'), className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedCardSection === 'distribute'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedCardSection === 'distribute' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: _jsxs("div", { className: "font-medium text-sm flex items-center justify-between", children: [_jsx("span", { children: "\uD83D\uDCE7 Distribute" }), cardsByLocation.distribute.length > 0 && (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: cardsByLocation.distribute.length }))] }) }), _jsx("button", { onClick: () => setSelectedCardSection('automations'), className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedCardSection === 'automations'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedCardSection === 'automations' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: _jsxs("div", { className: "font-medium text-sm flex items-center justify-between", children: [_jsx("span", { children: "\u2699\uFE0F Automations" }), cardsByLocation.automations.length > 0 && (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: cardsByLocation.automations.length }))] }) }), _jsx("button", { onClick: () => setSelectedCardSection('integrations'), className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedCardSection === 'integrations'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedCardSection === 'integrations' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: _jsxs("div", { className: "font-medium text-sm flex items-center justify-between", children: [_jsx("span", { children: "\uD83D\uDD0C Integrations" }), cardsByLocation.integrations.length > 0 && (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", children: cardsByLocation.integrations.length }))] }) })] }) })] }) }), _jsx("div", { children: _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [selectedCardSection === 'resumen' && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { children: _jsx("h3", { className: "text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100", children: "\uD83D\uDCDA Resumen: Cards" }) }), _jsxs("div", { className: "space-y-4 text-gray-700 dark:text-gray-300", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFQu\u00E9 son las Cards?" }), _jsx("p", { className: "text-sm", children: "Las Cards son capacidades unificadas que los plugins pueden agregar a Formara. Reemplazan el sistema anterior de integrations, generates y distributes con un sistema m\u00E1s flexible basado en locations." })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "Locations disponibles" }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-2 ml-4", children: [_jsxs("li", { children: [_jsx("strong", { children: "Generate:" }), " Generar documentos autom\u00E1ticamente desde datos de formularios"] }), _jsxs("li", { children: [_jsx("strong", { children: "Distribute:" }), " Enviar documentos por email, WhatsApp, o otros canales"] }), _jsxs("li", { children: [_jsx("strong", { children: "Automations:" }), " Crear flujos de trabajo automatizados"] }), _jsxs("li", { children: [_jsx("strong", { children: "Integrations:" }), " Conectar Formara con servicios externos"] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100", children: "\u00BFC\u00F3mo se agregan y programan en el plugin?" }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700", children: [_jsx("p", { className: "text-sm font-mono mb-2", children: "1. Definir la card en el manifest.json:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `"cards": [
  {
    "id": "mi-card",
    "location": "generate",
    "displayName": "Mi Card",
    "description": "Descripción de la card"
  }
]` }), _jsx("p", { className: "text-sm font-mono mt-4 mb-2", children: "2. Exportar en frontend/index.ts:" }), _jsx("pre", { className: "text-xs bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded overflow-x-auto", children: `export const cards = [
  {
    id: 'mi-card',
    location: 'generate',
    displayName: 'Mi Card',
    configComponent: MiCardConfig,
    // ...
  }
];` })] })] })] })] })), selectedCardSection === 'generate' && (_jsx("div", { children: cardsByLocation.generate.length > 0 ? (renderCardsGrid(cardsByLocation.generate, 'generate')) : (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: "No hay cards de Generate en este plugin" })) })), selectedCardSection === 'distribute' && (_jsx("div", { children: cardsByLocation.distribute.length > 0 ? (renderCardsGrid(cardsByLocation.distribute, 'distribute')) : (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: "No hay cards de Distribute en este plugin" })) })), selectedCardSection === 'automations' && (_jsx("div", { children: cardsByLocation.automations.length > 0 ? (renderCardsGrid(cardsByLocation.automations, 'automations')) : (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: "No hay cards de Automations en este plugin" })) })), selectedCardSection === 'integrations' && (_jsx("div", { children: cardSubView ? (renderCardDetail()) : (_jsx(_Fragment, { children: cardsByLocation.integrations.length > 0 ? (renderCardsGrid(cardsByLocation.integrations, 'integrations')) : (_jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: "No hay cards de Integrations en este plugin" })) })) }))] }) }) })] }) }), _jsx(TabsContent, { value: "field-types", children: _jsxs("div", { className: "grid gap-4 mt-4", style: { gridTemplateColumns: '1fr 3fr' }, children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Field Types" }), _jsxs(CardDescription, { children: [fieldTypes.length, " tipos disponibles"] })] }), _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: [_jsxs("button", { onClick: () => {
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
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm", children: ft.label }), ft.category && (_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: ft.category }))] }, ft.id)))] }) })] }) }), _jsx("div", { children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: renderTabContent() }) }) })] }) }), _jsx(TabsContent, { value: "actions", children: _jsxs("div", { className: "grid gap-4 mt-4", style: { gridTemplateColumns: '1fr 3fr' }, children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Actions" }), _jsx(CardDescription, { children: loadingActions ? 'Cargando...' : `${loadedActions.length} acciones disponibles` })] }), _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: [_jsxs("button", { onClick: () => {
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
                                                                    } : undefined, children: [_jsxs("div", { className: "font-medium text-sm", children: [action.icon || '⚡', " ", action.label] }), action.contexts && action.contexts.length > 0 && (_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: action.contexts.join(', ') }))] }, action.id)))] }) })] }) }), _jsx("div", { children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: renderTabContent() }) }) })] }) }), _jsx(TabsContent, { value: "hooks", children: _jsxs("div", { className: "grid gap-4 mt-4", style: { gridTemplateColumns: '1fr 3fr' }, children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Hooks" }), _jsxs(CardDescription, { children: [hooks.length, " hooks disponibles"] })] }), _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: [_jsxs("button", { onClick: () => {
                                                                        setSelectedHook('__RESUMEN_HOOKS__');
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedHook === '__RESUMEN_HOOKS__'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedHook === '__RESUMEN_HOOKS__' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm", children: "\uD83D\uDCDA Resumen: Hooks" }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Gu\u00EDa completa" })] }), hooks.map((hook) => (_jsxs("button", { onClick: () => {
                                                                        setSelectedHook(hook.id);
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedHook === hook.id
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedHook === hook.id ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm", children: hook.id }), hook.event && (_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: hook.event }))] }, hook.id)))] }) })] }) }), _jsx("div", { children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: renderTabContent() }) }) })] }) }), _jsx(TabsContent, { value: "templates", children: _jsxs("div", { className: "grid gap-4 mt-4", style: { gridTemplateColumns: '1fr 3fr' }, children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Templates" }), _jsxs(CardDescription, { children: [schemas.length + templates.length, " templates disponibles"] })] }), _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: [_jsxs("button", { onClick: () => {
                                                                        setSelectedTemplate('__RESUMEN_TEMPLATES__');
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedTemplate === '__RESUMEN_TEMPLATES__'
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedTemplate === '__RESUMEN_TEMPLATES__' ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsx("div", { className: "font-medium text-sm", children: "\uD83D\uDCDA Resumen: Templates" }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Gu\u00EDa completa" })] }), schemas.map((schema, index) => (_jsxs("button", { onClick: () => {
                                                                        setSelectedTemplate(`schema-${index}`);
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedTemplate === `schema-${index}`
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedTemplate === `schema-${index}` ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsxs("div", { className: "font-medium text-sm", children: ["\uD83D\uDCDD ", schema.name || schema.title || `Schema ${index + 1}`] }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Formulario" })] }, `schema-${index}`))), templates.map((template, index) => (_jsxs("button", { onClick: () => {
                                                                        setSelectedTemplate(`template-${index}`);
                                                                    }, className: `w-full text-left px-3 py-2 rounded transition-all border-2 ${selectedTemplate === `template-${index}`
                                                                        ? 'text-blue-900 dark:text-blue-100 border-blue-600 dark:border-blue-400 font-semibold shadow-lg scale-105'
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`, style: selectedTemplate === `template-${index}` ? {
                                                                        backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe',
                                                                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                                                                        borderWidth: '2px',
                                                                    } : undefined, children: [_jsxs("div", { className: "font-medium text-sm", children: ["\uD83D\uDCC4 ", template.name || template.title || `Template ${index + 1}`] }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Documento" })] }, `template-${index}`)))] }) })] }) }), _jsx("div", { children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: renderTabContent() }) }) })] }) })] })] }), renderCardModal()] }));
}
