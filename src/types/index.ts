export interface Workspace {
    id: string;
    name: string;
    displayName: string;
    avatar: string;
    color: string;
}

export interface Task {
    id: string;
    workspaceId: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'done';
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    projectId?: string;
    createdAt: string;
}

export interface Project {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    color: string;
    taskCount: number;
    completedTasks: number;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    workspaceId: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface Memory {
    id: string;
    workspaceId: string;
    content: string;
    category: 'preference' | 'fact' | 'task' | 'relationship' | 'routine';
    createdAt: string;
}
