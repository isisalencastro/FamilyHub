# Como Contribuir para o Alenfinos Intranet

Seja bem-vindo(a) à página de desenvolvimento e guidelines do projeto Alenfinos. Aqui estão os padrões de codificação, nomenclatura e fluxo que devem ser seguidos para garantir a manutenção rápida do repositório.

## 1. Fluxo de Git

-   A ramificação principal do projeto é a `main`. Tudo na main deve estar em estado funcional.
-   Mantenha nomes de commits semânticos em inglês ou português claro. (Ex: `feat(ui): add custom instructions to profile`, `fix(finance): prevent negative division crash`).

## 2. Padrões de Código e UI
Para manter o software homogêneo, siga à risca as seguintes orientações de design e implementação de código.

### Estilização (UI / Vanilla CSS)
- O projeto não usa bibliotecas utilitárias verbosas por padrão (como TailwindCSS), privilegiando folhas de estilo limpas e customizadas que estão aglomeradas via `index.css`.
-   **CSS Variables:** Sempre use as variáveis globais que estão definidas para prever compatibilidades estéticas, exemplo: `var(--color-bg-primary)`, `var(--color-text-secondary)`, `var(--radius-md)`.
-   **Design Premium:** Os componentes do aplicativo utilizam conceitos de *Glassmorphism*, paletas vibrantes de roxo, rosa, verde-menta, sombras projetadas (box-shadow) densas em dark modes e cantos arredondados extensivos. Sempre preserve essa assinatura. 

### Estrutura de Componentes Funcionais (React)
-   Prefira sempre construir os componentes num paradigma Funcional utilizando Hooks nativos (`useState`, `useEffect`).
-   Quando componentes React ficarem gigantescos, subdivida-os em arquivos isolados dentro da pasta estendida de domínios ou numa pasta `src/components/common/`.
- Ícones vetoriais devem provir unicamente da biblioteca `lucide-react`.

### Arquitetura de Estado (Zustand)
-   Sempre que precisar trafegar ou engessar uma mutação que tenha de afetar a aplicação num aspecto global (ou sincronizado ao banco de dados), use o `zustand`. Evite fura-telas com "prop drilling" profundo em contextos que requeiram apenas persistência assíncrona.
-   Funções que interagem com a API oficial do backend (o Supabase) e salvam os dados devem ser embutidas dentro do Zustand também. 
- Mantenha a interface do Zustand imutável antes da reatribuição `set((state) => ({}))`.

## 3. Fluxo Simples de Implementação de Feature

1.  Crie as **Interfaces/Types** em `src/types/index.ts` que definem sua estrutura base.
2.  Projete as requisições, manipulações e chamadas assíncronas do DB Supabase em uma Store Zustand `src/stores/minhaStore.ts`.
3.  Implemente a nova seção JSX na pasta `pages/` ou componente na `components/`, linkando-a com as chamadas nativas de store através do gancho principal `const { dados } = useMinhaStore()`.
4. Garanta a filtragem de acesso per-Perfil. Sempre compare itens em lista ou banco com o `activeWorkspace.id` do `workspaceStore`, nunca renderize itens globais sem autorização no painel isolado.

## 4. Testando Mudanças no App de Mesa (Desktop)
Apenas testar no ambiente host via navegador (`npm run dev`) pode camuflar comportamentos anômalos no webview do Tauri e Windows OS.

Sempre que a sua alteração envolver:
- Integrações de Sistema (Invocação de IPC `invoke(...)` pro backend em Rust).
- Acesso ao hardware, GPU local ou rede Ollama fora de sandboxes.
- Mudanças drásticas na exibição e responsidade dos elementos

**Use o comando de Debug Nativo do Tauri:**
```bash
npm run tauri dev
```
Ele abrirá o app nativamente onde as interações, ferramentas de devtools exclusivas do webview e IPC bridge podem ser depuradas pelo console real que rodará na máquina do usuário.
