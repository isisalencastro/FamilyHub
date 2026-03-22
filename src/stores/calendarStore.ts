import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    time?: string; // HH:mm
    owner: 'isis' | 'angelica' | 'both';
}

interface CalendarState {
    events: CalendarEvent[];
    isLoading: boolean;
    fetchEvents: () => Promise<void>;
    addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    removeEvent: (id: string) => Promise<void>;
    subscribeRealtime: () => () => void;
}

const generateId = () => `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const mapFromDB = (row: any): CalendarEvent => ({
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    time: row.time,
    owner: row.owner,
});

export const useCalendarStore = create<CalendarState>((set, get) => ({
    events: [],
    isLoading: false,

    fetchEvents: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .order('date', { ascending: true });

        if (!error && data) {
            set({ events: data.map(mapFromDB) });
        }
        set({ isLoading: false });
    },

    addEvent: async (event) => {
        const id = generateId();
        const newEvent: CalendarEvent = { ...event, id };

        set((state) => ({
            events: [...state.events, newEvent].sort(
                (a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime()
            ),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('calendar_events').insert({
                id,
                title: event.title,
                description: event.description || null,
                date: event.date,
                time: event.time || null,
                owner: event.owner,
            });
        }
    },

    removeEvent: async (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }));

        if (isSupabaseConfigured()) {
            await supabase.from('calendar_events').delete().eq('id', id);
        }
    },

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};

        const channel = supabase
            .channel('calendar-events-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => {
                get().fetchEvents();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
