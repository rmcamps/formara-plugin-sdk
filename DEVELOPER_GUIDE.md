# Guía para Developers de Plugins de Formara

## Comenzar

### 1. Clonar el plugin template

```bash
git clone git@github.com:formara/formara-plugin-template.git mi-plugin
cd mi-plugin
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará el SDK automáticamente desde Git.

### 3. Levantar base de datos

```bash
docker-compose up -d
```

### 4. Ejecutar migraciones

```bash
npx prisma migrate dev
```

### 5. Ejecutar en modo sandbox

```bash
npm run dev:sandbox
```

Abre http://localhost:5174 y verás:
- **Tab Configuration**: Tu componente de configuración funcionando
- **Tab Field Types**: Playground para probar tus field types
- **Tab API Test**: Cliente REST para probar tus endpoints

## Estructura del Plugin

```
mi-plugin/
├── backend/
│   ├── routes.ts              # Endpoints del plugin
│   ├── hooks.ts               # Hooks del plugin (opcional)
│   └── services/              # Lógica de negocio (opcional)
├── frontend/
│   ├── index.ts               # Export principal
│   ├── components/
│   │   └── MiConfig.tsx       # Componente de configuración
│   └── field-types/           # Field types custom (opcional)
│       └── mi-tipo.tsx
├── manifest.json              # Metadata del plugin
├── dev/
│   └── sandbox.config.js      # Configuración del sandbox
└── package.json
```

## Usar el SDK

### Backend

```typescript
import { 
  authMiddleware,
  sharedPrisma,
  encryptJSON,
  decryptJSON
} from '@formara/plugin-sdk/backend';

const router = Router();
router.use(authMiddleware);

router.get('/config', async (req, res) => {
  const workspaceId = req.workspaceId; // Inyectado por authMiddleware
  const config = await sharedPrisma.miTabla.findFirst({ 
    where: { workspaceId } 
  });
  res.json(config);
});
```

### Frontend

```typescript
import { 
  api,
  useAuth,
  authHeaders,
  Input
} from '@formara/plugin-sdk/frontend';

export default function MiConfig({ workspaceId }: { workspaceId: number }) {
  const { token } = useAuth();
  const [config, setConfig] = useState(null);
  
  useEffect(() => {
    fetch(api('/api/plugins/mi-plugin/config'), {
      headers: authHeaders(token)
    })
      .then(r => r.json())
      .then(setConfig);
  }, [workspaceId, token]);
  
  return <div>...</div>;
}
```

## Crear Field Types Custom

```typescript
import { 
  Input,
  type FieldTypeDefinition,
  type FieldPreviewProps,
  type FieldRenderProps
} from '@formara/plugin-sdk/frontend';
import { z } from 'zod';

const MiTipoFieldType: FieldTypeDefinition = {
  id: 'mi-tipo',
  label: 'Mi Tipo',
  category: 'custom',
  description: 'Descripción de mi tipo',
  
  // Cómo se ve en el editor de formularios
  renderPreview: ({ title, description }: FieldPreviewProps) => (
    <div>
      <Input placeholder={title} disabled />
    </div>
  ),
  
  // Cómo se comporta al llenar el formulario
  renderField: ({ value, onChange }: FieldRenderProps) => (
    <Input 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  
  // Validación
  generateZodSchema: (config) => {
    let schema = z.string();
    if (config.required) {
      return schema.min(1);
    }
    return schema.optional();
  },
  
  defaultValue: '',
};

export default MiTipoFieldType;
```

## Testing

El sandbox provee un entorno completo para testing:
- Base de datos PostgreSQL real
- Auth mock (siempre autenticado)
- UI interactiva para probar componentes
- Hot-reload automático

## Deploy

Cuando el plugin está listo:

```bash
git add .
git commit -m "Feature: nueva funcionalidad"
git push origin main
```

Formara Core lo integrará automáticamente usando los shims, sin necesidad de cambios en el código.


