import { useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useProjectStore } from '@/stores/projectStore';

const PROJECT_COLORS = [
    '#8b5cf6',
    '#3b82f6',
    '#06b6d4',
    '#22c55e',
    '#f59e0b',
    '#ec4899',
    '#ef4444',
    '#f97316',
];

export function Projects() {
    const { activeWorkspace } = useWorkspaceStore();
    const { projects, addProject } = useProjectStore();
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);

    const wsProjects = projects.filter((p) => p.workspaceId === activeWorkspace.id);

    const handleCreate = () => {
        if (!newName.trim()) return;
        addProject({
            workspaceId: activeWorkspace.id,
            name: newName.trim(),
            description: newDesc.trim() || undefined,
            color: newColor,
        });
        setNewName('');
        setNewDesc('');
        setShowNew(false);
    };

    return (
        <div className="main-content">
            <div className="page-container">
                <div
                    className="page-header"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                    <div>
                        <h1 className="page-title">Projetos</h1>
                        <p className="page-subtitle">{wsProjects.length} projeto{wsProjects.length !== 1 ? 's' : ''} ativo{wsProjects.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowNew(true)}>
                        <Plus size={16} />
                        Novo Projeto
                    </button>
                </div>

                {/* New Project Form */}
                {showNew && (
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div className="modal-title">Novo Projeto</div>
                        <input
                            className="input"
                            placeholder="Nome do projeto..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            autoFocus
                            style={{ marginBottom: '12px' }}
                        />
                        <input
                            className="input"
                            placeholder="Descrição (opcional)..."
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Cor:</span>
                            {PROJECT_COLORS.map((c) => (
                                <div
                                    key={c}
                                    onClick={() => setNewColor(c)}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: 'var(--radius-full)',
                                        background: c,
                                        cursor: 'pointer',
                                        outline: newColor === c ? '2px solid white' : 'none',
                                        outlineOffset: '2px',
                                        transition: 'transform 0.15s',
                                        transform: newColor === c ? 'scale(1.2)' : 'scale(1)',
                                    }}
                                />
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleCreate}>
                                Criar Projeto
                            </button>
                        </div>
                    </div>
                )}

                {/* Projects Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {wsProjects.map((project) => {
                        const progress =
                            project.taskCount > 0
                                ? Math.round((project.completedTasks / project.taskCount) * 100)
                                : 0;
                        return (
                            <div key={project.id} className="card" style={{ cursor: 'pointer' }}>
                                <div className="card-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: 'var(--radius-full)',
                                                background: project.color,
                                                boxShadow: `0 0 10px ${project.color}40`,
                                            }}
                                        />
                                        <h3 className="card-title">{project.name}</h3>
                                    </div>
                                    <span className="badge purple">{progress}%</span>
                                </div>
                                {project.description && (
                                    <p
                                        style={{
                                            fontSize: '13px',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '16px',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {project.description}
                                    </p>
                                )}
                                <div style={{ marginBottom: '8px' }}>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill purple"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: 'var(--color-text-tertiary)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span>
                                        {project.completedTasks} de {project.taskCount} tarefas
                                    </span>
                                    <span>
                                        {project.taskCount - project.completedTasks} restante
                                        {project.taskCount - project.completedTasks !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {wsProjects.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-tertiary)' }}>
                        <FolderKanban size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                            Nenhum projeto ainda
                        </p>
                        <p style={{ fontSize: '14px' }}>
                            Crie seu primeiro projeto para organizar suas tarefas
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
