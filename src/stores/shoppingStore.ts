import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ShoppingItem {
    id: string;
    name: string;
    note?: string;
    categoryId: string;
    completed: boolean;
    quantity: number;
    priority: 'normal' | 'high';
    assignedTo?: 'isis' | 'angelica';
    addedAt: string;
    completedBy?: string;
}

export interface ShoppingCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
}

interface ShoppingState {
    categories: ShoppingCategory[];
    items: ShoppingItem[];
    isLoading: boolean;
    fetchData: () => Promise<void>;
    addCategory: (name: string, icon: string, color: string) => Promise<void>;
    removeCategory: (id: string) => Promise<void>;
    addItem: (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'completed' | 'quantity'> & { quantity?: number }) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    toggleItem: (id: string, completedBy?: string) => Promise<void>;
    updateItemQuantity: (id: string, quantity: number) => Promise<void>;
    clearCompleted: () => Promise<void>;
    subscribeRealtime: () => () => void;
}

const defaultCategories: ShoppingCategory[] = [
    { id: 'groceries', name: 'Alimentos', icon: '🛒', color: '#22c55e' },
    { id: 'cleaning', name: 'Limpeza', icon: '🧹', color: '#3b82f6' },
    { id: 'hygiene', name: 'Higiene', icon: '🧴', color: '#ec4899' },
    { id: 'others', name: 'Outros', icon: '📦', color: '#f59e0b' },
];

const mapItemFromDB = (row: any): ShoppingItem => ({
    id: row.id,
    name: row.name,
    note: row.note,
    categoryId: row.category_id,
    completed: row.completed,
    quantity: row.quantity,
    priority: row.priority,
    assignedTo: row.assigned_to,
    addedAt: row.added_at,
    completedBy: row.completed_by,
});

const mapCategoryFromDB = (row: any): ShoppingCategory => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
});

export const useShoppingStore = create<ShoppingState>((set, get) => ({
    categories: defaultCategories,
    items: [],
    isLoading: false,

    fetchData: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const [catRes, itemRes] = await Promise.all([
            supabase.from('shopping_categories').select('*'),
            supabase.from('shopping_items').select('*').order('added_at', { ascending: false }),
        ]);

        if (!catRes.error && catRes.data) {
            set({ categories: catRes.data.length > 0 ? catRes.data.map(mapCategoryFromDB) : defaultCategories });
        }
        if (!itemRes.error && itemRes.data) {
            set({ items: itemRes.data.map(mapItemFromDB) });
        }
        set({ isLoading: false });
    },

    addCategory: async (name, icon, color) => {
        const id = `cat-${Date.now()}`;
        const cat: ShoppingCategory = { id, name, icon, color };

        set((state) => ({ categories: [...state.categories, cat] }));

        if (isSupabaseConfigured()) {
            await supabase.from('shopping_categories').insert({ id, name, icon, color });
        }
    },

    removeCategory: async (id) => {
        set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            items: state.items.filter((i) => i.categoryId !== id),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('shopping_items').delete().eq('category_id', id);
            await supabase.from('shopping_categories').delete().eq('id', id);
        }
    },

    addItem: async (item) => {
        const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newItem: ShoppingItem = {
            ...item,
            id,
            completed: false,
            quantity: item.quantity ?? 1,
            addedAt: new Date().toISOString(),
        };

        set((state) => ({ items: [...state.items, newItem] }));

        if (isSupabaseConfigured()) {
            await supabase.from('shopping_items').insert({
                id: newItem.id,
                name: newItem.name,
                note: newItem.note || null,
                category_id: newItem.categoryId,
                completed: false,
                quantity: newItem.quantity,
                priority: newItem.priority,
                assigned_to: newItem.assignedTo || null,
                added_at: newItem.addedAt,
                completed_by: null,
            });
        }
    },

    removeItem: async (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));

        if (isSupabaseConfigured()) {
            await supabase.from('shopping_items').delete().eq('id', id);
        }
    },

    toggleItem: async (id, completedBy) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;

        const newCompleted = !item.completed;
        const newCompletedBy = newCompleted ? completedBy : undefined;

        set((state) => ({
            items: state.items.map((i) =>
                i.id === id ? { ...i, completed: newCompleted, completedBy: newCompletedBy } : i
            ),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('shopping_items').update({
                completed: newCompleted,
                completed_by: newCompletedBy || null,
            }).eq('id', id);
        }
    },

    updateItemQuantity: async (id, quantity) => {
        const newQty = Math.max(1, quantity);
        set((state) => ({
            items: state.items.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('shopping_items').update({ quantity: newQty }).eq('id', id);
        }
    },

    clearCompleted: async () => {
        const completedIds = get().items.filter((i) => i.completed).map((i) => i.id);
        set((state) => ({ items: state.items.filter((i) => !i.completed) }));

        if (isSupabaseConfigured() && completedIds.length > 0) {
            await supabase.from('shopping_items').delete().in('id', completedIds);
        }
    },

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};

        const ch1 = supabase
            .channel('shopping-items-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, () => {
                get().fetchData();
            })
            .subscribe();

        const ch2 = supabase
            .channel('shopping-categories-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_categories' }, () => {
                get().fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ch1);
            supabase.removeChannel(ch2);
        };
    },
}));
