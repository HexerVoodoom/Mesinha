# Sistema de Backup e Sincronização Local

## Visão Geral

O aplicativo agora possui um sistema de **save local** com **backup automático no Google Drive**, reduzindo drasticamente a carga no Supabase.

## Funcionalidades

### 1. **Armazenamento Local (IndexedDB)**
- Todos os dados são salvos primeiro no navegador usando IndexedDB
- Muito mais rápido que o Supabase
- Funciona offline
- Suporta grandes volumes de dados (fotos, vídeos, etc.)

### 2. **Backup Automático no Google Drive**
- Backup automático a cada 30 minutos
- Sincronização com a pasta do Google Drive
- Não sobrecarrega o Supabase

### 3. **Modos de Sincronização**
Você pode escolher entre:

- **Apenas Local**: Dados salvos apenas no navegador (sem backup)
- **Local + Google Drive**: Dados salvos localmente + backup automático no Google Drive (Recomendado)

## Como Configurar

### Passo 1: Obter Google Client ID

1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crie um novo projeto (se necessário)
3. Vá em "Credenciais" → "Criar Credenciais" → "ID do cliente OAuth 2.0"
4. Tipo de aplicativo: **Aplicativo da Web**
5. Em "URIs de redirecionamento autorizados", adicione:
   - `http://localhost:5173/oauth-callback.html` (para desenvolvimento)
   - `https://seu-dominio.com/oauth-callback.html` (para produção)
6. Copie o **Client ID** gerado

### Passo 2: Configurar no Aplicativo

1. Abra o app e vá em **Configurações** (ícone de engrenagem)
2. Role até **"Configurações Avançadas de Backup"**
3. Cole o **Google Client ID** que você copiou
4. Clique em **"Salvar"**
5. Clique em **"Conectar com Google Drive"**
6. Autorize o acesso

### Passo 3: Escolher Modo de Sincronização

Recomendamos usar **"Local + Google Drive"** para:
- Velocidade máxima (dados locais)
- Backup automático e seguro
- Redução de custos no Supabase

## Como Usar

### Backup Manual
1. Vá em **Configurações**
2. Clique em **"Backup Agora"** para fazer backup imediato

### Restaurar do Google Drive
1. Vá em **Configurações** → **Configurações Avançadas**
2. Clique em **"Restaurar"**
3. Seus dados serão baixados do Google Drive

### Exportar/Importar Backup Local
- **Exportar**: Salva um arquivo JSON no seu computador
- **Importar**: Restaura dados de um arquivo JSON

## Vantagens

✅ **Rápido**: Dados salvos localmente (sem latência de rede)  
✅ **Econômico**: Reduz uso do Supabase  
✅ **Seguro**: Backup automático no Google Drive  
✅ **Offline**: Funciona sem internet  
✅ **Escalável**: Suporta grandes volumes de dados

## Importante

- Os backups automáticos acontecem a cada **30 minutos**
- Você pode fazer backup manual a qualquer momento
- Os dados ficam na pasta do Google Drive que você especificou
- Se você limpar os dados do navegador, pode restaurar do Google Drive

## Estrutura dos Dados

Todos os seus dados (itens, configurações, fotos) são armazenados:
- **Localmente**: No IndexedDB do navegador
- **Backup**: No Google Drive (pasta especificada)

## Troubleshooting

### "Erro ao autenticar com Google Drive"
- Verifique se o Client ID está correto
- Verifique se a URI de redirecionamento está configurada corretamente no Google Cloud Console

### "Nenhum backup encontrado no Google Drive"
- Você precisa fazer um backup manual primeiro
- Verifique se está autenticado corretamente

### "Dados não estão sendo salvos"
- Verifique se o navegador permite IndexedDB
- Tente limpar o cache e recarregar

## Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor.
