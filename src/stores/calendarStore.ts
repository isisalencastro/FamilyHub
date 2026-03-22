import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    removeEvent: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const today = new Date().toISOString().split('T')[0];

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            events: [
                { id: '1', title: 'Reunião do time', date: today, time: '14:00', owner: 'isis' },
                { id: '2', title: 'Consulta / Exame', date: today, time: '09:30', owner: 'angelica' },
                { id: '3', title: 'Dia de Mercado', date: today, owner: 'both' },
            ],
            addEvent: (event) => set((state) => ({
                events: [...state.events, { ...event, id: generateId() }].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime())
            })),
            removeEvent: (id) => set((state) => ({
                events: state.events.filter((e) => e.id !== id)
            })),
        }),
        {
            name: 'calendar-storage',
        }
    )
);
