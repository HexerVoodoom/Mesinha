# ✅ Checklist de Deploy - Couple App

Use este checklist para garantir que todos os passos foram completados antes e depois do deploy.

## 📋 Pré-Deploy

### Configuração Local

- [ ] Arquivo `.env` criado e configurado
  - [ ] `VITE_SUPABASE_URL` definida
  - [ ] `VITE_SUPABASE_ANON_KEY` definida
  - [ ] `VITE_GOOGLE_CLIENT_ID` definido
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Build local funciona (`pnpm run build`)
- [ ] Aplicação roda localmente sem erros

### Supabase

- [ ] Projeto criado em supabase.com
- [ ] Tabela `kv_store_19717bce` existe
- [ ] Edge Functions deployadas
- [ ] Environment variables configuradas:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `SUPABASE_DB_URL`
- [ ] Auth configurado (se aplicável)
- [ ] Storage buckets criados (se aplicável)

### Google Cloud Console

- [ ] Projeto criado
- [ ] Google Drive API habilitada
- [ ] OAuth 2.0 Client ID criado
- [ ] Redirect URIs configurados:
  - [ ] `http://localhost:5173/oauth-callback.html` (dev)
  - [ ] Placeholder para produção (será atualizado depois)
- [ ] Client ID copiado para `.env`

### Git & GitHub

- [ ] Repositório git inicializado
- [ ] Arquivo `.gitignore` configurado
- [ ] Primeiro commit feito
- [ ] Repositório GitHub criado
- [ ] Remote origin configurado
- [ ] Código pushed para GitHub
- [ ] Branch `main` protegida (opcional)

### Cloudflare

- [ ] Conta Cloudflare ativa
- [ ] Cloudflare Pages habilitado
- [ ] API Token criado com permissões:
  - [ ] Account - Cloudflare Pages - Edit
- [ ] Account ID anotado
- [ ] Zone ID anotado (se usar domínio customizado)

## 🚀 Deploy

### Google Antigravity

- [ ] CLI instalado (`npm install -g @google/antigravity-cli`)
- [ ] Login efetuado (`antigravity login`)
- [ ] Projeto inicializado (`antigravity init`)
- [ ] GitHub conectado (`antigravity github connect`)
- [ ] Cloudflare configurado (`antigravity cloudflare setup`)
- [ ] Environment variables configuradas:
  ```bash
  antigravity env set VITE_SUPABASE_URL "..."
  antigravity env set VITE_SUPABASE_ANON_KEY "..."
  antigravity env set VITE_GOOGLE_CLIENT_ID "..."
  ```
- [ ] API Key gerada e salva
- [ ] Deploy executado (`antigravity deploy`)

### GitHub Actions (Opcional)

- [ ] Workflow file criado (`.github/workflows/deploy.yml`)
- [ ] Secrets configurados no GitHub:
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_GOOGLE_CLIENT_ID`
- [ ] Workflow executado com sucesso

## ✅ Pós-Deploy

### Verificação Básica

- [ ] Site acessível na URL do Cloudflare Pages
- [ ] Assets carregando (imagens, CSS, JS)
- [ ] Console do navegador sem erros críticos
- [ ] Página de login aparece
- [ ] Redirecionamento funciona

### Atualizar Google OAuth

- [ ] URL de produção obtida (ex: `https://couple-app.pages.dev`)
- [ ] Redirect URI atualizado no Google Cloud Console:
  - [ ] `https://seu-dominio.pages.dev/oauth-callback.html`
  - [ ] `https://seu-dominio-customizado.com/oauth-callback.html` (se aplicável)
- [ ] Aguardar 5 minutos para propagação

### Testes Funcionais

- [ ] Login com perfil Amanda funciona
- [ ] Login com perfil Mateus funciona
- [ ] Dashboard carrega corretamente
- [ ] Navegação entre páginas funciona
- [ ] Despesas podem ser adicionadas
- [ ] Lembretes podem ser criados
- [ ] Galeria de fotos carrega
- [ ] Backup Google Drive funciona
  - [ ] Autenticação OAuth abre popup
  - [ ] Token recebido com sucesso
  - [ ] Backup manual funciona
  - [ ] Backup automático configurado
- [ ] Sincronização Supabase funciona
  - [ ] Dados salvos persistem
  - [ ] Auto-backup funciona
  - [ ] Dados sincronizam entre sessões

### Performance

- [ ] Lighthouse Score > 90 (Performance)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Assets otimizados e minificados

### Segurança

- [ ] HTTPS habilitado (automático no Cloudflare)
- [ ] Headers de segurança configurados
- [ ] Credenciais não expostas no client-side
- [ ] CORS configurado corretamente
- [ ] API keys não commitadas no Git

### Domínio Customizado (Opcional)

- [ ] Domínio comprado/disponível
- [ ] DNS apontando para Cloudflare
- [ ] Domínio adicionado no Cloudflare Pages
- [ ] SSL/TLS configurado
- [ ] Redirect de www para naked domain (ou vice-versa)
- [ ] Google OAuth atualizado com novo domínio

### Monitoramento

- [ ] Cloudflare Analytics configurado
- [ ] Error tracking configurado (Sentry, etc.)
- [ ] Uptime monitoring configurado
- [ ] Alertas configurados para:
  - [ ] Build failures
  - [ ] Deployment failures
  - [ ] High error rate
  - [ ] Downtime

### Documentação

- [ ] README.md atualizado com URL de produção
- [ ] DEPLOY_ANTIGRAVITY.md revisado
- [ ] Credenciais salvas em local seguro (1Password, etc.)
- [ ] Equipe/parceiro informado sobre deploy
- [ ] Processo de rollback documentado

## 🔄 Manutenção Contínua

### Backup

- [ ] Backup automático do Supabase configurado
- [ ] Backup do código no GitHub
- [ ] Backup do Google Drive funcionando
- [ ] Estratégia de recuperação de desastre documentada

### Atualizações

- [ ] Processo de atualização definido:
  1. Desenvolvimento local
  2. Commit e push
  3. Deploy automático via CI/CD
  4. Verificação em produção
- [ ] Dependências atualizadas regularmente
- [ ] Segurança auditada periodicamente

### Monitoramento

- [ ] Checar analytics semanalmente
- [ ] Revisar error logs regularmente
- [ ] Monitorar custos (Cloudflare, Supabase, Google)
- [ ] Testar backups mensalmente

## 📞 Contatos Importantes

**Suporte:**
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Supabase: https://supabase.com/docs
- Google Cloud: https://cloud.google.com/support
- Google Antigravity: https://antigravity.dev/docs

**Dashboards:**
- Cloudflare: https://dash.cloudflare.com
- Supabase: https://app.supabase.com
- Google Cloud: https://console.cloud.google.com
- GitHub: https://github.com

---

## ✨ Status Atual

**Última atualização:** _________

**Status:** [ ] Não iniciado | [ ] Em progresso | [ ] Concluído

**URL de Produção:** _____________________________

**Problemas Conhecidos:**
- 
- 

**Próximos Passos:**
1. 
2. 
3. 

---

**Atualizado em:** 23 de abril de 2026
