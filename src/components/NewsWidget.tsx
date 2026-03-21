import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, GraduationCap, Globe, Cpu } from 'lucide-react';
import { fetchNews, type NewsItem, type NewsCategory } from '@/lib/newsService';

const CATEGORY_CONFIG: Record<NewsCategory, { label: string; icon: typeof Globe; color: string; emoji: string }> = {
    geral: { label: 'Geral', icon: Globe, color: '#8b5cf6', emoji: '🌍' },
    tecnologia: { label: 'Tecnologia', icon: Cpu, color: '#06b6d4', emoji: '💻' },
    educacao: { label: 'Educação', icon: GraduationCap, color: '#f59e0b', emoji: '📚' },
};

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function NewsWidget() {
    const [category, setCategory] = useState<NewsCategory>('geral');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadNews = async (cat: NewsCategory) => {
        setLoading(true);
        setError(false);
        const items = await fetchNews(cat, 6);
        if (items.length === 0) {
            setError(true);
        }
        setNews(items);
        setLoading(false);
    };

    useEffect(() => {
        loadNews(category);
    }, [category]);

    const catConfig = CATEGORY_CONFIG[category];

    return (
        <div className="card" style={{ animation: 'slideInLeft 0.4s ease-out 0.3s', animationFillMode: 'backwards' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    }}>
                        <Newspaper size={18} color="white" />
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            margin: 0,
                        }}>
                            Notícias Importantes
                        </h2>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                            Atualizações do dia
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => loadNews(category)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 150ms ease',
                    }}
                    title="Atualizar notícias"
                >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                </button>
            </div>

            {/* Category Tabs */}
            <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '16px',
                padding: '3px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border-subtle)',
            }}>
                {(Object.keys(CATEGORY_CONFIG) as NewsCategory[]).map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const isActive = category === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                background: isActive
                                    ? `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`
                                    : 'transparent',
                                color: isActive ? 'white' : 'var(--color-text-secondary)',
                                fontSize: '12px',
                                fontWeight: isActive ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 150ms ease',
                                fontFamily: 'inherit',
                                boxShadow: isActive ? `0 2px 8px ${cfg.color}40` : 'none',
                            }}
                        >
                            <span style={{ fontSize: '13px' }}>{cfg.emoji}</span>
                            {cfg.label}
                        </button>
                    );
                })}
            </div>

            {/* News List */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            height: '72px',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--color-bg-tertiary)',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                    ))}
                </div>
            ) : error ? (
                <div style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    color: 'var(--color-text-tertiary)',
                }}>
                    <Newspaper size={28} style={{ marginBottom: '10px', opacity: 0.4 }} />
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>
                        Não foi possível carregar as notícias.
                    </p>
                    <button
                        onClick={() => loadNews(category)}
                        style={{
                            marginTop: '8px',
                            padding: '6px 16px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border-default)',
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-accent-secondary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {news.map((item, index) => (
                        <a
                            key={index}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                gap: '12px',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border-subtle)',
                                textDecoration: 'none',
                                color: 'inherit',
                                cursor: 'pointer',
                                transition: 'all 150ms ease',
                                animation: `fadeInUp 0.25s ease-out ${index * 0.05}s`,
                                animationFillMode: 'backwards',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${catConfig.color}40`;
                                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border-subtle)';
                                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(0)';
                            }}
                        >
                            {/* Thumbnail */}
                            {item.thumbnail && (
                                <div style={{
                                    width: '72px',
                                    height: '54px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: 'var(--color-bg-hover)',
                                }}>
                                    <img
                                        src={item.thumbnail}
                                        alt=""
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    lineHeight: 1.35,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical' as const,
                                    overflow: 'hidden',
                                    marginBottom: '4px',
                                }}>
                                    {item.title}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '11px',
                                    color: 'var(--color-text-tertiary)',
                                }}>
                                    <span style={{
                                        fontWeight: 600,
                                        color: catConfig.color,
                                    }}>
                                        {item.source}
                                    </span>
                                    <span>·</span>
                                    <span>{formatDate(item.pubDate)}</span>
                                </div>
                            </div>

                            {/* External link icon */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: 0,
                            }}>
                                <ExternalLink size={12} style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
