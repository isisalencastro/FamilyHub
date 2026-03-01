import { create } from 'zustand';
import type { Task } from '@/types';

// Demo tasks for each workspace
const DEMO_TASKS: Task[] = [
    // Isis tasks
    {
        id: '1',
        workspaceId: 'isis',
        title: 'Finalizar protótipo do Ring AI',
        description: 'Implementar o chat com Ollama e integração de memória',
        status: 'in_progress',
        priority: 'high',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        workspaceId: 'isis',
        title: 'Estudar Rust para plugins do Tauri',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        workspaceId: 'isis',
        title: 'Configurar CI/CD do projeto',
        status: 'pending',
        priority: 'low',
        createdAt: new Date().toISOString(),
    },
    {
        id: '4',
        workspaceId: 'isis',
        title: 'Revisar design do dashboard',
        status: 'done',
        priority: 'medium',
        createdAt: new Date().toISOString(),
    },
    // Angelica tasks
    {
        id: '5',
        workspaceId: 'angelica',
        title: 'Organizar agenda da semana',
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
    },
    {
        id: '6',
        workspaceId: 'angelica',
        title: 'Pesquisar receitas saudáveis',
        status: 'in_progress',
        priority: 'medium',
        createdAt: new Date().toISOString(),
    },
    // Familia tasks
    {
        id: '7',
        workspaceId: 'familia',
        title: 'Planejar viagem de férias',
        status: 'in_progress',
        priority: 'high',
        createdAt: new Date().toISOString(),
    },
    {
        id: '8',
        workspaceId: 'familia',
        title: 'Fazer compras do mês',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
    },
    {
        id: '9',
        workspaceId: 'familia',
        title: 'Revisar orçamento mensal',
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
    },
];

interface TaskState {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    toggleTask: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
    getTasksByWorkspace: (workspaceId: string) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: DEMO_TASKS,

    addTask: (taskData) => {
        const task: Task = {
            ...taskData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
    },

    toggleTask: (taskId) => {
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === taskId
                    ? { ...t, status: t.status === 'done' ? 'pending' : 'done' as Task['status'] }
                    : t
            ),
        }));
    },

    deleteTask: (taskId) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
    },

    getTasksByWorkspace: (workspaceId) => {
        return get().tasks.filter((t) => t.workspaceId === workspaceId);
    },
}));
