import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    ExternalLink,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useFinanceStore } from '@/stores/financeStore';

const CATEGORY_ICONS: Record<string, string> = {
    'Salário': '💰',
    'Freelance': '💻',
    'Investimentos': '📈',
    'Moradia': '🏠',
    'Mercado': '🛒',
    'Transporte': '🚗',
    'Saúde': '🏥',
    'Educação': '🎓',
    'Lazer': '🎬',
    'Serviços': '📡',
    'Vestuário': '👕',
    'Outros': '📦',
};

export function Finance() {
    const { activeWorkspace } = useWorkspaceStore();
    const {
        addTransaction,
        deleteTransaction,
        getSummaryByWorkspace,
        getTransactionsByWorkspace,
        getExpenseCategories,
        getIncomeCategories,
        brenoAppUrl,
    } = useFinanceStore();

    const [showNew, setShowNew] = useState(false);
    const [newType, setNewType] = useState<'income' | 'expense'>('expense');
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const summary = getSummaryByWorkspace(activeWorkspace.id);
    const transactions = getTransactionsByWorkspace(activeWorkspace.id);
    const categories = newType === 'income' ? getIncomeCategories() : getExpenseCategories();

    const handleCreate = () => {
        const amount = parseFloat(newAmount);
        if (!amount || !newCategory || !newDesc.trim()) return;
        addTransaction({
            workspaceId: activeWorkspace.id,
            type: newType,
            amount,
            category: newCategory,
            description: newDesc.trim(),
            date: new Date().toISOString().split('T')[0],
        });
        setNewAmount('');
        setNewCategory('');
        setNewDesc('');
        setShowNew(false);
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="main-content">
            <div className="page-container">
                {/* Header */}
                <div
                    className="page-header"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                    <div>
                        <h1 className="page-title">Finanças</h1>
                        <p className="page-subtitle">
                            Visão geral financeira · {activeWorkspace.displayName}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {brenoAppUrl && (
                            <a
                                href={brenoAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ textDecoration: 'none' }}
                            >
                                <ExternalLink size={16} />
                                App do Breno
                            </a>
                        )}
                        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
                            <Plus size={16} />
                            Nova Transação
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="dashboard-grid">
                    <div className="stat-card green">
                        <div className="stat-icon green">
                            <TrendingUp size={20} />
                        </div>
                        <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                            {formatCurrency(summary.totalIncome)}
                        </div>
                        <div className="stat-label">Receitas</div>
                    </div>

                    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            content: '',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                            background: 'linear-gradient(90deg, var(--color-error), #dc2626)',
                        }} />
                        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)' }}>
                            <TrendingDown size={20} />
                        </div>
                        <div className="stat-value" style={{ color: 'var(--color-error)' }}>
                            {formatCurrency(summary.totalExpense)}
                        </div>
                        <div className="stat-label">Despesas</div>
                    </div>

                    <div className={`stat-card ${summary.balance >= 0 ? 'cyan' : 'amber'}`}>
                        <div className={`stat-icon ${summary.balance >= 0 ? 'cyan' : 'amber'}`}>
                            <Wallet size={20} />
                        </div>
                        <div
                            className="stat-value"
                            style={{ color: summary.balance >= 0 ? 'var(--color-ws-familia)' : 'var(--color-warning)' }}
                        >
                            {formatCurrency(summary.balance)}
                        </div>
                        <div className="stat-label">Saldo</div>
                    </div>
                </div>

                {/* Visual Bar */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <h2 className="card-title">Receita vs Despesa</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ color: 'var(--color-success)' }}>Receita</span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{formatCurrency(summary.totalIncome)}</span>
                            </div>
                            <div className="progress-bar" style={{ height: '10px' }}>
                                <div
                                    className="progress-fill green"
                                    style={{
                                        width: summary.totalIncome > 0
                                            ? `${Math.min(100, (summary.totalIncome / Math.max(summary.totalIncome, summary.totalExpense)) * 100)}%`
                                            : '0%',
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ color: 'var(--color-error)' }}>Despesa</span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{formatCurrency(summary.totalExpense)}</span>
                            </div>
                            <div className="progress-bar" style={{ height: '10px' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'linear-gradient(90deg, var(--color-error), #f87171)',
                                        transition: 'width var(--transition-slow)',
                                        width: summary.totalExpense > 0
                                            ? `${Math.min(100, (summary.totalExpense / Math.max(summary.totalIncome, summary.totalExpense)) * 100)}%`
                                            : '0%',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Transaction Form */}
                {showNew && (
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div className="modal-title">Nova Transação</div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <button
                                className={`btn ${newType === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => { setNewType('income'); setNewCategory(''); }}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                <ArrowUpRight size={16} /> Receita
                            </button>
                            <button
                                className={`btn ${newType === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => { setNewType('expense'); setNewCategory(''); }}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                <ArrowDownRight size={16} /> Despesa
                            </button>
                        </div>
                        <input
                            className="input"
                            type="number"
                            placeholder="Valor (R$)..."
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            style={{ marginBottom: '12px' }}
                        />
                        <select
                            className="input"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            style={{ marginBottom: '12px' }}
                        >
                            <option value="">Selecione a categoria...</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <input
                            className="input"
                            placeholder="Descrição..."
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleCreate}>
                                Adicionar
                            </button>
                        </div>
                    </div>
                )}

                {/* Transactions List */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Transações recentes</h2>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                            {transactions.length} transaç{transactions.length !== 1 ? 'ões' : 'ão'}
                        </span>
                    </div>
                    <div className="task-list">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="task-item" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: 'var(--radius-md)',
                                            background: tx.type === 'income'
                                                ? 'rgba(34, 197, 94, 0.15)'
                                                : 'rgba(239, 68, 68, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {CATEGORY_ICONS[tx.category] || '📦'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{tx.description}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                                            {tx.category} · {new Date(tx.date).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-error)',
                                        }}
                                    >
                                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                    </span>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => deleteTransaction(tx.id)}
                                        style={{ color: 'var(--color-text-tertiary)' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-tertiary)' }}>
                                <Wallet size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p style={{ fontSize: '14px' }}>Nenhuma transação registrada.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
