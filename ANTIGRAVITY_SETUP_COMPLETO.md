# 🚀 Setup Completo - Google Antigravity

Este documento consolida TODAS as informações necessárias para preparar e fazer deploy do Couple App usando Google Antigravity.

## 📁 Arquivos Criados

Os seguintes arquivos foram criados para preparar o projeto:

### Configuração de Deploy
- ✅ `.gitignore` - Ignora arquivos sensíveis e temporários
- ✅ `.env.example` - Template de variáveis de ambiente
- ✅ `wrangler.toml` - Configuração do Cloudflare Pages
- ✅ `antigravity.config.json` - Configuração do Antigravity
- ✅ `.github/workflows/deploy.yml` - CI/CD automático

### Documentação
- ✅ `README.md` - Documentação principal do projeto
- ✅ `DEPLOY_ANTIGRAVITY.md` - Guia detalhado de deploy
- ✅ `CHECKLIST_DEPLOY.md` - Checklist passo a passo
- ✅ `ANTIGRAVITY_SETUP_COMPLETO.md` - Este documento

### Scripts
- ✅ `scripts/setup.sh` - Script de setup inicial

### Otimizações
- ✅ `vite.config.ts` - Otimizado para produção com code splitting

## 🎯 Resumo Executivo

### O que é Google Antigravity?

Google Antigravity é uma ferramenta CLI que automatiza todo o processo de deploy, conectando:
1. **GitHub** - Controle de versão e código-fonte
2. **Cloudflare Pages** - Hosting e CDN
3. **Geração de API Keys** - Autenticação e integração

### Por que usar?

- ⚡ Deploy em um comando
- 🔄 CI/CD automático
- 🔐 Gestão segura de secrets
- 📊 Monitoramento integrado
- 🌍 CDN global automático

## 🗺️ Fluxo Completo

```
1. Setup Local
   └─> Instalar dependências
   └─> Configurar .env
   └─> Testar localmente

2. Configurar Google Antigravity
   └─> Instalar CLI
   └─> Fazer login
   └─> Inicializar projeto

3. Conectar GitHub
   └─> Criar repositório
   └─> Push do código
   └─> Configurar CI/CD

4. Configurar Cloudflare
   └─> Conectar conta
   └─> Configurar environment vars
   └─> Configurar domínio (opcional)

5. Gerar API Key
   └─> Criar chave para integrações

6. Deploy
   └─> Build automático
   └─> Deploy para Cloudflare
   └─> URL de produção gerada

7. Pós-Deploy
   └─> Atualizar Google OAuth URIs
   └─> Testar funcionalidades
   └─> Monitorar aplicação
```

## ⚡ Quick Start (5 Passos)

### 1️⃣ Setup Inicial (5 minutos)

```bash
# Executar script de setup
./scripts/setup.sh

# Ou manualmente:
pnpm install
cp .env.example .env
# Editar .env com suas credenciais
```

### 2️⃣ Configurar Antigravity (5 minutos)

```bash
# Instalar
npm install -g @google/antigravity-cli

# Login
antigravity login

# Inicializar
antigravity init
```

### 3️⃣ Conectar Serviços (10 minutos)

```bash
# GitHub
antigravity github connect

# Cloudflare
antigravity cloudflare setup

# Configurar variáveis
antigravity env set VITE_SUPABASE_URL "sua-url"
antigravity env set VITE_SUPABASE_ANON_KEY "sua-key"
antigravity env set VITE_GOOGLE_CLIENT_ID "seu-client-id"
```

### 4️⃣ Gerar API Key (2 minutos)

```bash
antigravity apikey generate --name couple-app-key

# Salvar a chave gerada em local seguro
```

### 5️⃣ Deploy (5 minutos)

```bash
# Deploy
antigravity deploy

# Pegar URL
antigravity info
```

**Total: ~30 minutos** ⏱️

## 📝 Checklist Rápido

Use este checklist para não esquecer nada:

### Antes de Começar
- [ ] Node.js 20+ instalado
- [ ] pnpm instalado
- [ ] Git configurado
- [ ] Conta GitHub ativa
- [ ] Conta Cloudflare ativa
- [ ] Projeto Supabase criado
- [ ] Google OAuth configurado

### Durante Setup
- [ ] Executar `./scripts/setup.sh`
- [ ] Editar `.env` com credenciais reais
- [ ] Instalar Antigravity CLI
- [ ] Login no Antigravity
- [ ] Conectar GitHub
- [ ] Conectar Cloudflare
- [ ] Configurar env vars
- [ ] Gerar API key

### Após Deploy
- [ ] Obter URL de produção
- [ ] Atualizar Google OAuth redirect URIs
- [ ] Testar login
- [ ] Testar backup Google Drive
- [ ] Verificar sincronização Supabase
- [ ] Configurar domínio customizado (opcional)

## 🔑 Credenciais Necessárias

### Supabase
- **URL**: `https://seu-projeto.supabase.co`
- **Anon Key**: Pegar no dashboard > Settings > API
- **Service Role Key**: Pegar no dashboard > Settings > API (para backend)

### Google Cloud
- **Client ID**: Console > APIs & Services > Credentials
- **Redirect URIs**: Adicionar:
  - Dev: `http://localhost:5173/oauth-callback.html`
  - Prod: `https://seu-dominio/oauth-callback.html` (após deploy)

### Cloudflare
- **API Token**: Dashboard > My Profile > API Tokens > Create Token
  - Template: "Edit Cloudflare Pages"
- **Account ID**: Dashboard > Overview (lado direito)
- **Zone ID**: Dashboard > Seu domínio > Overview (lado direito)

### GitHub
- **Personal Access Token**: Settings > Developer settings > Personal access tokens
  - Permissions: `repo`, `workflow`

## 🛠️ Comandos Úteis

### Antigravity

```bash
# Ver informações do projeto
antigravity info

# Ver deployments
antigravity deploys list

# Ver logs em tempo real
antigravity logs --tail

# Ver status
antigravity status

# Fazer rollback
antigravity rollback <deployment-id>

# Listar variáveis de ambiente
antigravity env list

# Atualizar variável
antigravity env set NOME "valor"

# Ver domínios
antigravity domains list

# Adicionar domínio
antigravity domain add seu-dominio.com

# Ver analytics
antigravity analytics
```

### pnpm

```bash
# Instalar dependências
pnpm install

# Build local
pnpm run build

# Dev server
pnpm dev

# Adicionar pacote
pnpm add nome-do-pacote

# Remover pacote
pnpm remove nome-do-pacote

# Atualizar pacotes
pnpm update
```

### Git

```bash
# Status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "Mensagem"

# Push
git push

# Ver histórico
git log --oneline

# Criar branch
git checkout -b nome-branch

# Voltar para main
git checkout main
```

## 🐛 Troubleshooting

### "Build failed"
```bash
# Testar build local
pnpm run build

# Ver erros detalhados
antigravity deploy --verbose

# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "OAuth redirect URI mismatch"
1. Copiar URL exata do erro
2. Ir para Google Cloud Console
3. Adicionar URI em "Authorized redirect URIs"
4. Aguardar 5 minutos para propagação

### "Environment variable not found"
```bash
# Verificar variáveis
antigravity env list

# Adicionar novamente
antigravity env set NOME_VAR "valor"
```

### "Permission denied"
```bash
# Dar permissão ao script
chmod +x scripts/setup.sh

# Ou executar com bash
bash scripts/setup.sh
```

### "Deploy taking too long"
- Normal: build pode levar 2-5 minutos
- Se > 10 minutos: cancelar e tentar novamente
- Verificar logs: `antigravity logs --tail`

## 📊 Estrutura do Projeto

```
couple-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD automático
├── public/
│   └── oauth-callback.html     # OAuth callback do Google
├── scripts/
│   └── setup.sh                # Script de setup
├── src/
│   ├── app/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas da aplicação
│   │   ├── utils/              # Utilitários
│   │   │   └── googleDriveBackup.ts
│   │   ├── App.tsx             # Componente principal
│   │   └── routes.tsx          # Rotas
│   ├── imports/                # Assets importados do Figma
│   └── styles/                 # Estilos globais
├── supabase/
│   └── functions/              # Edge Functions
├── .env.example                # Template de variáveis
├── .gitignore                  # Arquivos ignorados
├── antigravity.config.json     # Config Antigravity
├── package.json                # Dependências
├── vite.config.ts              # Config Vite (otimizado)
├── wrangler.toml               # Config Cloudflare
└── README.md                   # Documentação principal
```

## 🎓 Próximos Passos Após Deploy

### Curto Prazo (Primeiro dia)
1. ✅ Atualizar Google OAuth URIs
2. ✅ Testar todas as funcionalidades
3. ✅ Configurar monitoramento
4. ✅ Documentar URL de produção

### Médio Prazo (Primeira semana)
1. 🎯 Configurar domínio customizado
2. 🎯 Configurar SSL/HTTPS
3. 🎯 Otimizar performance (Lighthouse)
4. 🎯 Configurar backups automáticos
5. 🎯 Adicionar error tracking (Sentry)

### Longo Prazo (Primeiro mês)
1. 🚀 Implementar analytics
2. 🚀 Configurar alertas
3. 🚀 Otimizar custos
4. 🚀 Documentar processos
5. 🚀 Treinar usuários

## 💰 Estimativa de Custos

### Gratuito
- ✅ GitHub (repositório público)
- ✅ Cloudflare Pages (até 500 builds/mês)
- ✅ Supabase (tier gratuito)
- ✅ Google Drive API (uso pessoal)

### Pago (Opcional)
- 💵 Domínio customizado: ~$12/ano
- 💵 Cloudflare Pro (se precisar): $20/mês
- 💵 Supabase Pro (se precisar): $25/mês

**Estimativa Total**: $0-50/mês dependendo do uso

## 🔐 Segurança

### ✅ Boas Práticas Implementadas
- Environment variables para secrets
- `.gitignore` para arquivos sensíveis
- HTTPS automático via Cloudflare
- OAuth 2.0 para Google Drive
- Headers de segurança configurados

### ⚠️ Importante
- **NUNCA** commitar arquivo `.env`
- **NUNCA** expor API keys no código
- **SEMPRE** usar HTTPS em produção
- **SEMPRE** fazer backup regular
- **SEMPRE** monitorar logs de erro

## 📞 Suporte e Recursos

### Documentação
- **Antigravity**: https://antigravity.dev/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **Supabase**: https://supabase.com/docs
- **Vite**: https://vite.dev
- **React**: https://react.dev

### Dashboards
- **Cloudflare**: https://dash.cloudflare.com
- **Supabase**: https://app.supabase.com
- **Google Cloud**: https://console.cloud.google.com
- **GitHub**: https://github.com

### Comunidade
- GitHub Issues do projeto
- Discord do Supabase
- Cloudflare Community
- Stack Overflow

## ✨ Conclusão

Você agora tem tudo que precisa para fazer deploy do Couple App usando Google Antigravity!

### Ordem Recomendada de Execução:

1. 📖 Ler `README.md` (visão geral)
2. ✅ Seguir `CHECKLIST_DEPLOY.md` (passo a passo)
3. 🚀 Executar `DEPLOY_ANTIGRAVITY.md` (deploy detalhado)
4. 📋 Usar este documento como referência rápida

### Em caso de dúvida:

1. Consultar a seção de Troubleshooting
2. Verificar os logs: `antigravity logs --tail`
3. Revisar o checklist: `CHECKLIST_DEPLOY.md`
4. Consultar documentação oficial

---

**Boa sorte com o deploy! 🚀**

*Última atualização: 23 de abril de 2026*
