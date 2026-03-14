# 🗄️ Onde os Dados São Armazenados - App Mesinha

## ✅ SIM! Os dados estão salvos na nuvem (Supabase)

### 📊 **Banco de Dados: PostgreSQL no Supabase**

Todos os dados do app (listas, fotos, configurações) são armazenados em um **banco de dados PostgreSQL** hospedado no Supabase.

## 🏗️ Estrutura de Armazenamento

### **Tabela Principal: `kv_store_19717bce`**
```sql
CREATE TABLE kv_store_19717bce (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### **Como os Dados São Organizados:**

#### 1. **Itens das Listas** 📝
- Chave: `item:{id}` (ex: `item:1234567890`)
- Valor: Objeto JSON completo com:
  - Título, comentário, categoria
  - Data do evento, foto (base64)
  - Tags, status (pending/done)
  - Quem criou (Amanda/Mateus)
  - Configurações de lembrete

#### 2. **Configurações** ⚙️
- Chave: `settings`
- Valor: Objeto JSON com:
  - Nome do casal
  - Cor do tema
  - Notificações habilitadas

#### 3. **Fotos** 📷
- Armazenadas como **base64** dentro do item
- Carregadas sob demanda para performance

## 🌐 Arquitetura Completa

```
┌─────────────────┐
│  iPhone Amanda  │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTPS + WebSocket
         ▼
┌─────────────────────────┐
│  Supabase Edge Function │
│    (Servidor Hono)      │
│   /supabase/functions/  │
│      server/index.tsx   │
└────────┬────────────────┘
         │
         │ SQL Queries
         ▼
┌─────────────────────────┐
│   PostgreSQL Database   │
│  kv_store_19717bce      │
│    (Supabase Cloud)     │
└─────────────────────────┘
         ▲
         │
         │ SQL Queries
┌────────┴────────────────┐
│  Supabase Edge Function │
│    (Servidor Hono)      │
└────────┬────────────────┘
         │
         │ HTTPS + WebSocket
         ▼
┌─────────────────┐
│  iPhone Mateus  │
│   (Frontend)    │
└─────────────────┘
```

## 🔄 Fluxo de Sincronização

### Quando Amanda adiciona um item:
1. ✅ Dados salvos no **banco PostgreSQL** (permanente)
2. ✅ Broadcast via **WebSocket** (tempo real)
3. ✅ iPhone do Mateus recebe atualização instantânea
4. ✅ Mateus vê o novo item sem refresh

## 💾 Modo Offline (Fallback)

O app também usa **localStorage** como backup:
- **Quando**: Se a conexão com o servidor falhar
- **Onde**: No navegador/celular de cada usuário
- **Limitação**: Dados locais NÃO sincronizam entre dispositivos

```typescript
// Exemplo no código:
try {
  // Tenta salvar no servidor (nuvem)
  const item = await syncApi.createItem(newItem);
  setItems([...items, item]);
} catch (error) {
  // Fallback: salva localmente
  localStorage.setItem('offlineItems', JSON.stringify([...items, newItem]));
  toast.info('Item salvo localmente (sem conexão)');
}
```

## 🔒 Segurança

- ✅ **Conexão HTTPS** criptografada
- ✅ **Autenticação simples** (senha de Amanda = "Mateus", senha de Mateus = "Amanda")
- ✅ **Dados compartilhados** entre Amanda e Mateus apenas
- ✅ **Supabase Service Role Key** protegida no servidor (não exposta no frontend)

## 📍 Dashboard do Banco de Dados

Você pode visualizar os dados diretamente no dashboard do Supabase:
```
https://supabase.com/dashboard/project/oubdmmaqxnutbbxiqeow/database/tables
```

## 🎯 Resumo

| Aspecto | Status |
|---------|--------|
| **Armazenamento na nuvem** | ✅ Sim (PostgreSQL) |
| **Sincronização tempo real** | ✅ Sim (WebSocket) |
| **Backup local** | ✅ Sim (localStorage) |
| **Acesso entre dispositivos** | ✅ Sim (mesmo banco) |
| **Persiste após fechar app** | ✅ Sim (dados permanentes) |
| **Amanda vê dados do Mateus** | ✅ Sim (compartilhado) |

## 💕 Conclusão

Os dados do "Mesinha" **SÃO salvos na nuvem** e **compartilhados entre Amanda e Mateus** em tempo real através do Supabase! O localStorage é apenas um backup caso não tenha internet.
