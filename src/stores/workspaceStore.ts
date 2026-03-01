import { create } from 'zustand';
import type { Workspace } from '@/types';

export const WORKSPACES: Workspace[] = [
    {
        id: 'isis',
        name: 'isis',
        displayName: 'Isis',
        avatar: 'I',
        color: 'isis',
    },
    {
        id: 'angelica',
        name: 'angelica',
        displayName: 'Angélica',
        avatar: 'A',
        color: 'angelica',
    },
    {
        id: 'familia',
        name: 'familia',
        displayName: 'Família',
        avatar: 'F',
        color: 'familia',
    },
];

interface WorkspaceState {
    activeWorkspace: Workspace;
    setActiveWorkspace: (workspace: Workspace) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    activeWorkspace: WORKSPACES[0],
    setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));
