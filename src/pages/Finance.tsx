import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertTriangle,
    CreditCard,
    CheckCircle2,
    Trash2,
    Plus,
    Bot,
    Calendar,
    CalendarClock
} from 'lucide-react';
import { useFamilyFinanceStore } from '@/stores/familyFinanceStore';
import { useChatStore } from '@/stores/chatStore';
import { FinanceModal, type FinanceModalType } from '@/components/FinanceModal';

type Tab = 'PLANO' | 'TERMOMETRO' | 'DIVIDAS';

export function Finance() {
    const navigate = useNavigate();
    const store = useFamilyFinanceStore();
    const chatStore = useChatStore();

    const [activeTab, setActiveTab] = useState<Tab>('PLANO');
    const [modalType, setModalType] = useState<FinanceModalType>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(store.currentMonth);

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
        const val = parseNumber(data.value);
        const total = parseNumber(data.total);

        if (modalType === 'renda' && val && data.name) store.addEntrada({ name: data.name, value: val, isFixed: data.isFixed });
        else if (modalType === 'fixo' && val && data.name) store.addFixo({ name: data.name, value: val, isFixed: data.isFixed });
        else if (modalType === 'credito' && val && data.name) store.addCredito({ name: data.name, value: val, type: data.type, congelado: !!data.congelado, progresso: data.progresso || '', isEvelise: !!data.isEvelise });
        else if (modalType === 'divida-isis' && total && data.name) store.addDividaIsis({ name: data.name, desc: data.desc || '', total });
        else if (modalType === 'divida-angelica' && total && data.name) store.addDividaAngelica({ name: data.name, desc: data.desc || '', total });
        else if (modalType === 'problema' && total && data.name) store.addProblema({ name: data.name, total, desc: data.desc || '', encerraEm: data.encerraEm || '', status: data.status || '' });
    };

    const generateAIDiagnostic = () => {
        if (chatStore.ollamaStatus !== 'online') {
            alert("A Inteligência Artificial (Ring) está Offline. Certifique-se de que o Ollama está rodando no sistema!");
            return;
        }

        const prompt = `Você atua como um educador financeiro empático e cirúrgico da Família Alenfinos. Baseado nos dados exatos atuais da família, apresente um diagnóstico claro sobre a saúde financeira. Faça críticas construtivas e aponte riscos.
Renda Total: ${formatCurrency(totalRenda)}
Renda Composição: ${store.entradas.map(s => s.name + ' - ' + formatCurrency(s.value)).join(', ')}
Despesas Fixas Mensais Pendentes: ${formatCurrency(totalFixo)}
Custos com Assinaturas/Parcelamentos (Cartões): ${formatCurrency(totalCreditos)} (${store.creditos.map(p => p.name + '...').join('; ')})
Dívidas Totais Angélica: ${formatCurrency(totalDivAngelica)}
Dívidas Totais Isis: ${formatCurrency(totalDivIsis)}`;

        chatStore.sendMessage('familia', prompt);
        navigate('/chat');
    };

    const totalRenda = store.entradas.reduce((a, b) => a + b.value, 0);
    const totalFixo = store.fixoMensal.filter(f => !f.paid).reduce((a, b) => a + b.value, 0);
    const totalCreditos = store.creditos.filter(c => !c.paid).reduce((a, b) => a + b.value, 0);
    const totalProblemas = store.problemas.filter(p => !p.paid).reduce((a, b) => a + b.total, 0);

    const saldoLivreReal = totalRenda - totalFixo - totalCreditos - totalProblemas;

    const totalDivAngelica = store.dividasAngelica.filter(d => !d.paid).reduce((a, b) => a + b.total, 0);
    const totalDivIsis = store.dividasIsis.filter(d => !d.paid).reduce((a, b) => a + b.total, 0);

    const termometroMes = store.termometroFiles[selectedMonth];
    const thermMonths = Object.keys(store.termometroFiles).sort();

    // Totais do termometro
    const termEntradas = termometroMes?.dias.reduce((a, d) => a + (d.entrada || 0), 0) || 0;
    const termSaidas = termometroMes?.dias.reduce((a, d) => a + (d.saida || 0), 0) || 0;
    const termDiario = termometroMes?.dias.reduce((a, d) => a + (d.diario || 0), 0) || 0;

    const currentSaldoTermometro = store.getSaldoFinalMes(selectedMonth) || 0;

    return (
        <div className="main-content">
            <FinanceModal
                type={modalType}
                onClose={() => setModalType(null)}
                onSubmit={handleModalSubmit}
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
                        <p className="page-subtitle">Página baseada nas planilhas de Termômetro e Plano de Contas.</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={generateAIDiagnostic}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}
                    >
                        <Bot size={18} /> Diagnóstico Inteligente (IA)
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 32, borderBottom: '1px solid var(--color-border-default)' }}>
                    {['PLANO', 'TERMOMETRO', 'DIVIDAS'].map((tab) => (
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
                            {tab === 'TERMOMETRO' && <CalendarClock size={16} />}
                            {tab === 'DIVIDAS' && <AlertTriangle size={16} />}
                            {tab === 'PLANO' ? 'Plano de Contas' : tab === 'TERMOMETRO' ? 'Termômetro' : 'Dívidas & Passivos'}
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
                                <button className="btn btn-ghost btn-sm" onClick={() => setModalType('renda')}><Plus size={14} /> Adicionar Renda</button>
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
                                <button className="btn btn-ghost btn-sm" onClick={() => setModalType('fixo')}><Plus size={14} /> Adicionar Saída</button>
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
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeFixo(f.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}

                                {/* Creditos / Parcelamentos Embeded */}
                                <div style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border-default)', borderBottom: '1px solid var(--color-border-default)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>CRÉDITO E PARCELAMENTOS (Cartão)</span>
                                    <button className="btn btn-ghost btn-sm" style={{ padding: '0px 4px', height: 'auto', color: 'var(--color-accent-primary)' }} onClick={() => setModalType('credito')}><Plus size={12} /></button>
                                </div>

                                {store.creditos.map(c => (
                                    <div key={c.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px', background: c.congelado ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
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
                                                    {c.isEvelise && <span style={{ fontSize: 10, background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-error)', padding: '2px 6px', borderRadius: 4 }}>EVELISE</span>}
                                                    {c.congelado && <span style={{ fontSize: 10, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', padding: '2px 6px', borderRadius: 4 }}>CONGELADO</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: c.congelado ? 'var(--color-warning)' : 'inherit' }}>{formatCurrency(c.value)}</span>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-text-tertiary)' }} onClick={() => store.toggleCongelado(c.id)} title="Congelar/Descongelar">❄️</button>
                                            <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeCredito(c.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border-default)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                    <span>TOTAL SAÍDAS PENDENTES (Débito + Crédito)</span><span style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalFixo + totalCreditos)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Totais Gerais */}
                        <div style={{ gridColumn: '1 / -1', padding: '20px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Total Entradas: {formatCurrency(totalRenda)}</div>
                                <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Total Saídas/Fixos/Faturas: {formatCurrency(totalFixo + totalCreditos + totalProblemas)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>SALDO PROJETADO RESTANTE (LIVRE)</div>
                                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: saldoLivreReal >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    {formatCurrency(saldoLivreReal)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'TERMOMETRO' && (
                    <div className="animation-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <select className="input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ width: 160 }}>
                                    {thermMonths.map(m => <option key={m} value={m}>{store.termometroFiles[m].nome} {m.split('-')[1]}</option>)}
                                </select>
                            </div>
                        </div>

                        {termometroMes ? (
                            <div className="card" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                            <th style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border-default)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Dia</th>
                                            <th style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border-default)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Entrada (+R$)</th>
                                            <th style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border-default)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Saída (-R$)</th>
                                            <th style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border-default)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Diário (-R$)</th>
                                            <th style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border-default)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Saldo Final</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            let accumulatedSaldo = termometroMes.saldoInicial;

                                            return termometroMes.dias.map((d, index) => {
                                                const eStr = d.entrada !== null ? d.entrada.toString() : '';
                                                const sStr = d.saida !== null ? d.saida.toString() : '';
                                                const diStr = d.diario !== null ? d.diario.toString() : '';

                                                const isToday = new Date().getDate() === d.dia && new Date().getMonth() + 1 === parseInt(selectedMonth.split('-')[0]);

                                                // Handle projected values for thermometer
                                                let projectedSaida = sStr;
                                                let projectedColor = 'var(--color-error)';

                                                let valEntrada = d.entrada || 0;
                                                let valSaida = d.saida || 0;
                                                let valDiario = d.diario || 0;

                                                // Se for no futuro e não tivermos preenchido nada, projetamos uma estimativa de diário de 100 reais
                                                const isThisMonth = new Date().getMonth() + 1 === parseInt(selectedMonth.split('-')[0]);
                                                const isFuture = isThisMonth ? (index + 1 > new Date().getDate()) : (new Date().getMonth() + 1 < parseInt(selectedMonth.split('-')[0]));

                                                if (isFuture && d.saida === null && d.diario === null && d.entrada === null) {
                                                    projectedSaida = '100';
                                                    projectedColor = 'var(--color-text-tertiary)';
                                                    valDiario = 100;
                                                }

                                                // Simulate receiving the income on the 5th working day (or day 5 for simplicity for now)
                                                let projectedEntrada = eStr;
                                                let projectedEntradaColor = 'var(--color-success)';
                                                if (isFuture && index === 4 && d.entrada === null) {
                                                    projectedEntrada = totalRenda.toString();
                                                    projectedEntradaColor = 'var(--color-text-tertiary)';
                                                    valEntrada = totalRenda;
                                                }

                                                accumulatedSaldo += valEntrada - (valSaida + valDiario);

                                                return (
                                                    <tr key={index} style={{ background: isToday ? 'rgba(79,138,255,0.05)' : 'transparent', borderLeft: isToday ? '3px solid var(--color-accent-primary)' : '3px solid transparent' }}>
                                                        <td style={{ padding: '6px 14px', borderBottom: '1px solid var(--color-border-default)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-secondary)' }}>{d.dia}</td>
                                                        <td style={{ padding: '6px 14px', borderBottom: '1px solid var(--color-border-default)' }}><input className="input" type="number" value={projectedEntrada !== eStr ? '' : eStr} placeholder={projectedEntrada !== eStr ? projectedEntrada : ''} onChange={e => store.updateTermometroDay(selectedMonth, d.dia, 'entrada', e.target.value ? parseFloat(e.target.value) : null)} style={{ height: 32, padding: '4px 8px', fontSize: 13, fontFamily: 'var(--font-mono)', color: projectedEntradaColor }} /></td>
                                                        <td style={{ padding: '6px 14px', borderBottom: '1px solid var(--color-border-default)' }}><input className="input" type="number" value={sStr} onChange={e => store.updateTermometroDay(selectedMonth, d.dia, 'saida', e.target.value ? parseFloat(e.target.value) : null)} style={{ height: 32, padding: '4px 8px', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-error)' }} /></td>
                                                        <td style={{ padding: '6px 14px', borderBottom: '1px solid var(--color-border-default)' }}><input className="input" type="number" value={projectedSaida !== sStr ? '' : diStr} placeholder={projectedSaida !== sStr ? projectedSaida : ''} onChange={e => store.updateTermometroDay(selectedMonth, d.dia, 'diario', e.target.value ? parseFloat(e.target.value) : null)} style={{ height: 32, padding: '4px 8px', fontSize: 13, fontFamily: 'var(--font-mono)', color: projectedColor }} /></td>
                                                        <td style={{ padding: '6px 14px', borderBottom: '1px solid var(--color-border-default)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: accumulatedSaldo >= 0 ? 'var(--color-accent-primary)' : 'var(--color-error)' }}>{formatCurrency(accumulatedSaldo)}</td>
                                                    </tr>
                                                )
                                            });
                                        })()}
                                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>TOTAIS</td>
                                            <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-success)' }}>{formatCurrency(termEntradas)}</td>
                                            <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-error)' }}>{formatCurrency(termSaidas)}</td>
                                            <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-warning)' }}>{formatCurrency(termDiario)}</td>
                                            <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: currentSaldoTermometro >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{formatCurrency(currentSaldoTermometro)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-tertiary)' }}>Mês sem lançamento criado. Altere o Mês/Ano e salve com alguma informação.</div>
                        )}
                    </div>
                )}

                {activeTab === 'DIVIDAS' && (
                    <div className="animation-fade-in content-grid">
                        <div className="card" style={{ gridColumn: '1 / -1' }}>
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={18} style={{ color: 'var(--color-error)' }} />
                                    <h2 className="card-title">Problemas Financeiros Ativos / Faturas Isoladas</h2>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => setModalType('problema')}><Plus size={14} /> Adicionar Prejuízo Extra</button>
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
                                <button className="btn btn-ghost btn-sm" onClick={() => setModalType('divida-angelica')}><Plus size={14} /></button>
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
                                <button className="btn btn-ghost btn-sm" onClick={() => setModalType('divida-isis')}><Plus size={14} /></button>
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
            </div>
        </div>
    );
}
