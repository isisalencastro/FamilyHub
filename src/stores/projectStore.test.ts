import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useProjectStore } from './projectStore';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({ order: () => ({ data: [], error: null }) }),
            insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
            update: () => ({ eq: () => ({}) }),
            delete: () => ({ eq: () => ({}) }),
        }),
        channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
        removeChannel: () => { },
    },
    isSupabaseConfigured: () => false,
}));

describe('projectStore', () => {
    beforeEach(() => {
        useProjectStore.setState({ projects: [], selectedProjectId: null, isLoading: false });
    });

    test('deve iniciar vazio', () => {
        const state = useProjectStore.getState();
        expect(state.projects).toEqual([]);
        expect(state.selectedProjectId).toBeNull();
    });

    test('deve adicionar um projeto em modo local', async () => {
        const store = useProjectStore.getState();
        await store.addProject({
            workspaceId: 'familia',
            name: 'Projeto Teste',
            description: 'Descrição do projeto',
            color: '#8b5cf6',
        });

        const state = useProjectStore.getState();
        expect(state.projects.length).toBe(1);
        expect(state.projects[0].name).toBe('Projeto Teste');
        expect(state.projects[0].color).toBe('#8b5cf6');
        expect(state.projects[0].workspaceId).toBe('familia');
        // Should have default columns (if any — depends on impl)
    });

    test('deve selecionar e deselecionar um projeto', async () => {
        const store = useProjectStore.getState();
        await store.addProject({
            workspaceId: 'familia',
            name: 'Selecionar Test',
            color: '#3b82f6',
        });

        let state = useProjectStore.getState();
        const projectId = state.projects[0].id;

        store.selectProject(projectId);
        state = useProjectStore.getState();
        expect(state.selectedProjectId).toBe(projectId);

        store.selectProject(null);
        state = useProjectStore.getState();
        expect(state.selectedProjectId).toBeNull();
    });

    test('deve deletar um projeto', async () => {
        const store = useProjectStore.getState();
        await store.addProject({
            workspaceId: 'familia',
            name: 'Deletar Test',
            color: '#ef4444',
        });

        let state = useProjectStore.getState();
        expect(state.projects.length).toBe(1);

        await store.deleteProject(state.projects[0].id);
        state = useProjectStore.getState();
        expect(state.projects.length).toBe(0);
    });

    test('deve adicionar e deletar colunas', async () => {
        const store = useProjectStore.getState();
        await store.addProject({
            workspaceId: 'familia',
            name: 'Colunas Test',
            color: '#22c55e',
        });

        let state = useProjectStore.getState();
        const projectId = state.projects[0].id;
        const initialCols = state.projects[0].columns.length;

        await store.addColumn(projectId, 'Nova Coluna');
        state = useProjectStore.getState();
        expect(state.projects[0].columns.length).toBe(initialCols + 1);

        const newCol = state.projects[0].columns.find(c => c.title === 'Nova Coluna');
        expect(newCol).toBeDefined();

        if (newCol) {
            await store.deleteColumn(projectId, newCol.id);
            state = useProjectStore.getState();
            expect(state.projects[0].columns.length).toBe(initialCols);
        }
    });

    test('deve adicionar e deletar cards em uma coluna', async () => {
        const store = useProjectStore.getState();
        await store.addProject({
            workspaceId: 'familia',
            name: 'Cards Test',
            color: '#f59e0b',
        });

        let state = useProjectStore.getState();
        const projectId = state.projects[0].id;

        // Add a column first
        await store.addColumn(projectId, 'Backlog');
        state = useProjectStore.getState();
        const columnId = state.projects[0].columns.find(c => c.title === 'Backlog')!.id;

        // Add a card
        await store.addCard(projectId, columnId, 'Card de Teste', 'Descrição');
        state = useProjectStore.getState();
        const column = state.projects[0].columns.find(c => c.id === columnId)!;
        expect(column.cards.length).toBe(1);
        expect(column.cards[0].title).toBe('Card de Teste');
        expect(column.cards[0].description).toBe('Descrição');

        // Delete the card
        await store.deleteCard(projectId, columnId, column.cards[0].id);
        state = useProjectStore.getState();
        const updatedCol = state.projects[0].columns.find(c => c.id === columnId)!;
        expect(updatedCol.cards.length).toBe(0);
    });

    test('deve mover card entre colunas', async () => {
        const store = useProjectStore.getState();
        await store.addProject({
            workspaceId: 'familia',
            name: 'Move Test',
            color: '#06b6d4',
        });

        let state = useProjectStore.getState();
        const projectId = state.projects[0].id;

        // Create two columns
        await store.addColumn(projectId, 'A Fazer');
        await store.addColumn(projectId, 'Fazendo');
        state = useProjectStore.getState();

        const col1 = state.projects[0].columns.find(c => c.title === 'A Fazer')!;
        const col2 = state.projects[0].columns.find(c => c.title === 'Fazendo')!;

        // Add card to column 1
        await store.addCard(projectId, col1.id, 'Card Move', undefined);
        state = useProjectStore.getState();
        const cardId = state.projects[0].columns.find(c => c.id === col1.id)!.cards[0].id;

        // Move card from col1 to col2
        await store.moveCard(projectId, col1.id, col2.id, cardId);
        state = useProjectStore.getState();

        const updatedCol1 = state.projects[0].columns.find(c => c.id === col1.id)!;
        const updatedCol2 = state.projects[0].columns.find(c => c.id === col2.id)!;

        expect(updatedCol1.cards.length).toBe(0);
        expect(updatedCol2.cards.length).toBe(1);
        expect(updatedCol2.cards[0].title).toBe('Card Move');
    });

    test('deve filtrar projetos por workspace', async () => {
        const store = useProjectStore.getState();
        await store.addProject({ workspaceId: 'familia', name: 'P1', color: '#fff' });
        await store.addProject({ workspaceId: 'isis', name: 'P2', color: '#000' });

        const famProjects = store.getProjectsByWorkspace('familia');
        expect(famProjects.length).toBe(1);
        expect(famProjects[0].name).toBe('P1');

        const isisProjects = store.getProjectsByWorkspace('isis');
        expect(isisProjects.length).toBe(1);
        expect(isisProjects[0].name).toBe('P2');
    });
});
