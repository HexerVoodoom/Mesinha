# Sistema de Sincronização em Tempo Real 💕

## Como Funciona

O app "Mesinha" possui sincronização em tempo real entre Amanda e Mateus usando **Supabase Realtime** com WebSockets e **arquitetura singleton** para evitar múltiplas conexões.

## Arquitetura

### 1. **Supabase Client Singleton** (`/src/app/utils/supabaseClient.ts`)
- **Uma única instância** do cliente Supabase para toda a aplicação
- Previne o warning "Multiple GoTrueClient instances"
- Compartilhado por todos os módulos

### 2. **Realtime Channel Singleton** (`/src/app/utils/realtimeChannel.ts`)
- **Um único canal WebSocket** compartilhado: `shared-couple-lists`
- Sistema de callbacks para múltiplos listeners
- Auto-cleanup quando não há mais subscribers
- Funções principais:
  - `subscribeToSync()` - Registra um listener
  - `broadcastSync()` - Envia evento para todos

### 3. **Hook useRealtimeSync** (`/src/app/hooks/useRealtimeSync.ts`)
- Hook React que registra/desregistra callbacks
- Cleanup automático ao desmontar componente
- Múltiplos componentes podem usar sem criar múltiplos canais

### 4. **API com Sincronização** (`/src/app/utils/syncApi.ts`)
- Wrapper em torno da API normal
- Após cada operação CRUD, chama `broadcastSync()`
- Todos os clientes conectados recebem a atualização instantaneamente

### 3. **Integração nas Páginas**

#### Home (`/src/app/pages/Home.tsx`)
- Usa `useRealtimeSync` para escutar mudanças em itens
- Quando outro usuário adiciona/edita/remove um item, a lista atualiza automaticamente
- Mostra notificações quando recebe atualizações

#### Settings (`/src/app/pages/Settings.tsx`)
- Escuta mudanças nas configurações
- Atualiza automaticamente quando o parceiro muda as configurações

## Eventos de Sincronização

### Tipos de Eventos:
1. **item_created** - Novo item adicionado
2. **item_updated** - Item atualizado (status, comentário, foto, etc)
3. **item_deleted** - Item removido
4. **settings_updated** - Configurações alteradas

## Como Usar

### No código:
```typescript
// 1. Importar o syncApi ao invés do api
import { syncApi } from '../utils/syncApi';

// 2. Usar nas operações
await syncApi.createItem(item);  // Cria E envia evento
await syncApi.updateItem(id, updates);  // Atualiza E envia evento
await syncApi.deleteItem(id);  // Deleta E envia evento

// 3. Escutar eventos
useRealtimeSync({
  onSync: (event) => {
    if (event.type === 'item_created') {
      // Adicionar item na lista local
    }
  },
  enabled: true,
});
```

## Benefícios

✅ **Sincronização instantânea** - Mudanças aparecem em menos de 1 segundo
✅ **Sem polling** - Não faz requisições desnecessárias ao servidor
✅ **Eficiente** - Usa WebSockets (conexão persistente)
✅ **Notificações** - Usuários sabem quando o parceiro fez mudanças
✅ **Experiência romântica** - "Vocês dois estão sempre conectados" 💕
✅ **Sem warnings** - Padrão singleton previne múltiplas instâncias

## Observações Técnicas

- **Um único canal WebSocket** compartilhado por toda a aplicação
- **Sistema de callbacks** permite múltiplos listeners sem criar novas conexões
- **Auto-cleanup**: Canal desconecta automaticamente quando não há listeners
- O sistema funciona com múltiplos dispositivos abertos simultaneamente
- Fallback para modo offline continua funcionando se a conexão cair
- **Padrão Singleton** garante apenas uma instância do Supabase client

## Melhorias Futuras Possíveis

- [ ] Indicador "Parceiro está online"
- [ ] Typing indicators ("Amanda está digitando...")
- [ ] Presença em tempo real (ver qual categoria o parceiro está vendo)
- [ ] Histórico de atividades
