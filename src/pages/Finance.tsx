import { useState, useEffect } from 'react';

import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertTriangle,
    CreditCard,
    CheckCircle2,
    Trash2,
    Plus,
    Pencil
} from 'lucide-react';
import { useFamilyFinanceStore } from '@/stores/familyFinanceStore';

import { FinanceModal, type FinanceModalType } from '@/components/FinanceModal';

type Tab = 'PLANO' | 'CREDITO';

export function Finance() {

    const store = useFamilyFinanceStore();


    const [activeTab, setActiveTab] = useState<Tab>('PLANO');
    const [modalType, setModalType] = useState<FinanceModalType>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [defaultCreditoType, setDefaultCreditoType] = useState<string>('assinatura');

    useEffect(() => {
        store.checkMonthTurnover();
    }, []);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const parseNumber = (str: string | undefined) => {
        if (!str) return 0;
        return parseFloat(str.replace(',', '.'));
    };

    const handleModalSubmit = (data: any) => {
        const val = parseNumber(data.value?.toString() || '');
        const total = parseNumber(data.total?.toString() || '');

        if (editingItem) {
            if (modalType === 'renda') store.updateEntrada(editingItem.id, { name: data.name, value: val, isFixed: data.isFixed });
            else if (modalType === 'fixo') store.updateFixo(editingItem.id, { name: data.name, value: val, isFixed: data.isFixed });
            else if (modalType === 'credito') store.updateCredito(editingItem.id, { name: data.name, value: val, type: data.type, congelado: !!data.congelado, progresso: data.progresso || '', isEvelise: !!data.isEvelise, startMonth: data.startMonth });
            else if (modalType === 'divida-isis') store.updateDividaIsis(editingItem.id, { name: data.name, desc: data.desc || '', total });
            else if (modalType === 'divida-angelica') store.updateDividaAngelica(editingItem.id, { name: data.name, desc: data.desc || '', total });
            else if (modalType === 'problema') store.updateProblema(editingItem.id, { name: data.name, total, desc: data.desc || '', encerraEm: data.encerraEm || '', status: data.status || '' });
        } else {
            if (modalType === 'renda' && val && data.name) store.addEntrada({ name: data.name, value: val, isFixed: data.isFixed });
            else if (modalType === 'fixo' && val && data.name) store.addFixo({ name: data.name, value: val, isFixed: data.isFixed });
            else if (modalType === 'credito' && val && data.name) store.addCredito({ name: data.name, value: val, type: data.type, congelado: !!data.congelado, progresso: data.progresso || '', isEvelise: !!data.isEvelise, startMonth: data.startMonth });
            else if (modalType === 'divida-isis' && total && data.name) store.addDividaIsis({ name: data.name, desc: data.desc || '', total });
            else if (modalType === 'divida-angelica' && total && data.name) store.addDividaAngelica({ name: data.name, desc: data.desc || '', total });
            else if (modalType === 'problema' && total && data.name) store.addProblema({ name: data.name, total, desc: data.desc || '', encerraEm: data.encerraEm || '', status: data.status || '' });
        }
    };



    const isActiveThisMonth = (startMonthStr: string | undefined, currentMonthStr: string) => {
        if (!startMonthStr) return true;
        const [sm, sy] = startMonthStr.split('-').map(Number);
        const [cm, cy] = currentMonthStr.split('-').map(Number);
        if (cy > sy) return true;
        if (cy === sy && cm >= sm) return true;
        return false;
    };

    const activeCreditos = store.creditos.filter(c => isActiveThisMonth(c.startMonth, store.currentMonth));
    const activeParcelamentos = activeCreditos.filter(c => c.type !== 'assinatura');
    const activeAssinaturas = activeCreditos.filter(c => c.type === 'assinatura');

    const totalRenda = store.entradas.reduce((a, b) => a + b.value, 0);
    const totalFixoMensal = store.fixoMensal.reduce((a, b) => a + b.value, 0);
    const totalCreditosMensal = activeParcelamentos.filter(c => !c.congelado).reduce((a, b) => a + b.value, 0);
    const totalAssinaturasMensal = activeAssinaturas.filter(c => !c.congelado).reduce((a, b) => a + b.value, 0);
    const totalProblemasMensal = store.problemas.reduce((a, b) => a + b.total, 0);

    const totalFixoPendente = store.fixoMensal.filter(f => !f.paid).reduce((a, b) => a + b.value, 0);
    const totalCreditosPendente = activeParcelamentos.filter(c => !c.paid && !c.congelado).reduce((a, b) => a + b.value, 0);
    const totalAssinaturasPendente = activeAssinaturas.filter(c => !c.paid && !c.congelado).reduce((a, b) => a + b.value, 0);
    const totalProblemasPendente = store.problemas.filter(p => !p.paid).reduce((a, b) => a + b.total, 0);

    const saldoLivreReal = totalRenda - totalFixoMensal - totalCreditosMensal - totalAssinaturasMensal - totalProblemasMensal;

    const totalDivAngelica = store.dividasAngelica.filter(d => !d.paid).reduce((a, b) => a + b.total, 0);
    const totalDivIsis = store.dividasIsis.filter(d => !d.paid).reduce((a, b) => a + b.total, 0);

    // Variáveis e lógicas do Termômetro foram removidas a pedido do usuário.

    return (
        <div className="main-content">
            <FinanceModal
                type={modalType}
                onClose={() => setModalType(null)}
                onSubmit={handleModalSubmit}
                initialData={editingItem}
                defaultCreditoType={defaultCreditoType}
            />

            <div className="page-container" style={{ paddingBottom: 100 }}>
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-accent-primary)', background: 'rgba(79,138,255,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(79,138,255,0.25)' }}>v2.0</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>Módulo Financeiro</span>
                        </div>
                        <h1 className="page-title">Finanças da Casa</h1>
                        <p className="page-subtitle">Página baseada na planilha de Plano de Contas.</p>
                        <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                            Hoje é <strong>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                        </p>
                    </div>

                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 32, borderBottom: '1px solid var(--color-border-default)' }}>
                    {['PLANO', 'CREDITO'].map((tab) => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab as Tab)}
                            style={{
                                padding: '12px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                color: activeTab === tab ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
                                borderBottom: activeTab === tab ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                            }}
                        >
                            {tab === 'PLANO' && <Wallet size={16} />}
                            {tab === 'CREDITO' && <CreditCard size={16} />}
                            {tab === 'PLANO' ? 'Gastos do Mês (Débito)' : 'Assinaturas (Crédito)'}
                        </div>
                    ))}
                </div>

                {activeTab === 'PLANO' && (
                    <div className="animation-fade-in content-grid">
                        <div className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
                                    <h2 className="card-title">Entradas</h2>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingItem(null); setModalType('renda'); }}><Plus size={14} /> Adicionar Renda</button>
                            </div>
                            <div className="task-list">
                                {store.entradas.map(e => (
                                    <div key={e.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{e.name}</div>
                                            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                                                {e.isFixed ? <span style={{ color: 'var(--color-success)' }}>Fixa</span> : <span style={{ color: 'var(--color-warning)' }}>Variável (Só este mês)</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(e.value)}</span>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => { setEditingItem(e); setModalType('renda'); }}><Pencil size={14} /></button>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeEntrada(e.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border-default)', background: 'rgba(34,197,94,0.05)', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                    <span>TOTAL ENTRADAS</span><span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalRenda)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <TrendingDown size={18} style={{ color: 'var(--color-error)' }} />
                                    <h2 className="card-title">Saídas Fixas (Débito)</h2>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingItem(null); setModalType('fixo'); }}><Plus size={14} /> Adicionar Saída</button>
                            </div>
                            <div className="task-list">
                                {store.fixoMensal.map(f => (
                                    <div key={f.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => store.toggleFixoPaid(f.id)}>
                                            {f.paid ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--color-border-default)' }} />}
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: f.paid ? 400 : 500, color: f.paid ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>{f.name}</div>
                                                {!f.isFixed && <div style={{ fontSize: 11, color: 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>Despesa Pontual (Variável)</div>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(f.value)}</span>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => { setEditingItem(f); setModalType('fixo'); }}><Pencil size={14} /></button>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeFixo(f.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}

                                {/* Creditos / Parcelamentos Embeded */}
                                <div style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border-default)', borderBottom: '1px solid var(--color-border-default)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>PARCELAMENTOS (CRÉDITO)</span>
                                    <button className="btn btn-ghost btn-sm" style={{ padding: '0px 4px', height: 'auto', color: 'var(--color-accent-primary)' }} onClick={() => { setEditingItem(null); setDefaultCreditoType('parcelamento'); setModalType('credito'); }}><Plus size={12} /></button>
                                </div>

                                {store.creditos.filter(c => c.type !== 'assinatura').map(c => {
                                    const isActive = isActiveThisMonth(c.startMonth, store.currentMonth);
                                    return (
                                        <div key={c.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px', background: c.congelado ? 'rgba(245, 158, 11, 0.05)' : (!isActive ? 'rgba(255,255,255,0.02)' : 'transparent'), opacity: !isActive ? 0.6 : 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }} onClick={() => store.toggleCreditoPaid(c.id)}>
                                                <div style={{ marginTop: 2 }}>
                                                    {c.paid ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--color-border-default)' }} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: c.paid ? 400 : 500, color: c.paid ? 'var(--color-text-tertiary)' : (c.congelado ? 'var(--color-warning)' : 'var(--color-text-primary)') }}>
                                                        {c.congelado && '⚠️ '} {c.name} {c.paid && <span style={{ fontSize: 11, marginLeft: 4, color: 'var(--color-success)' }}>- Pago</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                                        <span style={{ fontSize: 10, background: 'rgba(124,92,252,0.12)', color: 'var(--color-accent-secondary)', padding: '2px 6px', borderRadius: 4 }}>{c.type.toUpperCase()}</span>
                                                        {c.progresso && <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', padding: '2px 6px', borderRadius: 4 }}>{c.progresso}</span>}
                                                        {c.isEvelise && <span style={{ fontSize: 10, background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-error)', padding: '2px 6px', borderRadius: 4 }}>CARTÃO EVELISE</span>}
                                                        {c.congelado && <span style={{ fontSize: 10, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', padding: '2px 6px', borderRadius: 4 }}>CONGELADO</span>}
                                                        {!isActive && <span style={{ fontSize: 10, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: 4 }}>FATURA EM {c.startMonth}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: c.congelado ? 'var(--color-warning)' : 'inherit' }}>{formatCurrency(c.value)}</span>
                                                <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => store.toggleCongelado(c.id)} title="Congelar/Descongelar">❄️</button>
                                                <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => { setEditingItem(c); setModalType('credito'); }}><Pencil size={14} /></button>
                                                <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeCredito(c.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Subtotais detalhados */}
                                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--color-border-default)', background: 'var(--color-bg-secondary)', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Saídas Fixas (Débito)</span><span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalFixoMensal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Parcelamentos (Crédito)</span><span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalCreditosMensal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Assinaturas (Crédito)</span><span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalAssinaturasMensal)}</span>
                                    </div>
                                </div>
                                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border-default)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                    <span>TOTAL DE GASTOS DO MÊS</span><span style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalFixoMensal + totalCreditosMensal + totalAssinaturasMensal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* DIVIDAS E PROBLEMAS MOVED HERE */}
                        <div className="card" style={{ gridColumn: '1 / -1' }}>
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={18} style={{ color: 'var(--color-error)' }} />
                                    <h2 className="card-title">Problemas Financeiros Ativos / Faturas Isoladas</h2>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingItem(null); setModalType('problema'); }}><Plus size={14} /> Adicionar Prejuízo Extra</button>
                            </div>
                            <div className="task-list">
                                {store.problemas.map(p => (
                                    <div key={p.id} className="task-item" style={{ justifyContent: 'space-between', padding: '12px 16px', borderLeft: '3px solid var(--color-error)', background: 'rgba(239, 68, 68, 0.05)', opacity: p.paid ? 0.6 : 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }} onClick={() => store.toggleProblemaPaid(p.id)}>
                                            <div style={{ marginTop: 2 }}>
                                                {p.paid ? <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--color-error)' }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: p.paid ? 400 : 600, color: p.paid ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>
                                                    {p.name} {p.paid && <span style={{ fontSize: 12, marginLeft: 6, color: 'var(--color-success)' }}>(Resolvido este mês)</span>}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                                    {p.desc}
                                                    {p.encerraEm && <span style={{ marginLeft: 8, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>Até: {p.encerraEm}</span>}
                                                    {p.status && <span style={{ marginLeft: 8, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>Progresso: {p.status}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.total)}</span>
                                            <button className="btn btn-icon btn-ghost" style={{ color: 'var(--color-text-tertiary)' }} onClick={() => { setEditingItem(p); setModalType('problema'); }}><Pencil size={15} /></button>
                                            <button className="btn btn-icon btn-ghost" style={{ color: 'var(--color-error)' }} onClick={() => store.removeProblema(p.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {store.problemas.length === 0 && <div style={{ padding: '16px', fontSize: 13, color: 'var(--color-success)', textAlign: 'center' }}>Nenhum problema super faturado ativo (Tudo Ok!)</div>}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h2 className="card-title">Dívidas Ocultas (Angélica)</h2>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingItem(null); setModalType('divida-angelica'); }}><Plus size={14} /></button>
                            </div>
                            <div className="task-list">
                                {store.dividasAngelica.map(d => (
                                    <div key={d.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px', opacity: d.paid ? 0.6 : 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }} onClick={() => store.toggleDividaAngelicaPaid(d.id)}>
                                            <div style={{ marginTop: 2 }}>
                                                {d.paid ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--color-border-default)' }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: d.paid ? 400 : 500, color: d.paid ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>
                                                    {d.name} {d.paid && <span style={{ fontSize: 11, marginLeft: 4, color: 'var(--color-success)' }}>- Pago</span>}
                                                </div>
                                                {d.desc && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{d.desc}</div>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(d.total)}</span>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => { setEditingItem(d); setModalType('divida-angelica'); }}><Pencil size={14} /></button>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeDividaAngelica(d.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border-default)', display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                    <span>TOTAL</span><span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalDivAngelica)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h2 className="card-title">Dívidas Ocultas (Isis)</h2>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingItem(null); setModalType('divida-isis'); }}><Plus size={14} /></button>
                            </div>
                            <div className="task-list">
                                {store.dividasIsis.map(d => (
                                    <div key={d.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px', opacity: d.paid ? 0.6 : 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }} onClick={() => store.toggleDividaIsisPaid(d.id)}>
                                            <div style={{ marginTop: 2 }}>
                                                {d.paid ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--color-border-default)' }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: d.paid ? 400 : 500, color: d.paid ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>
                                                    {d.name} {d.paid && <span style={{ fontSize: 11, marginLeft: 4, color: 'var(--color-success)' }}>- Pago</span>}
                                                </div>
                                                {d.desc && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{d.desc}</div>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(d.total)}</span>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => { setEditingItem(d); setModalType('divida-isis'); }}><Pencil size={14} /></button>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeDividaIsis(d.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border-default)', display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                    <span>TOTAL</span><span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalDivIsis)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'CREDITO' && (
                    <div className="animation-fade-in content-grid">
                        <div className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CreditCard size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                    <h2 className="card-title">Assinaturas e Recorrentes (CRÉDITO)</h2>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => { setEditingItem(null); setDefaultCreditoType('assinatura'); setModalType('credito'); }}><Plus size={14} /> Nova Assinatura</button>
                            </div>
                            <div className="task-list">
                                {store.creditos.filter(c => c.type === 'assinatura').map(c => {
                                    const isActive = isActiveThisMonth(c.startMonth, store.currentMonth);
                                    return (
                                        <div key={c.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px', background: c.congelado ? 'rgba(245, 158, 11, 0.05)' : (!isActive ? 'rgba(255,255,255,0.02)' : 'transparent'), opacity: !isActive ? 0.6 : 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }} onClick={() => store.toggleCreditoPaid(c.id)}>
                                                <div style={{ marginTop: 2 }}>
                                                    {c.paid ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--color-border-default)' }} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: c.paid ? 400 : 500, color: c.paid ? 'var(--color-text-tertiary)' : (c.congelado ? 'var(--color-warning)' : 'var(--color-text-primary)') }}>
                                                        {c.congelado && '⚠️ '} {c.name} {c.paid && <span style={{ fontSize: 11, marginLeft: 4, color: 'var(--color-success)' }}>- Pago</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                                        <span style={{ fontSize: 10, background: 'rgba(124,92,252,0.12)', color: 'var(--color-accent-secondary)', padding: '2px 6px', borderRadius: 4 }}>ASSINATURA</span>
                                                        {c.isEvelise && <span style={{ fontSize: 10, background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-error)', padding: '2px 6px', borderRadius: 4 }}>CARTÃO EVELISE</span>}
                                                        {!isActive && <span style={{ fontSize: 10, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: 4 }}>FATURA EM {c.startMonth}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: c.congelado ? 'var(--color-warning)' : 'inherit' }}>{formatCurrency(c.value)}</span>
                                                <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => store.toggleCongelado(c.id)} title="Congelar/Descongelar">❄️</button>
                                                <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => { setEditingItem(c); setModalType('credito'); }}><Pencil size={14} /></button>
                                                <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeCredito(c.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    )
                                })}

                                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border-default)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                    <span>TOTAL FIXO EM ASSINATURAS (CRÉDITO)</span><span style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalAssinaturasMensal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    {/* Totais Gerais */}
                    <div style={{ gridColumn: '1 / -1', padding: '20px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Total Receitas no Mês: {formatCurrency(totalRenda)}</div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Total Despesas no Mês: {formatCurrency(totalFixoMensal + totalCreditosMensal + totalAssinaturasMensal + totalProblemasMensal)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>SALDO PROJETADO RESTANTE (LIVRE)</div>
                            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: saldoLivreReal >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                {formatCurrency(saldoLivreReal)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
