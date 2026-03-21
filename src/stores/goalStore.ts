import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'milestones'> & { milestones?: Omit<GoalMilestone, 'id' | 'completed'>[] }) => void;
    updateGoal: (id: string, data: Partial<Goal>) => void;
    removeGoal: (id: string) => void;
    toggleMilestone: (goalId: string, milestoneId: string) => void;
    addMilestone: (goalId: string, title: string) => void;
    removeMilestone: (goalId: string, milestoneId: string) => void;
}

export const useGoalStore = create<GoalState>()(
    persist(
        (set) => ({
            goals: [],

            addGoal: (goalData) =>
                set((state) => {
                    const milestones: GoalMilestone[] = (goalData.milestones || []).map((m) => ({
                        ...m,
                        id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        completed: false,
                    }));
                    return {
                        goals: [
                            ...state.goals,
                            {
                                ...goalData,
                                id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                progress: 0,
                                milestones,
                                createdAt: new Date().toISOString(),
                            } as Goal,
                        ],
                    };
                }),

            updateGoal: (id, data) =>
                set((state) => ({
                    goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
                })),

            removeGoal: (id) =>
                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== id),
                })),

            toggleMilestone: (goalId, milestoneId) =>
                set((state) => ({
                    goals: state.goals.map((g) => {
                        if (g.id !== goalId) return g;
                        const updatedMilestones = g.milestones.map((m) =>
                            m.id === milestoneId ? { ...m, completed: !m.completed } : m
                        );
                        const completedCount = updatedMilestones.filter((m) => m.completed).length;
                        const progress = updatedMilestones.length > 0
                            ? Math.round((completedCount / updatedMilestones.length) * 100)
                            : g.progress;
                        const completedAt = progress === 100 ? new Date().toISOString() : undefined;
                        return { ...g, milestones: updatedMilestones, progress, completedAt };
                    }),
                })),

            addMilestone: (goalId, title) =>
                set((state) => ({
                    goals: state.goals.map((g) => {
                        if (g.id !== goalId) return g;
                        const newMilestones = [
                            ...g.milestones,
                            {
                                id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                title,
                                completed: false,
                            },
                        ];
                        const completedCount = newMilestones.filter((m) => m.completed).length;
                        const progress = Math.round((completedCount / newMilestones.length) * 100);
                        return { ...g, milestones: newMilestones, progress, completedAt: progress === 100 ? new Date().toISOString() : undefined };
                    }),
                })),

            removeMilestone: (goalId, milestoneId) =>
                set((state) => ({
                    goals: state.goals.map((g) => {
                        if (g.id !== goalId) return g;
                        const newMilestones = g.milestones.filter((m) => m.id !== milestoneId);
                        const completedCount = newMilestones.filter((m) => m.completed).length;
                        const progress = newMilestones.length > 0
                            ? Math.round((completedCount / newMilestones.length) * 100)
                            : 0;
                        return { ...g, milestones: newMilestones, progress, completedAt: progress === 100 ? new Date().toISOString() : undefined };
                    }),
                })),
        }),
        {
            name: 'alenfinos-goals',
            partialize: (state) => ({ goals: state.goals }),
        }
    )
);
