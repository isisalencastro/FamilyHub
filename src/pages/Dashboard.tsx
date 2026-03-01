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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useDocStore } from '@/stores/docStore';

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
        activeWorkspace.id === 'familia' ? 'pessoal' : activeWorkspace.displayName;

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const isFamilia = activeWorkspace.id === 'familia';

    return (
        <div className="main-content">
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <Sparkles size={28} style={{ color: 'var(--color-accent-primary)' }} />
                        <h1 className="page-title">
                            {greeting}, {greetingName}!
                        </h1>
                    </div>
                    <p className="page-subtitle">
                        Aqui está o resumo do seu workspace. ✨
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="dashboard-grid" style={{ gridTemplateColumns: isFamilia ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' }}>
                    <div className="stat-card purple">
                        <div className="stat-icon purple">
                            <CheckSquare size={20} />
                        </div>
                        <div className="stat-value">{pendingTasks.length}</div>
                        <div className="stat-label">Tarefas pendentes</div>
                    </div>

                    <div className="stat-card green">
                        <div className="stat-icon green">
                            <TrendingUp size={20} />
                        </div>
                        <div className="stat-value">{doneTasks.length}</div>
                        <div className="stat-label">Tarefas concluídas</div>
                    </div>

                    <div className="stat-card blue">
                        <div className="stat-icon blue">
                            <FolderKanban size={20} />
                        </div>
                        <div className="stat-value">{wsProjects.length}</div>
                        <div className="stat-label">Projetos ativos</div>
                    </div>

                    {isFamilia && (
                        <div className="stat-card cyan">
                            <div className="stat-icon cyan">
                                <FileText size={20} />
                            </div>
                            <div className="stat-value">{documents.length}</div>
                            <div className="stat-label">Documentos</div>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="content-grid">
                    {/* Finance Summary */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Finanças</h2>
                            <button
                                className="btn btn-ghost"
                                onClick={() => navigate('/finance')}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                            >
                                Ver tudo <ArrowRight size={14} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ flex: 1, padding: '12px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-success)', marginBottom: '4px' }}>Receita</div>
                                <div style={{ fontSize: '16px', fontWeight: 700 }}>{formatCurrency(financeSummary.totalIncome)}</div>
                            </div>
                            <div style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-error)', marginBottom: '4px' }}>Despesa</div>
                                <div style={{ fontSize: '16px', fontWeight: 700 }}>{formatCurrency(financeSummary.totalExpense)}</div>
                            </div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Saldo</div>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 800,
                                color: financeSummary.balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                            }}>
                                {formatCurrency(financeSummary.balance)}
                            </div>
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Tarefas recentes</h2>
                            <button
                                className="btn btn-ghost"
                                onClick={() => navigate('/tasks')}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                            >
                                Ver todas <ArrowRight size={14} />
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
                                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px', padding: '12px' }}>
                                    Nenhuma tarefa ainda. Que tal criar uma?
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: isFamilia ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '12px', marginTop: '20px' }}>
                    <div
                        className="card"
                        style={{
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(109, 40, 217, 0.04))',
                            borderColor: 'var(--color-border-default)',
                        }}
                        onClick={() => navigate('/projects')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                background: 'var(--color-accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <FolderKanban size={20} style={{ color: 'var(--color-accent-primary)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>Projetos</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                    {wsProjects.length} projeto{wsProjects.length !== 1 ? 's' : ''} · Board Kanban
                                </div>
                            </div>
                            <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--color-text-tertiary)' }} />
                        </div>
                    </div>

                    <div
                        className="card"
                        style={{
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(109, 40, 217, 0.04))',
                            borderColor: 'var(--color-border-default)',
                        }}
                        onClick={() => navigate('/chat')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                background: 'linear-gradient(135deg, var(--color-accent-primary), #6d28d9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <MessageCircle size={20} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>Chat com Ring</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                    Sua assistente pessoal
                                </div>
                            </div>
                            <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--color-text-tertiary)' }} />
                        </div>
                    </div>

                    {isFamilia && (
                        <div
                            className="card"
                            style={{
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(8, 145, 178, 0.04))',
                                borderColor: 'var(--color-border-default)',
                            }}
                            onClick={() => navigate('/docs')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <FileText size={20} style={{ color: 'var(--color-ws-familia)' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Documentos</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {documents.length} documento{documents.length !== 1 ? 's' : ''} da família
                                    </div>
                                </div>
                                <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--color-text-tertiary)' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
