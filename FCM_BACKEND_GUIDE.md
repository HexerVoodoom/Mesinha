# Firebase Cloud Messaging - Supabase & Make.com

Agora que o Frontend já cadastra os FCM Tokens de cada usuário (Amanda e Mateus) no Supabase (através da rota `/settings/fcm-token` da Edge Function), você tem duas opções para disparar a push notification quando algo acontece.

## 1. Gatilho pelo Banco de Dados -> Make.com (Mais Fácil)

Se você já usa o Make.com, você pode adicionar um módulo do Supabase que escuta (Watch Changes) as inserções de novos items (ex: categoria: mural) e a criação de Lembretes. No webhook do cenário no Make.com você:

1. Adiciona o módulo **Firebase Cloud Messaging** (ou faz uma requisição HTTP REST direta).
2. O corpo do JSON da Requisição HTTP (via FCM API V1) deve ser assim:

```json
{
  "message": {
    "token": "O-FCM-TOKEN-DO-DESTINATARIO",
    "notification": {
       "title": "Novo no Mural!",
       "body": "Amanda adicionou: 🖼️ Novo post!"
    },
    "webpush": {
      "fcm_options": {
        "link": "https://sua-url-do-github.pages.dev"
      }
    }
  }
}
```

O Token do destinatário deve ser puxado da sua tabela/edge function que os salvou.

## 2. Direto pelo Supabase Edge Functions (Mais Robusto)

1. Você já tem uma Edge Function (`make-server`).
2. Adicione a biblioteca do Firebase Admin lá.
3. Quando a rota `/items` recebe um `POST` para criar algo no Mural, a Edge Function pode (após inserir no banco) pegar o Token FCM salvo do 'outro usuário' e disparar a notificação diretamente pelo Admin SDK.

**No frontend, a integração já está rodando.**
1. O usuário loga -> O navegador pede permissão.
2. Ele obtém o Token do Firebase.
3. Ele manda para a API (`/settings/fcm-token`) (Garanta que a sua Edge Function implemente essa rota para salvar no DB).
4. O `firebase-messaging-sw.js` foi registrado e configurado para receber notificações em Background e usar o ícone correto.
