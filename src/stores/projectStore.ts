import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Project, BoardColumn, BoardCard } from '@/types';

interface ProjectState {
    projects: Project[];
    selectedProjectId: string | null;
    isLoading: boolean;
    fetchProjects: () => Promise<void>;
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'taskCount' | 'completedTasks' | 'columns'>) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    selectProject: (projectId: string | null) => void;
    getProjectsByWorkspace: (workspaceId: string) => Project[];
    addColumn: (projectId: string, title: string) => Promise<void>;
    deleteColumn: (projectId: string, columnId: string) => Promise<void>;
    addCard: (projectId: string, columnId: string, title: string, description?: string) => Promise<void>;
    deleteCard: (projectId: string, columnId: string, cardId: string) => Promise<void>;
    moveCard: (projectId: string, fromColumnId: string, toColumnId: string, cardId: string) => Promise<void>;
    subscribeRealtime: () => () => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            projects: [],
            selectedProjectId: null,
            isLoading: false,

            fetchProjects: async () => {
                if (!isSupabaseConfigured()) return;
                set({ isLoading: true });

                // Fetch projects with columns and cards
                const { data: projectsData, error: pErr } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (pErr || !projectsData) {
                    set({ isLoading: false });
                    return;
                }

                const projects: Project[] = [];

                for (const p of projectsData) {
                    const { data: colsData } = await supabase
                        .from('board_columns')
                        .select('*')
                        .eq('project_id', p.id)
                        .order('position', { ascending: true });

                    const columns: BoardColumn[] = [];
                    for (const col of colsData || []) {
                        const { data: cardsData } = await supabase
                            .from('board_cards')
                            .select('*')
                            .eq('column_id', col.id)
                            .order('position', { ascending: true });

                        columns.push({
                            id: col.id,
                            title: col.title,
                            cards: (cardsData || []).map((c) => ({
                                id: c.id,
                                title: c.title,
                                description: c.description,
                                labels: c.labels || [],
                                createdAt: c.created_at,
                            })),
                        });
                    }

                    const totalCards = columns.reduce((s, col) => s + col.cards.length, 0);
                    const doneCol = columns.find(
                        (c) => c.title.toLowerCase().includes('conclu') || c.title.toLowerCase().includes('pronto') || c.title.toLowerCase().includes('done')
                    );

                    projects.push({
                        id: p.id,
                        workspaceId: p.workspace_id,
                        name: p.name,
                        description: p.description,
                        color: p.color || '#8b5cf6',
                        taskCount: totalCards,
                        completedTasks: doneCol ? doneCol.cards.length : 0,
                        columns,
                        createdAt: p.created_at,
                    });
                }

                set({ projects, isLoading: false });
            },

            addProject: async (projectData) => {
                if (!isSupabaseConfigured()) {
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
                    set((state) => ({ projects: [project, ...state.projects] }));
                    return;
                }

                const { data: pData, error: pErr } = await supabase
                    .from('projects')
                    .insert({
                        workspace_id: projectData.workspaceId,
                        name: projectData.name,
                        description: projectData.description || null,
                        color: projectData.color || '#8b5cf6',
                    })
                    .select()
                    .single();

                if (pErr || !pData) return;

                // Create default columns
                const defaultCols = ['A Fazer', 'Em Progresso', 'Concluído'];
                const columns: BoardColumn[] = [];
                for (let i = 0; i < defaultCols.length; i++) {
                    const { data: colData } = await supabase
                        .from('board_columns')
                        .insert({ project_id: pData.id, title: defaultCols[i], position: i })
                        .select()
                        .single();
                    if (colData) {
                        columns.push({ id: colData.id, title: colData.title, cards: [] });
                    }
                }

                const project: Project = {
                    id: pData.id,
                    workspaceId: pData.workspace_id,
                    name: pData.name,
                    description: pData.description,
                    color: pData.color,
                    taskCount: 0,
                    completedTasks: 0,
                    columns,
                    createdAt: pData.created_at,
                };
                set((state) => ({ projects: [project, ...state.projects] }));
            },

            deleteProject: async (projectId) => {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== projectId),
                    selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId,
                }));

                if (isSupabaseConfigured()) {
                    await supabase.from('projects').delete().eq('id', projectId);
                }
            },

            selectProject: (projectId) => set({ selectedProjectId: projectId }),

            getProjectsByWorkspace: (workspaceId) => {
                return get().projects.filter((p) => p.workspaceId === workspaceId);
            },

            addColumn: async (projectId, title) => {
                const project = get().projects.find((p) => p.id === projectId);
                const position = project ? project.columns.length : 0;

                if (!isSupabaseConfigured()) {
                    set((state) => ({
                        projects: state.projects.map((p) =>
                            p.id === projectId
                                ? { ...p, columns: [...p.columns, { id: `col-${Date.now()}`, title, cards: [] }] }
                                : p
                        ),
                    }));
                    return;
                }

                const { data } = await supabase
                    .from('board_columns')
                    .insert({ project_id: projectId, title, position })
                    .select()
                    .single();

                if (data) {
                    set((state) => ({
                        projects: state.projects.map((p) =>
                            p.id === projectId
                                ? { ...p, columns: [...p.columns, { id: data.id, title: data.title, cards: [] }] }
                                : p
                        ),
                    }));
                }
            },

            deleteColumn: async (projectId, columnId) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId
                            ? { ...p, columns: p.columns.filter((c) => c.id !== columnId) }
                            : p
                    ),
                }));

                if (isSupabaseConfigured()) {
                    await supabase.from('board_columns').delete().eq('id', columnId);
                }
            },

            addCard: async (projectId, columnId, title, description) => {
                const project = get().projects.find((p) => p.id === projectId);
                const column = project?.columns.find((c) => c.id === columnId);
                const position = column ? column.cards.length : 0;

                if (!isSupabaseConfigured()) {
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
                                        col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
                                    ),
                                }
                                : p
                        ),
                    }));
                    return;
                }

                const { data } = await supabase
                    .from('board_cards')
                    .insert({ column_id: columnId, title, description: description || null, position })
                    .select()
                    .single();

                if (data) {
                    const card: BoardCard = {
                        id: data.id,
                        title: data.title,
                        description: data.description,
                        labels: data.labels || [],
                        createdAt: data.created_at,
                    };
                    set((state) => ({
                        projects: state.projects.map((p) =>
                            p.id === projectId
                                ? {
                                    ...p,
                                    taskCount: p.taskCount + 1,
                                    columns: p.columns.map((col) =>
                                        col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
                                    ),
                                }
                                : p
                        ),
                    }));
                }
            },

            deleteCard: async (projectId, columnId, cardId) => {
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

                if (isSupabaseConfigured()) {
                    await supabase.from('board_cards').delete().eq('id', cardId);
                }
            },

            moveCard: async (projectId, fromColumnId, toColumnId, cardId) => {
                const project = get().projects.find((p) => p.id === projectId);
                const fromCol = project?.columns.find((c) => c.id === fromColumnId);
                const card = fromCol?.cards.find((c) => c.id === cardId);
                if (!card) return;

                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== projectId) return p;
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

                if (isSupabaseConfigured()) {
                    const toCol = project?.columns.find((c) => c.id === toColumnId);
                    const newPosition = toCol ? toCol.cards.length : 0;
                    await supabase
                        .from('board_cards')
                        .update({ column_id: toColumnId, position: newPosition })
                        .eq('id', cardId);
                }
            },

            subscribeRealtime: () => {
                if (!isSupabaseConfigured()) return () => { };

                const channel = supabase
                    .channel('projects-changes')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
                        get().fetchProjects();
                    })
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'board_columns' }, () => {
                        get().fetchProjects();
                    })
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'board_cards' }, () => {
                        get().fetchProjects();
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            },
        }),
        {
            name: 'alenfinos-projects',
            partialize: (state) => ({
                projects: state.projects,
                selectedProjectId: state.selectedProjectId,
            }),
        }
    )
);
