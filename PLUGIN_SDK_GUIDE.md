# Guía del Plugin SDK de Formara

## Introducción

El Plugin SDK (`@formara/plugin-sdk`) proporciona las interfaces/contratos y herramientas de sandbox necesarias para desarrollar plugins de Formara de forma independiente.

## Instalación

### En un plugin nuevo

El SDK se instala automáticamente cuando creas un plugin con `create-plugin.sh`. Si necesitas instalarlo manualmente:

```bash
cd plugins/mi-plugin/frontend
npm install @formara/plugin-sdk --save-dev
```

### En desarrollo (monorepo)

Si estás desarrollando en el monorepo, puedes usar el SDK local:

```bash
cd plugins/mi-plugin/frontend
npm install ../../plugin-sdk --save-dev
```

## Uso

### Importar interfaces

#### Frontend

```typescript
// plugins/mi-plugin/frontend/index.ts
import { FieldTypeDefinition } from '@core/frontend';

export const fieldTypes: FieldTypeDefinition[] = [
  // ...
];
```

#### Backend

```typescript
// plugins/mi-plugin/backend/routes.ts
import { ActionDefinition, HookDefinition } from '@core/backend';
```

### Configurar Vite

El SDK proporciona un helper para configurar el alias `@core` automáticamente:

```typescript
// plugins/mi-plugin/frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { getPluginViteConfig } from '@formara/plugin-sdk/utils/vite-config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ...getPluginViteConfig(__dirname).resolve?.alias,
    },
  },
  // ...
});
```

### Usar componentes de sandbox

#### Frontend - DevApp

El `DevApp` del SDK proporciona una UI completa para probar:
- **Field Types**: Preview, validación interactiva
- **Actions**: Ejecución con mockups dinámicos
- **Integrations**: Display de cards del manifest

```typescript
// plugins/mi-plugin/frontend/dev.tsx
import { createRoot } from 'react-dom/client';
import { DevApp } from '@formara/plugin-sdk/sandbox/frontend';
import { loadMockups } from '@formara/plugin-sdk/sandbox/frontend/mockup-loader';
import { fieldTypes } from './index';
import manifest from '../manifest.json';

// Cargar mockups dinámicamente desde ./src/mockups/*.json
const mockups = loadMockups();

// Componentes UI (opcional, el SDK tiene fallbacks básicos)
import { Tabs, TabsList, TabsTrigger, TabsContent } from './src/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './src/components/ui/card';
import { Button } from './src/components/ui/button';
import { Label } from './src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './src/components/ui/select';

// Renderizar
const root = createRoot(document.getElementById('root')!);
root.render(
  <DevApp
    pluginName={manifest.name}
    displayName={manifest.displayName}
    version={manifest.version}
    description={manifest.description}
    fieldTypes={fieldTypes.map(ft => ({
      id: ft.id,
      label: ft.label,
      component: ft,
    }))}
    actions={manifest.capabilities.actions || []}
    integrations={manifest.capabilities.integrations || []}
    mockups={mockups}
    backendUrl="http://localhost:4001"
    uiComponents={{
      Tabs,
      TabsList,
      TabsTrigger,
      TabsContent,
      Card,
      CardHeader,
      CardTitle,
      CardDescription,
      CardContent,
      Button,
      Label,
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    }}
    // Mapeo opcional de actions a endpoints (usa convención por defecto)
      // actionEndpoints es opcional - solo necesario para override
      // Los endpoints se resuelven automáticamente:
      // 1. Desde el campo "endpoint" en el manifest (si existe)
      // 2. Usando la convención: /api/plugins/{pluginName}/{actionId}
    // Componentes de configuración de integrations (opcional)
    integrationComponents={{
      'mi-integration': MiIntegrationConfig,
    }}
  />
);
```

**Nota:** Si no pasas `uiComponents`, el SDK usará componentes básicos con fallbacks. Para una mejor experiencia, se recomienda pasar los componentes UI de tu plugin (shadcn/ui, etc.).

#### Ejemplo completo: Plugin ARCA

```typescript
// plugins/arca/frontend/dev.tsx
import { createRoot } from 'react-dom/client';
import './dev-style.css';
import { DevApp } from '@formara/plugin-sdk/sandbox/frontend';
import { loadMockups } from '@formara/plugin-sdk/sandbox/frontend/mockup-loader';
import manifest from '../manifest.json';
import CUITFieldType from './field-types/cuit';
import CAEFieldType from './field-types/cae';
import AfipFacturacionConfig from './components/AfipFacturacionConfig';

// Componentes UI
import { Tabs, TabsList, TabsTrigger, TabsContent } from './src/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './src/components/ui/card';
import { Button } from './src/components/ui/button';
import { Label } from './src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './src/components/ui/select';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001';

// Cargar mockups dinámicamente (sin imports estáticos)
const mockups = loadMockups();

// Field Types
const fieldTypes = [
  { id: 'cuit', label: 'CUIT/CUIL', component: CUITFieldType },
  { id: 'cae', label: 'CAE', component: CAEFieldType },
];

// Los endpoints se resuelven automáticamente desde el manifest
// Si una action tiene el campo "endpoint" en el manifest, se usa ese
// Si no, se usa la convención: /api/plugins/{pluginName}/{actionId}
// 
// Ejemplo en manifest.json:
// {
//   "id": "facturar",
//   "label": "Emitir Factura",
//   "endpoint": {
//     "method": "POST",
//     "path": "/api/plugins/arca/facturacion/emitir"
//   }
// }

// Componentes de integración
const integrationComponents = {
  'afip-facturacion': AfipFacturacionConfig,
};

// Renderizar
const root = createRoot(document.getElementById('root')!);
root.render(
  <DevApp
    pluginName={manifest.name}
    displayName={manifest.displayName}
    version={manifest.version}
    description={manifest.description}
    fieldTypes={fieldTypes}
    actions={manifest.capabilities.actions || []}
    integrations={manifest.capabilities.integrations || []}
    mockups={mockups}
    backendUrl={BACKEND_URL}
    uiComponents={{
      Tabs, TabsList, TabsTrigger, TabsContent,
      Card, CardHeader, CardTitle, CardDescription, CardContent,
      Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    }}
    actionEndpoints={actionEndpoints}
    integrationComponents={integrationComponents}
  />
);
```

Este ejemplo muestra cómo el plugin ARCA usa completamente el DevApp del SDK, cargando mockups dinámicamente sin imports estáticos.

#### Backend - Dev Server

```typescript
// plugins/mi-plugin/backend/dev-server.ts
import { createDevServer } from '@formara/plugin-sdk/sandbox/backend/dev-server';
import pluginRouter from './routes';

const app = createDevServer({
  port: 4001,
  frontendUrl: 'http://localhost:5182',
});

app.use('/api/plugins/mi-plugin', pluginRouter);
```

#### Backend - Prisma Adapter

```typescript
// plugins/mi-plugin/backend/services/prisma.adapter.ts
import { sharedPrisma as prisma } from '@formara/plugin-sdk/sandbox/backend/prisma-adapter';

// Usar prisma normalmente
const data = await prisma.myModel.findMany();
```

## Resolución de Alias @core

El alias `@core` se resuelve de manera diferente según el contexto:

### En Sandbox del Plugin (standalone)

- `@core` → `node_modules/@formara/plugin-sdk/src/contracts`
- Usa las interfaces del SDK instalado

### En Plugin dentro del Monorepo (desarrollo)

- `@core` → `../../plugin-sdk/src/contracts` (workspace)
- O `node_modules/@formara/plugin-sdk` si está instalado

### En Formara Core (build time)

- `@core` → `frontend/src` (configurado en `frontend/vite.config.ts`)
- Los plugins compilados usan las interfaces del core directamente

## Arquitectura

### Estructura del SDK

```
plugin-sdk/
├── src/
│   ├── contracts/          # Interfaces/contratos
│   │   ├── frontend/      # Interfaces frontend (symlinks al core)
│   │   └── backend/       # Interfaces backend (symlinks al core)
│   ├── sandbox/           # Herramientas de desarrollo
│   │   ├── frontend/      # DevApp, componentes de sandbox
│   │   └── backend/       # Dev server, Prisma adapter
│   └── utils/             # Utilidades
│       └── vite-config.ts # Helper para configurar Vite
└── dist/                  # Build compilado (para npm)
```

### Symlinks en Desarrollo

En el monorepo, el SDK usa symlinks a las interfaces del core:

- `src/contracts/frontend/field-types.ts` → `../../../frontend/src/field-types/types.ts`
- `src/contracts/backend/actions.ts` → `../../../backend/src/core/actions/types.ts`
- `src/contracts/backend/hooks.ts` → `../../../backend/src/core/hooks/types.ts`
- `src/contracts/backend/integrations.ts` → `../../../backend/src/core/integrations/types.ts`

Al compilar el SDK, estos symlinks se resuelven y se copian las interfaces reales.

## Compilación y Publicación

### Compilar el SDK

```bash
cd plugin-sdk
npm run build
```

Esto:
1. Compila TypeScript a JavaScript
2. Resuelve symlinks y copia interfaces
3. Genera tipos TypeScript (.d.ts)

### Publicar en npm

```bash
cd plugin-sdk
npm publish
```

## Ventajas

1. ✅ **Menos archivos comunes:** Solo contratos y sandbox base
2. ✅ **Plugins más compactos:** Se enfocan en su funcionalidad
3. ✅ **Contratos versionados:** SDK versionado independientemente
4. ✅ **Sandbox reutilizable:** UI base compartida
5. ✅ **Sin duplicación en runtime:** Core no necesita SDK
6. ✅ **Desarrollo independiente:** Plugins pueden desarrollarse sin core

## Migración de Plugins Existentes

Para migrar un plugin existente:

1. Instalar el SDK:
   ```bash
   cd plugins/mi-plugin/frontend
   npm install @formara/plugin-sdk --save-dev
   ```

2. Actualizar `vite.config.ts`:
   ```typescript
   import { getPluginViteConfig } from '@formara/plugin-sdk/utils/vite-config';
   
   export default defineConfig({
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
         ...getPluginViteConfig(__dirname).resolve?.alias,
       },
     },
   });
   ```

3. Reemplazar imports:
   ```typescript
   // Antes
   import { FieldTypeDefinition } from '../../../frontend/src/field-types/types';
   
   // Después
   import { FieldTypeDefinition } from '@core/frontend';
   ```

## Soporte

Para más información, consulta:
- `README.md` del SDK
- Documentación de plugins en `plugins/README.md`
- Guía de desarrollo en `PLUGIN_DEVELOPER_GUIDE.md`

