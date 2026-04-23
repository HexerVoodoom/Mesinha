# ⚠️ URI CORRETA PARA CONFIGURAR NO GOOGLE CLOUD CONSOLE

## 🎯 A URI que você precisa adicionar é:

```
https://3601c913-7a74-42c7-903d-a102ec598374-v3-figmaiframepreview.figma.site/oauth-callback.html
```

## 📋 Passo a Passo:

### 1. Acesse o Google Cloud Console
🔗 https://console.cloud.google.com/apis/credentials

### 2. Encontre suas credenciais OAuth 2.0
- Procure pelo Client ID: `305705048348-jbfvtamh0llghkfiuntt9bqlc48vhukc.apps.googleusercontent.com`
- Clique no ícone de **editar** (lápis)

### 3. Adicione a URI de Redirecionamento

**COPIE E COLE EXATAMENTE:**

```
https://3601c913-7a74-42c7-903d-a102ec598374-v3-figmaiframepreview.figma.site/oauth-callback.html
```

### 4. Salve

Clique em **"Salvar"** no Google Cloud Console

### 5. Teste no App

Após salvar:
1. Aguarde 1-2 minutos (Google precisa propagar a mudança)
2. Abra o app
3. Vá em Configurações → Configurações Avançadas de Backup
4. Clique em "Conectar com Google Drive"
5. Agora deve funcionar! ✅

---

## 📸 Screenshot da Configuração

Deve ficar assim no Google Cloud Console:

**URIs de redirecionamento autorizados:**
```
https://3601c913-7a74-42c7-903d-a102ec598374-v3-figmaiframepreview.figma.site/oauth-callback.html
```

---

## ℹ️ Nota Importante

- Essa é a URL do Figma Make onde seu app está rodando
- Se você publicar o app em outro domínio no futuro, precisará adicionar a nova URI também
- Você pode ter múltiplas URIs configuradas ao mesmo tempo

---

## 🆘 Se ainda não funcionar:

1. **Verifique se copiou a URI exatamente** (sem espaços extras)
2. **Aguarde 2-3 minutos** após salvar (propagação do Google)
3. **Limpe o cache do navegador** e tente novamente
4. **Verifique se salvou** no projeto correto do Google Cloud Console
