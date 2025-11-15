# Cómo funciona la integración del SDK con Formara Core

## Arquitectura de doble contexto

El mismo código del plugin funciona en dos contextos diferentes:

### Contexto 1: Desarrollo standalone (con SDK real)

```
Plugin Developer (sin acceso al core)
├── formara-plugin-webhooks/
│   ├── package.json                  # dependencies: "@formara/plugin-sdk"
│   ├── backend/routes.js
│   │   └── require('@formara/plugin-sdk/backend')  → SDK real (mocks)
│   └── frontend/WebhooksConfig.tsx
│       └── import from '@formara/plugin-sdk/frontend' → SDK real (mocks)
│
└── node_modules/@formara/plugin-sdk/  # SDK instalado desde Git
    ├── backend/                       # Mocks de auth, prisma, etc.
    └── frontend/                      # Mocks de useAuth, api, etc.
```

### Contexto 2: Integrado con Formara Core (con shims)

```
Formara Core (producción/staging)
├── docminator-saas/
│   ├── backend/
│   │   └── node_modules/@formara/plugin-sdk/  → symlink a ../../../sdk-shim
│   ├── frontend/
│   │   └── node_modules/@formara/plugin-sdk/  → symlink a ../../../sdk-shim
│   └── sdk-shim/
│       ├── backend/index.ts         # Redirige a backend/src/...
│       └── frontend/index.tsx       # Redirige a frontend/src/...
│
└── formara-plugins/webhooks/
    ├── backend/routes.js
    │   └── require('@formara/plugin-sdk/backend')  → Shim → Core real
    └── frontend/WebhooksConfig.tsx
        └── import from '@formara/plugin-sdk/frontend' → Shim → Core real
```

## Magia de los Shims

### sdk-shim/backend/index.ts

```typescript
// Redirige las importaciones del SDK a las implementaciones REALES del core
export { authMiddleware } from '../../backend/src/middleware/auth.middleware';
export { sharedPrisma } from '../../backend/src/services/prisma.shared';
// ... etc
```

Cuando el plugin hace:
```javascript
const { authMiddleware } = require('@formara/plugin-sdk/backend');
```

En el core:
1. Node busca `node_modules/@formara/plugin-sdk` → encuentra symlink
2. Sigue el symlink a `sdk-shim/`
3. Carga `backend/index.ts`
4. Obtiene `authMiddleware` desde `backend/src/middleware/auth.middleware` (implementación REAL)

## Resultado

- Plugin developer desarrolla con mocks (experiencia completa)
- Core usa implementaciones reales (sin overhead)
- Mismo código, cero cambios para deploy

## Symlinks automáticos

El core crea automáticamente los symlinks al iniciar:

```javascript
// En backend/src/index.ts o script de setup
const fs = require('fs');
const path = require('path');

const sdkPath = path.resolve(__dirname, '../node_modules/@formara/plugin-sdk');
const shimPath = path.resolve(__dirname, '../sdk-shim');

if (!fs.existsSync(sdkPath)) {
  fs.symlinkSync(shimPath, sdkPath, 'dir');
}
```


