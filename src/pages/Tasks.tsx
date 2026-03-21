import { useState } from 'react';
import { Plus, Check, Trash2, CheckSquare, Zap, ShoppingCart, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { useShoppingStore } from '@/stores/shoppingStore';
import { useGoalStore, GOAL_CATEGORIES, type GoalCategory, type Goal } from '@/stores/goalStore';
import { Shopping } from '@/pages/Shopping';
import type { Task } from '@/types';

type MainTab = 'tarefas' | 'compras' | 'objetivos';

export function Tasks() {
    const { activeWorkspace } = useWorkspaceStore();
    const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
    const { items: shoppingItems } = useShoppingStore();
    const { goals, addGoal, updateGoal, removeGoal, toggleMilestone, addMilestone, removeMilestone } = useGoalStore();
    const [mainTab, setMainTab] = useState<MainTab>('tarefas');
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

    // Goal states
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalDesc, setGoalDesc] = useState('');
    const [goalCategory, setGoalCategory] = useState<GoalCategory>('pessoal');
    const [goalTargetDate, setGoalTargetDate] = useState('');
    const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
    const [newMilestoneText, setNewMilestoneText] = useState('');
    const [goalFilter, setGoalFilter] = useState<'all' | 'active' | 'done'>('all');

    const wsTasks = tasks.filter((t) => t.workspaceId === activeWorkspace.id);
    const filteredTasks =
        filter === 'all'
            ? wsTasks
            : wsTasks.filter((t) => (filter === 'done' ? t.status === 'done' : t.status !== 'done'));

    const wsGoals = goals.filter((g) => g.workspaceId === activeWorkspace.id);
    const filteredGoals =
        goalFilter === 'all'
            ? wsGoals
            : wsGoals.filter((g) => (goalFilter === 'done' ? g.progress === 100 : g.progress < 100));

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        addTask({
            workspaceId: activeWorkspace.id,
            title: newTaskTitle.trim(),
            status: 'pending',
            priority: newTaskPriority,
        });
        setNewTaskTitle('');
        setShowNewTask(false);
    };

    const handleAddGoal = () => {
        if (!goalTitle.trim()) return;
        addGoal({
            workspaceId: activeWorkspace.id,
            title: goalTitle.trim(),
            description: goalDesc.trim() || undefined,
            category: goalCategory,
            targetDate: goalTargetDate || undefined,
        });
        setGoalTitle('');
        setGoalDesc('');
        setGoalCategory('pessoal');
        setGoalTargetDate('');
        setShowNewGoal(false);
    };

    const handleAddMilestone = (goalId: string) => {
        if (!newMilestoneText.trim()) return;
        addMilestone(goalId, newMilestoneText.trim());
        setNewMilestoneText('');
    };

    const pendingCount = wsTasks.filter((t) => t.status !== 'done').length;
    const doneCount = wsTasks.filter((t) => t.status === 'done').length;
    const shoppingToBuy = shoppingItems.filter((i) => !i.completed).length;
    const activeGoals = wsGoals.filter((g) => g.progress < 100).length;

    const getHeaderIcon = () => {
        if (mainTab === 'tarefas') return <CheckSquare size={22} style={{ color: 'var(--color-accent-primary)' }} />;
        if (mainTab === 'compras') return <ShoppingCart size={22} style={{ color: 'var(--color-accent-primary)' }} />;
        return <Target size={22} style={{ color: 'var(--color-accent-primary)' }} />;
    };

    const getHeaderTitle = () => {
        if (mainTab === 'tarefas') return 'Tarefas';
        if (mainTab === 'compras') return 'Lista de Compras';
        return 'Objetivos';
    };

    const getHeaderSubtitle = () => {
        if (mainTab === 'tarefas') return `${pendingCount} pendente${pendingCount !== 1 ? 's' : ''} · ${doneCount} concluída${doneCount !== 1 ? 's' : ''}`;
        if (mainTab === 'compras') return `${shoppingToBuy} ${shoppingToBuy === 1 ? 'item' : 'itens'} para comprar`;
        return `${activeGoals} ${activeGoals === 1 ? 'objetivo ativo' : 'objetivos ativos'}`;
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-primary)',
        fontSize: '13px',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 150ms ease',
    };

    const labelStyle = {
        fontSize: '12px',
        fontWeight: 600 as const,
        color: 'var(--color-text-secondary)',
        marginBottom: '6px',
        display: 'block' as const,
    };

    const tabBtnStyle = (tab: MainTab) => ({
        display: 'flex' as const,
        alignItems: 'center' as const,
        gap: '8px',
        padding: '10px 22px',
        borderRadius: 'var(--radius-full)',
        border: 'none' as const,
        background: mainTab === tab
            ? 'linear-gradient(135deg, var(--color-accent-primary), #7c3aed)'
            : 'transparent',
        color: mainTab === tab ? 'white' : 'var(--color-text-secondary)',
        fontSize: '14px',
        fontWeight: mainTab === tab ? 700 : 500,
        cursor: 'pointer' as const,
        transition: 'all 150ms ease',
        fontFamily: 'inherit',
        boxShadow: mainTab === tab ? 'var(--shadow-glow)' : 'none',
    });

    const badgeStyle = (tab: MainTab) => ({
        fontSize: '11px',
        fontWeight: 700,
        background: mainTab === tab
            ? 'rgba(255,255,255,0.25)'
            : 'var(--color-accent-muted)',
        color: mainTab === tab ? 'white' : 'var(--color-accent-secondary)',
        padding: '1px 8px',
        borderRadius: 'var(--radius-full)',
    });

    // ─── Goal Card ───
    const renderGoalCard = (goal: Goal, index: number) => {
        const cat = GOAL_CATEGORIES[goal.category];
        const isExpanded = expandedGoal === goal.id;
        const isCompleted = goal.progress === 100;
        const daysLeft = goal.targetDate
            ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000)
            : null;

        return (
            <div
                key={goal.id}
                className="card"
                style={{
                    animation: `fadeInUp 0.25s ease-out ${index * 0.05}s`,
                    animationFillMode: 'backwards',
                    borderLeft: `4px solid ${cat.color}`,
                    opacity: isCompleted ? 0.75 : 1,
                }}
            >
                {/* Goal Header */}
                <div
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
                    onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: `${cat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                    }}>
                        {isCompleted ? '🏆' : cat.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                                fontSize: '15px',
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                            }}>
                                {goal.title}
                            </span>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: `${cat.color}15`,
                                color: cat.color,
                            }}>
                                {cat.label}
                            </span>
                        </div>
                        {goal.description && (
                            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: 0, marginBottom: '8px' }}>
                                {goal.description}
                            </p>
                        )}

                        {/* Progress Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                flex: 1,
                                height: '6px',
                                borderRadius: '3px',
                                background: 'var(--color-bg-tertiary)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${goal.progress}%`,
                                    height: '100%',
                                    borderRadius: '3px',
                                    background: isCompleted
                                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                        : `linear-gradient(90deg, ${cat.color}, ${cat.color}bb)`,
                                    transition: 'width 300ms ease',
                                }} />
                            </div>
                            <span style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: isCompleted ? 'var(--color-success)' : cat.color,
                                minWidth: '36px',
                                textAlign: 'right' as const,
                            }}>
                                {goal.progress}%
                            </span>
                        </div>

                        {/* Meta info */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' as const }}>
                            {goal.milestones.length > 0 && (
                                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                                    ✅ {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} etapas
                                </span>
                            )}
                            {daysLeft !== null && (
                                <span style={{
                                    fontSize: '11px',
                                    color: daysLeft < 0 ? 'var(--color-error)' : daysLeft <= 7 ? 'var(--color-warning)' : 'var(--color-text-tertiary)',
                                    fontWeight: daysLeft <= 7 ? 600 : 400,
                                }}>
                                    📅 {daysLeft < 0
                                        ? `${Math.abs(daysLeft)}d atrasado`
                                        : daysLeft === 0
                                            ? 'Hoje!'
                                            : `${daysLeft}d restantes`}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeGoal(goal.id); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-tertiary)',
                                cursor: 'pointer',
                                padding: '4px',
                                opacity: 0.5,
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                        {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--color-text-tertiary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-tertiary)' }} />}
                    </div>
                </div>

                {/* Expanded: Milestones */}
                {isExpanded && (
                    <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--color-border-subtle)',
                        animation: 'scaleIn 0.2s ease-out',
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                            Etapas / Marcos
                        </div>

                        {/* Milestones list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                            {goal.milestones.map((ms) => (
                                <div
                                    key={ms.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px 12px',
                                        borderRadius: 'var(--radius-md)',
                                        background: ms.completed ? 'var(--color-success-muted)' : 'var(--color-bg-tertiary)',
                                        border: '1px solid var(--color-border-subtle)',
                                        transition: 'all 150ms ease',
                                    }}
                                >
                                    <div
                                        onClick={() => toggleMilestone(goal.id, ms.id)}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '6px',
                                            border: ms.completed ? 'none' : '2px solid var(--color-text-tertiary)',
                                            background: ms.completed ? `linear-gradient(135deg, ${cat.color}, ${cat.color}bb)` : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            transition: 'all 200ms ease',
                                        }}
                                    >
                                        {ms.completed && <Check size={12} color="white" />}
                                    </div>
                                    <span style={{
                                        flex: 1,
                                        fontSize: '13px',
                                        color: ms.completed ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                                        textDecoration: ms.completed ? 'line-through' : 'none',
                                        fontWeight: 500,
                                    }}>
                                        {ms.title}
                                    </span>
                                    <button
                                        onClick={() => removeMilestone(goal.id, ms.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-tertiary)',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            opacity: 0.4,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            {goal.milestones.length === 0 && (
                                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '12px 0' }}>
                                    Adicione etapas para acompanhar seu progresso
                                </p>
                            )}
                        </div>

                        {/* Add milestone */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                style={{ ...inputStyle, flex: 1 }}
                                placeholder="Nova etapa..."
                                value={expandedGoal === goal.id ? newMilestoneText : ''}
                                onChange={(e) => setNewMilestoneText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddMilestone(goal.id); }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={() => handleAddMilestone(goal.id)}
                                style={{ padding: '8px 14px', fontSize: '13px' }}
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {/* Manual progress (if no milestones) */}
                        {goal.milestones.length === 0 && (
                            <div style={{ marginTop: '12px' }}>
                                <label style={labelStyle}>Progresso manual</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={goal.progress}
                                        onChange={(e) => updateGoal(goal.id, {
                                            progress: parseInt(e.target.value),
                                            completedAt: parseInt(e.target.value) === 100 ? new Date().toISOString() : undefined,
                                        })}
                                        style={{ flex: 1, accentColor: cat.color }}
                                    />
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: cat.color, minWidth: '36px' }}>
                                        {goal.progress}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="main-content">
            <div className="page-container">
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '28px',
                }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            background: 'var(--color-accent-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {getHeaderIcon()}
                        </div>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: '2px' }}>
                                {getHeaderTitle()}
                            </h1>
                            <p className="page-subtitle">
                                {getHeaderSubtitle()}
                            </p>
                        </div>
                    </div>
                    {mainTab === 'tarefas' && (
                        <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
                            <Plus size={16} />
                            Nova Tarefa
                        </button>
                    )}
                    {mainTab === 'objetivos' && (
                        <button className="btn btn-primary" onClick={() => setShowNewGoal(true)}>
                            <Plus size={16} />
                            Novo Objetivo
                        </button>
                    )}
                </div>

                {/* Main Tabs: Tarefas / Compras / Objetivos */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '24px',
                    padding: '4px',
                    background: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border-default)',
                    width: 'fit-content',
                }}>
                    <button onClick={() => setMainTab('tarefas')} style={tabBtnStyle('tarefas')}>
                        <CheckSquare size={16} />
                        Tarefas
                        {pendingCount > 0 && <span style={badgeStyle('tarefas')}>{pendingCount}</span>}
                    </button>
                    <button onClick={() => setMainTab('compras')} style={tabBtnStyle('compras')}>
                        <ShoppingCart size={16} />
                        Compras
                        {shoppingToBuy > 0 && <span style={badgeStyle('compras')}>{shoppingToBuy}</span>}
                    </button>
                    <button onClick={() => setMainTab('objetivos')} style={tabBtnStyle('objetivos')}>
                        <Target size={16} />
                        Objetivos
                        {activeGoals > 0 && <span style={badgeStyle('objetivos')}>{activeGoals}</span>}
                    </button>
                </div>

                {/* Content based on active tab */}
                {mainTab === 'tarefas' && (
                    <>
                        {/* Task Filters */}
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            marginBottom: '20px',
                            padding: '4px',
                            background: 'var(--color-bg-card)',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border-default)',
                            width: 'fit-content',
                        }}>
                            {(['all', 'pending', 'done'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: 'var(--radius-full)',
                                        border: 'none',
                                        background: filter === f ? 'linear-gradient(135deg, var(--color-accent-primary), #7c3aed)' : 'transparent',
                                        color: filter === f ? 'white' : 'var(--color-text-secondary)',
                                        fontSize: '13px',
                                        fontWeight: filter === f ? 700 : 500,
                                        cursor: 'pointer',
                                        transition: 'all 150ms ease',
                                        fontFamily: 'inherit',
                                        boxShadow: filter === f ? 'var(--shadow-glow)' : 'none',
                                    }}
                                >
                                    {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Concluídas'}
                                </button>
                            ))}
                        </div>

                        {/* New Task Form */}
                        {showNewTask && (
                            <div className="card" style={{ marginBottom: '20px', animation: 'scaleIn 0.2s ease-out' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Nova Tarefa</div>
                                <input
                                    className="input"
                                    placeholder="Título da tarefa..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                    autoFocus
                                />
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '14px',
                                    alignItems: 'center',
                                }}>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                        Prioridade:
                                    </span>
                                    {(['high', 'medium', 'low'] as const).map((p) => (
                                        <button
                                            key={p}
                                            className={`badge ${p === 'high' ? 'red' : p === 'medium' ? 'amber' : 'green'}`}
                                            onClick={() => setNewTaskPriority(p)}
                                            style={{
                                                cursor: 'pointer',
                                                outline:
                                                    newTaskPriority === p
                                                        ? '2px solid var(--color-accent-primary)'
                                                        : 'none',
                                                outlineOffset: '2px',
                                                padding: '4px 12px',
                                                border: 'none',
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                    <button className="btn btn-secondary" onClick={() => setShowNewTask(false)}>
                                        Cancelar
                                    </button>
                                    <button className="btn btn-primary" onClick={handleAddTask}>
                                        Criar Tarefa
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Task List */}
                        <div className="task-list">
                            {filteredTasks.map((task, index) => (
                                <div
                                    key={task.id}
                                    className="task-item"
                                    style={{
                                        justifyContent: 'space-between',
                                        animation: `fadeInUp 0.25s ease-out ${index * 0.03}s`,
                                        animationFillMode: 'backwards',
                                    }}
                                >
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}
                                        onClick={() => toggleTask(task.id)}
                                    >
                                        <div
                                            className={`task-checkbox ${task.status === 'done' ? 'done' : ''}`}
                                        >
                                            {task.status === 'done' && <Check size={12} color="white" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <span className={`task-text ${task.status === 'done' ? 'done' : ''}`}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'var(--color-text-tertiary)',
                                                    marginTop: '2px',
                                                }}>
                                                    {task.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`task-priority ${task.priority}`}>
                                            {task.priority === 'high'
                                                ? 'Alta'
                                                : task.priority === 'medium'
                                                    ? 'Média'
                                                    : 'Baixa'}
                                        </span>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => deleteTask(task.id)}
                                            style={{ color: 'var(--color-text-tertiary)', padding: '6px' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredTasks.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 0',
                                    color: 'var(--color-text-tertiary)',
                                }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: 'var(--color-accent-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                    }}>
                                        <Zap size={24} style={{ color: 'var(--color-accent-secondary)' }} />
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: 500 }}>
                                        {filter === 'all'
                                            ? 'Nenhuma tarefa ainda. Crie sua primeira!'
                                            : 'Nenhuma tarefa com esse filtro.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {mainTab === 'compras' && <Shopping />}

                {mainTab === 'objetivos' && (
                    <>
                        {/* Goal Filters */}
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            marginBottom: '20px',
                            padding: '4px',
                            background: 'var(--color-bg-card)',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border-default)',
                            width: 'fit-content',
                        }}>
                            {(['all', 'active', 'done'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setGoalFilter(f)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: 'var(--radius-full)',
                                        border: 'none',
                                        background: goalFilter === f ? 'linear-gradient(135deg, var(--color-accent-primary), #7c3aed)' : 'transparent',
                                        color: goalFilter === f ? 'white' : 'var(--color-text-secondary)',
                                        fontSize: '13px',
                                        fontWeight: goalFilter === f ? 700 : 500,
                                        cursor: 'pointer',
                                        transition: 'all 150ms ease',
                                        fontFamily: 'inherit',
                                        boxShadow: goalFilter === f ? 'var(--shadow-glow)' : 'none',
                                    }}
                                >
                                    {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Concluídos'}
                                </button>
                            ))}
                        </div>

                        {/* New Goal Form */}
                        {showNewGoal && (
                            <div className="card" style={{ marginBottom: '20px', animation: 'scaleIn 0.2s ease-out' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Novo Objetivo</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Título *</label>
                                        <input
                                            style={inputStyle}
                                            placeholder="Ex: Economizar R$ 5.000..."
                                            value={goalTitle}
                                            onChange={(e) => setGoalTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Categoria</label>
                                        <select
                                            value={goalCategory}
                                            onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}
                                            style={{ ...inputStyle, cursor: 'pointer' }}
                                        >
                                            {Object.entries(GOAL_CATEGORIES).map(([key, cat]) => (
                                                <option key={key} value={key}>{cat.emoji} {cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Descrição</label>
                                        <input
                                            style={inputStyle}
                                            placeholder="Descreva seu objetivo..."
                                            value={goalDesc}
                                            onChange={(e) => setGoalDesc(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Data alvo</label>
                                        <input
                                            type="date"
                                            style={inputStyle}
                                            value={goalTargetDate}
                                            onChange={(e) => setGoalTargetDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                    <button className="btn btn-secondary" onClick={() => setShowNewGoal(false)}>Cancelar</button>
                                    <button className="btn btn-primary" onClick={handleAddGoal}>Criar Objetivo</button>
                                </div>
                            </div>
                        )}

                        {/* Goals List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredGoals.map((goal, index) => renderGoalCard(goal, index))}
                        </div>

                        {filteredGoals.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 0',
                                color: 'var(--color-text-tertiary)',
                            }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    fontSize: '24px',
                                }}>
                                    🎯
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                                    {goalFilter === 'all'
                                        ? 'Nenhum objetivo ainda'
                                        : goalFilter === 'active'
                                            ? 'Nenhum objetivo ativo'
                                            : 'Nenhum objetivo concluído'}
                                </p>
                                <p style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto' }}>
                                    Defina metas, adicione etapas e acompanhe seu progresso ao longo do tempo.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
