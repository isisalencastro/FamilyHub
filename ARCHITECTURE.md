# Arquitetura do Alenfinos Intranet

Este documento detalha as decisões de engenharia, a estrutura do projeto e o fluxo de dados do Alenfinos Intranet. O objetivo é fornecer um mapa claro para qualquer desenvolvedor entender como as diferentes peças de tecnologia interagem.

## Visão Geral do Sistema

O Alenfinos combina o melhor do desenvolvimento web moderno com o ecossistema nativo do Rust para entregar um aplicativo Windows altamente responsivo. Funciona através de 3 camadas principais:

1. **Frontend (UI & Estado):** React + Vite.
2. **Backend Nativo (App Bundle):** Tauri (Rust), provendo acesso seguro ao sistema operacional, sistema de arquivos local e chamadas pesadas.
3. **Cloud & Sincronização:** Supabase atua como a única fonte de verdade (Source of Truth) persistente, com WebSockets para manter múltiplos computadores da família sincronizados.
4. **Inteligência Artificial Local:** Ollama, rodando no host e servindo como "cérebro" privado da Assistente.

---

## 1. Frontend: React, Vite & Zustand

A escolha de Vite garante HMR (Hot Module Replacement) instantâneo. React 18 e Zustand constroem a camada de estado previsível.

### Fluxo de Estado por Contexto (Workspaces)
Uma das inovações arquiteturais é o uso de **Workspaces** simulados.
Em vez de implementar sistemas de Multitenancy complexos no banco, o app possui `workspaceStore.ts`. Ele mantém a fonte indicando se o usuário clicou na "Visão Geral (Família)", ou no "Perfil Isis", ou "Perfil Angélica".

**Como as Stores consomem isso?**
Quando o componente `Finance.tsx` renderiza, ele não busca todos os dados do BD. Ele pede à `financeStore`:
```ts
const transactions = getTransactionsByWorkspace(activeWorkspace.id);
```
Isso isola visualmente e logicamente os dados financeiros da Isis da visão macro da Família. O mesmo vale para o `taskStore`.

---

## 2. Banco de Dados e Realtime (Supabase)

O esquema relacional é simples, mas focado na coluna `workspace_id`. Todas as chaves estrangeiras (`projects`, `tasks`, `transactions`) garantem que o dado pertence a um perfil.

### Migrações
A migração principal e fonte de verdade do DDL está em `supabase/migration.sql`.

### Sincronização em Tempo Real (Realtime)
O aplicativo não utiliza *polling* (buscas a cada X segundos). Em vez disso, no carregamento principal em `App.tsx`, as Stores assinam os canais do Supabase (`supabase.channel().on('postgres_changes', ...).subscribe()`).
Quando um PC altera o status Kanban de um "Projeto" de "A Fazer" para "Feito", todos os outros computadores conectados ao Alenfinos atualizam renderizando o card de forma assíncrona.

---

## 3. Assistente de IA: O Motor Ring (Ollama)

O Alenfinos integra a "Ring IA", uma interface humana conversacional.

### Segurança e Privacidade
Conversas financeiras e tarefas familiares são altamente confidenciais. A arquitetura decidiu usar **Ollama** em comunicação direta API via `localhost:11434`. Todo dado digerido pela IA é inferido *bare-metal*, de forma offline no PC, não existindo tráfego com APIs de terceiros como OpenAI ou Anthropic.

### Instruções Customizadas Injetadas (System Prompts)
Em `chatStore.ts`, o Ollama recebe não só as últimas mensagens, mas um cabeçalho injetado (System Prompt).
Se a variável de contexto for o "Perfil Isis", a Store busca em `localStorage` as "Instruções do Perfil" específicas salvas por ela nas Configurações e concatena antes da inferência, forçando a IA a simular um persona comportamental única predefinida pela Isis.

---

## 4. O Empacotador Nativo (Tauri)

O Vite compila a pasta genérica `dist` para Web, mas o grande objetivo é usar o binário. O Tauri (`src-tauri`) sequestra essa pasta e aloca num frame `WebView2` otimizado no Windows.
As definições de ícones gerados (logo, icns, ico, tamanhos de janelas e min/max bounds) ficam na declaração nativa em `tauri.conf.json`. Módulos OS e de invocação IPC (Inter-Process Communication) podem ser adicionados à medida que o projeto exigir acesso a diretórios ou processamento paralelo no host Windows.
