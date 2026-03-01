import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertTriangle,
    CreditCard,
    DollarSign,
    CalendarClock,
    CheckCircle2,
    Trash2,
    Plus,
    Bot
} from 'lucide-react';
import { useFamilyFinanceStore } from '@/stores/familyFinanceStore';
import { useChatStore } from '@/stores/chatStore';

export function Finance() {
    const navigate = useNavigate();
    const store = useFamilyFinanceStore();
    const chatStore = useChatStore();

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const parseNumber = (str: string | null) => {
        if (!str) return 0;
        return parseFloat(str.replace(',', '.'));
    };

    const handleAddRenda = (type: 'salarios' | 'vales') => {
        const name = window.prompt(`Adicionar ${type === 'salarios' ? 'Salário' : 'Vale'} (Nome da Pessoa):`);
        if (!name) return;
        const valStr = window.prompt(`Valor do ${type === 'salarios' ? 'Salário' : 'Vale'} (Ex: 2000.50):`);
        const value = parseNumber(valStr);
        if (value) store.addRenda(type, { name, value });
    };

    const handleAddFixo = () => {
        const name = window.prompt('Nome da Conta Fixa Geral (ex: Luz, Água):');
        if (!name) return;
        const valStr = window.prompt('Valor mensal:');
        const value = parseNumber(valStr);
        if (value) store.addFixo({ name, value });
    };

    const handleAddParcelamento = () => {
        const name = window.prompt('Nome do Parcelamento (ex: TV, Celular):');
        if (!name) return;
        const type = window.prompt('Detalhes do Parcelamento (ex: Parcelamento 3/6, Assinatura):') || '';
        const valStr = window.prompt('Valor da Parcela Mensal:');
        const value = parseNumber(valStr);
        if (value) store.addParcelamento({ name, type, value });
    };

    const handleAddDivida = (person: 'isis' | 'angelica') => {
        const name = window.prompt(`Nome da Dívida para ${person === 'isis' ? 'Isis' : 'Angélica'}:`);
        if (!name) return;
        const desc = window.prompt('Detalhes da Dívida (ex: 2x 700,00 ou só traços):') || '';
        const valStr = window.prompt('Valor TOTAL restante da Dívida:');
        const total = parseNumber(valStr);
        if (total) {
            person === 'isis'
                ? store.addDividaIsis({ name, desc, total })
                : store.addDividaAngelica({ name, desc, total });
        }
    };

    const handleAddProblema = () => {
        const name = window.prompt('Problema / Histórico Pós Data:');
        if (!name) return;
        const desc = window.prompt('Quando este problema acaba ou vai acontecer?:') || '';
        const valStr = window.prompt('Valor total:');
        const total = parseNumber(valStr);
        if (total) store.addProblema({ name, desc, total });
    };

    const generateAIDiagnostic = () => {
        if (chatStore.ollamaStatus !== 'online') {
            alert("A Inteligência Artificial (Ring) está Offline. Certifique-se de que o Ollama está rodando no sistema!");
            return;
        }

        const prompt = `Você atua como um educador financeiro empático e cirúrgico da Família Alenfinos. Baseado nos dados exatos atuais da família, apresente um diagnóstico claro sobre a saúde financeira. Faça críticas construtivas, aponte riscos e sugira estratégias de quitação de dívidas e redução do custo de vida. Não faça suposições externas.

DADOS DA FAMÍLIA:
Renda Total: ${formatCurrency(totalRenda)}
Renda Composição: ${store.renda.salarios.map(s => s.name + ' - ' + formatCurrency(s.value)).join(', ')} | Vales: ${store.renda.vales.map(v => v.name + ' - ' + formatCurrency(v.value)).join(', ')}

Despesas Fixas Mensais: ${formatCurrency(totalFixo)}
(Líquido Livre sem Parcelamentos: ${formatCurrency(totalRenda - totalFixo)})

Custos com Parcelamentos e Assinaturas (Cartões): ${formatCurrency(totalParcelamentos)}
O que deve em parcelas detalhado: ${store.parcelamentos.map(p => p.name + ' (' + p.type + '). Valor mês: ' + formatCurrency(p.value)).join('; ')}

Dívidas Totais Angélica: ${formatCurrency(totalDivAngelica)}
Detalhe Dív. Angélica: ${store.dividasAngelica.map(d => d.name + ' => Total:' + formatCurrency(d.total)).join('; ')}

Dívidas Totais Isis: ${formatCurrency(totalDivIsis)}
Detalhe Dív. Isis: ${store.dividasIsis.map(d => d.name + ' => Total:' + formatCurrency(d.total)).join('; ')}

Histórico/Risco no radar da família: ${store.problemas.map(p => p.name + ' = ' + formatCurrency(p.total) + ' (' + p.desc + ')').join('; ')}

Por favor, faça um balanço financeiro e crie um plano de contenção para esses riscos atuais. Quais devem ser os próximos passos dos meses seguintes da família?`;

        chatStore.sendMessage('familia', prompt);
        navigate('/chat');
    };

    const totalRenda = [...store.renda.salarios, ...store.renda.vales].reduce((a, b) => a + b.value, 0);
    const totalFixo = store.fixoMensal.reduce((acc, curr) => acc + curr.value, 0);
    const totalParcelamentos = store.parcelamentos.reduce((acc, curr) => acc + curr.value, 0);
    const totalProblemas = store.problemas.reduce((acc, curr) => acc + curr.total, 0);

    const totalCreditoFaturas = totalParcelamentos + totalProblemas;

    const totalDivAngelica = store.dividasAngelica.reduce((acc, curr) => acc + curr.total, 0);
    const totalDivIsis = store.dividasIsis.reduce((acc, curr) => acc + curr.total, 0);

    const saldoLivreReal = totalRenda - totalFixo - totalCreditoFaturas;

    return (
        <div className="main-content">
            <div className="page-container">
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-title">Finanças da Casa</h1>
                        <p className="page-subtitle">
                            Monitoramento em tempo real do ecossistema financeiro familiar.
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={generateAIDiagnostic}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}
                    >
                        <Bot size={18} /> Diagnóstico Inteligente (IA)
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <div className="stat-card green">
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div className="stat-icon green">
                                <TrendingUp size={20} />
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn btn-icon btn-ghost" style={{ padding: 4 }} onClick={() => handleAddRenda('salarios')} title="Adicionar Salário"><Plus size={14} /></button>
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                            {formatCurrency(totalRenda)}
                        </div>
                        <div className="stat-label">Renda (Salários + Vales)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
                            <div>
                                {store.renda.salarios.map(r => (
                                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                        <span>Salário {r.name}</span>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            {formatCurrency(r.value)}
                                            <Trash2 size={10} style={{ cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => store.removeRenda('salarios', r.id)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                {store.renda.vales.map(r => (
                                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                        <span>Vale {r.name}</span>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            {formatCurrency(r.value)}
                                            <Trash2 size={10} style={{ cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => store.removeRenda('vales', r.id)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            content: '', position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                            background: 'linear-gradient(90deg, var(--color-error), #dc2626)',
                        }} />
                        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)' }}>
                            <TrendingDown size={20} />
                        </div>
                        <div className="stat-value" style={{ color: 'var(--color-error)' }}>
                            {formatCurrency(totalFixo)}
                        </div>
                        <div className="stat-label">Total Fixo Mensal (Débito)</div>
                    </div>

                    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            content: '', position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                            background: 'linear-gradient(90deg, var(--color-warning), #d97706)',
                        }} />
                        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
                            <CreditCard size={20} />
                        </div>
                        <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                            {formatCurrency(totalCreditoFaturas)}
                        </div>
                        <div className="stat-label">Créditos, Faturas e Descontos</div>
                    </div>

                    <div className={`stat-card ${saldoLivreReal >= 0 ? 'green' : 'red'}`} style={{ border: saldoLivreReal < 0 ? '1px solid var(--color-error)' : '1px solid var(--color-success)', background: saldoLivreReal < 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div className={`stat-icon ${saldoLivreReal >= 0 ? 'green' : 'red'}`}>
                                <Wallet size={20} />
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: saldoLivreReal >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {formatCurrency(saldoLivreReal)}
                        </div>
                        <div className="stat-label" style={{ fontWeight: 600 }}>Saldo Livre do Mês</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                            (Deduzida as faturas e fixos do salário total)
                        </div>
                    </div>
                </div>

                <div className="content-grid" style={{ marginTop: '20px' }}>
                    {/* Fixo Mensal */}
                    <div className="card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <DollarSign size={18} style={{ color: 'var(--color-error)' }} />
                                <h2 className="card-title">Fixo Mensal (Débito)</h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                    {store.fixoMensal.length} contas
                                </span>
                                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={handleAddFixo}>
                                    <Plus size={14} /> Adicionar
                                </button>
                            </div>
                        </div>
                        <div className="task-list">
                            {store.fixoMensal.map((item) => (
                                <div key={item.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => store.toggleFixoPaid(item.id)}>
                                        {item.paid ? (
                                            <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
                                        ) : (
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--color-border-default)' }} />
                                        )}
                                        <span style={{ fontSize: '14px', fontWeight: item.paid ? 400 : 500, color: item.paid ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{formatCurrency(item.value)}</span>
                                        <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeFixo(item.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Crédito e Parcelamentos */}
                    <div className="card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CreditCard size={18} style={{ color: 'var(--color-warning)' }} />
                                <h2 className="card-title">Créditos, Faturas e Descontos</h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '14px', color: 'var(--color-warning)', fontWeight: 700 }}>
                                    {formatCurrency(totalCreditoFaturas)}/mês
                                </span>
                                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={handleAddProblema} title="Adicionar Desconto de Folha/Fatura Única">
                                    <AlertTriangle size={14} style={{ marginRight: '4px', color: 'var(--color-error)' }} /> Fatura/Desconto
                                </button>
                                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={handleAddParcelamento} title="Adicionar Assinatura ou Parcelamento Cartão">
                                    <Plus size={14} /> Assinatura/Parcela
                                </button>
                            </div>
                        </div>
                        <div className="task-list">
                            {store.problemas.map((item) => (
                                <div key={item.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.05)' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-error)' }}>{item.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Fatura do Mês ou Desconto: {item.desc}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-error)' }}>{formatCurrency(item.total)}</span>
                                        <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeProblema(item.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {store.parcelamentos.map((item) => (
                                <div key={item.id} className="task-item" style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{item.type}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{formatCurrency(item.value)}</span>
                                        <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeParcelamento(item.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {store.parcelamentos.length === 0 && store.problemas.length === 0 && <div style={{ padding: 12, fontSize: 13, color: 'var(--color-text-tertiary)' }}>Nenhum gasto de crédito.</div>}
                        </div>
                    </div>
                </div>

                {/* Dívidas e Problemas (Full Width) */}
                <div style={{ marginTop: '20px' }}>
                    <div className="card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={18} style={{ color: 'var(--color-error)' }} />
                                <h2 className="card-title">Dívidas e Passivos Congelados</h2>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Dívidas Angélica */}
                            <div>
                                <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Dívidas Ocultas (Angélica)</span>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <span style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(totalDivAngelica)}</span>
                                        <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => handleAddDivida('angelica')}><Plus size={12} /></button>
                                    </div>
                                </h3>
                                <div className="task-list">
                                    {store.dividasAngelica.map((item) => (
                                        <div key={item.id} className="task-item" style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{item.desc}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{formatCurrency(item.total)}</span>
                                                <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeDividaAngelica(item.id)}><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {store.dividasAngelica.length === 0 && <div style={{ fontSize: 12, padding: 8, color: 'var(--color-text-tertiary)' }}>Sem dividas.</div>}
                                </div>
                            </div>

                            {/* Dívidas Isis */}
                            <div>
                                <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Dívidas Ocultas (Isis)</span>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <span style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(totalDivIsis)}</span>
                                        <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => handleAddDivida('isis')}><Plus size={12} /></button>
                                    </div>
                                </h3>
                                <div className="task-list">
                                    {store.dividasIsis.map((item) => (
                                        <div key={item.id} className="task-item" style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{item.desc}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{formatCurrency(item.total)}</span>
                                                <button className="btn btn-icon btn-ghost" style={{ padding: 4, height: 'auto', color: 'var(--color-error)' }} onClick={() => store.removeDividaIsis(item.id)}><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {store.dividasIsis.length === 0 && <div style={{ fontSize: 12, padding: 8, color: 'var(--color-text-tertiary)' }}>Sem dividas.</div>}
                                </div>
                            </div>
                        </div>



                    </div>
                </div>
                <div style={{ padding: 20 }}></div>
            </div>
        </div>
    );
}
