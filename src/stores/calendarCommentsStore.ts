import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CalendarComment {
    id: string;
    author: string;
    authorAvatar: string;
    authorColor: string;
    text: string;
    date: string;       // YYYY-MM-DD
    createdAt: string;   // ISO timestamp
}

interface CalendarCommentsState {
    comments: CalendarComment[];
    isLoading: boolean;
    fetchComments: () => Promise<void>;
    addComment: (comment: Omit<CalendarComment, 'id' | 'createdAt'>) => Promise<void>;
    removeComment: (id: string) => Promise<void>;
    subscribeRealtime: () => () => void;
}

const mapFromDB = (row: any): CalendarComment => ({
    id: row.id,
    author: row.author,
    authorAvatar: row.author_avatar,
    authorColor: row.author_color,
    text: row.text,
    date: row.date,
    createdAt: row.created_at,
});

export const useCalendarCommentsStore = create<CalendarCommentsState>((set, get) => ({
    comments: [],
    isLoading: false,

    fetchComments: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const { data, error } = await supabase
            .from('calendar_comments')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            set({ comments: data.map(mapFromDB) });
        }
        set({ isLoading: false });
    },

    addComment: async (comment) => {
        const id = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const createdAt = new Date().toISOString();
        const newComment: CalendarComment = { ...comment, id, createdAt };

        set((state) => ({ comments: [newComment, ...state.comments] }));

        if (isSupabaseConfigured()) {
            await supabase.from('calendar_comments').insert({
                id,
                author: comment.author,
                author_avatar: comment.authorAvatar,
                author_color: comment.authorColor,
                text: comment.text,
                date: comment.date,
                created_at: createdAt,
            });
        }
    },

    removeComment: async (id) => {
        set((state) => ({ comments: state.comments.filter((c) => c.id !== id) }));

        if (isSupabaseConfigured()) {
            await supabase.from('calendar_comments').delete().eq('id', id);
        }
    },

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};

        const channel = supabase
            .channel('calendar-comments-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_comments' }, () => {
                get().fetchComments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
