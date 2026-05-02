# Family Hub

**Hub central de gestão familiar** — um aplicativo desktop que unifica finanças, tarefas, documentos, calendário, cardápio, pets e mais, tudo sincronizado em tempo real entre múltiplos computadores.

<div align="center">
  <img src="public/favicon.svg" alt="Logo Family Hub" width="96"/>
  <br/><br/>
  <strong>v0.4.0</strong> &nbsp;|&nbsp; Windows Desktop &nbsp;|&nbsp; Tauri v2 + React 19
</div>

---

## Funcionalidades

### Dashboard
Painel central com widgets de clima, calendário, notícias (RSS), resumo de tarefas pendentes, finanças e atalhos rápidos. Adaptável por workspace (Isis, Angélica, Visão Geral).

### Tarefas & Compras
Quadro Kanban com drag-and-drop, lista de compras integrada com categorias/prioridades e metas com milestones.

### Finanças Familiares
Gestão financeira completa com separadores **Plano** e **Crédito**: entradas mensais, gastos fixos, créditos/parcelamentos, dívidas individuais e termômetro financeiro mensal.

### Documentos
Repositório seguro de documentos organizados por categoria (identidade, comprovantes, contratos, etc.) com upload para Supabase Storage e cache local via IndexedDB.

### Calendário
Calendário com eventos e comentários por dia, suporte a múltiplos autores (Isis, Angélica, Família).

### Cardápio Semanal
Planejamento de refeições da semana com tipos (almoço/jantar), custos e organização por dia.

### Pets
Cadastro de animais de estimação com controle de vacinas e histórico médico completo.

### Configurações
Gerenciamento de conexão Supabase, workspace ativo e preferências do sistema.

### Atualização Automática
Sistema de auto-update nativo via Tauri Updater — quando uma nova versão é publicada, o app exibe um toast de notificação com barra de progresso para download e instalação automática.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Desktop Runtime** | [Tauri v2](https://v2.tauri.app/) (Rust) |
| **Frontend** | [React 19](https://react.dev/) + TypeScript |
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Estilização** | [Tailwind CSS 4](https://tailwindcss.com/) + CSS Variables |
| **Estado Global** | [Zustand 5](https://github.com/pmndrs/zustand) |
| **Roteamento** | [React Router DOM 7](https://reactrouter.com/) |
| **Backend** | [Supabase](https://supabase.com/) (PostgreSQL + Realtime + Storage) |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) |
| **Ícones** | [Lucide React](https://lucide.dev/) |
| **Testes** | [Vitest](https://vitest.dev/) + Testing Library |
| **CI/CD** | GitHub Actions |
| **Auto-Update** | Tauri Updater Plugin + Supabase Storage |

---

## Pré-Requisitos

- [Node.js 20+](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install) (toolchain stable)
- Visual Studio C++ Build Tools (Windows)
- [Supabase](https://supabase.com/) — projeto configurado

---

## Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/family-hub.git
cd family-hub
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Encontre estas chaves em: **Supabase Dashboard > Settings > API**.

### 3. Configurar o banco de dados

Execute as migrações SQL no editor SQL do Supabase, na seguinte ordem:

1. `supabase/migration.sql` — tabelas base (tasks, transactions, documents, etc.)
2. `supabase/migration_v2_sync.sql` — tabelas de sincronização (shopping, calendar, goals, pets, meals, family finance)

### 4. Executar em desenvolvimento

```bash
# Frontend no navegador (porta 1420)
npm run dev

# App desktop com hot-reload
npm run tauri dev
```

### 5. Compilar para produção

```bash
npm run tauri build
```

O instalador `.exe` será gerado em `src-tauri/target/release/bundle/nsis/`.

---

## Estrutura do Projeto

```
family-hub/
├── .github/
│   └── workflows/
│       └── release.yml          # CI/CD: build + release automático
├── public/                      # Assets estáticos
├── src/
│   ├── components/              # Componentes reutilizáveis
│   │   ├── CalendarWidget.tsx
│   │   ├── FinanceModal.tsx
│   │   ├── NewsWidget.tsx
│   │   ├── Sidebar.tsx
│   │   ├── UpdateToast.tsx
│   │   └── WeatherWidget.tsx
│   ├── hooks/
│   │   └── useFileUpload.ts
│   ├── lib/                     # Serviços e utilitários
│   │   ├── supabase.ts          # Cliente Supabase
│   │   ├── docDatabase.ts       # IndexedDB (cache local)
│   │   ├── notificationService.ts
│   │   └── newsService.ts       # RSS feed parser
│   ├── pages/                   # Páginas/rotas
│   │   ├── Dashboard.tsx        # /
│   │   ├── Tasks.tsx            # /tasks
│   │   ├── Finance.tsx          # /finance
│   │   ├── Docs.tsx             # /docs
│   │   ├── CalendarView.tsx     # /calendar
│   │   ├── MenusView.tsx        # /menus
│   │   ├── Pets.tsx             # /pets
│   │   ├── Settings.tsx         # /settings
│   │   └── Shopping.tsx         # (componente usado em Tasks)
│   ├── stores/                  # Estado global (Zustand)
│   │   ├── taskStore.ts
│   │   ├── financeStore.ts
│   │   ├── familyFinanceStore.ts
│   │   ├── shoppingStore.ts
│   │   ├── calendarStore.ts
│   │   ├── calendarCommentsStore.ts
│   │   ├── goalStore.ts
│   │   ├── petStore.ts
│   │   ├── menuStore.ts
│   │   ├── docStore.ts
│   │   ├── updateStore.ts
│   │   ├── workspaceStore.ts
│   │   └── themeStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx                  # Roteamento + bootstrap
│   ├── main.tsx
│   └── index.css                # Design system (CSS Variables)
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs               # Comandos Rust (Ollama integration)
│   │   └── main.rs
│   ├── capabilities/
│   │   └── default.json         # Permissões Tauri
│   ├── icons/                   # Ícones do app
│   ├── Cargo.toml               # Dependências Rust
│   └── tauri.conf.json          # Configuração Tauri + Updater
├── supabase/
│   ├── migration.sql            # Migração base
│   └── migration_v2_sync.sql    # Migração de sincronização
├── .env                         # Variáveis de ambiente (local)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Sincronização em Tempo Real

Todos os dados são sincronizados via **Supabase Realtime**. Cada store Zustand:

1. **Carrega** os dados do Supabase na inicialização
2. **Assina** um canal Realtime para receber INSERT/UPDATE/DELETE instantaneamente
3. **Atualiza** o estado local automaticamente

Isso significa que alterações feitas em um computador aparecem imediatamente em todos os outros que estejam com o app aberto.

---

## Sistema de Auto-Update

O app possui atualização automática integrada via **Tauri Updater Plugin**.

### Como funciona

1. O app verifica `latest.json` no Supabase Storage ao iniciar
2. Se existe uma versão mais recente, um **toast** aparece no canto inferior
3. O usuário clica em **"Atualizar agora"** e o download acontece com barra de progresso
4. Após o download, a instalação é aplicada automaticamente (modo passivo)

### Como publicar uma nova versão

```bash
# 1. Atualize a versão em package.json, tauri.conf.json e updateStore.ts
# 2. Commit e push
git add -A && git commit -m "release: v0.5.0" && git push

# 3. Crie e push a tag
git tag v0.5.0
git push origin v0.5.0
```

O **GitHub Actions** cuida do resto:
- Compila o app para Windows
- Assina o instalador com a chave do Tauri Updater
- Faz upload do `.exe` + assinatura para o Supabase Storage
- Gera o `latest.json` com metadados da versão
- Atualiza a tabela `app_version` no Supabase (trigger Realtime)
- Cria um GitHub Release com os assets

### GitHub Secrets necessários

Configure em **Settings > Secrets and variables > Actions**:

| Secret | Descrição |
|--------|-----------|
| `TAURI_SIGNING_PRIVATE_KEY` | Conteúdo da chave privada (`~/.tauri/family-hub.key`) |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Dashboard > Settings > API) |

---

## Rotas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Dashboard | Painel com widgets e resumos |
| `/tasks` | Tasks | Tarefas Kanban + Compras + Metas |
| `/finance` | Finance | Finanças familiares (Plano/Crédito) |
| `/docs` | Docs | Documentos por categoria |
| `/calendar` | CalendarView | Calendário com eventos e comentários |
| `/menus` | MenusView | Cardápio semanal |
| `/pets` | Pets | Pets, vacinas, histórico médico |
| `/settings` | Settings | Configurações do sistema |

---

## Tabelas Supabase

### Base (`migration.sql`)
`tasks`, `projects`, `board_columns`, `board_cards`, `transactions`, `conversations`, `chat_messages`, `memories`, `documents`

### Sincronização (`migration_v2_sync.sql`)
`shopping_categories`, `shopping_items`, `calendar_events`, `calendar_comments`, `goals`, `goal_milestones`, `pets`, `pet_vaccinations`, `pet_medical_records`, `meals`, `family_finance_entradas`, `family_finance_fixos`, `family_finance_creditos`, `family_finance_dividas`, `family_finance_problemas`, `family_finance_termometro`

### Storage Buckets
- `documents` — arquivos de documentos do usuário
- `app-updates` — instaladores e metadados de atualização (público)

### Auto-Update
`app_version` — registro único com versão atual, changelog e URL de download

---

## Scripts

```bash
npm run dev          # Servidor de desenvolvimento (Vite, porta 1420)
npm run build        # Build do frontend (TypeScript + Vite)
npm run tauri dev    # App desktop com hot-reload
npm run tauri build  # Build de produção (gera instalador .exe)
npm run build:app    # Build + copia instalador para a raiz
npm run test         # Executa testes (Vitest)
```

---

## Licença

Uso pessoal — Repositório privado.
