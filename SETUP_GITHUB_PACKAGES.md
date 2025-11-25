# Setup GitHub Packages para Plugin SDK

## 📋 Pasos para Configurar

### 1. Configurar GitHub Token

Necesitas un Personal Access Token (PAT) con permisos `read:packages` y `write:packages`:

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. Nombre: `formara-plugin-sdk-publish`
4. Permisos:
   - ✅ `read:packages`
   - ✅ `write:packages`
   - ✅ `repo` (si el repo es privado)
5. Genera y copia el token

### 2. Configurar en tu máquina local

```bash
# Opción A: Variable de entorno
export GITHUB_TOKEN=tu_token_aqui

# Opción B: npm config
npm config set //npm.pkg.github.com/:_authToken tu_token_aqui
```

### 3. Configurar en cada plugin

Crea `.npmrc` en cada plugin:

```
@formara:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

O configura globalmente:

```bash
npm config set @formara:registry https://npm.pkg.github.com
```

### 4. Publicar el SDK

```bash
cd plugin-sdk
npm run build
npm publish
```

### 5. Instalar en plugins

```bash
cd plugins/arca/backend
npm install @formara/plugin-sdk --save-dev
```

## 🔄 GitHub Actions (Automático)

El workflow `.github/workflows/publish.yml` publica automáticamente cuando:
- Se hace push a `main` o `master`
- Se crea un tag `v*` (ej: `v1.0.0`)
- Se ejecuta manualmente desde GitHub Actions

## 📝 Actualizar Plugins

### Opción 1: Actualizar manualmente

En cada plugin, actualiza `package.json`:

```json
{
  "devDependencies": {
    "@formara/plugin-sdk": "^1.0.0"
  }
}
```

Luego:

```bash
npm install
```

### Opción 2: Script automatizado

```bash
# Desde la raíz del monorepo
for plugin_dir in plugins/*/backend; do
  if [ -f "$plugin_dir/package.json" ]; then
    cd "$plugin_dir"
    npm install @formara/plugin-sdk@^1.0.0 --save-dev
    cd - > /dev/null
  fi
done
```

## ✅ Verificación

Para verificar que funciona:

```bash
cd plugins/arca/backend
npm list @formara/plugin-sdk
```

Debería mostrar la versión instalada desde GitHub Packages.

## 🐛 Troubleshooting

### Error: 401 Unauthorized
- Verifica que el token tenga permisos `read:packages`
- Verifica que `.npmrc` esté configurado correctamente

### Error: 404 Not Found
- Verifica que el paquete se haya publicado correctamente
- Verifica que el scope `@formara` esté correcto

### Error: Package not found
- Asegúrate de que el repo sea accesible (público o tienes acceso si es privado)
- Verifica que el nombre del paquete en `package.json` sea `@formara/plugin-sdk`

