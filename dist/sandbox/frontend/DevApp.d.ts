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
import React from 'react';
import { loadMockups } from './mockup-loader';
export { loadMockups };
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
    /** Hooks del plugin (del manifest) */
    hooks?: any[];
    /** Schemas del plugin (formularios) */
    schemas?: any[];
    /** Templates del plugin (documentos) */
    templates?: any[];
    /** Cards del plugin (array de card objects con location) */
    cards?: any[];
    /** Mockups para testing de actions (opcional, si no se proporciona se intenta cargar automáticamente) */
    mockups?: Record<string, {
        label: string;
        data: any;
    }>;
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
    actionEndpoints?: Record<string, {
        method: string;
        path: string;
    }>;
    /** Componentes de configuración de cards (opcional) */
    cardComponents?: Record<string, React.ComponentType<any>>;
}
export declare function DevApp({ pluginName, displayName, version, description, fieldTypes, actions, hooks, schemas, templates, cards, mockups: providedMockups, backendUrl, uiComponents, actionEndpoints, cardComponents: providedCardComponents, }: DevAppProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DevApp.d.ts.map