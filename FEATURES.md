# Guia de Funcionalidades - Alenfinos Intranet

Para que qualquer usuário (ou novo programador) consiga entender o alcance atual da plataforma, este documento lista e explica todas as funcionalidades disponíveis.

## 🏠 Visão Geral (Dashboard da Família)
Ao abrir o aplicativo, o Dashboard principal fornece um agregador global da casa. Ele foi projetado para exibir o estado colaborativo:
*   **Contadores de Produtividade**: Mostra a contagem total de Tarefas Pendentes, Feitas e Projetos da Família.
*   **Resumo Financeiro da Casa**: Cartão visual rápido com Total de despesas, receitas e o Saldo da família daquele período através de barras de progresso verde/vermelhas e saldos gerais.
*   **Atalhos Rápidos**: Botões no final para acesso instantâneo ao Chat com a Ring, Projetos em Andamento e o Cofre de Documentos.

## 👤 Espaços Individuais Compartimentados (Isis & Angélica)
Através da **Sidebar Inferior (Alternar Perfil)**, o Alenfinos modifica inteiramente o seu contexto.
*   Ao invés de visualizar o que acontece "na casa", os cliques migram tudo o que é carregado para a visualização individual.
*   **Finanças Privadas:** Você pode controlar seus próprios boletos e salários sem misturar com as despesas que são conjuntas e divididas no painel Família.
*   **Tarefas Pessoais:** Controle de backlog e tarefas cotidianas particulares isoladas.

## 🤖 Ring IA (Sua Assistente Local)
Implementada nativamente na interface.
*   **Offline First, Privacy First:** Usa modelos abertos via Ollama (recomendado: *Llama 3.2* ou *Mistral*). Nenhum dado do teclado vaza pela internet.
*   **Ring Instructions (Comportamentos Customizados):** Em Configurações, você pode escrever regras detalhadas de "Como a Ring deve agir" para cada perfil, independentemente. Se a Angélica quer respostas curtas, ela define no perfil dela. Se a Isis quer respostas detalhadas com terminologia técnica, define de forma isolada.
*   **Memória Adaptativa (Long-Term Memory):** A Ring escuta "Fatos", "Preferências" e "Rotinas", extraindo dados conversacionais para usar futuramente contra as perguntas que envolvam histórico.

## 💰 Gerenciamento Financeiro (Finanças)
*   Integra importação manual ou simples de transações.
*   Layout baseado em listas de cores dinâmicas para perdas (despesas) ou ganhos (receitas).
*   Suporte a Ícones por Categoria (Moradia, Saúde, Lazer, etc).
*   Visualizações detalhadas para deleção e histórico.

## 📝 Gestão de Projetos (Kanban) e Tarefas (Todo)
*   **Tasks:** Todo-list linear com suporte a tags de prioridade (Alta, Média, Baixa) e marcação mágica com cliques duplos (concluído).
*   **Projetos (Kanban):** Tabuleiros inspirados no Trello, para arranjo em colunas horizontais de projetos criativos mais duradouros ou complexos.

## 📄 Guardião de Documentos
Acesso estritamente no perfil Família para guardar de forma acessível e rápida informações categorizadas de extrema importância (identidade do morador X, garantias do eletrodoméstico Y, boletos residenciais).

## ⚙️ Configurações e Diagnóstico de Sistema
*   Monitor de Conexão com Supabase (exibe se o LiveSync e a cloud estão operantes).
*   Gerenciamento completo do Status do Ollama e seleção do modelo ativo no Dropdown sem necessidade de comandos de terminal se a máquina local já fornecer a porta `11434`.
