# Quick Start: Desarrollo de Plugins con SDK

## Configuración inicial (5 minutos)

### 1. Obtener el SDK

Agregar a tu `package.json`:

```json
{
  "dependencies": {
    "@formara/plugin-sdk": "git+ssh://git@github.com/formara/formara-plugin-sdk.git"
  }
}
```

### 2. Instalar

```bash
npm install
```

### 3. Base de datos

```bash
docker-compose up -d
npx prisma migrate dev
```

### 4. Ejecutar

```bash
npm run dev:sandbox
```

## Ejemplo mínimo: Plugin "Hola Mundo"

### backend/routes.ts

```typescript
import { Router } from 'express';
import { authMiddleware, sharedPrisma } from '@formara/plugin-sdk/backend';

const router = Router();
router.use(authMiddleware);

router.get('/mensaje', async (req, res) => {
  res.json({ mensaje: 'Hola desde el plugin!' });
});

export default router;
```

### frontend/components/HolaMundoConfig.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { api, useAuth, authHeaders } from '@formara/plugin-sdk/frontend';

export default function HolaMundoConfig({ workspaceId }) {
  const { token } = useAuth();
  const [mensaje, setMensaje] = useState('');
  
  useEffect(() => {
    fetch(api('/api/plugins/hola-mundo/mensaje'), {
      headers: authHeaders(token)
    })
      .then(r => r.json())
      .then(data => setMensaje(data.mensaje));
  }, [token]);
  
  return <div>{mensaje}</div>;
}
```

### frontend/index.ts

```typescript
import HolaMundoConfig from './components/HolaMundoConfig';

export const components = {
  HolaMundoConfig
};

export const fieldTypes = [];
```

### manifest.json

```json
{
  "name": "hola-mundo",
  "version": "1.0.0",
  "displayName": "Hola Mundo",
  "capabilities": {
    "integrations": [{
      "id": "hola-mundo",
      "displayName": "Hola Mundo",
      "description": "Plugin de ejemplo",
      "icon": "👋",
      "category": "other",
      "configComponent": "components/HolaMundoConfig"
    }]
  }
}
```

### dev/sandbox.config.js

```javascript
module.exports = {
  plugin: {
    name: 'hola-mundo',
    integration: {
      id: 'hola-mundo',
      displayName: 'Hola Mundo',
      configComponent: require('../frontend/components/HolaMundoConfig').default
    }
  },
  backend: {
    routes: require('../backend/routes').default,
    basePath: '/api/plugins/hola-mundo',
    port: 3001
  }
};
```

## Ejecutar sandbox

```bash
npm run dev:sandbox
```

Abre http://localhost:5174 y verás tu plugin funcionando.

## ¿Qué provee el SDK?

### Backend
- `authMiddleware`: Autenticación automática
- `sharedPrisma`: Acceso a base de datos
- `encryptJSON, decryptJSON`: Cifrado de credenciales
- Mocks de PubSub y Cloud Tasks

### Frontend
- `useAuth`: Hook de autenticación
- `api()`: Helper para construir URLs
- `Input, MaskedInput`: Componentes UI básicos
- Tipos para field types custom

## Deploy

No necesitas cambios para deploy. El core automáticamente:
1. Redirige imports del SDK a sus implementaciones reales
2. Carga el plugin normalmente
3. Todo funciona sin modificaciones

## Siguientes pasos

- Ver `DEVELOPER_GUIDE.md` para detalles completos
- Ver `INTEGRATION_WITH_CORE.md` para entender la arquitectura
- Ver `examples/` para plugins de ejemplo


