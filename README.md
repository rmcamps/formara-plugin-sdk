# @formara/plugin-sdk

SDK para desarrollo de plugins de Formara. Proporciona interfaces/contratos y herramientas de sandbox para desarrollo y testing de plugins.

## Instalación

```bash
npm install @formara/plugin-sdk --save-dev
```

## Uso

### Importar interfaces

```typescript
// Frontend
import { FieldTypeDefinition } from '@formara/plugin-sdk/contracts/frontend';

// Backend
import { ActionDefinition, HookDefinition } from '@formara/plugin-sdk/contracts/backend';
```

### Usar alias @core en plugins

Configura el alias `@core` en tu `vite.config.ts`:

```typescript
import { getPluginViteConfig } from '@formara/plugin-sdk/utils/vite-config';

export default defineConfig({
  ...getPluginViteConfig(__dirname),
  // tu configuración
});
```

Luego usa `@core` en tus imports:

```typescript
import { FieldTypeDefinition } from '@core/frontend';
```

## Desarrollo

Este SDK se desarrolla en el monorepo de Formara y usa symlinks a las interfaces del core. Al compilar, se copian las interfaces para publicar como paquete npm.

