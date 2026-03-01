import { useState } from 'react';
import {
    Plus,
    FolderKanban,
    ArrowLeft,
    MoreHorizontal,
    Trash2,
    GripVertical,
    ChevronRight,
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useProjectStore } from '@/stores/projectStore';

const PROJECT_COLORS = [
    '#8b5cf6', '#3b82f6', '#06b6d4', '#22c55e',
    '#f59e0b', '#ec4899', '#ef4444', '#f97316',
];

export function Projects() {
    const { activeWorkspace } = useWorkspaceStore();
    const {
        projects,
        selectedProjectId,
        addProject,
        deleteProject,
        selectProject,
        addColumn,
        addCard,
        deleteCard,
        moveCard,
        deleteColumn,
    } = useProjectStore();

    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);

    // Kanban card creation state
    const [addingCardInColumn, setAddingCardInColumn] = useState<string | null>(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [newCardDesc, setNewCardDesc] = useState('');

    // New column state
    const [showNewColumn, setShowNewColumn] = useState(false);
    const [newColTitle, setNewColTitle] = useState('');

    // Move card menu state
    const [moveMenuCard, setMoveMenuCard] = useState<{ cardId: string; columnId: string } | null>(null);

    const wsProjects = projects.filter((p) => p.workspaceId === activeWorkspace.id);
    const selectedProject = projects.find((p) => p.id === selectedProjectId);

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

    const handleAddCard = (columnId: string) => {
        if (!newCardTitle.trim() || !selectedProjectId) return;
        addCard(selectedProjectId, columnId, newCardTitle.trim(), newCardDesc.trim() || undefined);
        setNewCardTitle('');
        setNewCardDesc('');
        setAddingCardInColumn(null);
    };

    const handleAddColumn = () => {
        if (!newColTitle.trim() || !selectedProjectId) return;
        addColumn(selectedProjectId, newColTitle.trim());
        setNewColTitle('');
        setShowNewColumn(false);
    };

    const handleMoveCard = (toColumnId: string) => {
        if (!moveMenuCard || !selectedProjectId) return;
        moveCard(selectedProjectId, moveMenuCard.columnId, toColumnId, moveMenuCard.cardId);
        setMoveMenuCard(null);
    };

    // Board View
    if (selectedProject) {
        return (
            <div className="main-content">
                <div className="page-container" style={{ maxWidth: '100%' }}>
                    {/* Board Header */}
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                className="btn btn-ghost"
                                onClick={() => selectProject(null)}
                                style={{ padding: '8px' }}
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: 'var(--radius-full)',
                                    background: selectedProject.color,
                                    boxShadow: `0 0 10px ${selectedProject.color}40`,
                                }}
                            />
                            <div>
                                <h1 className="page-title" style={{ fontSize: '22px', marginBottom: 0 }}>
                                    {selectedProject.name}
                                </h1>
                                {selectedProject.description && (
                                    <p className="page-subtitle">{selectedProject.description}</p>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowNewColumn(true)}
                            >
                                <Plus size={16} /> Nova Coluna
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    if (confirm(`Tem certeza que deseja deletar o projeto "${selectedProject.name}"? Todas as colunas e cards serão perdidos.`)) {
                                        deleteProject(selectedProject.id);
                                    }
                                }}
                                style={{ padding: '8px 12px', color: 'var(--color-error)' }}
                                title="Deletar projeto"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* New Column Form */}
                    {showNewColumn && (
                        <div className="card" style={{ marginBottom: '20px', maxWidth: '400px' }}>
                            <input
                                className="input"
                                placeholder="Nome da coluna..."
                                value={newColTitle}
                                onChange={(e) => setNewColTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowNewColumn(false)}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleAddColumn}>
                                    Criar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Kanban Board */}
                    <div className="kanban-board">
                        {selectedProject.columns.map((column) => (
                            <div key={column.id} className="kanban-column">
                                <div className="kanban-column-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="kanban-column-title">{column.title}</span>
                                        <span className="kanban-column-count">{column.cards.length}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => setAddingCardInColumn(column.id)}
                                            style={{ padding: '4px' }}
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => {
                                                if (confirm(`Deletar coluna "${column.title}" e todos os cards?`)) {
                                                    deleteColumn(selectedProject.id, column.id);
                                                }
                                            }}
                                            style={{ padding: '4px', color: 'var(--color-text-tertiary)' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="kanban-cards">
                                    {column.cards.map((card) => (
                                        <div key={card.id} className="kanban-card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div className="kanban-card-title">{card.title}</div>
                                                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() =>
                                                            setMoveMenuCard(
                                                                moveMenuCard?.cardId === card.id
                                                                    ? null
                                                                    : { cardId: card.id, columnId: column.id }
                                                            )
                                                        }
                                                        style={{ padding: '2px', color: 'var(--color-text-tertiary)' }}
                                                    >
                                                        <ChevronRight size={12} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => deleteCard(selectedProject.id, column.id, card.id)}
                                                        style={{ padding: '2px', color: 'var(--color-text-tertiary)' }}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            {card.description && (
                                                <div className="kanban-card-desc">{card.description}</div>
                                            )}
                                            {card.labels && card.labels.length > 0 && (
                                                <div className="kanban-card-labels">
                                                    {card.labels.map((label) => (
                                                        <span key={label} className="kanban-label">{label}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Move menu */}
                                            {moveMenuCard?.cardId === card.id && (
                                                <div className="kanban-move-menu">
                                                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Mover para:
                                                    </div>
                                                    {selectedProject.columns
                                                        .filter((c) => c.id !== column.id)
                                                        .map((col) => (
                                                            <button
                                                                key={col.id}
                                                                className="kanban-move-option"
                                                                onClick={() => handleMoveCard(col.id)}
                                                            >
                                                                {col.title}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add Card Form */}
                                    {addingCardInColumn === column.id && (
                                        <div className="kanban-card" style={{ border: '1px dashed var(--color-border-accent)' }}>
                                            <input
                                                className="input"
                                                placeholder="Título do card..."
                                                value={newCardTitle}
                                                onChange={(e) => setNewCardTitle(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCard(column.id)}
                                                autoFocus
                                                style={{ marginBottom: '8px', fontSize: '13px' }}
                                            />
                                            <input
                                                className="input"
                                                placeholder="Descrição (opcional)..."
                                                value={newCardDesc}
                                                onChange={(e) => setNewCardDesc(e.target.value)}
                                                style={{ fontSize: '13px' }}
                                            />
                                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    onClick={() => handleAddCard(column.id)}
                                                >
                                                    Criar
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ padding: '6px 8px', fontSize: '12px' }}
                                                    onClick={() => setAddingCardInColumn(null)}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Add card button at bottom */}
                                {addingCardInColumn !== column.id && (
                                    <button
                                        className="kanban-add-card-btn"
                                        onClick={() => setAddingCardInColumn(column.id)}
                                    >
                                        <Plus size={14} /> Adicionar card
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Projects List View
    return (
        <div className="main-content">
            <div className="page-container">
                <div
                    className="page-header"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                    <div>
                        <h1 className="page-title">Projetos</h1>
                        <p className="page-subtitle">
                            {wsProjects.length} projeto{wsProjects.length !== 1 ? 's' : ''} ativo{wsProjects.length !== 1 ? 's' : ''}
                        </p>
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
                        const totalCards = project.columns.reduce((sum, col) => sum + col.cards.length, 0);
                        const doneCol = project.columns.find(
                            (c) => c.title.toLowerCase().includes('conclu') || c.title.toLowerCase().includes('pronto') || c.title.toLowerCase().includes('done')
                        );
                        const doneCards = doneCol ? doneCol.cards.length : 0;
                        const progress = totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0;

                        return (
                            <div
                                key={project.id}
                                className="card project-card-hover"
                                style={{ cursor: 'pointer' }}
                                onClick={() => selectProject(project.id)}
                            >
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="badge purple">{progress}%</span>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Deletar o projeto "${project.name}"? Todas as colunas e cards serão perdidos.`)) {
                                                    deleteProject(project.id);
                                                }
                                            }}
                                            style={{ padding: '4px', color: 'var(--color-text-tertiary)' }}
                                            title="Deletar projeto"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                {project.description && (
                                    <p style={{
                                        fontSize: '13px',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '16px',
                                        lineHeight: 1.5,
                                    }}>
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
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--color-text-tertiary)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}>
                                    <span>{project.columns.length} colunas · {totalCards} cards</span>
                                    <span>{doneCards} concluído{doneCards !== 1 ? 's' : ''}</span>
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
                            Crie seu primeiro projeto para organizar suas tarefas em boards
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
