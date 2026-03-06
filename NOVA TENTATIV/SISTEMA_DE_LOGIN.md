# 🔐 Sistema de Login e Sincronização - Mesinha da Amanda e do Mateus

## ✨ Visão Geral

O app agora possui um sistema completo de autenticação e sincronização em tempo real para que Amanda e Mateus possam gerenciar suas listas juntos, cada um em seu próprio dispositivo.

## 🚀 Como Funcionar

### Primeira vez usando o app:

1. **Tela de Setup (Configuração Inicial)**
   - Na primeira vez que abrir o app, você verá a tela de configuração
   - Defina uma senha para Amanda (mínimo 6 caracteres)
   - Defina uma senha para Mateus (mínimo 6 caracteres)
   - Clique em "Criar contas"
   - **IMPORTANTE:** Guarde essas senhas em um local seguro!

2. **Tela de Login**
   - Após o setup, você será redirecionado para a tela de login
   - Escolha seu perfil (Amanda ou Mateus)
   - Digite sua senha
   - Clique em "Entrar"

3. **Usando o App**
   - Você está logado e pode usar todas as funcionalidades
   - Todos os itens criados serão marcados com seu nome
   - O app sincroniza automaticamente a cada 5 segundos

### Recursos de Segurança:

- ✅ Apenas Amanda e Mateus podem ter contas
- ✅ Cada conta é vinculada permanentemente a um perfil
- ✅ As senhas são armazenadas com segurança no Supabase
- ✅ O token de autenticação é salvo localmente para não precisar fazer login toda vez
- ✅ Você pode fazer logout clicando no botão no canto superior direito

## 🔄 Sincronização em Tempo Real

### Como funciona:

1. **Polling Automático**
   - O app busca atualizações do servidor a cada 5 segundos
   - Isso garante que ambos vejam as mudanças quase instantaneamente

2. **Notificações de Atualização**
   - Quando seu parceiro adiciona/edita/remove um item, você recebe uma notificação
   - Exemplo: "Mateus atualizou a lista! 💕"

3. **Identificação de Criador**
   - Cada item mostra quem o criou (Amanda ou Mateus)
   - Isso ajuda a saber quem sugeriu cada coisa

4. **Modo Offline**
   - Se a internet cair, o app continua funcionando
   - As mudanças são salvas localmente
   - Quando a conexão voltar, o app sincroniza automaticamente

## 🎨 Fluxo de Autenticação

```
1. App Inicia
   ↓
2. Verifica se tem setup completo?
   → NÃO: Mostra Tela de Setup → Cria contas
   → SIM: Continua
   ↓
3. Verifica se tem token salvo?
   → NÃO: Mostra Tela de Login
   → SIM: Valida token
      ↓
      Token válido? → SIM: Entra no app
                   → NÃO: Mostra Tela de Login
```

## 🔧 Arquitetura Técnica

### Frontend (`/src/app/`)
- **App.tsx**: Gerencia o estado de autenticação e roteamento
- **pages/Setup.tsx**: Tela de configuração inicial (primeira vez)
- **pages/Login.tsx**: Tela de login com seleção de perfil
- **pages/Home.tsx**: Página principal com sincronização ativa

### Backend (`/supabase/functions/server/`)
- **POST /signup**: Cria contas de Amanda e Mateus
- **POST /signin**: Autentica usuário e retorna token
- **GET /verify**: Verifica se o token ainda é válido
- Todas as outras rotas agora usam o token de autenticação

### API (`/src/app/utils/api.ts`)
- Adiciona automaticamente o token nas requisições
- Funções: `signup()`, `signin()`, `verifyToken()`

## 💡 Dicas de Uso

1. **Senhas Fortes**: Use senhas seguras com letras, números e símbolos
2. **Não Compartilhe**: Cada um deve usar apenas sua própria conta
3. **Logout**: Use o botão de logout se outra pessoa for usar o dispositivo
4. **Sincronização**: Aguarde alguns segundos para ver as mudanças do parceiro

## 🛠️ Para Desenvolvedores

### Redefinir Setup (se necessário):
```javascript
// No console do navegador:
localStorage.removeItem('setupCompleted');
localStorage.removeItem('authToken');
localStorage.removeItem('userProfile');
location.reload();
```

### Criar contas manualmente via API:
```javascript
// Abra o console e execute:
await fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-19717bce/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'amanda@mesinhadocasal.com',
    password: 'sua-senha-aqui',
    name: 'Amanda'
  })
});
```

## ❤️ Feito com Amor

Este sistema foi criado especialmente para Amanda e Mateus gerenciarem suas listas juntos, cada um com sua própria identidade, mas compartilhando o mesmo espaço amoroso! 💕
