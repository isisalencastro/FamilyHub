import { create } from 'zustand';
import type { FinanceTransaction, FinanceSummary } from '@/types';

const DEMO_TRANSACTIONS: FinanceTransaction[] = [
    // Familia transactions
    {
        id: '1',
        workspaceId: 'familia',
        type: 'income',
        amount: 8500,
        category: 'Salário',
        description: 'Salário mensal - Angélica',
        date: '2026-03-01',
    },
    {
        id: '2',
        workspaceId: 'familia',
        type: 'income',
        amount: 3200,
        category: 'Freelance',
        description: 'Projeto freelance - Isis',
        date: '2026-02-28',
    },
    {
        id: '3',
        workspaceId: 'familia',
        type: 'expense',
        amount: 1800,
        category: 'Moradia',
        description: 'Aluguel - Março',
        date: '2026-03-01',
    },
    {
        id: '4',
        workspaceId: 'familia',
        type: 'expense',
        amount: 650,
        category: 'Mercado',
        description: 'Compras do mês - Supermercado',
        date: '2026-02-27',
    },
    {
        id: '5',
        workspaceId: 'familia',
        type: 'expense',
        amount: 320,
        category: 'Transporte',
        description: 'Combustível e transporte',
        date: '2026-02-26',
    },
    {
        id: '6',
        workspaceId: 'familia',
        type: 'expense',
        amount: 180,
        category: 'Saúde',
        description: 'Plano de saúde',
        date: '2026-02-25',
    },
    {
        id: '7',
        workspaceId: 'familia',
        type: 'expense',
        amount: 250,
        category: 'Educação',
        description: 'Curso online - Isis',
        date: '2026-02-24',
    },
    {
        id: '8',
        workspaceId: 'familia',
        type: 'income',
        amount: 500,
        category: 'Outros',
        description: 'Venda de itens usados',
        date: '2026-02-23',
    },
    {
        id: '9',
        workspaceId: 'familia',
        type: 'expense',
        amount: 120,
        category: 'Lazer',
        description: 'Cinema e jantar fora',
        date: '2026-02-22',
    },
    {
        id: '10',
        workspaceId: 'familia',
        type: 'expense',
        amount: 95,
        category: 'Serviços',
        description: 'Internet e streaming',
        date: '2026-02-21',
    },
    // Isis personal
    {
        id: '11',
        workspaceId: 'isis',
        type: 'income',
        amount: 3200,
        category: 'Freelance',
        description: 'Projeto de desenvolvimento',
        date: '2026-02-28',
    },
    {
        id: '12',
        workspaceId: 'isis',
        type: 'expense',
        amount: 250,
        category: 'Educação',
        description: 'Assinatura Udemy',
        date: '2026-02-25',
    },
    // Angelica personal
    {
        id: '13',
        workspaceId: 'angelica',
        type: 'income',
        amount: 8500,
        category: 'Salário',
        description: 'Salário mensal',
        date: '2026-03-01',
    },
    {
        id: '14',
        workspaceId: 'angelica',
        type: 'expense',
        amount: 340,
        category: 'Saúde',
        description: 'Consulta médica',
        date: '2026-02-26',
    },
];

const EXPENSE_CATEGORIES = [
    'Moradia', 'Mercado', 'Transporte', 'Saúde', 'Educação',
    'Lazer', 'Serviços', 'Vestuário', 'Outros',
];

const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Investimentos', 'Outros'];

interface FinanceState {
    transactions: FinanceTransaction[];
    brenoAppUrl: string;
    addTransaction: (tx: Omit<FinanceTransaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    getSummaryByWorkspace: (workspaceId: string) => FinanceSummary;
    getTransactionsByWorkspace: (workspaceId: string) => FinanceTransaction[];
    getExpenseCategories: () => string[];
    getIncomeCategories: () => string[];
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    transactions: DEMO_TRANSACTIONS,
    brenoAppUrl: '', // URL do app do Breno - configurável nas settings

    addTransaction: (txData) => {
        const tx: FinanceTransaction = {
            ...txData,
            id: Date.now().toString(),
        };
        set((state) => ({ transactions: [...state.transactions, tx] }));
    },

    deleteTransaction: (id) => {
        set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
        }));
    },

    getSummaryByWorkspace: (workspaceId) => {
        const txs = get().transactions.filter((t) => t.workspaceId === workspaceId);
        const totalIncome = txs
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = txs
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
        };
    },

    getTransactionsByWorkspace: (workspaceId) => {
        return get()
            .transactions.filter((t) => t.workspaceId === workspaceId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    getExpenseCategories: () => EXPENSE_CATEGORIES,
    getIncomeCategories: () => INCOME_CATEGORIES,
}));
