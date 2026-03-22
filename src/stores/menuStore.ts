import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Meal {
    id: string;
    name: string;
    ingredients: string;
    dateToMake: string; // YYYY-MM-DD
    dateToConsume: string; // YYYY-MM-DD
    mealType: 'almoco' | 'janta';
    averageCost: number;
    isMarmita: boolean;
    owner: string;
}

interface MenuState {
    meals: Meal[];
    addMeal: (meal: Omit<Meal, 'id'>) => void;
    updateMeal: (id: string, meal: Partial<Meal>) => void;
    removeMeal: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useMenuStore = create<MenuState>()(
    persist(
        (set) => ({
            meals: [],
            addMeal: (meal) => set((state) => ({
                meals: [...state.meals, { ...meal, id: generateId() }].sort((a, b) => new Date(a.dateToConsume).getTime() - new Date(b.dateToConsume).getTime())
            })),
            updateMeal: (id, updatedFields) => set((state) => ({
                meals: state.meals.map(m => m.id === id ? { ...m, ...updatedFields } : m).sort((a, b) => new Date(a.dateToConsume).getTime() - new Date(b.dateToConsume).getTime())
            })),
            removeMeal: (id) => set((state) => ({
                meals: state.meals.filter((m) => m.id !== id)
            })),
        }),
        {
            name: 'menu-storage',
        }
    )
);
