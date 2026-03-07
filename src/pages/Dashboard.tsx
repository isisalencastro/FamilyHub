import {
    CheckSquare,
    FolderKanban,
    Wallet,
    TrendingUp,
    Sparkles,
    ArrowRight,
    Check,
    FileText,
    MessageCircle,
    Bell,
    ChevronRight,
    Clock,
    Star,
    Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useFamilyFinanceStore } from '@/stores/familyFinanceStore';
import { useDocStore } from '@/stores/docStore';
import { WeatherWidget } from '@/components/WeatherWidget';
import { CalendarWidget } from '@/components/CalendarWidget';

export function Dashboard() {
    const navigate = useNavigate();
    const { activeWorkspace } = useWorkspaceStore();
    const { tasks, toggleTask } = useTaskStore();
    const { projects } = useProjectStore();
    const { getSummaryByWorkspace, getTransactionsByWorkspace } = useFinanceStore();
    const { documents } = useDocStore();

    const wsTasks = tasks.filter((t) => t.workspaceId === activeWorkspace.id);
    const wsProjects = projects.filter((p) => p.workspaceId === activeWorkspace.id);
    const financeSummary = getSummaryByWorkspace(activeWorkspace.id);
    const recentTransactions = getTransactionsByWorkspace(activeWorkspace.id).slice(0, 3);

    const pendingTasks = wsTasks.filter((t) => t.status !== 'done');
    const doneTasks = wsTasks.filter((t) => t.status === 'done');

    const greetingName =
        activeWorkspace.id === 'familia' ? 'Família' : activeWorkspace.displayName;

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const isFamilia = activeWorkspace.id === 'familia';
    const famFinance = useFamilyFinanceStore();

    // Calculate Dynamic Finance Summary for Family
    const staticFamilyIncome = famFinance.entradas.reduce((acc, c) => acc + c.value, 0);
    const staticFamilyExpense = famFinance.fixoMensal.filter(x => !x.paid).reduce((acc, c) => acc + c.value, 0) + famFinance.creditos.filter(x => !x.paid).reduce((acc, c) => acc + c.value, 0) + famFinance.problemas.filter(x => !x.paid).reduce((acc, c) => acc + c.total, 0);

    const displayIncome = isFamilia ? staticFamilyIncome : financeSummary.totalIncome;
    const displayExpense = isFamilia ? staticFamilyExpense : financeSummary.totalExpense;
    const displayBalance = isFamilia ? (staticFamilyIncome - staticFamilyExpense) : financeSummary.balance;

    const taskCompletionRate = wsTasks.length > 0 ? Math.round((doneTasks.length / wsTasks.length) * 100) : 0;

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
                                    {isFamilia
                                        ? 'Resumo de todas as tarefas e finanças da casa.'
                                        : 'Seu espaço pessoal de tarefas e anotações. ✨'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {isFamilia && <WeatherWidget />}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="dashboard-grid" style={{
                    gridTemplateColumns: isFamilia ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                }}>
                    <div className="stat-card purple" style={{ animation: 'scaleIn 0.3s ease-out' }}>
                        <div className="stat-icon purple">
                            <CheckSquare size={22} />
                        </div>
                        <div className="stat-value">{pendingTasks.length}</div>
                        <div className="stat-label">Tarefas pendentes</div>
                        {wsTasks.length > 0 && (
                            <div style={{
                                marginTop: '12px',
                                height: '4px',
                                background: 'var(--color-bg-hover)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${100 - taskCompletionRate}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))',
                                    borderRadius: 'var(--radius-full)',
                                    transition: 'width 0.5s ease',
                                }} />
                            </div>
                        )}
                    </div>

                    <div className="stat-card green" style={{ animation: 'scaleIn 0.3s ease-out 0.1s', animationFillMode: 'backwards' }}>
                        <div className="stat-icon green">
                            <TrendingUp size={22} />
                        </div>
                        <div className="stat-value">{doneTasks.length}</div>
                        <div className="stat-label">Tarefas concluídas</div>
                        {wsTasks.length > 0 && (
                            <div style={{
                                marginTop: '12px',
                                fontSize: '12px',
                                color: 'var(--color-success)',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}>
                                <Star size={12} />
                                {taskCompletionRate}% completo
                            </div>
                        )}
                    </div>

                    <div className="stat-card blue" style={{ animation: 'scaleIn 0.3s ease-out 0.2s', animationFillMode: 'backwards' }}>
                        <div className="stat-icon blue">
                            <FolderKanban size={22} />
                        </div>
                        <div className="stat-value">{wsProjects.length}</div>
                        <div className="stat-label">Projetos ativos</div>
                    </div>

                    {isFamilia && (
                        <div className="stat-card cyan" style={{ animation: 'scaleIn 0.3s ease-out 0.3s', animationFillMode: 'backwards' }}>
                            <div className="stat-icon cyan">
                                <FileText size={22} />
                            </div>
                            <div className="stat-value">{documents.length}</div>
                            <div className="stat-label">Documentos</div>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="content-grid">
                    {/* Finance Summary */}
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
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div className="finance-summary-card income" style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-success)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Receita {isFamilia ? '(Salários+Vales)' : ''}
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCurrency(displayIncome)}</div>
                            </div>
                            <div className="finance-summary-card expense" style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-error)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Despesa {isFamilia ? '(Fixa)' : ''}
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCurrency(displayExpense)}</div>
                            </div>
                        </div>
                        <div className="finance-summary-card balance">
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {isFamilia ? 'Fluxo Livre Planejado' : 'Saldo'}
                            </div>
                            <div style={{
                                fontSize: '22px',
                                fontWeight: 800,
                                letterSpacing: '-0.02em',
                                color: displayBalance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                            }}>
                                {formatCurrency(displayBalance)}
                            </div>
                        </div>

                        {/* Mini Finance Bar Chart */}
                        {isFamilia && (() => {
                            const fixoTotal = famFinance.fixoMensal.filter(x => !x.paid).reduce((acc, c) => acc + c.value, 0);
                            const creditoTotal = famFinance.creditos.filter(x => !x.paid).reduce((acc, c) => acc + c.value, 0) + famFinance.problemas.filter(x => !x.paid).reduce((acc, c) => acc + c.total, 0);
                            const livre = Math.max(staticFamilyIncome - fixoTotal - creditoTotal, 0);
                            const maxVal = Math.max(staticFamilyIncome, fixoTotal + creditoTotal + livre, 1);
                            const bars = [
                                { label: 'Receita', value: staticFamilyIncome, color: '#22c55e' },
                                { label: 'Fixos', value: fixoTotal, color: '#ef4444' },
                                { label: 'Créditos', value: creditoTotal, color: '#f59e0b' },
                                { label: 'Livre', value: livre, color: '#8b5cf6' },
                            ];
                            return (
                                <div style={{ marginTop: '16px', padding: '12px 0 0' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '48px' }}>
                                        {bars.map((bar) => {
                                            const pct = Math.max((bar.value / maxVal) * 100, 4);
                                            return (
                                                <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                    <div
                                                        style={{
                                                            width: '100%',
                                                            height: `${pct * 0.48}px`,
                                                            minHeight: '4px',
                                                            background: `linear-gradient(180deg, ${bar.color}, ${bar.color}80)`,
                                                            borderRadius: '4px 4px 2px 2px',
                                                            transition: 'height 0.5s ease',
                                                        }}
                                                        title={`${bar.label}: ${formatCurrency(bar.value)}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                        {bars.map((bar) => (
                                            <div key={bar.label} style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ fontSize: '10px', fontWeight: 600, color: bar.color }}>{bar.label}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{formatCurrency(bar.value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Tasks */}
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

                    {/* Calendar (Only for Family) */}
                    {isFamilia && <CalendarWidget />}
                </div>

                {/* Quick Access Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isFamilia ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                    gap: '12px',
                    marginTop: '16px',
                }}>
                    <div
                        className="quick-access-card"
                        onClick={() => navigate('/projects')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                background: 'var(--color-accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <FolderKanban size={22} style={{ color: 'var(--color-accent-primary)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 700 }}>Projetos</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                    {wsProjects.length} projeto{wsProjects.length !== 1 ? 's' : ''} · Board Kanban
                                </div>
                            </div>
                            <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                        </div>
                    </div>

                    <div
                        className="quick-access-card"
                        onClick={() => navigate('/chat')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                background: 'linear-gradient(135deg, var(--color-accent-primary), #6d28d9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: 'var(--shadow-glow)',
                            }}>
                                <MessageCircle size={22} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 700 }}>Chat com Ring</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                    Sua assistente pessoal
                                </div>
                            </div>
                            <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                        </div>
                    </div>

                    {isFamilia && (
                        <div
                            className="quick-access-card"
                            onClick={() => navigate('/docs')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <FileText size={22} style={{ color: 'var(--color-ws-familia)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Documentos</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                        {documents.length} documento{documents.length !== 1 ? 's' : ''} da família
                                    </div>
                                </div>
                                <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
