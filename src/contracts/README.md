# Contracts - Tipos Compartidos

**IMPORTANTE**: Los archivos de tipos en este directorio son COPIAS de los archivos del core.

## Archivos Copiados

### Backend
- `backend/actions.ts` ← `backend/src/core/actions/types.ts`
- `backend/hooks.ts` ← `backend/src/core/hooks/types.ts`
- `backend/integrations.ts` ← `backend/src/core/integrations/types.ts`

### Frontend
- `frontend/field-types.ts` ← `frontend/src/field-types/types.ts`

## Sincronización

**Antes eran symlinks** pero se reemplazaron con copias reales para que funcionen en Docker/Cloud Build.

**Cuando cambies tipos en el core**:
1. Copia manualmente los archivos actualizados aquí
2. O ejecuta el script de sincronización (TODO: crear script)

## Por qué Copias en lugar de Symlinks

Los symlinks no funcionan en:
- Docker multi-stage builds
- Google Cloud Build
- npm publish

Las copias garantizan que el SDK se pueda compilar en cualquier entorno.

