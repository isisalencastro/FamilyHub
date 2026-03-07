import { useState, useMemo } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function CalendarView() {
    const { events, addEvent, removeEvent } = useCalendarStore();
    const { activeWorkspace } = useWorkspaceStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        addEvent({
            title: title.trim(),
            date,
            time: time || undefined,
            owner: 'both' // hardcoded value
        });
        setTitle('');
        setTime('');
        setIsAddingEvent(false);
    };

    const isFamilia = activeWorkspace.id === 'familia';

    // Current month helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Calendar grid generation
    const days = useMemo(() => {
        const result = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            result.push(null); // padding
        }
        for (let i = 1; i <= daysInMonth; i++) {
            result.push(new Date(year, month, i));
        }
        return result;
    }, [year, month, daysInMonth, firstDayOfMonth]);

    const getOwnerBadgeColor = () => {
        return '#8b5cf6'; // Unified color
    };

    return (
        <div className="main-content">
            <div className="page-container">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <CalendarIcon size={28} style={{ color: 'var(--color-accent-primary)' }} />
                            <h1 className="page-title">Calendário da Família</h1>
                        </div>
                        <p className="page-subtitle">
                            Acompanhe eventos, consultas e reuniões.{' '}
                            {!isFamilia && 'Mudando para a Visão Geral você pode ver os eventos compartilhados.'}
                        </p>
                    </div>

                    {isFamilia && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsAddingEvent(!isAddingEvent)}
                            >
                                <Plus size={16} /> {isAddingEvent ? 'Cancelar' : 'Novo Evento'}
                            </button>
                        </div>
                    )}
                </div>

                {isAddingEvent && isFamilia && (
                    <div className="card" style={{ marginBottom: '24px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-default)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Adicionar Novo Evento</h3>
                        </div>
                        <form onSubmit={handleAdd} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Título do Evento *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Reunião Escolar"
                                        className="input"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Data *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Horário (Opcional)</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={time}
                                        onChange={e => setTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setIsAddingEvent(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Salvar Evento</button>
                            </div>
                        </form>
                    </div>
                )}



                <div className="card">
                    {/* Calendar Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--color-border-default)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{monthNames[month]} {year}</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-ghost" onClick={prevMonth}><ChevronLeft size={20} /></button>
                            <button className="btn btn-ghost" onClick={() => setCurrentDate(new Date())}>Hoje</button>
                            <button className="btn btn-ghost" onClick={nextMonth}><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    {/* Calendar Days Header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                        background: 'var(--color-bg-tertiary)', borderBottom: '1px solid var(--color-border-default)'
                    }}>
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                            <div key={d} style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, auto)' }}>
                        {days.map((date, i) => {
                            if (!date) {
                                return <div key={`empty-${i}`} style={{ borderRight: '1px solid var(--color-border-default)', borderBottom: '1px solid var(--color-border-default)', background: 'var(--color-bg-tertiary)', opacity: 0.3 }} />;
                            }

                            const isToday = new Date().toDateString() === date.toDateString();
                            const dateStr = date.toISOString().split('T')[0];
                            const dayEvents = events.filter(e => e.date === dateStr);

                            return (
                                <div key={i} style={{
                                    borderRight: '1px solid var(--color-border-default)',
                                    borderBottom: '1px solid var(--color-border-default)',
                                    padding: '8px',
                                    minHeight: '100px',
                                    background: isToday ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                                }}>
                                    <div style={{
                                        width: '24px', height: '24px',
                                        borderRadius: '50%',
                                        background: isToday ? 'var(--color-accent-primary)' : 'transparent',
                                        color: isToday ? 'white' : 'var(--color-text-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '14px', fontWeight: isToday ? 700 : 500,
                                        marginBottom: '8px'
                                    }}>
                                        {date.getDate()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {dayEvents.map(ev => (
                                            <div key={ev.id} style={{
                                                fontSize: '11px', padding: '4px', borderRadius: '4px',
                                                background: 'var(--color-bg-tertiary)',
                                                borderLeft: `3px solid ${getOwnerBadgeColor()}`,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                            }} title={ev.title}>
                                                {ev.time && <span style={{ fontWeight: 600, marginRight: '4px' }}>{ev.time}</span>}
                                                {ev.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
