import { useState } from 'react';
import { Plus, Check, Trash2, Filter, CheckSquare, Zap } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types';

export function Tasks() {
    const { activeWorkspace } = useWorkspaceStore();
    const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

    const wsTasks = tasks.filter((t) => t.workspaceId === activeWorkspace.id);
    const filteredTasks =
        filter === 'all'
            ? wsTasks
            : wsTasks.filter((t) => (filter === 'done' ? t.status === 'done' : t.status !== 'done'));

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

    const pendingCount = wsTasks.filter((t) => t.status !== 'done').length;
    const doneCount = wsTasks.filter((t) => t.status === 'done').length;

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
                            <CheckSquare size={22} style={{ color: 'var(--color-accent-primary)' }} />
                        </div>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: '2px' }}>Tarefas</h1>
                            <p className="page-subtitle">
                                {pendingCount} pendente{pendingCount !== 1 ? 's' : ''} · {doneCount} concluída
                                {doneCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
                        <Plus size={16} />
                        Nova Tarefa
                    </button>
                </div>

                {/* Filters */}
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
            </div>
        </div>
    );
}
