#!/bin/bash

# Script de setup inicial do projeto Couple App
# Para ser usado com Google Antigravity

set -e

echo "🚀 Couple App - Setup Inicial"
echo "================================"
echo ""

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não encontrado. Instalando..."
    npm install -g pnpm
    echo "✅ pnpm instalado"
fi

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install
echo "✅ Dependências instaladas"
echo ""

# Verificar arquivo .env
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado"
    echo "📝 Criando .env a partir do .env.example..."
    cp .env.example .env
    echo "✅ Arquivo .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais reais:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - VITE_GOOGLE_CLIENT_ID"
    echo ""
else
    echo "✅ Arquivo .env encontrado"
fi

# Verificar git
if [ ! -d .git ]; then
    echo "📝 Inicializando repositório git..."
    git init
    git add .
    git commit -m "Initial commit - Couple App"
    echo "✅ Git inicializado"
    echo ""
    echo "ℹ️  Configure o remote do GitHub:"
    echo "   git remote add origin https://github.com/SEU-USUARIO/couple-app.git"
    echo "   git push -u origin main"
else
    echo "✅ Git já inicializado"
fi

echo ""
echo "================================"
echo "✅ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Edite o arquivo .env com suas credenciais:"
echo "   nano .env"
echo ""
echo "2. Configure Google Antigravity:"
echo "   antigravity login"
echo "   antigravity init"
echo ""
echo "3. Conecte ao GitHub:"
echo "   antigravity github connect"
echo ""
echo "4. Configure Cloudflare:"
echo "   antigravity cloudflare setup"
echo ""
echo "5. Gere API Key:"
echo "   antigravity apikey generate --name couple-app-key"
echo ""
echo "6. Faça deploy:"
echo "   antigravity deploy"
echo ""
echo "📖 Veja DEPLOY_ANTIGRAVITY.md para instruções detalhadas"
echo ""
