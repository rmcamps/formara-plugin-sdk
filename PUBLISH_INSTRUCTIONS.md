# 📦 Instrucciones para Publicar Plugin SDK

## 🚀 Publicación Inicial

### 1. Configurar GitHub Token

Necesitas un Personal Access Token con permisos `write:packages`:

```bash
# Opción A: Variable de entorno
export GITHUB_TOKEN=tu_token_aqui

# Opción B: npm config
npm config set //npm.pkg.github.com/:_authToken tu_token_aqui
```

**Crear token:**
1. Ve a: https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Nombre: `formara-plugin-sdk-publish`
4. Permisos: `write:packages`, `read:packages`, `repo`
5. Genera y copia

### 2. Build y Publicar

```bash
cd plugin-sdk

# Build
npm run build

# Publicar
npm publish
```

### 3. Verificar Publicación

Ve a: https://github.com/rmcamps/formara-plugin-sdk/packages

Deberías ver `@formara/plugin-sdk` publicado.

## 🔄 Publicación Automática

El workflow `.github/workflows/publish.yml` publica automáticamente cuando:

- ✅ Push a `main` o `master`
- ✅ Creación de tag `v*` (ej: `v1.0.0`)
- ✅ Ejecución manual desde GitHub Actions

**Para publicar una nueva versión:**

```bash
# Actualizar versión en package.json
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# Push con tag
git push origin main --tags
```

O crear tag manualmente:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 📝 Actualizar Plugins

Después de publicar, actualiza los plugins:

```bash
# Opción 1: Script automatizado
./orchestrator/scripts/update-plugins-to-github-packages.sh

# Opción 2: Manual en cada plugin
cd plugins/arca/backend
npm install @formara/plugin-sdk@^1.0.0 --save-dev
```

## ✅ Verificación

```bash
cd plugins/arca/backend
npm list @formara/plugin-sdk
```

Debería mostrar la versión desde GitHub Packages.

