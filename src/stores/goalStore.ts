import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface GoalMilestone {
    id: string;
    title: string;
    completed: boolean;
}

export interface Goal {
    id: string;
    workspaceId: string;
    title: string;
    description?: string;
    category: GoalCategory;
    progress: number; // 0-100
    milestones: GoalMilestone[];
    targetDate?: string;
    createdAt: string;
    completedAt?: string;
}

export type GoalCategory =
    | 'pessoal'
    | 'financeiro'
    | 'saude'
    | 'educacao'
    | 'familia'
    | 'carreira'
    | 'outro';

export const GOAL_CATEGORIES: Record<GoalCategory, { label: string; emoji: string; color: string }> = {
    pessoal: { label: 'Pessoal', emoji: '⭐', color: '#f59e0b' },
    financeiro: { label: 'Financeiro', emoji: '💰', color: '#22c55e' },
    saude: { label: 'Saúde', emoji: '💪', color: '#ef4444' },
    educacao: { label: 'Educação', emoji: '📚', color: '#3b82f6' },
    familia: { label: 'Família', emoji: '❤️', color: '#ec4899' },
    carreira: { label: 'Carreira', emoji: '🚀', color: '#8b5cf6' },
    outro: { label: 'Outro', emoji: '🎯', color: '#6b7280' },
};

interface GoalState {
    goals: Goal[];
    isLoading: boolean;
    fetchGoals: () => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'milestones'> & { milestones?: Omit<GoalMilestone, 'id' | 'completed'>[] }) => Promise<void>;
    updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
    removeGoal: (id: string) => Promise<void>;
    toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
    addMilestone: (goalId: string, title: string) => Promise<void>;
    removeMilestone: (goalId: string, milestoneId: string) => Promise<void>;
    subscribeRealtime: () => () => void;
}

const calcProgress = (milestones: GoalMilestone[]): number => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
};

export const useGoalStore = create<GoalState>((set, get) => ({
    goals: [],
    isLoading: false,

    fetchGoals: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const { data: goalsData, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: milestonesData, error: msError } = await supabase
            .from('goal_milestones')
            .select('*');

        if (!goalsError && goalsData && !msError && milestonesData) {
            const goals: Goal[] = goalsData.map((g) => {
                const milestones: GoalMilestone[] = milestonesData
                    .filter((m: any) => m.goal_id === g.id)
                    .map((m: any) => ({ id: m.id, title: m.title, completed: m.completed }));
                return {
                    id: g.id,
                    workspaceId: g.workspace_id,
                    title: g.title,
                    description: g.description,
                    category: g.category as GoalCategory,
                    progress: g.progress,
                    milestones,
                    targetDate: g.target_date,
                    createdAt: g.created_at,
                    completedAt: g.completed_at,
                };
            });
            set({ goals });
        }
        set({ isLoading: false });
    },

    addGoal: async (goalData) => {
        const id = `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const createdAt = new Date().toISOString();
        const milestones: GoalMilestone[] = (goalData.milestones || []).map((m) => ({
            ...m,
            id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            completed: false,
        }));

        const goal: Goal = {
            ...goalData,
            id,
            progress: 0,
            milestones,
            createdAt,
        } as Goal;

        set((state) => ({ goals: [...state.goals, goal] }));

        if (isSupabaseConfigured()) {
            await supabase.from('goals').insert({
                id,
                workspace_id: goalData.workspaceId,
                title: goalData.title,
                description: goalData.description || null,
                category: goalData.category,
                progress: 0,
                target_date: goalData.targetDate || null,
                created_at: createdAt,
            });

            if (milestones.length > 0) {
                await supabase.from('goal_milestones').insert(
                    milestones.map((m) => ({
                        id: m.id,
                        goal_id: id,
                        title: m.title,
                        completed: false,
                    }))
                );
            }
        }
    },

    updateGoal: async (id, data) => {
        set((state) => ({
            goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
        }));

        if (isSupabaseConfigured()) {
            const dbData: any = {};
            if (data.title !== undefined) dbData.title = data.title;
            if (data.description !== undefined) dbData.description = data.description;
            if (data.category !== undefined) dbData.category = data.category;
            if (data.progress !== undefined) dbData.progress = data.progress;
            if (data.targetDate !== undefined) dbData.target_date = data.targetDate;
            if (data.completedAt !== undefined) dbData.completed_at = data.completedAt;

            if (Object.keys(dbData).length > 0) {
                await supabase.from('goals').update(dbData).eq('id', id);
            }
        }
    },

    removeGoal: async (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));

        if (isSupabaseConfigured()) {
            await supabase.from('goals').delete().eq('id', id); // cascades milestones
        }
    },

    toggleMilestone: async (goalId, milestoneId) => {
        let newCompleted = false;
        set((state) => ({
            goals: state.goals.map((g) => {
                if (g.id !== goalId) return g;
                const updatedMilestones = g.milestones.map((m) => {
                    if (m.id === milestoneId) {
                        newCompleted = !m.completed;
                        return { ...m, completed: newCompleted };
                    }
                    return m;
                });
                const progress = calcProgress(updatedMilestones);
                const completedAt = progress === 100 ? new Date().toISOString() : undefined;
                return { ...g, milestones: updatedMilestones, progress, completedAt };
            }),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('goal_milestones').update({ completed: newCompleted }).eq('id', milestoneId);
            const goal = get().goals.find((g) => g.id === goalId);
            if (goal) {
                await supabase.from('goals').update({
                    progress: goal.progress,
                    completed_at: goal.completedAt || null,
                }).eq('id', goalId);
            }
        }
    },

    addMilestone: async (goalId, title) => {
        const msId = `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newMs: GoalMilestone = { id: msId, title, completed: false };

        set((state) => ({
            goals: state.goals.map((g) => {
                if (g.id !== goalId) return g;
                const newMilestones = [...g.milestones, newMs];
                const progress = calcProgress(newMilestones);
                return { ...g, milestones: newMilestones, progress, completedAt: progress === 100 ? new Date().toISOString() : undefined };
            }),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('goal_milestones').insert({ id: msId, goal_id: goalId, title, completed: false });
            const goal = get().goals.find((g) => g.id === goalId);
            if (goal) {
                await supabase.from('goals').update({
                    progress: goal.progress,
                    completed_at: goal.completedAt || null,
                }).eq('id', goalId);
            }
        }
    },

    removeMilestone: async (goalId, milestoneId) => {
        set((state) => ({
            goals: state.goals.map((g) => {
                if (g.id !== goalId) return g;
                const newMilestones = g.milestones.filter((m) => m.id !== milestoneId);
                const progress = calcProgress(newMilestones);
                return { ...g, milestones: newMilestones, progress, completedAt: progress === 100 ? new Date().toISOString() : undefined };
            }),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('goal_milestones').delete().eq('id', milestoneId);
            const goal = get().goals.find((g) => g.id === goalId);
            if (goal) {
                await supabase.from('goals').update({
                    progress: goal.progress,
                    completed_at: goal.completedAt || null,
                }).eq('id', goalId);
            }
        }
    },

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};

        const ch1 = supabase
            .channel('goals-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
                get().fetchGoals();
            })
            .subscribe();

        const ch2 = supabase
            .channel('goal-milestones-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_milestones' }, () => {
                get().fetchGoals();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ch1);
            supabase.removeChannel(ch2);
        };
    },
}));
