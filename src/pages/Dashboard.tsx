import { useEffect } from 'react';
import {
    CheckSquare,
    Wallet,
    TrendingUp,
    Sparkles,
    Check,
    FileText,
    ChevronRight,
    Star,
    Zap,
    ShoppingCart,
    Target,
    PawPrint,
    Calendar as CalendarIcon,
    ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useFamilyFinanceStore } from '@/stores/familyFinanceStore';
import { useDocStore } from '@/stores/docStore';
import { useShoppingStore } from '@/stores/shoppingStore';
import { useGoalStore } from '@/stores/goalStore';
import { usePetStore } from '@/stores/petStore';
import { WeatherWidget } from '@/components/WeatherWidget';
import { CalendarWidget } from '@/components/CalendarWidget';

export function Dashboard() {
    const navigate = useNavigate();
    const { activeWorkspace } = useWorkspaceStore();
    const { tasks, toggleTask } = useTaskStore();
    const { getSummaryByWorkspace, getTransactionsByWorkspace } = useFinanceStore();
    const { documents, loadDocuments } = useDocStore();
    const { items: shoppingItems } = useShoppingStore();
    const { goals } = useGoalStore();
    const { pets } = usePetStore();

    useEffect(() => { loadDocuments(); }, []);

    const wsTasks = tasks.filter((t) => t.workspaceId === activeWorkspace.id);
    const wsGoals = goals.filter((g) => g.workspaceId === activeWorkspace.id);

    const pendingTasks = wsTasks.filter((t) => t.status !== 'done');
    const doneTasks = wsTasks.filter((t) => t.status === 'done');
    const shoppingToBuy = shoppingItems.filter((i) => !i.completed).length;
    const activeGoals = wsGoals.filter((g) => g.progress < 100).length;

    const greetingName =
        activeWorkspace.id === 'familia' ? 'Família' : activeWorkspace.displayName;

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const isFamilia = activeWorkspace.id === 'familia';
    const famFinance = useFamilyFinanceStore();

    // Finance calculations
    const saldoCorrente = famFinance.entradas.filter(e => !e.isFixed).reduce((acc, c) => acc + c.value, 0);
    const saldoFixo = famFinance.entradas.filter(e => e.isFixed).reduce((acc, c) => acc + c.value, 0);
    const despFixaMs = famFinance.fixoMensal.reduce((acc, c) => acc + c.value, 0);

    const creditosAtivos = famFinance.creditos.filter(c => c.type !== 'assinatura' && !c.congelado);
    const currentMonthStr = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`;

    const isActiveThisMonth = (startMonth: string, currentMonth: string) => {
        if (!startMonth) return true;
        const [smM, smY] = startMonth.split('-').map(Number);
        const [cmM, cmY] = currentMonth.split('-').map(Number);
        if (smY < cmY) return true;
        if (smY === cmY && smM <= cmM) return true;
        return false;
    };

    const dispCreditosMs = creditosAtivos.filter(c => isActiveThisMonth(c.startMonth || '', currentMonthStr)).reduce((acc, c) => acc + c.value, 0);
    const probsTotalMs = famFinance.problemas.reduce((acc, c) => acc + c.total, 0) || 0;

    const totalEntradasNoMes = saldoCorrente + saldoFixo;
    const totalDespesasNoMes = despFixaMs + dispCreditosMs + probsTotalMs;
    const saldoProjetadoLivre = totalEntradasNoMes - totalDespesasNoMes;

    const displayIncome = totalEntradasNoMes;
    const displayExpense = totalDespesasNoMes;
    const displayBalance = saldoProjetadoLivre;

    const taskCompletionRate = wsTasks.length > 0 ? Math.round((doneTasks.length / wsTasks.length) * 100) : 0;

    // Quick access sections config
    const quickAccessSections = [
        {
            key: 'tasks',
            label: 'Tarefas',
            subtitle: `${pendingTasks.length} pendente${pendingTasks.length !== 1 ? 's' : ''}`,
            icon: CheckSquare,
            color: '#8b5cf6',
            bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            path: '/tasks',
            badge: pendingTasks.length > 0 ? pendingTasks.length : null,
        },
        {
            key: 'shopping',
            label: 'Compras',
            subtitle: `${shoppingToBuy} ${shoppingToBuy === 1 ? 'item' : 'itens'} para comprar`,
            icon: ShoppingCart,
            color: '#22c55e',
            bg: 'linear-gradient(135deg, #22c55e, #16a34a)',
            path: '/tasks',
            badge: shoppingToBuy > 0 ? shoppingToBuy : null,
        },
        {
            key: 'goals',
            label: 'Objetivos',
            subtitle: `${activeGoals} ${activeGoals === 1 ? 'ativo' : 'ativos'}`,
            icon: Target,
            color: '#f59e0b',
            bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
            path: '/tasks',
            badge: activeGoals > 0 ? activeGoals : null,
        },
        {
            key: 'pets',
            label: 'Pets',
            subtitle: `${pets.length} ${pets.length === 1 ? 'pet' : 'pets'} cadastrado${pets.length !== 1 ? 's' : ''}`,
            icon: PawPrint,
            color: '#ec4899',
            bg: 'linear-gradient(135deg, #ec4899, #db2777)',
            path: '/pets',
            badge: null,
        },
        {
            key: 'finance',
            label: 'Finanças',
            subtitle: formatCurrency(displayBalance),
            icon: Wallet,
            color: '#06b6d4',
            bg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            path: '/finance',
            badge: null,
        },
        {
            key: 'calendar',
            label: 'Calendário',
            subtitle: 'Eventos da família',
            icon: CalendarIcon,
            color: '#a855f7',
            bg: 'linear-gradient(135deg, #a855f7, #9333ea)',
            path: '/calendar',
            badge: null,
        },
    ];

    if (isFamilia) {
        quickAccessSections.push({
            key: 'docs',
            label: 'Documentos',
            subtitle: `${documents.length} documento${documents.length !== 1 ? 's' : ''}`,
            icon: FileText,
            color: '#14b8a6',
            bg: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            path: '/docs',
            badge: null,
        });
    }

    return (
        <div className="main-content">
            <div className="page-container">
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '32px',
                }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px',
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, var(--color-accent-primary), #6d28d9)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'var(--shadow-glow)',
                            }}>
                                <Sparkles size={22} color="white" />
                            </div>
                            <div>
                                <h1 style={{
                                    fontSize: '26px',
                                    fontWeight: 800,
                                    letterSpacing: '-0.03em',
                                    color: 'var(--color-text-primary)',
                                    margin: 0,
                                }}>
                                    {greeting}, {greetingName}!
                                </h1>
                                <p style={{
                                    fontSize: '14px',
                                    color: 'var(--color-text-secondary)',
                                    margin: 0,
                                    marginTop: '2px',
                                }}>
                                    Acesso rápido a todas as seções do seu hub. ✨
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {isFamilia && <WeatherWidget />}
                    </div>
                </div>

                {/* ─── Quick Access Grid ─── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '14px',
                    marginBottom: '28px',
                }}>
                    {quickAccessSections.map((section, index) => (
                        <div
                            key={section.key}
                            onClick={() => navigate(section.path)}
                            style={{
                                position: 'relative',
                                cursor: 'pointer',
                                padding: '20px',
                                borderRadius: 'var(--radius-xl)',
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border-default)',
                                overflow: 'hidden',
                                transition: 'all 200ms ease',
                                animation: `scaleIn 0.3s ease-out ${index * 0.05}s`,
                                animationFillMode: 'backwards',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${section.color}20`;
                                (e.currentTarget as HTMLElement).style.borderColor = `${section.color}40`;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-default)';
                            }}
                        >
                            {/* Decorative gradient corner */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '80px',
                                height: '80px',
                                background: `radial-gradient(circle at top right, ${section.color}12, transparent 70%)`,
                                pointerEvents: 'none',
                            }} />

                            {/* Icon */}
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: section.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '14px',
                                boxShadow: `0 4px 12px ${section.color}30`,
                            }}>
                                <section.icon size={20} color="white" />
                            </div>

                            {/* Label + Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                }}>
                                    {section.label}
                                </span>
                                {section.badge && (
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: `${section.color}18`,
                                        color: section.color,
                                    }}>
                                        {section.badge}
                                    </span>
                                )}
                            </div>

                            {/* Subtitle */}
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--color-text-tertiary)',
                                margin: 0,
                            }}>
                                {section.subtitle}
                            </p>

                            {/* Arrow indicator */}
                            <ArrowRight
                                size={14}
                                style={{
                                    position: 'absolute',
                                    bottom: '16px',
                                    right: '16px',
                                    color: 'var(--color-text-tertiary)',
                                    opacity: 0.4,
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* ─── Main Content ─── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isFamilia ? '1fr 1fr' : '1fr',
                    gap: '16px',
                    marginBottom: '16px',
                }}>
                    {/* Finance Summary Card */}
                    <div className="card" style={{ animation: 'slideInLeft 0.4s ease-out' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Wallet size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                Finanças
                            </h2>
                            <button
                                className="btn btn-ghost"
                                onClick={() => navigate('/finance')}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-accent-secondary)' }}
                            >
                                Ver tudo <ChevronRight size={14} />
                            </button>
                        </div>
                        <div style={{ padding: '16px', background: 'var(--color-bg-tertiary)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', margin: '12px', borderLeft: '4px solid var(--color-accent-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Receitas no Mês</span>
                                <span style={{ fontSize: '14px', color: 'var(--color-success)', fontWeight: 700 }}>{formatCurrency(displayIncome)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--color-border-default)', paddingBottom: '16px' }}>
                                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Despesas no Mês</span>
                                <span style={{ fontSize: '14px', color: 'var(--color-error)', fontWeight: 700 }}>{formatCurrency(displayExpense)}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>SALDO PROJETADO RESTANTE (LIVRE)</div>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: displayBalance >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    {formatCurrency(displayBalance)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks + Progress */}
                    <div className="card" style={{ animation: 'slideInLeft 0.4s ease-out 0.1s', animationFillMode: 'backwards' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckSquare size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                Tarefas recentes
                            </h2>
                            <button
                                className="btn btn-ghost"
                                onClick={() => navigate('/tasks')}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-accent-secondary)' }}
                            >
                                Ver todas <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Progress bar */}
                        {wsTasks.length > 0 && (
                            <div style={{ padding: '0 16px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Progresso geral</span>
                                    <span style={{ fontSize: '12px', color: 'var(--color-accent-secondary)', fontWeight: 700 }}>{taskCompletionRate}%</span>
                                </div>
                                <div style={{
                                    height: '6px',
                                    background: 'var(--color-bg-hover)',
                                    borderRadius: 'var(--radius-full)',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${taskCompletionRate}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))',
                                        borderRadius: 'var(--radius-full)',
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            </div>
                        )}

                        <div className="task-list">
                            {wsTasks.slice(0, 5).map((task) => (
                                <div key={task.id} className="task-item" onClick={() => toggleTask(task.id)}>
                                    <div className={`task-checkbox ${task.status === 'done' ? 'done' : ''}`}>
                                        {task.status === 'done' && <Check size={12} color="white" />}
                                    </div>
                                    <span className={`task-text ${task.status === 'done' ? 'done' : ''}`}>
                                        {task.title}
                                    </span>
                                    <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                                </div>
                            ))}
                            {wsTasks.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '24px 12px',
                                    color: 'var(--color-text-tertiary)',
                                }}>
                                    <Zap size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p style={{ fontSize: '14px' }}>
                                        Nenhuma tarefa ainda. Que tal criar uma?
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Bottom Row: Goals Summary + Calendar ─── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isFamilia ? '1fr 1fr' : '1fr',
                    gap: '16px',
                }}>
                    {/* Goals Overview */}
                    <div className="card" style={{ animation: 'slideInLeft 0.4s ease-out 0.2s', animationFillMode: 'backwards' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Target size={18} style={{ color: '#f59e0b' }} />
                                Objetivos
                            </h2>
                            <button
                                className="btn btn-ghost"
                                onClick={() => navigate('/tasks')}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-accent-secondary)' }}
                            >
                                Ver todos <ChevronRight size={14} />
                            </button>
                        </div>

                        {wsGoals.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 4px' }}>
                                {wsGoals.slice(0, 4).map((goal) => {
                                    const isCompleted = goal.progress === 100;
                                    return (
                                        <div key={goal.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 12px',
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'var(--color-bg-tertiary)',
                                            border: '1px solid var(--color-border-subtle)',
                                        }}>
                                            <span style={{ fontSize: '18px' }}>{isCompleted ? '🏆' : '🎯'}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: 'var(--color-text-primary)',
                                                    textDecoration: isCompleted ? 'line-through' : 'none',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {goal.title}
                                                </div>
                                                <div style={{
                                                    height: '4px',
                                                    borderRadius: '2px',
                                                    background: 'var(--color-bg-hover)',
                                                    marginTop: '6px',
                                                    overflow: 'hidden',
                                                }}>
                                                    <div style={{
                                                        width: `${goal.progress}%`,
                                                        height: '100%',
                                                        borderRadius: '2px',
                                                        background: isCompleted
                                                            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                                            : 'linear-gradient(90deg, #f59e0b, #d97706)',
                                                        transition: 'width 300ms ease',
                                                    }} />
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                color: isCompleted ? 'var(--color-success)' : '#f59e0b',
                                                minWidth: '32px',
                                                textAlign: 'right' as const,
                                            }}>
                                                {goal.progress}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '24px 12px',
                                color: 'var(--color-text-tertiary)',
                            }}>
                                <Target size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                <p style={{ fontSize: '14px' }}>
                                    Defina suas metas e acompanhe o progresso!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Calendar Widget */}
                    {isFamilia && <CalendarWidget />}
                </div>
            </div>
        </div>
    );
}
