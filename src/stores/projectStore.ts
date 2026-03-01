import { create } from 'zustand';
import type { Project, BoardColumn, BoardCard } from '@/types';

const DEMO_PROJECTS: Project[] = [
    {
        id: '1',
        workspaceId: 'isis',
        name: 'Ring AI',
        description: 'Assistente de IA pessoal e familiar',
        color: '#8b5cf6',
        taskCount: 5,
        completedTasks: 2,
        columns: [
            {
                id: 'col-1-1',
                title: 'A Fazer',
                cards: [
                    { id: 'c1', title: 'Integrar API do Ollama', description: 'Conectar chat com modelos locais', labels: ['backend'], createdAt: new Date().toISOString() },
                    { id: 'c2', title: 'Implementar memória', labels: ['feature'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-1-2',
                title: 'Em Progresso',
                cards: [
                    { id: 'c3', title: 'Design do Dashboard', description: 'Layout com widgets', labels: ['design'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-1-3',
                title: 'Concluído',
                cards: [
                    { id: 'c4', title: 'Setup Tauri + React', labels: ['infra'], createdAt: new Date().toISOString() },
                    { id: 'c5', title: 'Sidebar e navegação', labels: ['ui'], createdAt: new Date().toISOString() },
                ],
            },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        workspaceId: 'isis',
        name: 'MentalSaaS',
        description: 'Plataforma de saúde mental',
        color: '#3b82f6',
        taskCount: 8,
        completedTasks: 4,
        columns: [
            {
                id: 'col-2-1',
                title: 'A Fazer',
                cards: [
                    { id: 'c6', title: 'Landing page', labels: ['frontend'], createdAt: new Date().toISOString() },
                    { id: 'c7', title: 'Sistema de pagamentos', labels: ['backend'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-2-2',
                title: 'Em Progresso',
                cards: [
                    { id: 'c8', title: 'Dashboard do paciente', labels: ['frontend'], createdAt: new Date().toISOString() },
                    { id: 'c9', title: 'API REST com NestJS', labels: ['backend'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-2-3',
                title: 'Concluído',
                cards: [
                    { id: 'c10', title: 'Setup Supabase', labels: ['infra'], createdAt: new Date().toISOString() },
                    { id: 'c11', title: 'Schema do banco', labels: ['backend'], createdAt: new Date().toISOString() },
                    { id: 'c12', title: 'Auth com Supabase', labels: ['auth'], createdAt: new Date().toISOString() },
                    { id: 'c13', title: 'Prisma ORM setup', labels: ['backend'], createdAt: new Date().toISOString() },
                ],
            },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        workspaceId: 'angelica',
        name: 'Organização Casa',
        description: 'Tarefas domésticas e organização',
        color: '#ec4899',
        taskCount: 6,
        completedTasks: 3,
        columns: [
            {
                id: 'col-3-1',
                title: 'A Fazer',
                cards: [
                    { id: 'c14', title: 'Organizar guarda-roupa', labels: ['casa'], createdAt: new Date().toISOString() },
                    { id: 'c15', title: 'Limpar despensa', labels: ['casa'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-3-2',
                title: 'Em Progresso',
                cards: [
                    { id: 'c16', title: 'Reorganizar cozinha', labels: ['casa'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-3-3',
                title: 'Concluído',
                cards: [
                    { id: 'c17', title: 'Faxina geral', labels: ['casa'], createdAt: new Date().toISOString() },
                    { id: 'c18', title: 'Comprar organizadores', labels: ['compras'], createdAt: new Date().toISOString() },
                    { id: 'c19', title: 'Montar prateleiras', labels: ['casa'], createdAt: new Date().toISOString() },
                ],
            },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '4',
        workspaceId: 'familia',
        name: 'Finanças',
        description: 'Controle financeiro da família',
        color: '#06b6d4',
        taskCount: 4,
        completedTasks: 1,
        columns: [
            {
                id: 'col-4-1',
                title: 'A Fazer',
                cards: [
                    { id: 'c20', title: 'Fechar orçamento de março', labels: ['finanças'], createdAt: new Date().toISOString() },
                    { id: 'c21', title: 'Pesquisar investimentos', labels: ['finanças'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-4-2',
                title: 'Em Progresso',
                cards: [
                    { id: 'c22', title: 'Revisar gastos de fevereiro', labels: ['finanças'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-4-3',
                title: 'Concluído',
                cards: [
                    { id: 'c23', title: 'Montar planilha mensal', labels: ['finanças'], createdAt: new Date().toISOString() },
                ],
            },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '5',
        workspaceId: 'familia',
        name: 'Viagem 2026',
        description: 'Planejamento da viagem de férias',
        color: '#f59e0b',
        taskCount: 7,
        completedTasks: 2,
        columns: [
            {
                id: 'col-5-1',
                title: 'Pesquisar',
                cards: [
                    { id: 'c24', title: 'Pesquisar destinos', description: 'Praia ou montanha?', labels: ['pesquisa'], createdAt: new Date().toISOString() },
                    { id: 'c25', title: 'Comparar preços de hospedagem', labels: ['pesquisa'], createdAt: new Date().toISOString() },
                    { id: 'c26', title: 'Ver roteiro de passeios', labels: ['pesquisa'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-5-2',
                title: 'Reservar',
                cards: [
                    { id: 'c27', title: 'Reservar passagens', labels: ['reserva'], createdAt: new Date().toISOString() },
                    { id: 'c28', title: 'Reservar hotel', labels: ['reserva'], createdAt: new Date().toISOString() },
                ],
            },
            {
                id: 'col-5-3',
                title: 'Pronto',
                cards: [
                    { id: 'c29', title: 'Definir datas', labels: ['organização'], createdAt: new Date().toISOString() },
                    { id: 'c30', title: 'Criar lista de malas', labels: ['organização'], createdAt: new Date().toISOString() },
                ],
            },
        ],
        createdAt: new Date().toISOString(),
    },
];

interface ProjectState {
    projects: Project[];
    selectedProjectId: string | null;
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'taskCount' | 'completedTasks' | 'columns'>) => void;
    deleteProject: (projectId: string) => void;
    selectProject: (projectId: string | null) => void;
    getProjectsByWorkspace: (workspaceId: string) => Project[];
    addColumn: (projectId: string, title: string) => void;
    deleteColumn: (projectId: string, columnId: string) => void;
    addCard: (projectId: string, columnId: string, title: string, description?: string) => void;
    deleteCard: (projectId: string, columnId: string, cardId: string) => void;
    moveCard: (projectId: string, fromColumnId: string, toColumnId: string, cardId: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: DEMO_PROJECTS,
    selectedProjectId: null,

    addProject: (projectData) => {
        const project: Project = {
            ...projectData,
            id: Date.now().toString(),
            taskCount: 0,
            completedTasks: 0,
            columns: [
                { id: `col-${Date.now()}-1`, title: 'A Fazer', cards: [] },
                { id: `col-${Date.now()}-2`, title: 'Em Progresso', cards: [] },
                { id: `col-${Date.now()}-3`, title: 'Concluído', cards: [] },
            ],
            createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, project] }));
    },

    deleteProject: (projectId) => {
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
            selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId,
        }));
    },

    selectProject: (projectId) => {
        set({ selectedProjectId: projectId });
    },

    getProjectsByWorkspace: (workspaceId) => {
        return get().projects.filter((p) => p.workspaceId === workspaceId);
    },

    addColumn: (projectId, title) => {
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        columns: [
                            ...p.columns,
                            { id: `col-${Date.now()}`, title, cards: [] },
                        ],
                    }
                    : p
            ),
        }));
    },

    deleteColumn: (projectId, columnId) => {
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? { ...p, columns: p.columns.filter((c) => c.id !== columnId) }
                    : p
            ),
        }));
    },

    addCard: (projectId, columnId, title, description) => {
        const card: BoardCard = {
            id: `card-${Date.now()}`,
            title,
            description,
            createdAt: new Date().toISOString(),
        };
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        taskCount: p.taskCount + 1,
                        columns: p.columns.map((col) =>
                            col.id === columnId
                                ? { ...col, cards: [...col.cards, card] }
                                : col
                        ),
                    }
                    : p
            ),
        }));
    },

    deleteCard: (projectId, columnId, cardId) => {
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        taskCount: Math.max(0, p.taskCount - 1),
                        columns: p.columns.map((col) =>
                            col.id === columnId
                                ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
                                : col
                        ),
                    }
                    : p
            ),
        }));
    },

    moveCard: (projectId, fromColumnId, toColumnId, cardId) => {
        set((state) => ({
            projects: state.projects.map((p) => {
                if (p.id !== projectId) return p;
                const fromCol = p.columns.find((c) => c.id === fromColumnId);
                const card = fromCol?.cards.find((c) => c.id === cardId);
                if (!card) return p;
                return {
                    ...p,
                    columns: p.columns.map((col) => {
                        if (col.id === fromColumnId) {
                            return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
                        }
                        if (col.id === toColumnId) {
                            return { ...col, cards: [...col.cards, card] };
                        }
                        return col;
                    }),
                };
            }),
        }));
    },
}));
