import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Task } from '@/types';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    fetchTasks: () => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    getTasksByWorkspace: (workspaceId: string) => Task[];
    subscribeRealtime: () => () => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],
            isLoading: false,

            fetchTasks: async () => {
                if (!isSupabaseConfigured()) return;
                set({ isLoading: true });
                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    set({
                        tasks: data.map((t) => ({
                            id: t.id,
                            workspaceId: t.workspace_id,
                            title: t.title,
                            description: t.description,
                            status: t.status as Task['status'],
                            priority: t.priority as Task['priority'],
                            dueDate: t.due_date,
                            createdAt: t.created_at,
                        })),
                    });
                }
                set({ isLoading: false });
            },

            addTask: async (taskData) => {
                if (!isSupabaseConfigured()) {
                    // Fallback local
                    const task: Task = { ...taskData, id: Date.now().toString(), createdAt: new Date().toISOString() };
                    set((state) => ({ tasks: [task, ...state.tasks] }));
                    return;
                }

                const { data, error } = await supabase
                    .from('tasks')
                    .insert({
                        workspace_id: taskData.workspaceId,
                        title: taskData.title,
                        description: taskData.description || null,
                        status: taskData.status,
                        priority: taskData.priority,
                        due_date: taskData.dueDate || null,
                    })
                    .select()
                    .single();

                if (!error && data) {
                    const task: Task = {
                        id: data.id,
                        workspaceId: data.workspace_id,
                        title: data.title,
                        description: data.description,
                        status: data.status,
                        priority: data.priority,
                        dueDate: data.due_date,
                        createdAt: data.created_at,
                    };
                    set((state) => ({ tasks: [task, ...state.tasks] }));
                }
            },

            toggleTask: async (id) => {
                const task = get().tasks.find((t) => t.id === id);
                if (!task) return;
                const newStatus = task.status === 'done' ? 'pending' : 'done';

                // Optimistic update
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, status: newStatus } : t
                    ),
                }));

                if (isSupabaseConfigured()) {
                    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
                }
            },

            deleteTask: async (id) => {
                set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));

                if (isSupabaseConfigured()) {
                    await supabase.from('tasks').delete().eq('id', id);
                }
            },

            getTasksByWorkspace: (workspaceId) => {
                return get().tasks.filter((t) => t.workspaceId === workspaceId);
            },

            subscribeRealtime: () => {
                if (!isSupabaseConfigured()) return () => { };

                const channel = supabase
                    .channel('tasks-changes')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'tasks' },
                        (payload) => {
                            if (payload.eventType === 'INSERT') {
                                const d = payload.new;
                                const task: Task = {
                                    id: d.id,
                                    workspaceId: d.workspace_id,
                                    title: d.title,
                                    description: d.description,
                                    status: d.status,
                                    priority: d.priority,
                                    dueDate: d.due_date,
                                    createdAt: d.created_at,
                                };
                                const exists = get().tasks.some((t) => t.id === task.id);
                                if (!exists) {
                                    set((state) => ({ tasks: [task, ...state.tasks] }));
                                }
                            } else if (payload.eventType === 'UPDATE') {
                                const d = payload.new;
                                set((state) => ({
                                    tasks: state.tasks.map((t) =>
                                        t.id === d.id
                                            ? { ...t, status: d.status, title: d.title, priority: d.priority, description: d.description }
                                            : t
                                    ),
                                }));
                            } else if (payload.eventType === 'DELETE') {
                                const d = payload.old;
                                set((state) => ({
                                    tasks: state.tasks.filter((t) => t.id !== d.id),
                                }));
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            },
        }),
        {
            name: 'alenfinos-tasks',
            partialize: (state) => ({
                tasks: state.tasks,
            }),
        }
    )
);
