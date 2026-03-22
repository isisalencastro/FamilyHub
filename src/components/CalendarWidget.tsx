import { useState } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { Calendar, Trash2, Plus, Clock, AlignLeft, X } from 'lucide-react';

export function CalendarWidget() {
    const { events, addEvent, removeEvent } = useCalendarStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        addEvent({
            title: title.trim(),
            description: description.trim() || undefined,
            date,
            time: time || undefined,
            owner: 'both' // owner is hardcoded now
        });
        setTitle('');
        setDescription('');
        setTime('');
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const sortedEvents = [...events]
        .filter(ev => ev.date >= todayStr)
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
            const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
            return dateA - dateB;
        });

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-header">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'var(--color-accent-primary)' }} />
                    Calendário
                </h2>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                <input
                    type="text"
                    placeholder="Adicionar novo compromisso..."
                    className="input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{ background: 'transparent', border: 'none', padding: '0 4px', fontSize: '14px', boxShadow: 'none' }}
                    required
                />
                <textarea
                    placeholder="Descrição (opcional)..."
                    className="input"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', minHeight: '44px', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
                    <input
                        type="date"
                        className="input"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{ flex: 2, fontSize: '13px', padding: '6px 10px', height: '32px' }}
                        required
                    />
                    <input
                        type="time"
                        className="input"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        style={{ flex: 1, fontSize: '13px', padding: '6px 10px', height: '32px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ height: '32px', width: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', flexShrink: 0 }}>
                        <Plus size={16} />
                    </button>
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, maxHeight: '320px', paddingRight: '4px' }}>
                {sortedEvents.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '32px 12px',
                        color: 'var(--color-text-tertiary)',
                        background: 'var(--color-bg-secondary)',
                        borderRadius: '12px',
                        border: '1px dashed var(--color-border-subtle)'
                    }}>
                        <Calendar size={28} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p style={{ fontSize: '13px', fontWeight: 500 }}>
                            Calendário limpo!
                        </p>
                        <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                            Sem compromissos em vista.
                        </p>
                    </div>
                ) : (
                    sortedEvents.map((ev, i) => {
                        const [year, month, day] = ev.date.split('-');
                        const monthName = months[parseInt(month) - 1];

                        return (
                            <div key={ev.id} 
                                onClick={() => setSelectedEvent(ev)}
                                style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', background: 'var(--color-bg-tertiary)',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border-subtle)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                animation: `fadeIn 0.3s ease-out ${i * 0.05}s backwards`
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-tertiary)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
                                        color: 'var(--color-accent-primary)', width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0
                                    }}>
                                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{monthName}</span>
                                        <span style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1, marginTop: '2px', color: 'var(--color-text-primary)' }}>{day}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                            {ev.title}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                                            <Clock size={12} style={{ opacity: 0.6 }} />
                                            <span>{ev.time || 'O dia todo'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeEvent(ev.id)}
                                    className="btn btn-ghost"
                                    style={{ padding: '6px', height: '30px', width: '30px', borderRadius: '8px', color: 'var(--color-text-tertiary)', opacity: 0.4, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                    title="Remover evento"
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'; (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.4'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedEvent && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: '20px'
                }} onClick={() => setSelectedEvent(null)}>
                    <div style={{
                        background: 'var(--color-bg-primary)',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '400px',
                        padding: '32px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            style={{
                                position: 'absolute', top: '24px', right: '24px',
                                background: 'var(--color-bg-tertiary)', border: 'none',
                                width: '32px', height: '32px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--color-text-secondary)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                        >
                            <X size={16} />
                        </button>

                        <div style={{
                            width: '48px', height: '48px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
                            color: 'var(--color-accent-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '20px'
                        }}>
                            <Calendar size={24} />
                        </div>

                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '16px', lineHeight: 1.2 }}>
                            {selectedEvent.title}
                        </h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                                <Calendar size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                {new Date(selectedEvent.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                                <Clock size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                {selectedEvent.time || 'O dia todo'}
                            </div>
                        </div>

                        {selectedEvent.description && (
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '14px' }}>
                                    <AlignLeft size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                    Descrição
                                </div>
                                <p style={{
                                    fontSize: '15px', color: 'var(--color-text-secondary)',
                                    lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0
                                }}>
                                    {selectedEvent.description}
                                </p>
                            </div>
                        )}

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                removeEvent(selectedEvent.id);
                                setSelectedEvent(null);
                            }}
                            style={{
                                width: '100%', color: 'var(--color-error)', border: '1px solid var(--color-error)',
                                background: 'transparent'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Trash2 size={16} /> Excluir Evento
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
