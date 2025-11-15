# @formara/plugin-sdk

SDK para desarrollo de plugins de Formara

## Instalación

```bash
npm install git+ssh://git@github.com/formara/formara-plugin-sdk.git
```

## Uso en Plugin

### Backend

```typescript
import { 
  authMiddleware, 
  sharedPrisma, 
  encryptJSON, 
  decryptJSON 
} from '@formara/plugin-sdk/backend';
```

### Frontend

```typescript
import { 
  api, 
  useAuth, 
  authHeaders,
  Input,
  MaskedInput
} from '@formara/plugin-sdk/frontend';
```

## Desarrollo Local (Sandbox)

1. Levanta la base de datos:
```bash
docker-compose up -d
```

2. Ejecuta migraciones:
```bash
npx prisma migrate dev
```

3. Ejecuta el sandbox:
```bash
npm run dev:sandbox
```

4. Abre http://localhost:5174

## Estructura del Plugin

```
tu-plugin/
├── package.json                 # Incluye SDK como dependencia
├── backend/
│   └── routes.ts               # Usa SDK
├── frontend/
│   └── components/
│       └── TuConfig.tsx        # Usa SDK
├── dev/
│   └── sandbox.config.js       # Configuración del sandbox
└── manifest.json
```

## Lo que provee el SDK

### Backend
- `authMiddleware`: Middleware de autenticación (mock en dev)
- `sharedPrisma`: Cliente de Prisma compartido
- `encryptJSON, decryptJSON`: Utilidades de cifrado
- `publishWhatsappControl, publishDocTask`: Mocks de PubSub
- `cloudTasksService`: Mock de Cloud Tasks
- Tipos de hooks: `HookDefinition, FileEventData, FormRecordEventData`

### Frontend
- `api, API_BASE`: Helpers de API
- `useAuth, authHeaders`: Hooks de autenticación (mock en dev)
- `Input, MaskedInput`: Componentes UI básicos
- Tipos de field types: `FieldTypeDefinition, FieldPreviewProps, FieldRenderProps`

## Cómo funciona

En desarrollo (sandbox):
- Plugin usa implementaciones mock del SDK
- Docker Compose provee PostgreSQL
- Sandbox shell permite probar visualmente

En producción (integrado con core):
- Core redirige imports del SDK a sus implementaciones reales
- Plugin funciona sin cambios
- Sin overhead (resolución en compile time)


