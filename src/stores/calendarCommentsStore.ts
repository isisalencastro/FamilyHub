import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CalendarComment {
    id: string;
    author: string;         // 'isis' | 'angelica' | workspace displayName
    authorAvatar: string;   // first letter or emoji
    authorColor: string;
    text: string;
    date: string;           // YYYY-MM-DD — the calendar date this comment is about (optional, '' for general)
    createdAt: string;      // ISO timestamp
}

interface CalendarCommentsState {
    comments: CalendarComment[];
    addComment: (comment: Omit<CalendarComment, 'id' | 'createdAt'>) => void;
    removeComment: (id: string) => void;
}

export const useCalendarCommentsStore = create<CalendarCommentsState>()(
    persist(
        (set) => ({
            comments: [],

            addComment: (comment) =>
                set((state) => ({
                    comments: [
                        {
                            ...comment,
                            id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                            createdAt: new Date().toISOString(),
                        },
                        ...state.comments,
                    ],
                })),

            removeComment: (id) =>
                set((state) => ({
                    comments: state.comments.filter((c) => c.id !== id),
                })),
        }),
        {
            name: 'alenfinos-calendar-comments',
            partialize: (state) => ({ comments: state.comments }),
        }
    )
);
