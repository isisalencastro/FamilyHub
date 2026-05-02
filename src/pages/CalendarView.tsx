import { useState, useMemo, useEffect } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { useCalendarCommentsStore } from '@/stores/calendarCommentsStore';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, MessageCircle, Send, Trash2, User, AlignLeft, X, Clock } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

const AUTHOR_CONFIG: Record<string, { displayName: string; avatar: string; color: string }> = {
    user2: { displayName: 'User2', avatar: 'I', color: '#8b5cf6' },
    user1: { displayName: 'User1', avatar: 'A', color: '#ec4899' },
    familia: { displayName: 'Família', avatar: 'F', color: '#f59e0b' },
};

export function CalendarView() {
    const { events, addEvent, removeEvent } = useCalendarStore();
    const { comments, addComment, removeComment } = useCalendarCommentsStore();
    const { activeWorkspace } = useWorkspaceStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    // Comment form state
    const [commentText, setCommentText] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState(activeWorkspace.id || 'familia');

    useEffect(() => {
        if (activeWorkspace.id && AUTHOR_CONFIG[activeWorkspace.id]) {
            setSelectedAuthor(activeWorkspace.id);
        }
    }, [activeWorkspace.id]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        addEvent({
            title: title.trim(),
            description: description.trim() || undefined,
            date,
            time: time || undefined,
            owner: 'both' // hardcoded value
        });
        setTitle('');
        setDescription('');
        setTime('');
        setIsAddingEvent(false);
    };

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        const authorKey = selectedAuthor;
        const authorCfg = AUTHOR_CONFIG[authorKey] || AUTHOR_CONFIG.familia;
        addComment({
            author: authorKey,
            authorAvatar: authorCfg.avatar,
            authorColor: authorCfg.color,
            text: commentText.trim(),
            date: '', // general comment, not tied to specific date
        });
        setCommentText('');
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

    const formatTimeAgo = (dateStr: string) => {
        const now = new Date();
        const commentDate = new Date(dateStr);
        const diffMs = now.getTime() - commentDate.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'agora';
        if (diffMin < 60) return `${diffMin}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;
        return commentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
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
                            {!isFamilia && 'Mudando para a Visão Geral você pode ver todos os eventos.'}
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Horário (Opcional)</label>
                                        <input
                                            type="time"
                                            className="input"
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Descrição (Opcional)</label>
                                        <textarea
                                            className="input"
                                            placeholder="Ex: Não esqueça os documentos..."
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            style={{ minHeight: '60px', resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setIsAddingEvent(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Salvar Evento</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Calendar Card */}
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
                                            <div key={ev.id} 
                                                onClick={() => setSelectedEvent(ev)}
                                                style={{
                                                fontSize: '11px', padding: '4px', borderRadius: '4px',
                                                background: 'var(--color-bg-tertiary)',
                                                borderLeft: `3px solid ${getOwnerBadgeColor()}`,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                cursor: 'pointer', transition: 'background 0.2s ease'
                                            }} title="Clique para ver detalhes" onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-tertiary)')}>
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

                {/* ─── Comments Section ─── */}
                <div className="card" style={{ marginTop: '24px' }}>
                    {/* Comments Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: 'var(--color-accent-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <MessageCircle size={18} style={{ color: 'var(--color-accent-primary)' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                                Comentários
                            </h3>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: 0 }}>
                                Deixe notas e lembretes visíveis para toda a família
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            <span style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text-secondary)',
                            }}>
                                {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
                            </span>
                        </div>
                    </div>

                    {/* Comment Input */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        marginBottom: comments.length > 0 ? '24px' : '0',
                        padding: '16px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--color-border-subtle)',
                    }}>
                        {/* Author Avatar */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${AUTHOR_CONFIG[selectedAuthor]?.color || '#8b5cf6'}, ${AUTHOR_CONFIG[selectedAuthor]?.color || '#8b5cf6'}cc)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '14px',
                            flexShrink: 0,
                        }}>
                            {AUTHOR_CONFIG[selectedAuthor]?.avatar || 'F'}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comentar como:</span>
                                <select 
                                    value={selectedAuthor}
                                    onChange={e => setSelectedAuthor(e.target.value)}
                                    style={{
                                        border: '1px solid var(--color-border-subtle)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'transparent',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        padding: '2px 4px',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {Object.entries(AUTHOR_CONFIG).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.displayName}</option>
                                    ))}
                                </select>
                            </div>
                            <textarea
                                placeholder={`Escreva um comentário como ${AUTHOR_CONFIG[selectedAuthor]?.displayName || 'Família'}...`}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    minHeight: '44px',
                                    maxHeight: '120px',
                                    resize: 'vertical',
                                    padding: '10px 14px',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border-default)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    transition: 'border-color 150ms ease',
                                    lineHeight: '1.5',
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                                    Pressione Enter para enviar · Shift+Enter para nova linha
                                </span>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim()}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        opacity: commentText.trim() ? 1 : 0.5,
                                    }}
                                >
                                    <Send size={14} />
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Comment List */}
                    {comments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {comments.map((comment, index) => {
                                const authorCfg = AUTHOR_CONFIG[comment.author] || { displayName: comment.author, avatar: comment.author[0]?.toUpperCase() || '?', color: '#6b7280' };
                                const isOwn = comment.author === activeWorkspace.id;

                                return (
                                    <div
                                        key={comment.id}
                                        style={{
                                            display: 'flex',
                                            gap: '12px',
                                            padding: '14px 16px',
                                            borderRadius: 'var(--radius-lg)',
                                            background: isOwn ? `${authorCfg.color}06` : 'transparent',
                                            transition: 'background 150ms ease',
                                            animation: index < 3 ? `fadeInUp 0.3s ease-out ${index * 0.05}s` : 'none',
                                            animationFillMode: 'backwards',
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${authorCfg.color}, ${authorCfg.color}bb)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '13px',
                                            flexShrink: 0,
                                        }}>
                                            {authorCfg.avatar}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    color: authorCfg.color,
                                                }}>
                                                    {authorCfg.displayName}
                                                </span>
                                                <span style={{
                                                    fontSize: '11px',
                                                    color: 'var(--color-text-tertiary)',
                                                }}>
                                                    {formatTimeAgo(comment.createdAt)}
                                                </span>
                                                {isOwn && (
                                                    <span style={{
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        padding: '1px 6px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: `${authorCfg.color}15`,
                                                        color: authorCfg.color,
                                                    }}>
                                                        você
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: 'var(--color-text-primary)',
                                                lineHeight: '1.6',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}>
                                                {comment.text}
                                            </div>
                                        </div>

                                        {/* Delete (own comments only) */}
                                        {isOwn && (
                                            <button
                                                onClick={() => removeComment(comment.id)}
                                                title="Excluir comentário"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--color-text-tertiary)',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    opacity: 0.4,
                                                    transition: 'opacity 150ms ease',
                                                    flexShrink: 0,
                                                    alignSelf: 'flex-start',
                                                    marginTop: '2px',
                                                }}
                                                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
                                                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.4'; }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty State */}
                    {comments.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '32px 0 12px',
                            color: 'var(--color-text-tertiary)',
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: 'var(--color-bg-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px',
                            }}>
                                <MessageCircle size={20} style={{ opacity: 0.5 }} />
                            </div>
                            <p style={{ fontSize: '13px', fontWeight: 500 }}>
                                Nenhum comentário ainda. Comece a conversa!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Event Details Modal */}
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
                            <CalendarIcon size={24} />
                        </div>

                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '16px', lineHeight: 1.2 }}>
                            {selectedEvent.title}
                        </h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                                <CalendarIcon size={16} style={{ color: 'var(--color-accent-primary)' }} />
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
