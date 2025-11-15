# Guía de Base de Datos para Plugins

## Patrón Recomendado

Los plugins pueden tener sus propias tablas en la base de datos del core usando migraciones SQL.

### Estructura

```
mi-plugin/
├── backend/
│   ├── migrations/
│   │   ├── 001_create_tables.sql
│   │   └── 002_add_indexes.sql
│   └── prisma/
│       └── schema.prisma  # Documentación del schema (no se usa para generar client)
```

### Migrations SQL

**Ubicación:** `backend/migrations/*.sql`

**Reglas:**
1. Usar prefijo `plugin_{nombre}_` para todas las tablas
2. Usar `CREATE TABLE IF NOT EXISTS` (idempotente)
3. Nombrar archivos con prefijo numérico (001, 002, etc.)
4. Se ejecutan automáticamente al cargar el plugin

**Ejemplo: `backend/migrations/001_create_cache.sql`**

```sql
-- Crear tabla de caché
CREATE TABLE IF NOT EXISTS plugin_mi_plugin_cache (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_plugin_mi_plugin_cache_expires 
  ON plugin_mi_plugin_cache(expires_at);

-- Función helper (opcional)
CREATE OR REPLACE FUNCTION cleanup_plugin_mi_plugin_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM plugin_mi_plugin_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

### Schema de Prisma (Documentación)

**Ubicación:** `backend/prisma/schema.prisma`

Este archivo NO se usa para generar el Prisma Client (el plugin usa el del core).
Solo documenta el schema para developers.

```prisma
// backend/prisma/schema.prisma

model plugin_mi_plugin_cache {
  id         Int      @id @default(autoincrement())
  key        String   @unique
  value      Json?
  expires_at DateTime?
  created_at DateTime @default(now())

  @@map("plugin_mi_plugin_cache")
}
```

### Usar en el Código

```typescript
// backend/routes.ts
import { sharedPrisma } from '@formara/plugin-sdk/backend';

// Usar como 'any' para acceder a tablas que el SDK no conoce
const prisma = sharedPrisma as any;

router.get('/cache/:key', async (req, res) => {
  const cached = await prisma.$queryRaw`
    SELECT value FROM plugin_mi_plugin_cache 
    WHERE key = ${req.params.key}
      AND (expires_at IS NULL OR expires_at > NOW())
  `;
  res.json(cached[0] || null);
});
```

## Entornos

### En Sandbox Standalone

**Opción A: Sin base de datos (solo testing de capabilities)**

El sandbox funciona sin DATABASE_URL. Las rutas que necesiten DB lanzarán error descriptivo.
Útil para ver field types, actions, hooks sin ejecutar lógica real.

**Opción B: Con base de datos local**

```bash
# .env
DATABASE_URL="postgresql://user:pass@localhost:5433/formara_plugin_dev"
```

Ejecutar migrations:
```bash
docker-compose up -d  # PostgreSQL
# Ejecutar manualmente los archivos .sql
psql $DATABASE_URL -f backend/migrations/001_xxx.sql
```

**Opción C: Usar DB del core (recomendada para testing completo)**

```bash
# .env
DATABASE_URL="postgresql://formara:password@localhost:5432/formara?schema=public"
```

Las migrations ya estarán aplicadas si el core las ejecutó.

### En Integración con Core

El core ejecuta automáticamente las migrations del plugin al cargarlo:

1. Detecta `backend/migrations/*.sql`
2. Verifica cuáles ya se ejecutaron (tabla `plugin_migrations`)
3. Ejecuta las pendientes en orden
4. Marca como ejecutadas

**No requiere acción manual.**

## Ventajas

- ✅ Plugin autónomo (trae sus propias migrations)
- ✅ Core no necesita modificar su schema
- ✅ Migrations idempotentes
- ✅ Tracking automático
- ✅ Sin conflictos (prefijo plugin_*)

## Ejemplo Real: Plugin ARCA

```
arca/backend/migrations/001_afip_ticket_cache.sql
→ Crea: plugin_arca_ta_cache, plugin_arca_cuit_cache
→ El core las ejecuta automáticamente
→ El plugin las usa vía sharedPrisma
```

## Alternativa: Sin Base de Datos

Si tu plugin no necesita persistencia, simplemente no tengas carpeta `migrations/`.

