import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

export type FinanceModalType = 'renda' | 'fixo' | 'credito' | 'divida-user2' | 'divida-user1' | 'problema' | null;

interface FinanceModalProps {
    type: FinanceModalType;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    defaultCreditoType?: string;
}

export function FinanceModal({ type, onClose, onSubmit, initialData, defaultCreditoType }: FinanceModalProps) {
    const firstInputRef = useRef<HTMLInputElement>(null);
    const [values, setValues] = useState<any>({});

    useEffect(() => {
        if (type) {
            if (initialData) {
                setValues(initialData);
            } else {
                let defaultValues = {};
                if (type === 'renda' || type === 'fixo') defaultValues = { isFixed: true };
                if (type === 'credito') {
                    const date = new Date();
                    let nextMonth = date.getMonth() + 2;
                    let year = date.getFullYear();
                    if (nextMonth > 12) {
                        nextMonth = 1;
                        year += 1;
                    }
                    const nextMonthStr = `${nextMonth.toString().padStart(2, '0')}-${year}`;
                    defaultValues = { type: defaultCreditoType || 'assinatura', congelado: false, isEvelise: false, startMonth: nextMonthStr };
                }
                setValues(defaultValues);
            }
            setTimeout(() => firstInputRef.current?.focus(), 50);
        }
    }, [type, initialData]);

    if (!type) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!values.name?.trim()) return;
        if ((type === 'renda' || type === 'fixo' || type === 'credito') && !values.value) return;
        if ((type === 'divida-user2' || type === 'divida-user1' || type === 'problema') && !values.total) return;

        onSubmit(values);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    const renderInput = (key: string, label: string, placeholder: string, isNumber = false, autoFocus = false) => (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                {label} <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
                ref={autoFocus ? firstInputRef : undefined}
                className="input"
                type={isNumber ? 'text' : 'text'}
                inputMode={isNumber ? 'decimal' : 'text'}
                placeholder={placeholder}
                value={values[key] || ''}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                style={{ fontSize: '14px', width: '100%' }}
                required
            />
        </div>
    );

    const renderToggle = (key: string, label: string, desc: string) => (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }} onClick={() => setValues({ ...values, [key]: !values[key] })}>
            <div style={{
                width: 20, height: 20, borderRadius: 6, border: '1px solid var(--color-border-default)',
                background: values[key] ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0
            }}>
                {values[key] && <Check size={14} color="white" />}
            </div>
            <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{desc}</div>
            </div>
        </div>
    );

    let title = '';

    if (type === 'renda') title = initialData ? '✏️ Editar Receita' : '💰 Adicionar Receita';
    if (type === 'fixo') title = initialData ? '✏️ Editar Saída' : '📋 Nova Saída (Débito)';
    if (type === 'credito') {
        if (initialData) title = '✏️ Editar Crédito / Assinatura';
        else if (defaultCreditoType === 'parcelamento') title = '💳 Novo Parcelamento';
        else title = '💳 Nova Assinatura';
    }
    if (type === 'divida-user2') title = initialData ? '✏️ Editar Dívida (User 2)' : '⚠️ Nova Dívida (User 2)';
    if (type === 'divida-user1') title = initialData ? '✏️ Editar Dívida (User 1)' : '⚠️ Nova Dívida (User 1)';
    if (type === 'problema') title = initialData ? '✏️ Editar Problema' : '🔴 Novo Problema Financeiro';

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.15s ease', padding: 20
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            onKeyDown={handleKeyDown}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--color-border-default)', padding: '28px', width: '100%', maxWidth: '440px',
                    animation: 'slideUp 0.2s ease', maxHeight: '90vh', overflowY: 'auto'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{title}</h3>
                    <button type="button" onClick={onClose} className="btn-icon" style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                {(type === 'renda' || type === 'fixo') && (
                    <>
                        {renderInput('name', 'Nome/Motivo', 'Ex: Salário, Projeto X, Água...', false, true)}
                        {renderInput('value', 'Valor (R$)', 'Ex: 1500.00', true)}
                        {renderToggle('isFixed', 'Fixo Mensal', 'Se marcado, será replicado para os próximos meses. Se desmarcado, conta como variável para apenas o mês atual.')}
                    </>
                )}

                {type === 'credito' && (
                    <>
                        {renderInput('name', 'Nome', 'Ex: TV, Spotify, Cooktop', false, true)}
                        {renderInput('value', 'Valor da Parcela (R$)', 'Ex: 65.00', true)}

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Mês da Primeira Cobrança</label>
                            <input className="input" type="text" placeholder="Ex: 04-2026" value={values.startMonth || ''} onChange={(e) => setValues({ ...values, startMonth: e.target.value })} style={{ fontSize: '14px', width: '100%' }} />
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Tipo</label>
                            <select className="input" value={values.type || 'assinatura'} onChange={e => setValues({ ...values, type: e.target.value })} style={{ width: '100%', fontSize: 14 }}>
                                <option value="assinatura">Assinatura</option>
                                <option value="parcelamento">Parcelamento</option>
                                <option value="credito">Crédito Recorrente</option>
                                <option value="debito">Débito</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Progresso (Opcional)</label>
                            <input className="input" type="text" placeholder="Ex: 3/6" value={values.progresso || ''} onChange={(e) => setValues({ ...values, progresso: e.target.value })} style={{ fontSize: '14px', width: '100%' }} />
                        </div>

                        {renderToggle('congelado', 'Congelado', 'Uma parcela que foi congelada/pausada.')}
                        {renderToggle('isEvelise', 'De Terceiros (Evelise)', 'Compras no cartão feitas para Evelise.')}
                    </>
                )}

                {(type === 'divida-user2' || type === 'divida-user1') && (
                    <>
                        {renderInput('name', 'Nome da Conta', 'Ex: Empréstimo Banco X', false, true)}
                        {renderInput('total', 'Valor Total Restante (R$)', 'Ex: 1500.00', true)}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Detalhes (Opcional)</label>
                            <input className="input" type="text" placeholder="Ex: 12x 53,20" value={values.desc || ''} onChange={(e) => setValues({ ...values, desc: e.target.value })} style={{ fontSize: '14px', width: '100%' }} />
                        </div>
                    </>
                )}

                {type === 'problema' && (
                    <>
                        {renderInput('name', 'Nome do Problema', 'Ex: Crédito Banco X', false, true)}
                        {renderInput('total', 'Valor Total / Prejuízo (R$)', 'Ex: 850.00', true)}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Quando encerra? (Opcional)</label>
                            <input className="input" type="text" placeholder="Ex: Março/2026" value={values.encerraEm || ''} onChange={(e) => setValues({ ...values, encerraEm: e.target.value })} style={{ fontSize: '14px', width: '100%' }} />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Status/Progresso (Opcional)</label>
                            <input className="input" type="text" placeholder="Ex: 1/6" value={values.status || ''} onChange={(e) => setValues({ ...values, status: e.target.value })} style={{ fontSize: '14px', width: '100%' }} />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Observação Adicional</label>
                            <input className="input" type="text" placeholder="Ex: Fatura do mês 03" value={values.desc || ''} onChange={(e) => setValues({ ...values, desc: e.target.value })} style={{ fontSize: '14px', width: '100%' }} />
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Salvar Itens</button>
                </div>
            </form>
        </div>
    );
}
