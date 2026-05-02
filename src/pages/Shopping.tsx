import { useState } from 'react';
import {
    Plus,
    Check,
    Trash2,
    Minus,
    AlertCircle,
    X,
    Sparkles,
} from 'lucide-react';
import { useShoppingStore, ShoppingItem, ShoppingCategory } from '@/stores/shoppingStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function Shopping() {
    const { activeWorkspace } = useWorkspaceStore();
    const {
        categories,
        items,
        addCategory,
        removeCategory,
        addItem,
        removeItem,
        toggleItem,
        updateItemQuantity,
        clearCompleted,
    } = useShoppingStore();

    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState(categories[0]?.id || '');
    const [newItemPriority, setNewItemPriority] = useState<'normal' | 'high'>('normal');
    const [newItemAssigned, setNewItemAssigned] = useState<'user2' | 'user1' | undefined>(undefined);

    // New category modal
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('📦');
    const [newCatColor, setNewCatColor] = useState('#8b5cf6');

    // Inline add per category
    const [inlineAddCat, setInlineAddCat] = useState<string | null>(null);
    const [inlineItemName, setInlineItemName] = useState('');

    const filteredItems =
        activeFilter === 'all'
            ? items
            : items.filter((i) => i.categoryId === activeFilter);

    const toBuyItems = filteredItems.filter((i) => !i.completed);
    const completedItems = filteredItems.filter((i) => i.completed);

    const handleAddItem = () => {
        if (!newItemName.trim()) return;
        addItem({
            name: newItemName.trim(),
            categoryId: newItemCategory || categories[0]?.id,
            priority: newItemPriority,
            assignedTo: newItemAssigned,
        });
        setNewItemName('');
        setNewItemPriority('normal');
        setNewItemAssigned(undefined);
    };

    const handleInlineAdd = (categoryId: string) => {
        if (!inlineItemName.trim()) return;
        addItem({
            name: inlineItemName.trim(),
            categoryId,
            priority: 'normal',
        });
        setInlineItemName('');
        setInlineAddCat(null);
    };

    const handleAddCategory = () => {
        if (!newCatName.trim()) return;
        addCategory(newCatName.trim(), newCatIcon, newCatColor);
        setNewCatName('');
        setNewCatIcon('📦');
        setNewCatColor('#8b5cf6');
        setShowNewCategory(false);
    };

    const getTimeDiff = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Adicionado hoje';
        if (days === 1) return 'Adicionado ontem';
        return `${days} dias atrás`;
    };

    const getAssignedAvatar = (assigned?: 'user2' | 'user1') => {
        if (!assigned) return null;
        const isUser 2 = assigned === 'user2';
        return (
            <div
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isUser 2
                        ? 'linear-gradient(135deg, var(--color-ws-user2), #6d28d9)'
                        : 'linear-gradient(135deg, var(--color-ws-user1), #db2777)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                }}
            >
                {isUser 2 ? 'I' : 'A'}
            </div>
        );
    };

    const getCategoryById = (id: string) => categories.find((c) => c.id === id);

    const totalToBuy = items.filter((i) => !i.completed).length;
    const totalCompleted = items.filter((i) => i.completed).length;

    // Group by category for the "all" view
    const groupedByCategory = categories
        .map((cat) => ({
            category: cat,
            toBuy: items.filter((i) => i.categoryId === cat.id && !i.completed),
            completed: items.filter((i) => i.categoryId === cat.id && i.completed),
        }))
        .filter((g) => g.toBuy.length > 0 || g.completed.length > 0 || activeFilter !== 'all');

    const emojiOptions = ['🛒', '🧹', '🧴', '📦', '🥩', '🥬', '🍞', '🧊', '🎨', '🔧', '💊', '🐾'];
    const colorOptions = ['#22c55e', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'];

    const renderItem = (item: ShoppingItem) => {
        const cat = getCategoryById(item.categoryId);
        return (
            <div
                key={item.id}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-subtle)',
                    transition: 'all 150ms ease',
                    opacity: item.completed ? 0.65 : 1,
                }}
            >
                {/* Checkbox */}
                <div
                    onClick={() => toggleItem(item.id, activeWorkspace.displayName)}
                    style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: item.completed
                            ? 'none'
                            : item.priority === 'high'
                                ? '2.5px solid var(--color-warning)'
                                : '2px solid var(--color-text-tertiary)',
                        background: item.completed
                            ? 'linear-gradient(135deg, var(--color-accent-primary), #7c3aed)'
                            : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: item.completed ? '0 0 8px rgba(139, 92, 246, 0.3)' : 'none',
                        transition: 'all 200ms ease',
                    }}
                >
                    {item.completed && <Check size={13} color="white" strokeWidth={3} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: item.completed ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                                textDecoration: item.completed ? 'line-through' : 'none',
                            }}
                        >
                            {item.name}
                        </span>
                        {item.priority === 'high' && !item.completed && (
                            <AlertCircle size={14} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                        )}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--color-text-tertiary)',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        {item.completed && item.completedBy ? (
                            <span>Concluído por {item.completedBy}</span>
                        ) : item.note ? (
                            <span>{item.note}</span>
                        ) : (
                            <span>{getTimeDiff(item.addedAt)}</span>
                        )}
                        {item.priority === 'high' && !item.completed && (
                            <span style={{
                                color: 'var(--color-error)',
                                fontWeight: 600,
                                fontSize: '11px',
                            }}>
                                • Prioridade Alta
                            </span>
                        )}
                    </div>
                </div>

                {/* Quantity controls (only for non-completed) */}
                {!item.completed && item.quantity > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'var(--color-bg-elevated)',
                        borderRadius: 'var(--radius-full)',
                        padding: '2px',
                        border: '1px solid var(--color-border-subtle)',
                    }}>
                        <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--color-text-tertiary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'inherit',
                            }}
                        >
                            <Minus size={12} />
                        </button>
                        <span style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            minWidth: '16px',
                            textAlign: 'center',
                        }}>
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--color-text-tertiary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'inherit',
                            }}
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                )}

                {/* Avatar */}
                {getAssignedAvatar(item.assignedTo)}

                {/* Delete */}
                <button
                    onClick={() => removeItem(item.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        padding: '4px',
                        opacity: 0.5,
                        transition: 'opacity 150ms',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.opacity = '1'; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.opacity = '0.5'; }}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        );
    };

    return (
        <>

                {/* Add Item Bar */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    alignItems: 'stretch',
                }}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '6px 6px 6px 18px',
                        boxShadow: 'var(--shadow-card)',
                    }}>
                        <Plus size={18} style={{ color: 'var(--color-accent-secondary)', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="O que precisamos comprar?"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            style={{
                                flex: 1,
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-primary)',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                outline: 'none',
                            }}
                        />
                        <select
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(e.target.value)}
                            style={{
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-secondary)',
                                fontSize: '12px',
                                padding: '6px 8px',
                                fontFamily: 'inherit',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddItem}
                            disabled={!newItemName.trim()}
                            className="btn btn-primary"
                            style={{
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: '13px',
                                opacity: newItemName.trim() ? 1 : 0.5,
                            }}
                        >
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* Category Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    marginBottom: '24px',
                    padding: '4px',
                    background: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border-default)',
                    width: 'fit-content',
                    flexWrap: 'wrap',
                }}>
                    <button
                        onClick={() => setActiveFilter('all')}
                        style={{
                            padding: '8px 18px',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: activeFilter === 'all'
                                ? 'linear-gradient(135deg, var(--color-accent-primary), #7c3aed)'
                                : 'transparent',
                            color: activeFilter === 'all' ? 'white' : 'var(--color-text-secondary)',
                            fontSize: '13px',
                            fontWeight: activeFilter === 'all' ? 700 : 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            boxShadow: activeFilter === 'all' ? 'var(--shadow-glow)' : 'none',
                            transition: 'all 150ms ease',
                        }}
                    >
                        Todas
                    </button>
                    {categories.map((cat) => {
                        const count = items.filter((i) => i.categoryId === cat.id && !i.completed).length;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveFilter(cat.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-full)',
                                    border: 'none',
                                    background: activeFilter === cat.id
                                        ? 'linear-gradient(135deg, var(--color-accent-primary), #7c3aed)'
                                        : 'transparent',
                                    color: activeFilter === cat.id ? 'white' : 'var(--color-text-secondary)',
                                    fontSize: '13px',
                                    fontWeight: activeFilter === cat.id ? 700 : 500,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    boxShadow: activeFilter === cat.id ? 'var(--shadow-glow)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 150ms ease',
                                }}
                            >
                                {cat.icon} {cat.name}
                                {count > 0 && (
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        background: activeFilter === cat.id
                                            ? 'rgba(255,255,255,0.25)'
                                            : 'var(--color-accent-muted)',
                                        color: activeFilter === cat.id ? 'white' : 'var(--color-accent-secondary)',
                                        padding: '1px 7px',
                                        borderRadius: 'var(--radius-full)',
                                    }}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {activeFilter === 'all' ? (
                    /* Grouped by category view */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {groupedByCategory.map(({ category, toBuy, completed }) => (
                            <div
                                key={category.id}
                                className="card"
                                style={{
                                    animation: 'scaleIn 0.3s ease-out',
                                    borderTop: `3px solid ${category.color}`,
                                }}
                            >
                                {/* Category Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '16px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '20px' }}>{category.icon}</span>
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            color: 'var(--color-text-primary)',
                                        }}>
                                            {category.name}
                                        </h3>
                                    </div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        background: `${category.color}18`,
                                        color: category.color,
                                        padding: '4px 12px',
                                        borderRadius: 'var(--radius-full)',
                                    }}>
                                        {toBuy.length} {toBuy.length === 1 ? 'item' : 'itens'}
                                    </span>
                                </div>

                                {/* Items */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {toBuy.map(renderItem)}
                                    {completed.length > 0 && (
                                        <>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: 'var(--color-text-tertiary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                padding: '8px 0 4px',
                                            }}>
                                                Concluídos
                                            </div>
                                            {completed.map(renderItem)}
                                        </>
                                    )}
                                </div>

                                {/* Inline add */}
                                {inlineAddCat === category.id ? (
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px',
                                        marginTop: '12px',
                                        alignItems: 'center',
                                    }}>
                                        <input
                                            type="text"
                                            placeholder={`Adicionar em ${category.name}...`}
                                            value={inlineItemName}
                                            onChange={(e) => setInlineItemName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleInlineAdd(category.id);
                                                if (e.key === 'Escape') setInlineAddCat(null);
                                            }}
                                            autoFocus
                                            className="input"
                                            style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                                        />
                                        <button
                                            onClick={() => handleInlineAdd(category.id)}
                                            className="btn btn-primary"
                                            style={{ padding: '8px 14px', fontSize: '12px' }}
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <button
                                            onClick={() => setInlineAddCat(null)}
                                            className="btn btn-ghost"
                                            style={{ padding: '8px' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setInlineAddCat(category.id);
                                            setInlineItemName('');
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            width: '100%',
                                            padding: '10px 0',
                                            marginTop: '8px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-tertiary)',
                                            fontSize: '13px',
                                            fontFamily: 'inherit',
                                            cursor: 'pointer',
                                            transition: 'color 150ms ease',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-secondary)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
                                    >
                                        <Plus size={14} />
                                        Adicionar em {category.name}
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Create New Category */}
                        {!showNewCategory ? (
                            <div
                                onClick={() => setShowNewCategory(true)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '28px',
                                    background: 'var(--color-bg-card)',
                                    border: '2px dashed var(--color-border-default)',
                                    borderRadius: 'var(--radius-xl)',
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease',
                                    color: 'var(--color-text-tertiary)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                                    e.currentTarget.style.color = 'var(--color-accent-secondary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border-default)';
                                    e.currentTarget.style.color = 'var(--color-text-tertiary)';
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--color-accent-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Plus size={20} style={{ color: 'var(--color-accent-secondary)' }} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Criar Nova Categoria</span>
                                <span style={{ fontSize: '12px' }}>Organize suas compras melhor</span>
                            </div>
                        ) : (
                            <div className="card" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                                    Nova Categoria
                                </div>
                                <input
                                    className="input"
                                    placeholder="Nome da categoria..."
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                    autoFocus
                                />
                                {/* Emoji picker */}
                                <div style={{ marginTop: '14px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                        Ícone:
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        {emojiOptions.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => setNewCatIcon(emoji)}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 'var(--radius-md)',
                                                    border: newCatIcon === emoji
                                                        ? '2px solid var(--color-accent-primary)'
                                                        : '1px solid var(--color-border-subtle)',
                                                    background: newCatIcon === emoji ? 'var(--color-accent-muted)' : 'var(--color-bg-tertiary)',
                                                    fontSize: '16px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 150ms ease',
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Color picker */}
                                <div style={{ marginTop: '14px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                        Cor:
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setNewCatColor(color)}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    border: newCatColor === color
                                                        ? '3px solid var(--color-text-primary)'
                                                        : '2px solid transparent',
                                                    background: color,
                                                    cursor: 'pointer',
                                                    transition: 'all 150ms ease',
                                                    outline: newCatColor === color ? '2px solid var(--color-bg-primary)' : 'none',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                    <button className="btn btn-secondary" onClick={() => setShowNewCategory(false)}>
                                        Cancelar
                                    </button>
                                    <button className="btn btn-primary" onClick={handleAddCategory}>
                                        Criar Categoria
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Filtered single category view */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* TO BUY section */}
                        {toBuyItems.length > 0 && (
                            <>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--color-accent-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    padding: '4px 0',
                                }}>
                                    Para Comprar
                                </div>
                                {toBuyItems.map(renderItem)}
                            </>
                        )}

                        {/* COMPLETED section */}
                        {completedItems.length > 0 && (
                            <>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--color-text-tertiary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    padding: '8px 0 4px',
                                }}>
                                    Concluídos
                                </div>
                                {completedItems.map(renderItem)}
                            </>
                        )}

                        {toBuyItems.length === 0 && completedItems.length === 0 && (
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
                                    <Sparkles size={24} style={{ color: 'var(--color-accent-secondary)' }} />
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 500 }}>
                                    Nenhum item nesta categoria.
                                </p>
                            </div>
                        )}
                    </div>
                )}

            {/* New Category Modal */}
            {showNewCategory && activeFilter !== 'all' && (
                <div className="modal-overlay" onClick={() => setShowNewCategory(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">Nova Categoria</div>
                        <input
                            className="input"
                            placeholder="Nome da categoria..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNewCategory(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleAddCategory}>
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
