import { useState } from 'react';
import { Plus, Check, Trash2, Filter } from 'lucide-react';
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
                <div
                    className="page-header"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                    <div>
                        <h1 className="page-title">Tarefas</h1>
                        <p className="page-subtitle">
                            {pendingCount} pendente{pendingCount !== 1 ? 's' : ''} · {doneCount} concluída
                            {doneCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
                        <Plus size={16} />
                        Nova Tarefa
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {(['all', 'pending', 'done'] as const).map((f) => (
                        <button
                            key={f}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(f)}
                            style={{ fontSize: '13px', padding: '8px 14px' }}
                        >
                            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Concluídas'}
                        </button>
                    ))}
                </div>

                {/* New Task Form */}
                {showNewTask && (
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div className="modal-title">Nova Tarefa</div>
                        <input
                            className="input"
                            placeholder="Título da tarefa..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            autoFocus
                        />
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                                marginTop: '12px',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                Prioridade:
                            </span>
                            {(['high', 'medium', 'low'] as const).map((p) => (
                                <button
                                    key={p}
                                    className={`badge ${p === 'high' ? 'red' : p === 'medium' ? 'amber' : 'green'
                                        }`}
                                    onClick={() => setNewTaskPriority(p)}
                                    style={{
                                        cursor: 'pointer',
                                        outline:
                                            newTaskPriority === p
                                                ? '2px solid var(--color-accent-primary)'
                                                : 'none',
                                        outlineOffset: '2px',
                                        padding: '4px 10px',
                                    }}
                                >
                                    {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                                </button>
                            ))}
                        </div>
                        <div className="modal-actions">
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
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className="task-item"
                            style={{ justifyContent: 'space-between' }}
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
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: 'var(--color-text-tertiary)',
                                                marginTop: '2px',
                                            }}
                                        >
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
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredTasks.length === 0 && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '48px 0',
                                color: 'var(--color-text-tertiary)',
                            }}
                        >
                            <Filter size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ fontSize: '14px' }}>
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
