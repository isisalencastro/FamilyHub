import { useState } from 'react';
import { useCalendarStore, CalendarEvent } from '@/stores/calendarStore';
import { Calendar, Trash2, Plus, Users, User } from 'lucide-react';

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
                return { label: 'Isis', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' };
            case 'angelica':
                return { label: 'Angélica', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' };
            default:
                return { label: 'Ambas', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
        }
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-header">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} /> Calendário Compartilhado
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
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>
                        <Plus size={18} />
                    </button>
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '300px', paddingRight: '4px' }}>
                {sortedEvents.length === 0 ? (
                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>
                        Nenhum evento agendado.
                    </p>
                ) : (
                    sortedEvents.map(ev => {
                        const badge = getOwnerBadge(ev.owner);
                        const [year, month, day] = ev.date.split('-');
                        const formattedDate = `${day}/${month}/${year}`;

                        return (
                            <div key={ev.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${badge.color}`
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {ev.title}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                                        <span>{formattedDate} {ev.time && `às ${ev.time}`}</span>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            background: badge.bg, color: badge.color, padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600
                                        }}>
                                            {ev.owner === 'both' ? <Users size={10} /> : <User size={10} />}
                                            {badge.label}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeEvent(ev.id)}
                                    className="btn btn-ghost"
                                    style={{ padding: '6px', color: 'var(--color-error)' }}
                                    title="Remover evento"
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
