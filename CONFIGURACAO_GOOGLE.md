# Configuração do Google Drive - Credenciais

## Credenciais OAuth 2.0

**Client ID:**
```
305705048348-jbfvtamh0llghkfiuntt9bqlc48vhukc.apps.googleusercontent.com
```

**Client Secret (não usado no frontend):**
```
[CHAVE_REMOVIDA_POR_SEGURANCA]
```

## Configuração no Google Cloud Console

### URIs de Redirecionamento Autorizados

Certifique-se de adicionar estas URIs no Google Cloud Console:

**Para Desenvolvimento:**
```
http://localhost:5173/oauth-callback.html
http://127.0.0.1:5173/oauth-callback.html
```

**Para Produção:**
```
https://seu-dominio.com/oauth-callback.html
```

### Escopos Necessários

O aplicativo usa o seguinte escopo:
- `https://www.googleapis.com/auth/drive.file` - Acesso apenas aos arquivos criados pelo app

### Pasta do Google Drive

**Folder ID:** `1ss1CKK_eN-rTV54Y5fYl5oh9MPlU46sM`

## Como Usar

1. **No app, vá em Configurações → Configurações Avançadas de Backup**

2. **Cole o Client ID:**
   ```
   305705048348-jbfvtamh0llghkfiuntt9bqlc48vhukc.apps.googleusercontent.com
   ```

3. **Clique em "Salvar"**

4. **Clique em "Conectar com Google Drive"**

5. **Autorize o acesso na janela popup**

6. **Pronto! O backup automático estará ativo**

## Verificação

Após conectar, você verá:
- ✅ "Conectado ao Google Drive"
- Último backup: horário do último backup
- Botão "Backup Agora" habilitado
- Botão "Restaurar" habilitado

## Troubleshooting

### Erro "redirect_uri_mismatch"
- Verifique se adicionou as URIs corretas no Google Cloud Console
- A URI deve ser EXATAMENTE: `http://localhost:5173/oauth-callback.html`

### Erro "access_denied"
- Certifique-se de autorizar o acesso quando o popup abrir
- Verifique se está usando a conta Google correta

### "Nenhum backup encontrado"
- Faça um backup manual primeiro clicando em "Backup Agora"
- Verifique se está conectado corretamente

## Segurança

⚠️ **IMPORTANTE:**
- O Client ID pode ser público (está no código frontend)
- A Client Secret NÃO é usada no frontend (apenas para server-side OAuth)
- Os dados são criptografados durante a transmissão (HTTPS)
- Apenas o usuário autenticado pode acessar seus backups
