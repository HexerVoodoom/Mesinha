# Deploy com Google Antigravity

Este guia detalha como configurar e fazer deploy da aplicação usando Google Antigravity para automatizar todo o processo de deployment.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

1. ✅ Conta GitHub ativa
2. ✅ Conta Cloudflare com Pages habilitado
3. ✅ Projeto Supabase configurado
4. ✅ Google Cloud Console com OAuth configurado
5. ✅ Google Antigravity CLI instalado

## 🔧 Passo 1: Preparação Local

### 1.1 Verificar Configuração

```bash
# Verificar se todos os arquivos necessários existem
ls -la .env.example
ls -la wrangler.toml
ls -la .gitignore
ls -la package.json
```

### 1.2 Configurar Variáveis de Ambiente

Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais reais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

## 🚀 Passo 2: Configurar Google Antigravity

### 2.1 Instalar CLI

Se ainda não instalou:

```bash
npm install -g @google/antigravity-cli
```

### 2.2 Fazer Login

```bash
antigravity login
```

Isso abrirá um navegador para autenticação com sua conta Google.

### 2.3 Inicializar Projeto

```bash
antigravity init
```

Siga os prompts:
- **Project name**: couple-app
- **Framework**: React + Vite
- **Build command**: pnpm run build
- **Output directory**: dist

## 📦 Passo 3: Conectar GitHub

### 3.1 Criar Repositório

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Initial commit - Couple App"
```

### 3.2 Conectar ao GitHub via Antigravity

```bash
antigravity github connect
```

Isso irá:
1. Criar um repositório no GitHub automaticamente
2. Configurar o remote origin
3. Fazer push do código
4. Configurar GitHub Actions (opcional)

Alternativamente, você pode criar manualmente:

```bash
# Criar repo no GitHub primeiro, depois:
git remote add origin https://github.com/seu-usuario/couple-app.git
git branch -M main
git push -u origin main
```

## ☁️ Passo 4: Configurar Cloudflare

### 4.1 Conectar Cloudflare

```bash
antigravity cloudflare setup
```

Forneça:
- **Cloudflare API Token**: Crie em cloudflare.com/profile/api-tokens
- **Account ID**: Encontre no dashboard do Cloudflare
- **Zone ID**: Encontre nas configurações do seu domínio

### 4.2 Configurar Variáveis de Ambiente

```bash
antigravity env set VITE_SUPABASE_URL "https://seu-projeto.supabase.co"
antigravity env set VITE_SUPABASE_ANON_KEY "sua-anon-key"
antigravity env set VITE_GOOGLE_CLIENT_ID "seu-client-id.apps.googleusercontent.com"
```

### 4.3 Configurar Domínio Personalizado (Opcional)

```bash
antigravity domain add seu-dominio.com
```

## 🔑 Passo 5: Gerar API Key

```bash
antigravity apikey generate --name "couple-app-key"
```

Isso retornará uma chave API. Salve em local seguro:

```bash
# Adicionar ao .env local (não commitar!)
echo "ANTIGRAVITY_API_KEY=sua-chave-gerada" >> .env
```

## 🚢 Passo 6: Deploy

### 6.1 Deploy Manual

```bash
antigravity deploy
```

Este comando:
1. ✅ Faz build do projeto
2. ✅ Otimiza assets
3. ✅ Faz upload para Cloudflare Pages
4. ✅ Configura variáveis de ambiente
5. ✅ Gera URL de preview e produção

### 6.2 Deploy Automático

Configurar deploy automático a cada push:

```bash
antigravity ci enable
```

Isso configura:
- GitHub Actions para deploy automático
- Preview deploys para PRs
- Production deploy no merge para main

## 🔄 Passo 7: Atualizar Redirect URIs do Google

Após o deploy, você terá URLs como:
- **Production**: `https://couple-app.pages.dev`
- **Custom domain**: `https://seu-dominio.com`

Atualize no Google Cloud Console:

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Vá para "APIs & Services" > "Credentials"
3. Edite seu OAuth 2.0 Client ID
4. Adicione aos **Authorized redirect URIs**:
   ```
   https://couple-app.pages.dev/oauth-callback.html
   https://seu-dominio.com/oauth-callback.html
   ```
5. Salve

## ✅ Passo 8: Verificação

### 8.1 Testar Aplicação

```bash
# Ver URL de produção
antigravity info
```

Acesse a URL e teste:
1. ✅ Login funcionando
2. ✅ Dashboard carregando
3. ✅ Backup Google Drive (após atualizar redirect URI)
4. ✅ Sincronização Supabase

### 8.2 Monitorar Logs

```bash
antigravity logs --tail
```

### 8.3 Ver Status

```bash
antigravity status
```

## 📊 Comandos Úteis

```bash
# Ver todas as deployments
antigravity deploys list

# Fazer rollback para versão anterior
antigravity rollback <deployment-id>

# Ver variáveis de ambiente
antigravity env list

# Atualizar variável
antigravity env set NOME_VAR "novo-valor"

# Ver domínios configurados
antigravity domains list

# Ver analytics
antigravity analytics
```

## 🔒 Segurança

### Secrets e Variáveis Sensíveis

**NUNCA** commite no Git:
- `.env` (já está no .gitignore)
- API keys
- Tokens de autenticação
- Credenciais do Supabase

**SEMPRE** use:
- Antigravity env vars para produção
- `.env.local` para desenvolvimento local
- Cloudflare Pages environment variables

### Permissões Mínimas

Configure tokens com permissões mínimas:
- GitHub: apenas read/write do repositório
- Cloudflare: apenas Cloudflare Pages
- Google: apenas Drive API

## 🐛 Troubleshooting

### Erro: "Build failed"

```bash
# Testar build local primeiro
pnpm run build

# Ver logs detalhados
antigravity deploy --verbose
```

### Erro: "OAuth redirect URI mismatch"

1. Verifique a URL exata no erro
2. Adicione no Google Cloud Console
3. Aguarde 5 minutos para propagação

### Erro: "Environment variable not found"

```bash
# Verificar variáveis
antigravity env list

# Re-adicionar se necessário
antigravity env set NOME_VAR "valor"
```

## 📈 Próximos Passos

Após deploy bem-sucedido:

1. ✅ Configurar domínio personalizado
2. ✅ Habilitar HTTPS (automático no Cloudflare)
3. ✅ Configurar analytics
4. ✅ Configurar alertas de erro
5. ✅ Configurar backup automático do Supabase
6. ✅ Documentar processo para equipe

## 🎯 Resumo do Fluxo

```
Código Local
    ↓
Git Commit
    ↓
Git Push → GitHub
    ↓
Antigravity CI/CD
    ↓
Build (Vite)
    ↓
Deploy → Cloudflare Pages
    ↓
Live! 🎉
```

## 📞 Suporte

- **Antigravity Docs**: https://antigravity.dev/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Supabase**: https://supabase.com/docs
- **Google Cloud**: https://cloud.google.com/docs

---

**Última atualização**: 23 de abril de 2026
