import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Entrada {
    id: string;
    name: string;
    value: number;
    isFixed: boolean; // se false, é renda variável e sai na virada do mês
}

export interface FixoItem {
    id: string;
    name: string;
    value: number;
    isFixed: boolean; // se false, é despesa pontual do mês
    paid: boolean;
}

export interface ParcelamentoItem {
    id: string;
    name: string;
    value: number;
    type: 'debito' | 'credito' | 'parcelamento' | 'assinatura';
    congelado: boolean;
    progresso: string; // Ex: "3/7"
    isEvelise: boolean;
    paid?: boolean;
    startMonth?: string;
}

export interface DividaItem {
    id: string;
    name: string;
    total: number;
    desc: string;
    paid?: boolean;
}

export interface ProblemaItem {
    id: string;
    name: string;
    total: number;
    desc: string;
    encerraEm: string;
    status: string;
    paid?: boolean;
}

export interface DiaTermometro {
    dia: number;
    entrada: number | null;
    saida: number | null;
    diario: number | null;
}

export interface MesTermometro {
    mesAno: string; // Ex: "03-2026"
    nome: string; // Ex: "Março"
    dias: DiaTermometro[];
    saldoInicial: number;
}

export interface FamilyFinanceState {
    currentMonth: string; // "MM-YYYY"

    entradas: Entrada[];
    fixoMensal: FixoItem[];
    creditos: ParcelamentoItem[];
    dividasAngelica: DividaItem[];
    dividasIsis: DividaItem[];
    problemas: ProblemaItem[];

    termometroFiles: Record<string, MesTermometro>; // chave é "MM-YYYY"

    // Funções de Inicialização / Virada de Mês
    checkMonthTurnover: () => void;
    updateTermometroDay: (mesAno: string, dia: number, field: keyof DiaTermometro, value: number | null) => void;

    // CRUD Entradas
    addEntrada: (item: Omit<Entrada, 'id'>) => void;
    updateEntrada: (id: string, item: Partial<Entrada>) => void;
    removeEntrada: (id: string) => void;

    // CRUD FixoMensal
    addFixo: (item: Omit<FixoItem, 'id' | 'paid'>) => void;
    updateFixo: (id: string, item: Partial<FixoItem>) => void;
    removeFixo: (id: string) => void;
    toggleFixoPaid: (id: string) => void;

    // CRUD Creditos e Parcelamentos
    addCredito: (item: Omit<ParcelamentoItem, 'id'>) => void;
    updateCredito: (id: string, item: Partial<ParcelamentoItem>) => void;
    removeCredito: (id: string) => void;
    toggleCongelado: (id: string) => void;
    toggleCreditoPaid: (id: string) => void;

    // CRUD Dividas
    addDividaAngelica: (item: Omit<DividaItem, 'id'>) => void;
    updateDividaAngelica: (id: string, item: Partial<DividaItem>) => void;
    removeDividaAngelica: (id: string) => void;
    toggleDividaAngelicaPaid: (id: string) => void;

    addDividaIsis: (item: Omit<DividaItem, 'id'>) => void;
    updateDividaIsis: (id: string, item: Partial<DividaItem>) => void;
    removeDividaIsis: (id: string) => void;
    toggleDividaIsisPaid: (id: string) => void;

    // CRUD Problemas
    addProblema: (item: Omit<ProblemaItem, 'id'>) => void;
    updateProblema: (id: string, item: Partial<ProblemaItem>) => void;
    removeProblema: (id: string) => void;
    toggleProblemaPaid: (id: string) => void;

    // Calcular Saldo Final anterior para passar para o próximo mês
    getSaldoFinalMes: (mesAno: string) => number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyMonth = (mesAno: string, saldoInicial: number, nome: string): MesTermometro => {
    const [mesStr, anoStr] = mesAno.split('-');
    const daysInMonth = new Date(parseInt(anoStr), parseInt(mesStr), 0).getDate();
    const dias: DiaTermometro[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        dias.push({ dia: i, entrada: null, saida: null, diario: null });
    }
    return { mesAno, nome, dias, saldoInicial };
};

const getMonthName = (monthIndex: number) => {
    const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return names[monthIndex - 1] || '';
};

const getCurrentMonthStr = () => {
    const d = new Date();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${m}-${d.getFullYear()}`;
};

export const useFamilyFinanceStore = create<FamilyFinanceState>()(
    persist(
        (set, get) => ({
            currentMonth: '03-2026', // Data hardcoded default do mockup mas atualiza no bootstrap

            entradas: [
                { id: 'e1', name: 'Salário Angélica', value: 2000, isFixed: true },
                { id: 'e2', name: 'Salário Isis', value: 1750, isFixed: true },
                { id: 'e3', name: 'Vale Alimentação Angélica', value: 390, isFixed: true },
                { id: 'e4', name: 'Vale Alimentação Isis', value: 538, isFixed: true },
            ],

            fixoMensal: [
                { id: 'f1', name: 'Aluguel', value: 1183.24, paid: false, isFixed: true },
                { id: 'f2', name: 'Alimentação / Mercado', value: 1000, paid: false, isFixed: true },
                { id: 'f3', name: 'Eletricidade', value: 100, paid: false, isFixed: true },
                { id: 'f4', name: 'Terapia Angélica', value: 400, paid: false, isFixed: true },
                { id: 'f5', name: 'Faculdade Isis', value: 305.09, paid: false, isFixed: true },
                { id: 'f6', name: 'Terapia Isis', value: 300, paid: false, isFixed: true },
                { id: 'f7', name: 'Rações', value: 150, paid: false, isFixed: true },
                { id: 'f8', name: 'Internet', value: 100, paid: false, isFixed: true },
                { id: 'f9', name: 'Água', value: 100, paid: false, isFixed: true },
                { id: 'f10', name: 'Dentista Isis', value: 90, paid: false, isFixed: true },
            ],

            creditos: [
                { id: 'c1', name: 'Emp. Nubank', value: 208.12, type: 'parcelamento', congelado: false, progresso: '3/7', isEvelise: false },
                { id: 'c2', name: 'Óculos Isis', value: 160, type: 'parcelamento', congelado: true, progresso: '2/6', isEvelise: true },
                { id: 'c3', name: 'TV', value: 150, type: 'parcelamento', congelado: true, progresso: '0/4', isEvelise: true },
                { id: 'c4', name: 'Disney+', value: 66, type: 'assinatura', congelado: false, progresso: '', isEvelise: false },
                { id: 'c5', name: 'Cooktop', value: 65.07, type: 'parcelamento', congelado: false, progresso: '3/6', isEvelise: true },
                { id: 'c6', name: 'Claro Flex', value: 40, type: 'assinatura', congelado: false, progresso: '', isEvelise: false },
                { id: 'c7', name: 'Cort. Grama', value: 38.32, type: 'parcelamento', congelado: false, progresso: '2/6', isEvelise: false },
                { id: 'c8', name: 'Plano TIM', value: 36.99, type: 'assinatura', congelado: false, progresso: '', isEvelise: false },
                { id: 'c9', name: 'Canva', value: 35, type: 'assinatura', congelado: false, progresso: '', isEvelise: false },
                { id: 'c10', name: 'Max', value: 29.90, type: 'assinatura', congelado: false, progresso: '', isEvelise: false },
                { id: 'c11', name: 'Spotify', value: 27.90, type: 'assinatura', congelado: false, progresso: '', isEvelise: false },
                { id: 'c12', name: 'Netflix', value: 20.90, type: 'assinatura', congelado: false, progresso: '', isEvelise: false },
                { id: 'c13', name: 'Escola Breno', value: 19.90, type: 'parcelamento', congelado: false, progresso: '5/12', isEvelise: false },
            ],

            dividasAngelica: [
                { id: 'da1', name: 'Banrisul', total: 1507, desc: '---' },
                { id: 'da2', name: 'WillBank', total: 1410, desc: '24x R$ 58,70' },
                { id: 'da3', name: 'Alcydes Maia', total: 1400, desc: '2x R$ 700,00' },
                { id: 'da4', name: 'Nubank', total: 662, desc: '12x R$ 53,20' },
                { id: 'da5', name: 'MEI', total: 600, desc: '---' },
                { id: 'da6', name: 'Uninter', total: 350, desc: '---' },
            ],

            dividasIsis: [
                { id: 'di1', name: 'Emp. BB', total: 3817.47, desc: '' },
                { id: 'di2', name: 'Crédito BB', total: 5045.61, desc: '' },
                { id: 'di3', name: 'Emp. BB (2)', total: 296.54, desc: '' },
            ],

            problemas: [
                { id: 'prob1', name: 'Bulla Isis', total: 600, desc: 'R$140 descontado da folha', encerraEm: 'Agosto/2026', status: '1/6' },
                { id: 'prob2', name: 'Crédito Nubank', total: 401, desc: 'Fatura mês', encerraEm: 'Março/2026', status: '' },
                { id: 'prob3', name: 'Crédito Inter', total: 858.83, desc: 'Fatura mês', encerraEm: 'Março/2026', status: '' },
            ],

            termometroFiles: {},

            getSaldoFinalMes: (mesAno: string) => {
                const term = get().termometroFiles[mesAno];
                if (!term) return 0;

                // Calculates the balance progressively
                let saldoAtual = term.saldoInicial;
                for (let i = 0; i < term.dias.length; i++) {
                    const dia = term.dias[i];
                    saldoAtual = saldoAtual + (dia.entrada || 0) - ((dia.saida || 0) + (dia.diario || 0));
                }
                return saldoAtual;
            },

            checkMonthTurnover: () => {
                const currentStr = getCurrentMonthStr();
                const state = get();

                if (state.currentMonth !== currentStr) {
                    // Turn over to new month!
                    const lastMonthStr = state.currentMonth;
                    const saldoHerança = get().getSaldoFinalMes(lastMonthStr);

                    set((s) => ({
                        currentMonth: currentStr,
                        // Clean arrays keeping only fixed
                        entradas: s.entradas.filter(e => e.isFixed),
                        // Keep fixed, and reset paid to false
                        fixoMensal: s.fixoMensal.filter(f => f.isFixed).map(f => ({ ...f, paid: false })),
                        creditos: s.creditos.map(c => ({ ...c, paid: false })),
                        problemas: s.problemas.map(p => ({ ...p, paid: false })),
                        dividasAngelica: s.dividasAngelica.map(d => ({ ...d, paid: false })),
                        dividasIsis: s.dividasIsis.map(d => ({ ...d, paid: false })),

                        // Initialize new thermometro month
                        termometroFiles: {
                            ...s.termometroFiles,
                            [currentStr]: createEmptyMonth(currentStr, saldoHerança, getMonthName(parseInt(currentStr.split('-')[0])))
                        }
                    }));
                } else if (!state.termometroFiles[currentStr]) {
                    // Just bootstrap the current month if missing
                    set((s) => ({
                        termometroFiles: {
                            ...s.termometroFiles,
                            [currentStr]: createEmptyMonth(currentStr, 0, getMonthName(parseInt(currentStr.split('-')[0])))
                        }
                    }));
                }
            },

            updateTermometroDay: (mesAno, dia, field, value) => {
                set((s) => {
                    const monthFile = s.termometroFiles[mesAno];
                    if (!monthFile) return s;

                    const newDias = [...monthFile.dias];
                    const dayObj = { ...newDias[dia - 1] };

                    // @ts-ignore
                    dayObj[field] = value;
                    newDias[dia - 1] = dayObj;

                    return {
                        termometroFiles: {
                            ...s.termometroFiles,
                            [mesAno]: { ...monthFile, dias: newDias }
                        }
                    };
                });
            },

            addEntrada: (item) => set((s) => ({ entradas: [...s.entradas, { ...item, id: generateId() }] })),
            updateEntrada: (id, item) => set((s) => ({ entradas: s.entradas.map(e => e.id === id ? { ...e, ...item } : e) })),
            removeEntrada: (id) => set((s) => ({ entradas: s.entradas.filter(e => e.id !== id) })),

            addFixo: (item) => set((s) => ({ fixoMensal: [...s.fixoMensal, { ...item, paid: false, id: generateId() }] })),
            updateFixo: (id, item) => set((s) => ({ fixoMensal: s.fixoMensal.map(f => f.id === id ? { ...f, ...item } : f) })),
            removeFixo: (id) => set((s) => ({ fixoMensal: s.fixoMensal.filter(f => f.id !== id) })),
            toggleFixoPaid: (id) => set((s) => ({ fixoMensal: s.fixoMensal.map(f => f.id === id ? { ...f, paid: !f.paid } : f) })),

            addCredito: (item) => set((s) => ({ creditos: [...s.creditos, { ...item, paid: false, id: generateId() }] })),
            updateCredito: (id, item) => set((s) => ({ creditos: s.creditos.map(c => c.id === id ? { ...c, ...item } : c) })),
            removeCredito: (id) => set((s) => ({ creditos: s.creditos.filter(c => c.id !== id) })),
            toggleCongelado: (id) => set((s) => ({ creditos: s.creditos.map(c => c.id === id ? { ...c, congelado: !c.congelado } : c) })),
            toggleCreditoPaid: (id) => set((s) => ({ creditos: s.creditos.map(c => c.id === id ? { ...c, paid: !c.paid } : c) })),

            addDividaAngelica: (item) => set((s) => ({ dividasAngelica: [...s.dividasAngelica, { ...item, paid: false, id: generateId() }] })),
            updateDividaAngelica: (id, item) => set((s) => ({ dividasAngelica: s.dividasAngelica.map(d => d.id === id ? { ...d, ...item } : d) })),
            removeDividaAngelica: (id) => set((s) => ({ dividasAngelica: s.dividasAngelica.filter(d => d.id !== id) })),
            toggleDividaAngelicaPaid: (id) => set((s) => ({ dividasAngelica: s.dividasAngelica.map(d => d.id === id ? { ...d, paid: !d.paid } : d) })),

            addDividaIsis: (item) => set((s) => ({ dividasIsis: [...s.dividasIsis, { ...item, paid: false, id: generateId() }] })),
            updateDividaIsis: (id, item) => set((s) => ({ dividasIsis: s.dividasIsis.map(d => d.id === id ? { ...d, ...item } : d) })),
            removeDividaIsis: (id) => set((s) => ({ dividasIsis: s.dividasIsis.filter(d => d.id !== id) })),
            toggleDividaIsisPaid: (id) => set((s) => ({ dividasIsis: s.dividasIsis.map(d => d.id === id ? { ...d, paid: !d.paid } : d) })),

            addProblema: (item) => set((s) => ({ problemas: [...s.problemas, { ...item, paid: false, id: generateId() }] })),
            updateProblema: (id, item) => set((s) => ({ problemas: s.problemas.map(p => p.id === id ? { ...p, ...item } : p) })),
            removeProblema: (id) => set((s) => ({ problemas: s.problemas.filter(p => p.id !== id) })),
            toggleProblemaPaid: (id) => set((s) => ({ problemas: s.problemas.map(p => p.id === id ? { ...p, paid: !p.paid } : p) })),
        }),
        {
            name: 'family-finance-v2', // Change name to abandon old cache state and use the new initial seed
        }
    )
);
