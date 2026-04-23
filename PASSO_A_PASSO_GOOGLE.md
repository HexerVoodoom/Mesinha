# 🚀 Passo a Passo: Configurar Google Drive Backup

## ⚠️ IMPORTANTE: Configurar URI no Google Cloud Console

Antes de usar o backup, você PRECISA configurar a URI de redirecionamento:

### 1. Acesse o Google Cloud Console
🔗 https://console.cloud.google.com/apis/credentials

### 2. Encontre suas credenciais OAuth 2.0
- Procure pelo Client ID: `305705048348-jbfvtamh0llghkfiuntt9bqlc48vhukc.apps.googleusercontent.com`
- Clique no ícone de **editar** (lápis)

### 3. Adicione as URIs de Redirecionamento

**COPIE E COLE EXATAMENTE:**

Para desenvolvimento local:
```
http://localhost:5173/oauth-callback.html
```

Se estiver usando outro domínio/porta, adicione também:
```
https://seu-dominio.com/oauth-callback.html
```

### 4. Salve as alterações

Clique em **"Salvar"** no Google Cloud Console

---

## ✅ Agora Use o App

### 1. O Client ID já está configurado!
O app já vem com o Client ID pré-configurado: `305705048348-jbfvtamh0llghkfiuntt9bqlc48vhukc.apps.googleusercontent.com`

### 2. Abra o App
- Vá em **Configurações** (ícone de engrenagem)
- Role até **"Configurações Avançadas de Backup"**
- Clique para expandir

### 3. Conecte com Google Drive
- Clique no botão **"Conectar com Google Drive"**
- Uma janela popup abrirá
- Faça login com sua conta Google
- Autorize o acesso

### 4. Pronto! ✨
- Você verá: ✅ **"Conectado ao Google Drive"**
- O backup automático está ativo (a cada 30 minutos)

---

## 🎯 Como Usar

### Fazer Backup Manual
1. Configurações → Configurações Avançadas
2. Clique em **"Backup Agora"**
3. Aguarde a confirmação

### Restaurar do Google Drive
1. Configurações → Configurações Avançadas
2. Clique em **"Restaurar"**
3. Seus dados serão baixados e restaurados

### Exportar Backup Local (JSON)
1. Configurações → Configurações Avançadas
2. Clique em **"Exportar"**
3. Um arquivo JSON será baixado

---

## 📊 Onde os Dados Ficam?

### Local (IndexedDB)
- Todos os dados são salvos **primeiro** no navegador
- Muito rápido, funciona offline
- Pasta: `CoupleAppDB` no IndexedDB do navegador

### Google Drive
- Backup automático a cada 30 minutos
- Arquivo: `couple-app-backup.json`
- Pasta ID: `1ss1CKK_eN-rTV54Y5fYl5oh9MPlU46sM`

---

## ❗ Troubleshooting

### Erro: "redirect_uri_mismatch"
**Solução:**
1. Verifique se adicionou EXATAMENTE esta URI no Google Cloud Console:
   ```
   http://localhost:5173/oauth-callback.html
   ```
2. Não esqueça o `/oauth-callback.html` no final!

### Erro: "access_denied"
**Solução:**
- Autorize o acesso quando o popup abrir
- Use a conta Google correta

### "Nenhum backup encontrado"
**Solução:**
- Faça um backup manual primeiro (botão "Backup Agora")
- Aguarde alguns segundos e tente restaurar novamente

### Popup não abre
**Solução:**
- Verifique se o navegador não está bloqueando popups
- Permita popups para este site

---

## 🔒 Segurança

✅ Os dados são criptografados durante transmissão (HTTPS)  
✅ Apenas você (usuário autenticado) pode acessar seus backups  
✅ O Google Drive usa permissões granulares (apenas arquivos criados pelo app)

---

## 📞 Suporte

Se tiver problemas, verifique:
1. URI de redirecionamento está configurada corretamente no Google Cloud Console
2. Está usando o navegador mais atualizado (Chrome, Firefox, Safari, Edge)
3. Popups não estão bloqueados

---

**Feito com ❤️ para Amanda & Mateus**
