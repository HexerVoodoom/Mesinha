# Couple App

Uma aplicação web para casais gerenciarem suas finanças, lembretes e compartilharem momentos especiais.

## 🚀 Recursos

- **Sistema de Login** personalizado para Amanda e Mateus
- **Dashboard** com estatísticas financeiras
- **Gestão de Despesas** compartilhadas
- **Calendário de Lembretes** sincronizado
- **Galeria de Fotos** com memórias do casal
- **Backup no Google Drive** automático e manual
- **Sincronização em Tempo Real** via Supabase

## 🛠️ Tecnologias

- **React** 18.3.1 com TypeScript
- **Tailwind CSS** v4 para estilização
- **Vite** como build tool
- **React Router** para navegação
- **Supabase** para backend e autenticação
- **Material UI** para componentes
- **Google Drive API** para backup de dados

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas credenciais
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_GOOGLE_CLIENT_ID=...
```

## 🔧 Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie a URL e a Anon Key para o arquivo `.env`
3. Execute as migrações do banco de dados (ver `supabase/`)

### 2. Google Drive Backup

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Habilite a Google Drive API
4. Crie credenciais OAuth 2.0
5. Adicione o Redirect URI: `https://seu-dominio.com/oauth-callback.html`
6. Copie o Client ID para `VITE_GOOGLE_CLIENT_ID` no `.env`

### 3. Google Antigravity

Para deploy automatizado via Google Antigravity:

1. Instale o Antigravity CLI
2. Configure suas credenciais:
   ```bash
   antigravity login
   ```
3. Conecte ao GitHub:
   ```bash
   antigravity github connect
   ```
4. Configure Cloudflare:
   ```bash
   antigravity cloudflare setup
   ```
5. Deploy:
   ```bash
   antigravity deploy
   ```

## 🚀 Deploy

### Cloudflare Pages

```bash
# Build para produção
pnpm run build

# Deploy via Wrangler
npx wrangler pages deploy dist
```

### Variáveis de Ambiente no Cloudflare

Adicione no dashboard do Cloudflare Pages:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CLIENT_ID`

## 📱 Uso

1. Acesse a aplicação
2. Faça login com seu perfil (Amanda ou Mateus)
3. Navegue pelas diferentes seções
4. Configure backup automático no Google Drive

## 🔐 Segurança

- Senhas armazenadas com hash no localStorage
- Tokens OAuth gerenciados de forma segura
- Dados sincronizados via Supabase com autenticação
- Backup criptografado no Google Drive

## 📄 Licença

Uso pessoal privado.

## 🤝 Contribuindo

Este é um projeto privado para uso pessoal.

## 📞 Suporte

Para questões ou suporte, consulte a documentação em:
- `CONFIGURACAO_GOOGLE.md` - Configuração do Google Drive
- `INSTRUCOES_BACKUP.md` - Sistema de backup
- `SISTEMA_DE_LOGIN.md` - Detalhes do login
- `ARMAZENAMENTO_DE_DADOS.md` - Estrutura de dados
