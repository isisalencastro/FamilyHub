import {
    CheckSquare,
    FolderKanban,
    MessageCircle,
    TrendingUp,
    Clock,
    Sparkles,
    ArrowRight,
    Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';

export function Dashboard() {
    const navigate = useNavigate();
    const { activeWorkspace } = useWorkspaceStore();
    const { tasks, toggleTask } = useTaskStore();
    const { projects } = useProjectStore();

    const wsTasks = tasks.filter((t) => t.workspaceId === activeWorkspace.id);
    const wsProjects = projects.filter((p) => p.workspaceId === activeWorkspace.id);

    const pendingTasks = wsTasks.filter((t) => t.status !== 'done');
    const doneTasks = wsTasks.filter((t) => t.status === 'done');
    const inProgressTasks = wsTasks.filter((t) => t.status === 'in_progress');

    const greetingName =
        activeWorkspace.id === 'familia' ? 'pessoal' : activeWorkspace.displayName;

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

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
                        Aqui está o resumo do seu workspace. A Ring está pronta para ajudar! ✨
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="dashboard-grid">
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
                </div>

                {/* Content Grid */}
                <div className="content-grid">
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

                    {/* Projects */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Projetos</h2>
                            <button
                                className="btn btn-ghost"
                                onClick={() => navigate('/projects')}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                            >
                                Ver todos <ArrowRight size={14} />
                            </button>
                        </div>
                        <div>
                            {wsProjects.map((project) => {
                                const progress =
                                    project.taskCount > 0
                                        ? Math.round((project.completedTasks / project.taskCount) * 100)
                                        : 0;
                                return (
                                    <div key={project.id} className="project-item">
                                        <div
                                            className="project-dot"
                                            style={{ background: project.color }}
                                        />
                                        <div className="project-info">
                                            <div className="project-name">{project.name}</div>
                                            <div className="project-tasks">
                                                {project.completedTasks}/{project.taskCount} tarefas · {progress}%
                                            </div>
                                            <div className="progress-bar" style={{ marginTop: '8px' }}>
                                                <div
                                                    className="progress-fill purple"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {wsProjects.length === 0 && (
                                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px', padding: '12px' }}>
                                    Nenhum projeto ainda.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Chat CTA */}
                <div
                    className="card"
                    style={{
                        marginTop: '20px',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(109, 40, 217, 0.05))',
                        borderColor: 'var(--color-border-accent)',
                    }}
                    onClick={() => navigate('/chat')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-md)',
                                background: 'linear-gradient(135deg, var(--color-accent-primary), #6d28d9)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'var(--shadow-glow)',
                            }}
                        >
                            <MessageCircle size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                                Conversar com a Ring
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                Peça ajuda, organize suas ideias ou tire dúvidas com sua assistente pessoal
                            </div>
                        </div>
                        <ArrowRight
                            size={20}
                            style={{ marginLeft: 'auto', color: 'var(--color-accent-secondary)' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
