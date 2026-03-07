import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    icon: string; // emoji
    color: string;
}

interface ShoppingState {
    categories: ShoppingCategory[];
    items: ShoppingItem[];
    addCategory: (name: string, icon: string, color: string) => void;
    removeCategory: (id: string) => void;
    addItem: (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'completed' | 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: string) => void;
    toggleItem: (id: string, completedBy?: string) => void;
    updateItemQuantity: (id: string, quantity: number) => void;
    clearCompleted: () => void;
}

const defaultCategories: ShoppingCategory[] = [
    { id: 'groceries', name: 'Alimentos', icon: '🛒', color: '#22c55e' },
    { id: 'cleaning', name: 'Limpeza', icon: '🧹', color: '#3b82f6' },
    { id: 'hygiene', name: 'Higiene', icon: '🧴', color: '#ec4899' },
    { id: 'others', name: 'Outros', icon: '📦', color: '#f59e0b' },
];

export const useShoppingStore = create<ShoppingState>()(
    persist(
        (set) => ({
            categories: defaultCategories,
            items: [],

            addCategory: (name, icon, color) =>
                set((state) => ({
                    categories: [
                        ...state.categories,
                        {
                            id: `cat-${Date.now()}`,
                            name,
                            icon,
                            color,
                        },
                    ],
                })),

            removeCategory: (id) =>
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                    items: state.items.filter((i) => i.categoryId !== id),
                })),

            addItem: (item) =>
                set((state) => ({
                    items: [
                        ...state.items,
                        {
                            ...item,
                            id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                            completed: false,
                            quantity: item.quantity ?? 1,
                            addedAt: new Date().toISOString(),
                        },
                    ],
                })),

            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),

            toggleItem: (id, completedBy) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id
                            ? {
                                ...i,
                                completed: !i.completed,
                                completedBy: !i.completed ? completedBy : undefined,
                            }
                            : i
                    ),
                })),

            updateItemQuantity: (id, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
                    ),
                })),

            clearCompleted: () =>
                set((state) => ({
                    items: state.items.filter((i) => !i.completed),
                })),
        }),
        {
            name: 'alenfinos-shopping',
            partialize: (state) => ({
                categories: state.categories,
                items: state.items,
            }),
        }
    )
);
