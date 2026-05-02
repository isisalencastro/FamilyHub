import { create } from 'zustand';
import type { Workspace } from '@/types';

export const WORKSPACES: Workspace[] = [
    {
        id: 'user2',
        name: 'user2',
        displayName: 'User 2',
        avatar: 'I',
        color: 'user2',
    },
    {
        id: 'user1',
        name: 'user1',
        displayName: 'User 1',
        avatar: 'A',
        color: 'user1',
    },
    {
        id: 'familia',
        name: 'familia',
        displayName: 'Visão Geral',
        avatar: 'VG',
        color: 'familia',
    },
];

interface WorkspaceState {
    activeWorkspace: Workspace;
    setActiveWorkspace: (workspace: Workspace) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    activeWorkspace: WORKSPACES[2], // Starts on 'Visão Geral'
    setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));
