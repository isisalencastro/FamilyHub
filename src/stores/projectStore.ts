import { create } from 'zustand';
import type { Project } from '@/types';

const DEMO_PROJECTS: Project[] = [
    {
        id: '1',
        workspaceId: 'isis',
        name: 'Ring AI',
        description: 'Assistente de IA pessoal e familiar',
        color: '#8b5cf6',
        taskCount: 5,
        completedTasks: 2,
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
        createdAt: new Date().toISOString(),
    },
];

interface ProjectState {
    projects: Project[];
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'taskCount' | 'completedTasks'>) => void;
    getProjectsByWorkspace: (workspaceId: string) => Project[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: DEMO_PROJECTS,

    addProject: (projectData) => {
        const project: Project = {
            ...projectData,
            id: Date.now().toString(),
            taskCount: 0,
            completedTasks: 0,
            createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, project] }));
    },

    getProjectsByWorkspace: (workspaceId) => {
        return get().projects.filter((p) => p.workspaceId === workspaceId);
    },
}));
