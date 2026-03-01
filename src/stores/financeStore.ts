import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { FinanceTransaction, FinanceSummary } from '@/types';

const EXPENSE_CATEGORIES = [
    'Moradia', 'Mercado', 'Transporte', 'Saúde', 'Educação',
    'Lazer', 'Serviços', 'Vestuário', 'Outros',
];

const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Investimentos', 'Outros'];

interface FinanceState {
    transactions: FinanceTransaction[];
    isLoading: boolean;
    fetchTransactions: () => Promise<void>;
    addTransaction: (tx: Omit<FinanceTransaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    getSummaryByWorkspace: (workspaceId: string) => FinanceSummary;
    getTransactionsByWorkspace: (workspaceId: string) => FinanceTransaction[];
    getExpenseCategories: () => string[];
    getIncomeCategories: () => string[];
    subscribeRealtime: () => () => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    transactions: [],
    isLoading: false,

    fetchTransactions: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (!error && data) {
            set({
                transactions: data.map((t) => ({
                    id: t.id,
                    workspaceId: t.workspace_id,
                    type: t.type as 'income' | 'expense',
                    amount: parseFloat(t.amount),
                    category: t.category,
                    description: t.description,
                    date: t.date,
                })),
            });
        }
        set({ isLoading: false });
    },

    addTransaction: async (txData) => {
        if (!isSupabaseConfigured()) {
            const tx: FinanceTransaction = { ...txData, id: Date.now().toString() };
            set((state) => ({ transactions: [tx, ...state.transactions] }));
            return;
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                workspace_id: txData.workspaceId,
                type: txData.type,
                amount: txData.amount,
                category: txData.category,
                description: txData.description,
                date: txData.date,
            })
            .select()
            .single();

        if (!error && data) {
            const tx: FinanceTransaction = {
                id: data.id,
                workspaceId: data.workspace_id,
                type: data.type,
                amount: parseFloat(data.amount),
                category: data.category,
                description: data.description,
                date: data.date,
            };
            set((state) => ({ transactions: [tx, ...state.transactions] }));
        }
    },

    deleteTransaction: async (id) => {
        set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('transactions').delete().eq('id', id);
        }
    },

    getSummaryByWorkspace: (workspaceId) => {
        const txs = get().transactions.filter((t) => t.workspaceId === workspaceId);
        const totalIncome = txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    },

    getTransactionsByWorkspace: (workspaceId) => {
        return get()
            .transactions.filter((t) => t.workspaceId === workspaceId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    getExpenseCategories: () => EXPENSE_CATEGORIES,
    getIncomeCategories: () => INCOME_CATEGORIES,

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => { };

        const channel = supabase
            .channel('transactions-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions' },
                () => {
                    get().fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
