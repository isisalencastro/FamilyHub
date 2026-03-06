import { useState } from 'react';
import { useCalendarStore, CalendarEvent } from '@/stores/calendarStore';
import { Calendar, Trash2, Plus, Users, User, Clock } from 'lucide-react';

export function CalendarWidget() {
    const { events, addEvent, removeEvent } = useCalendarStore();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [owner, setOwner] = useState<'isis' | 'angelica' | 'both'>('both');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        addEvent({
            title: title.trim(),
            date,
            time: time || undefined,
            owner
        });
        setTitle('');
        setTime('');
    };

    const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
        return dateA - dateB;
    });

    const getOwnerBadge = (o: 'isis' | 'angelica' | 'both') => {
        switch (o) {
            case 'isis':
                return { label: 'Isis', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' };
            case 'angelica':
                return { label: 'Angélica', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' };
            default:
                return { label: 'Ambas', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' };
        }
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-header">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'var(--color-accent-primary)' }} />
                    Calendário Compartilhado
                </h2>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="Nome do evento..."
                    className="input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="date"
                        className="input"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{ flex: 2 }}
                        required
                    />
                    <input
                        type="time"
                        className="input"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                        className="input"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value as 'isis' | 'angelica' | 'both')}
                        style={{ flex: 1 }}
                    >
                        <option value="both">Ambas (E-mails conjuntos)</option>
                        <option value="isis">Isis (E-mail)</option>
                        <option value="angelica">Angélica (E-mail)</option>
                    </select>
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}>
                        <Plus size={18} />
                    </button>
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '300px', paddingRight: '4px' }}>
                {sortedEvents.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '24px 12px',
                        color: 'var(--color-text-tertiary)',
                    }}>
                        <Clock size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <p style={{ fontSize: '14px' }}>
                            Nenhum evento agendado.
                        </p>
                    </div>
                ) : (
                    sortedEvents.map(ev => {
                        const badge = getOwnerBadge(ev.owner);
                        const [year, month, day] = ev.date.split('-');
                        const formattedDate = `${day}/${month}/${year}`;

                        return (
                            <div key={ev.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 14px', background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)', borderLeft: `3px solid ${badge.color}`,
                                border: '1px solid var(--color-border-subtle)',
                                borderLeftWidth: '3px',
                                borderLeftColor: badge.color,
                                transition: 'all 150ms ease',
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {ev.title}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                                        <span>{formattedDate} {ev.time && `às ${ev.time}`}</span>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: 700
                                        }}>
                                            {ev.owner === 'both' ? <Users size={10} /> : <User size={10} />}
                                            {badge.label}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeEvent(ev.id)}
                                    className="btn btn-ghost"
                                    style={{ padding: '6px', color: 'var(--color-error)', opacity: 0.6, transition: 'opacity 150ms ease' }}
                                    title="Remover evento"
                                    onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
                                    onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.6'; }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
