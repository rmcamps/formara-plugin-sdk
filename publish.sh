#!/bin/bash

# Script para publicar plugin-sdk a GitHub Packages
# Requiere GITHUB_TOKEN configurado

set -e

echo "📦 Publicando @formara/plugin-sdk a GitHub Packages"
echo ""

# Verificar token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN no está configurado"
    echo ""
    echo "Configura el token:"
    echo "  export GITHUB_TOKEN=tu_token_aqui"
    echo ""
    echo "O crea .npmrc con:"
    echo "  echo '//npm.pkg.github.com/:_authToken=tu_token_aqui' > .npmrc"
    echo ""
    echo "Para crear un token:"
    echo "  1. Ve a: https://github.com/settings/tokens"
    echo "  2. Generate new token (classic)"
    echo "  3. Permisos: write:packages, read:packages, repo"
    echo "  4. Copia el token"
    exit 1
fi

echo "✅ Token configurado"
echo ""

# Build
echo "🔨 Haciendo build..."
npm run build

echo ""
echo "📤 Publicando a GitHub Packages..."
npm publish

echo ""
echo "✅ Publicación exitosa!"
echo ""
echo "🔗 Ver paquete en:"
echo "   https://github.com/rmcamps/formara-plugin-sdk/packages"
echo ""
echo "📝 Para instalar en plugins:"
echo "   npm install @formara/plugin-sdk@^1.0.0 --save-dev"

