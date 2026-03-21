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
    createdAt: string;
}

// Finance types
export interface FinanceTransaction {
    id: string;
    workspaceId: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
}

export interface FinanceSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

// Docs types
export type DocCategory = 'identidade' | 'comprovantes' | 'contratos' | 'saude' | 'educacao' | 'outros';

export interface FamilyDocument {
    id: string;
    name: string;
    category: DocCategory;
    owner: string; // workspace member name
    fileSize?: string;
    filePath?: string; // local file path for uploaded documents
    uploadedAt: string;
    tags?: string[];
}
