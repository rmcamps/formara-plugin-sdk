# @formara/plugin-sdk

SDK para desarrollo de plugins de Formara. Proporciona interfaces/contratos y herramientas de sandbox para desarrollo y testing de plugins.

## 📦 Instalación

Instala el SDK desde npm:

```bash
npm install @formara/plugin-sdk --save-dev
```

¡Eso es todo! No necesitas configuración adicional.

## 📚 Uso

### Importar interfaces

```typescript
// Frontend
import { FieldTypeDefinition } from '@formara/plugin-sdk/contracts/frontend';

// Backend
import { ActionDefinition, HookDefinition } from '@formara/plugin-sdk/contracts/backend';
```

### Usar componentes UI

```typescript
import { Button, Input, Dialog } from '@formara/plugin-sdk/ui';
```

### Usar sandbox tools

```typescript
// Backend dev server
import { createDevServer } from '@formara/plugin-sdk/sandbox/backend/dev-server';
import { createPrismaAdapter } from '@formara/plugin-sdk/sandbox/backend/prisma-adapter';

// Frontend adapters
import { createApiAdapter } from '@formara/plugin-sdk/sandbox/frontend/api-adapter';
import { createAuthAdapter } from '@formara/plugin-sdk/sandbox/frontend/auth-adapter';
```

### Configurar Vite

```typescript
import { getPluginViteConfig } from '@formara/plugin-sdk/utils/vite-config';
import { defineConfig } from 'vite';

export default defineConfig({
  ...getPluginViteConfig(__dirname),
  // tu configuración adicional
});
```

## 🔧 Desarrollo

Este SDK se desarrolla en el repositorio `formara-plugin-sdk` y se publica a npmjs.com.

### Publicar manualmente

```bash
npm run build
npm publish
```

## 📝 Versiones

El SDK usa versionado semántico. Para actualizar en tus plugins:

```bash
npm install @formara/plugin-sdk@latest
```

O especifica una versión:

```bash
npm install @formara/plugin-sdk@^1.0.0
```

## 🔗 Links

- [Repositorio](https://github.com/rmcamps/formara-plugin-sdk)
- [Documentación completa](./PLUGIN_SDK_GUIDE.md)
