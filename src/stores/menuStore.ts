import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
    isLoading: boolean;
    fetchMeals: () => Promise<void>;
    addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
    updateMeal: (id: string, meal: Partial<Meal>) => Promise<void>;
    removeMeal: (id: string) => Promise<void>;
    subscribeRealtime: () => () => void;
}

const generateId = () => `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const mapFromDB = (row: any): Meal => ({
    id: row.id,
    name: row.name,
    ingredients: row.ingredients || '',
    dateToMake: row.date_to_make,
    dateToConsume: row.date_to_consume,
    mealType: row.meal_type,
    averageCost: row.average_cost ? parseFloat(row.average_cost) : 0,
    isMarmita: row.is_marmita,
    owner: row.owner || '',
});

const sortByConsume = (meals: Meal[]) =>
    [...meals].sort((a, b) => new Date(a.dateToConsume).getTime() - new Date(b.dateToConsume).getTime());

export const useMenuStore = create<MenuState>((set, get) => ({
    meals: [],
    isLoading: false,

    fetchMeals: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const { data, error } = await supabase
            .from('meals')
            .select('*')
            .order('date_to_consume', { ascending: true });

        if (!error && data) {
            set({ meals: data.map(mapFromDB) });
        }
        set({ isLoading: false });
    },

    addMeal: async (meal) => {
        const id = generateId();
        const newMeal: Meal = { ...meal, id };

        set((state) => ({ meals: sortByConsume([...state.meals, newMeal]) }));

        if (isSupabaseConfigured()) {
            await supabase.from('meals').insert({
                id,
                name: meal.name,
                ingredients: meal.ingredients || null,
                date_to_make: meal.dateToMake,
                date_to_consume: meal.dateToConsume,
                meal_type: meal.mealType,
                average_cost: meal.averageCost,
                is_marmita: meal.isMarmita,
                owner: meal.owner,
            });
        }
    },

    updateMeal: async (id, updatedFields) => {
        set((state) => ({
            meals: sortByConsume(state.meals.map((m) => (m.id === id ? { ...m, ...updatedFields } : m))),
        }));

        if (isSupabaseConfigured()) {
            const dbData: any = {};
            if (updatedFields.name !== undefined) dbData.name = updatedFields.name;
            if (updatedFields.ingredients !== undefined) dbData.ingredients = updatedFields.ingredients;
            if (updatedFields.dateToMake !== undefined) dbData.date_to_make = updatedFields.dateToMake;
            if (updatedFields.dateToConsume !== undefined) dbData.date_to_consume = updatedFields.dateToConsume;
            if (updatedFields.mealType !== undefined) dbData.meal_type = updatedFields.mealType;
            if (updatedFields.averageCost !== undefined) dbData.average_cost = updatedFields.averageCost;
            if (updatedFields.isMarmita !== undefined) dbData.is_marmita = updatedFields.isMarmita;
            if (updatedFields.owner !== undefined) dbData.owner = updatedFields.owner;

            if (Object.keys(dbData).length > 0) {
                await supabase.from('meals').update(dbData).eq('id', id);
            }
        }
    },

    removeMeal: async (id) => {
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }));

        if (isSupabaseConfigured()) {
            await supabase.from('meals').delete().eq('id', id);
        }
    },

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};

        const channel = supabase
            .channel('meals-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'meals' }, () => {
                get().fetchMeals();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
