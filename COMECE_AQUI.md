# 🎯 COMECE AQUI - Deploy Couple App

**Data de preparação:** 23 de abril de 2026

## ✅ Status: Projeto Preparado para Deploy

Seu projeto está **100% pronto** para ser deployado com Google Antigravity!

---

## 🚀 Deploy em 3 Comandos

```bash
# 1. Setup inicial
./scripts/setup.sh

# 2. Configurar Antigravity
antigravity login && antigravity init

# 3. Deploy
antigravity deploy
```

**Pronto!** Sua aplicação estará online em ~5 minutos.

---

## 📚 Documentação Disponível

### Para Deploy Rápido
1. **`COMECE_AQUI.md`** ← Você está aqui (início rápido)
2. **`scripts/setup.sh`** ← Execute este script primeiro
3. **`ANTIGRAVITY_SETUP_COMPLETO.md`** ← Guia completo consolidado

### Para Detalhes
- **`DEPLOY_ANTIGRAVITY.md`** - Instruções passo a passo detalhadas
- **`CHECKLIST_DEPLOY.md`** - Checklist completo de verificação
- **`README.md`** - Documentação geral do projeto

### Sobre a Aplicação
- **`CONFIGURACAO_GOOGLE.md`** - Como configurar Google Drive
- **`INSTRUCOES_BACKUP.md`** - Sistema de backup
- **`SISTEMA_DE_LOGIN.md`** - Funcionamento do login
- **`ARMAZENAMENTO_DE_DADOS.md`** - Estrutura de dados

---

## 🎓 Primeiro Deploy? Siga Estes Passos

### PASSO 1: Preparar Ambiente (10 min)

```bash
# Executar script de setup
cd /workspaces/default/code
./scripts/setup.sh
```

Isso vai:
- ✅ Instalar dependências
- ✅ Criar arquivo `.env`
- ✅ Inicializar git

### PASSO 2: Configurar Credenciais (5 min)

Edite o arquivo `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

**Onde pegar:**
- **Supabase**: https://app.supabase.com (Settings > API)
- **Google**: https://console.cloud.google.com (APIs > Credentials)

### PASSO 3: Instalar Antigravity (2 min)

```bash
npm install -g @google/antigravity-cli
antigravity login
```

### PASSO 4: Configurar Serviços (10 min)

```bash
# Inicializar projeto
antigravity init

# Conectar GitHub
antigravity github connect

# Conectar Cloudflare
antigravity cloudflare setup

# Configurar variáveis de ambiente
antigravity env set VITE_SUPABASE_URL "sua-url"
antigravity env set VITE_SUPABASE_ANON_KEY "sua-key"
antigravity env set VITE_GOOGLE_CLIENT_ID "seu-client-id"
```

### PASSO 5: Deploy (5 min)

```bash
# Fazer deploy
antigravity deploy

# Pegar URL de produção
antigravity info
```

### PASSO 6: Finalizar (5 min)

1. Copie a URL de produção (ex: `https://couple-app.pages.dev`)
2. Vá para [Google Cloud Console](https://console.cloud.google.com)
3. Adicione a URL em "Authorized redirect URIs":
   ```
   https://couple-app.pages.dev/oauth-callback.html
   ```
4. Teste sua aplicação!

---

## 📋 Checklist Rápido

- [ ] Executar `./scripts/setup.sh`
- [ ] Editar `.env` com credenciais
- [ ] Instalar Antigravity CLI
- [ ] `antigravity login`
- [ ] `antigravity init`
- [ ] `antigravity github connect`
- [ ] `antigravity cloudflare setup`
- [ ] Configurar env vars
- [ ] `antigravity deploy`
- [ ] Atualizar Google OAuth URIs
- [ ] Testar aplicação

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**"Command not found: antigravity"**
```bash
npm install -g @google/antigravity-cli
```

**"Build failed"**
```bash
# Testar build local primeiro
pnpm run build
```

**"OAuth error"**
- Verifique se atualizou os redirect URIs no Google Cloud Console
- Aguarde 5 minutos para propagação

### Onde Buscar Ajuda

1. **Troubleshooting detalhado**: Ver `DEPLOY_ANTIGRAVITY.md`
2. **Checklist completo**: Ver `CHECKLIST_DEPLOY.md`
3. **Guia consolidado**: Ver `ANTIGRAVITY_SETUP_COMPLETO.md`

---

## 🎉 Após Deploy

### Testar Funcionalidades

1. ✅ Login (Amanda e Mateus)
2. ✅ Dashboard
3. ✅ Adicionar despesa
4. ✅ Criar lembrete
5. ✅ Upload de foto
6. ✅ Backup Google Drive

### Otimizar

1. 🎯 Configurar domínio customizado
2. 🎯 Adicionar analytics
3. 🎯 Configurar monitoring
4. 🎯 Otimizar performance

---

## 🔑 Arquivos Importantes

### Configuração
- `.env` - Variáveis de ambiente (NÃO COMMITAR!)
- `.env.example` - Template de variáveis
- `wrangler.toml` - Config Cloudflare
- `antigravity.config.json` - Config Antigravity

### Deploy
- `.github/workflows/deploy.yml` - CI/CD automático
- `scripts/setup.sh` - Script de setup

### Código
- `src/app/App.tsx` - Componente principal
- `src/app/utils/googleDriveBackup.ts` - Backup Google Drive
- `public/oauth-callback.html` - OAuth callback

---

## 💡 Dicas

1. **Teste local primeiro**: Sempre rode `pnpm run build` antes de fazer deploy
2. **Use CI/CD**: Após primeiro deploy, pushes para `main` fazem deploy automático
3. **Monitore custos**: Use tiers gratuitos do Cloudflare e Supabase
4. **Faça backups**: Configure backup automático do Supabase
5. **Documente mudanças**: Mantenha o README.md atualizado

---

## 📞 Recursos Úteis

### Dashboards
- Cloudflare: https://dash.cloudflare.com
- Supabase: https://app.supabase.com
- Google Cloud: https://console.cloud.google.com
- GitHub: https://github.com

### Documentação
- Antigravity: https://antigravity.dev/docs
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Supabase: https://supabase.com/docs

---

## ✨ Resumo

Seu projeto **Couple App** está preparado com:

- ✅ Configuração de deploy completa
- ✅ CI/CD automático via GitHub Actions
- ✅ Otimizações de build para produção
- ✅ Documentação detalhada
- ✅ Scripts de automação
- ✅ Checklist de verificação
- ✅ Guia de troubleshooting

**Próximo passo:** Execute `./scripts/setup.sh` e comece o deploy!

---

**Preparado por:** Claude Code  
**Data:** 23 de abril de 2026  
**Status:** ✅ Pronto para produção
