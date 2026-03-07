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

    // Real calculations as in the Finance Panel footer:
    const saldoCorrente = famFinance.entradas.filter(e => !e.isFixed).reduce((acc, c) => acc + c.value, 0); // Variaveis count
    const saldoFixo = famFinance.entradas.filter(e => e.isFixed).reduce((acc, c) => acc + c.value, 0);
    const despFixaMs = famFinance.fixoMensal.reduce((acc, c) => acc + c.value, 0); // We count both paid and unpaid for the monthly overview

    const creditosAtivos = famFinance.creditos.filter(c => c.type !== 'assinatura' && !c.congelado);
    const currentMonthStr = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`;

    // To filter active credit card items
    const isActiveThisMonth = (startMonth: string, currentMonth: string) => {
        if (!startMonth) return true;
        const [smM, smY] = startMonth.split('-').map(Number);
        const [cmM, cmY] = currentMonth.split('-').map(Number);
        if (smY < cmY) return true;
        if (smY === cmY && smM <= cmM) return true;
        return false;
    };

    const dispCreditosMs = creditosAtivos.filter(c => isActiveThisMonth(c.startMonth || '', currentMonthStr)).reduce((acc, c) => acc + c.value, 0);
    const probsTotalMs = famFinance.problemas.reduce((acc, c) => acc + c.total, 0) || 0; // Se existir parcela de problema

    const totalEntradasNoMes = saldoCorrente + saldoFixo;
    const totalDespesasNoMes = despFixaMs + dispCreditosMs + probsTotalMs;
    const saldoProjetadoLivre = totalEntradasNoMes - totalDespesasNoMes;

    // Use these for display
    const displayIncome = totalEntradasNoMes;
    const displayExpense = totalDespesasNoMes;
    const displayBalance = saldoProjetadoLivre;

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
