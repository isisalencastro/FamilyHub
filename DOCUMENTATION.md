# Documentacao Tecnica — Family Hub

Documentacao detalhada da arquitetura, fluxos de dados e decisoes tecnicas do projeto.

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────┐
│                   Tauri v2 (Rust)                    │
│  ┌───────────────────────────────────────────────┐  │
│  │              React 19 (Frontend)               │  │
│  │                                                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │  │
│  │  │  Pages   │  │Components│  │   Widgets    │ │  │
│  │  │ (Routes) │  │(Sidebar, │  │(Weather,News,│ │  │
│  │  │          │  │ Modals)  │  │ Calendar)    │ │  │
│  │  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │  │
│  │       │              │               │        │  │
│  │       └──────────────┴───────────────┘        │  │
│  │                      │                        │  │
│  │              ┌───────┴───────┐                │  │
│  │              │ Zustand Stores│                │  │
│  │              │  (13 stores)  │                │  │
│  │              └───────┬───────┘                │  │
│  │                      │                        │  │
│  │          ┌───────────┴───────────┐            │  │
│  │          │                       │            │  │
│  │    ┌─────┴─────┐         ┌──────┴──────┐     │  │
│  │    │ Supabase  │         │  IndexedDB  │     │  │
│  │    │ (Remote)  │         │ (Cache Local)│    │  │
│  │    └───────────┘         └─────────────┘     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Plugins Nativos: fs, dialog, sql, opener,    │  │
│  │                   updater                     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Comandos Rust: chat_with_ollama,             │  │
│  │                 list_ollama_models,            │  │
│  │                 check_ollama_status            │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Fluxo de Dados e Sincronizacao

### Padrao utilizado em todos os stores

Cada store Zustand segue o mesmo padrao de integracao com Supabase:

```
App.tsx (useEffect na montagem)
  │
  ├── store.fetchData()        ← SELECT inicial do Supabase
  │
  └── store.subscribeRealtime() ← Canal Supabase Realtime
        │
        ├── INSERT  → adiciona ao estado local
        ├── UPDATE  → atualiza no estado local
        └── DELETE  → remove do estado local
```

**Operacoes de escrita** (add, update, delete) fazem:
1. Escrita no Supabase (operacao remota)
2. O Realtime propaga a mudanca de volta
3. O estado local e atualizado pelo handler do Realtime

Isso garante consistencia: a fonte de verdade e sempre o Supabase, e todos os clientes conectados recebem as mesmas mudancas.

### Fallback sem Supabase

Se `VITE_SUPABASE_URL` nao estiver configurado, o app roda em **modo local**: os stores mantem dados apenas em memoria (perdidos ao fechar). O `docStore` usa IndexedDB como fallback para persistencia local de documentos.

---

## Stores Detalhados

### taskStore
- **Tabela**: `tasks`
- **Campos**: id, title, description, status (todo/in-progress/done), priority, dueDate, workspace, category, tags, assignedTo, reminders
- **Features**: Drag-and-drop entre colunas Kanban, filtros por workspace

### financeStore
- **Tabela**: `transactions`
- **Campos**: id, type (income/expense), amount, category, description, date, workspace
- **Features**: Resumos por workspace, totais mensais

### familyFinanceStore
- **Tabelas**: `family_finance_entradas`, `family_finance_fixos`, `family_finance_creditos`, `family_finance_dividas`, `family_finance_problemas`, `family_finance_termometro`
- **Features**: Separadores Plano/Credito, calculos automaticos de totais (incluindo assinaturas de credito nos gastos mensais), termometro financeiro com dados JSONB por dia

### shoppingStore
- **Tabelas**: `shopping_categories`, `shopping_items`
- **Features**: Categorias customizaveis, itens com quantidade/prioridade/atribuicao

### calendarStore / calendarCommentsStore
- **Tabelas**: `calendar_events`, `calendar_comments`
- **Features**: Eventos com data/hora, comentarios por dia com autor (Isis/Angelica/Familia)

### goalStore
- **Tabelas**: `goals`, `goal_milestones`
- **Features**: Metas com milestones, tracking de progresso

### petStore
- **Tabelas**: `pets`, `pet_vaccinations`, `pet_medical_records`
- **Features**: CRUD de pets com historico de vacinas e consultas medicas

### menuStore
- **Tabela**: `meals`
- **Features**: Planejamento semanal, tipos (almoco/jantar), custos por refeicao

### docStore
- **Tabela**: `documents` (metadados) + Supabase Storage (arquivos)
- **Fallback**: IndexedDB via `docDatabase.ts`
- **Categorias fixas**: identidade, comprovantes, contratos, receitas, imovel, veiculos, pets, educacao, trabalho, saude, outros

### updateStore
- **Tabela**: `app_version` (trigger Realtime)
- **API**: `@tauri-apps/plugin-updater` (check, downloadAndInstall)
- **Fases**: idle → checking → available → downloading → ready → error
- **Features**: Progresso em bytes/percentual, reinstalacao automatica

### workspaceStore
- **Armazenamento**: Estado local (sem Supabase)
- **Workspaces**: "isis", "angelica", "visao-geral"

### themeStore
- **Armazenamento**: `localStorage` (chave `family-theme`)
- **Temas**: light/dark via atributo `data-theme` no HTML

---

## Design System

O design system e definido inteiramente via **CSS Variables** em `src/index.css`, usando a diretiva `@theme` do Tailwind CSS 4.

### Tokens principais

| Categoria | Exemplos |
|-----------|----------|
| **Cores de fundo** | `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-elevated` |
| **Cores de texto** | `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary` |
| **Cores de acento** | `--color-accent-primary`, `--color-accent-hover` |
| **Cores semanticas** | `--color-success`, `--color-warning`, `--color-danger`, `--color-info` |
| **Bordas** | `--color-border-default`, `--color-border-accent` |
| **Raios** | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` |
| **Sombras** | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| **Transicoes** | `--transition-spring` |

### Temas

O tema escuro e aplicado via `[data-theme="dark"]` que sobrescreve todas as variaveis de cor. A troca e gerenciada pelo `themeStore`.

---

## Componentes

### Sidebar (`src/components/Sidebar.tsx`)
Barra lateral fixa (270px) com navegacao principal, seletor de workspace e alternador de tema.

### UpdateToast (`src/components/UpdateToast.tsx`)
Toast fixo no canto inferior (ao lado da sidebar) com estados visuais para cada fase da atualizacao: disponivel, baixando (com barra de progresso), pronto e erro.

### FinanceModal (`src/components/FinanceModal.tsx`)
Modal reutilizavel para adicionar/editar itens financeiros (entradas, fixos, creditos, dividas).

### Widgets do Dashboard
- **WeatherWidget**: Clima atual via OpenWeather API
- **CalendarWidget**: Mini-calendario com indicadores de eventos
- **NewsWidget**: Noticias via RSS (G1) com cache e categorias

---

## Plugins Tauri

| Plugin | Uso |
|--------|-----|
| `tauri-plugin-opener` | Abrir URLs e arquivos no sistema |
| `tauri-plugin-sql` | SQLite local (legado) |
| `tauri-plugin-dialog` | Dialogos nativos (abrir arquivo, salvar) |
| `tauri-plugin-fs` | Leitura/escrita no sistema de arquivos |
| `tauri-plugin-updater` | Auto-update nativo com assinatura |

### Comandos Rust customizados (`src-tauri/src/lib.rs`)

| Comando | Descricao |
|---------|-----------|
| `chat_with_ollama` | Envia mensagens para LLM local via Ollama HTTP API |
| `list_ollama_models` | Lista modelos disponiveis no Ollama |
| `check_ollama_status` | Verifica se o Ollama esta rodando |

---

## CI/CD — GitHub Actions

### Workflow: `release.yml`

**Trigger**: Push de tag `v*` (ex: `v0.5.0`)

**Pipeline**:

```
Tag push (v0.5.0)
  │
  ├── Checkout + Setup (Node 20, Rust stable)
  │
  ├── npm ci + npx tauri build
  │     └── Gera: .exe + .exe.sig (assinado com TAURI_SIGNING_PRIVATE_KEY)
  │
  ├── Upload para Supabase Storage (bucket: app-updates)
  │     ├── Familys-Hub_0.5.0_x64-setup.exe
  │     └── Familys-Hub_0.5.0_x64-setup.exe.sig
  │
  ├── Gera e upload latest.json
  │     └── { version, signature, url, pub_date, platforms }
  │
  ├── Atualiza tabela app_version no Supabase
  │     └── Trigger Realtime → toast nos clientes conectados
  │
  └── Cria GitHub Release com assets
```

### Secrets necessarios

| Secret | Onde encontrar |
|--------|---------------|
| `TAURI_SIGNING_PRIVATE_KEY` | `~/.tauri/family-hub.key` (gerado localmente) |
| `VITE_SUPABASE_URL` | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API (service_role) |

---

## Fluxo de Atualizacao

```
Developer                  GitHub Actions              Supabase                 App (usuario)
    │                           │                         │                         │
    │  git tag v0.5.0           │                         │                         │
    │  git push origin v0.5.0   │                         │                         │
    │ ─────────────────────────>│                         │                         │
    │                           │  Build + Sign           │                         │
    │                           │ ──────────────────────> │  Upload .exe + .sig     │
    │                           │                         │  Upload latest.json     │
    │                           │                         │  UPDATE app_version     │
    │                           │                         │ ───────────────────────>│
    │                           │                         │  Realtime: version changed
    │                           │                         │                         │
    │                           │                         │                 checkForUpdate()
    │                           │                         │                 Toast aparece
    │                           │                         │                         │
    │                           │                         │         Usuario clica "Atualizar"
    │                           │                         │ <───────────────────────│
    │                           │                         │  Download .exe          │
    │                           │                         │ ───────────────────────>│
    │                           │                         │                 Instala + Reinicia
```

---

## Migracoes SQL

### `supabase/migration.sql` (v1 — Base)

Cria as tabelas fundamentais:
- `tasks` — tarefas com status, prioridade, workspace
- `projects` — projetos (legado)
- `board_columns`, `board_cards` — Kanban (legado)
- `transactions` — receitas/despesas por workspace
- `conversations`, `chat_messages`, `memories` — historico de chat IA (legado)
- `documents` — metadados de documentos

Habilita RLS (Row Level Security) com politica "allow all" e Realtime para todas as tabelas.

### `supabase/migration_v2_sync.sql` (v2 — Sincronizacao Completa)

Cria as tabelas de sincronizacao entre multiplos dispositivos:
- `shopping_categories`, `shopping_items` — compras
- `calendar_events`, `calendar_comments` — calendario
- `goals`, `goal_milestones` — metas
- `pets`, `pet_vaccinations`, `pet_medical_records` — pets
- `meals` — cardapio
- `family_finance_entradas/fixos/creditos/dividas/problemas/termometro` — financas familiares

Cada tabela possui:
- RLS habilitado com politica "allow all"
- Realtime habilitado
- Indices relevantes
- Timestamps (`created_at`, `updated_at`)

---

## Workflow de Desenvolvimento

### Adicionar uma nova feature

1. Crie o store em `src/stores/novoStore.ts` seguindo o padrao existente
2. Crie a tabela no Supabase (via migration SQL)
3. Implemente `fetchData()` e `subscribeRealtime()` no store
4. Registre o fetch e subscribe em `App.tsx`
5. Crie a pagina em `src/pages/` e adicione a rota em `App.tsx`
6. Adicione o link na `Sidebar`

### Publicar uma release

1. Atualize a versao em `package.json`, `src-tauri/tauri.conf.json` e `src/stores/updateStore.ts` (`APP_VERSION`)
2. Commit e push para `main`
3. Crie a tag: `git tag v<versao> && git push origin v<versao>`
4. O GitHub Actions faz o resto automaticamente

### Executar testes

```bash
npm run test
```

Os testes usam Vitest + jsdom + Testing Library. Setup em `src/test/setup.ts`.
