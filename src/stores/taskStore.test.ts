import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from './taskStore';

// Mock supabase to always return "not configured" so tests use local mode
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: () => ({ select: () => ({ order: () => ({ data: [], error: null }) }), insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }), update: () => ({ eq: () => ({}) }), delete: () => ({ eq: () => ({}) }) }),
        channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
        removeChannel: () => { },
    },
    isSupabaseConfigured: () => false,
}));

describe('taskStore', () => {
    beforeEach(() => {
        // Reset the store before each test
        useTaskStore.setState({ tasks: [], isLoading: false });
    });

    test('deve iniciar com um array vazio de tarefas', () => {
        const state = useTaskStore.getState();
        expect(state.tasks).toEqual([]);
        expect(state.isLoading).toBe(false);
    });

    test('deve adicionar uma tarefa em modo local', async () => {
        const store = useTaskStore.getState();
        await store.addTask({
            workspaceId: 'familia',
            title: 'Tarefa de teste',
            description: 'Descrição teste',
            status: 'pending',
            priority: 'medium',
        });

        const state = useTaskStore.getState();
        expect(state.tasks.length).toBe(1);
        expect(state.tasks[0].title).toBe('Tarefa de teste');
        expect(state.tasks[0].status).toBe('pending');
        expect(state.tasks[0].priority).toBe('medium');
        expect(state.tasks[0].workspaceId).toBe('familia');
        expect(state.tasks[0].id).toBeDefined();
        expect(state.tasks[0].createdAt).toBeDefined();
    });

    test('deve alternar status da tarefa (toggle)', async () => {
        const store = useTaskStore.getState();
        await store.addTask({
            workspaceId: 'familia',
            title: 'Toggle test',
            status: 'pending',
            priority: 'low',
        });

        let state = useTaskStore.getState();
        const taskId = state.tasks[0].id;

        // Toggle para done
        await store.toggleTask(taskId);
        state = useTaskStore.getState();
        expect(state.tasks[0].status).toBe('done');

        // Toggle de volta para pending
        await store.toggleTask(taskId);
        state = useTaskStore.getState();
        expect(state.tasks[0].status).toBe('pending');
    });

    test('deve deletar uma tarefa', async () => {
        const store = useTaskStore.getState();
        await store.addTask({
            workspaceId: 'familia',
            title: 'Delete test',
            status: 'pending',
            priority: 'high',
        });

        let state = useTaskStore.getState();
        expect(state.tasks.length).toBe(1);

        await store.deleteTask(state.tasks[0].id);
        state = useTaskStore.getState();
        expect(state.tasks.length).toBe(0);
    });

    test('deve filtrar tarefas por workspace', async () => {
        const store = useTaskStore.getState();
        await store.addTask({ workspaceId: 'familia', title: 'Família 1', status: 'pending', priority: 'low' });
        await store.addTask({ workspaceId: 'user2', title: 'User2 1', status: 'pending', priority: 'low' });
        await store.addTask({ workspaceId: 'familia', title: 'Família 2', status: 'done', priority: 'high' });

        const familiaTasks = store.getTasksByWorkspace('familia');
        expect(familiaTasks.length).toBe(2);
        expect(familiaTasks.every(t => t.workspaceId === 'familia')).toBe(true);

        const user2Tasks = store.getTasksByWorkspace('user2');
        expect(user2Tasks.length).toBe(1);
        expect(user2Tasks[0].title).toBe('User2 1');
    });

    test('deve adicionar múltiplas tarefas e manter a ordem (mais recente primeiro)', async () => {
        const store = useTaskStore.getState();
        await store.addTask({ workspaceId: 'familia', title: 'Primeira', status: 'pending', priority: 'low' });
        await store.addTask({ workspaceId: 'familia', title: 'Segunda', status: 'pending', priority: 'medium' });
        await store.addTask({ workspaceId: 'familia', title: 'Terceira', status: 'pending', priority: 'high' });

        const state = useTaskStore.getState();
        expect(state.tasks.length).toBe(3);
        // Most recent first (addTask prepends)
        expect(state.tasks[0].title).toBe('Terceira');
        expect(state.tasks[2].title).toBe('Primeira');
    });
});
