import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Entrada {
    id: string;
    name: string;
    value: number;
    isFixed: boolean;
}

export interface FixoItem {
    id: string;
    name: string;
    value: number;
    isFixed: boolean;
    paid: boolean;
}

export interface ParcelamentoItem {
    id: string;
    name: string;
    value: number;
    type: 'debito' | 'credito' | 'parcelamento' | 'assinatura';
    congelado: boolean;
    progresso: string;
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
    mesAno: string;
    nome: string;
    dias: DiaTermometro[];
    saldoInicial: number;
}

export interface FamilyFinanceState {
    currentMonth: string;
    entradas: Entrada[];
    fixoMensal: FixoItem[];
    creditos: ParcelamentoItem[];
    dividasUser1: DividaItem[];
    dividasUser2: DividaItem[];
    problemas: ProblemaItem[];
    termometroFiles: Record<string, MesTermometro>;
    isLoading: boolean;

    fetchAll: () => Promise<void>;
    checkMonthTurnover: () => void;
    updateTermometroDay: (mesAno: string, dia: number, field: keyof DiaTermometro, value: number | null) => Promise<void>;

    addEntrada: (item: Omit<Entrada, 'id'>) => Promise<void>;
    updateEntrada: (id: string, item: Partial<Entrada>) => Promise<void>;
    removeEntrada: (id: string) => Promise<void>;

    addFixo: (item: Omit<FixoItem, 'id' | 'paid'>) => Promise<void>;
    updateFixo: (id: string, item: Partial<FixoItem>) => Promise<void>;
    removeFixo: (id: string) => Promise<void>;
    toggleFixoPaid: (id: string) => Promise<void>;

    addCredito: (item: Omit<ParcelamentoItem, 'id'>) => Promise<void>;
    updateCredito: (id: string, item: Partial<ParcelamentoItem>) => Promise<void>;
    removeCredito: (id: string) => Promise<void>;
    toggleCongelado: (id: string) => Promise<void>;
    toggleCreditoPaid: (id: string) => Promise<void>;

    addDividaUser1: (item: Omit<DividaItem, 'id'>) => Promise<void>;
    updateDividaUser1: (id: string, item: Partial<DividaItem>) => Promise<void>;
    removeDividaUser1: (id: string) => Promise<void>;
    toggleDividaUser1Paid: (id: string) => Promise<void>;

    addDividaUser2: (item: Omit<DividaItem, 'id'>) => Promise<void>;
    updateDividaUser2: (id: string, item: Partial<DividaItem>) => Promise<void>;
    removeDividaUser2: (id: string) => Promise<void>;
    toggleDividaUser2Paid: (id: string) => Promise<void>;

    addProblema: (item: Omit<ProblemaItem, 'id'>) => Promise<void>;
    updateProblema: (id: string, item: Partial<ProblemaItem>) => Promise<void>;
    removeProblema: (id: string) => Promise<void>;
    toggleProblemaPaid: (id: string) => Promise<void>;

    getSaldoFinalMes: (mesAno: string) => number;
    subscribeRealtime: () => () => void;
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

// Default initial data (used as seed when Supabase is empty)
const defaultEntradas: Entrada[] = [];

const defaultFixos: FixoItem[] = [];

const defaultCreditos: ParcelamentoItem[] = [];

const defaultDividasUser1: DividaItem[] = [];

const defaultDividasUser2: DividaItem[] = [];

const defaultProblemas: ProblemaItem[] = [];

// ───────────────────────────────────────────
// Helper: Supabase CRUD wrappers for dividas (shared between user1/user2)
// ───────────────────────────────────────────
const upsertDivida = async (id: string, data: Omit<DividaItem, 'id'>, owner: string) => {
    await supabase.from('family_finance_dividas').upsert({
        id,
        name: data.name,
        total: data.total,
        descricao: data.desc,
        owner,
        paid: data.paid || false,
    });
};

export const useFamilyFinanceStore = create<FamilyFinanceState>((set, get) => ({
    currentMonth: getCurrentMonthStr(),
    entradas: defaultEntradas,
    fixoMensal: defaultFixos,
    creditos: defaultCreditos,
    dividasUser1: defaultDividasUser1,
    dividasUser2: defaultDividasUser2,
    problemas: defaultProblemas,
    termometroFiles: {},
    isLoading: false,

    fetchAll: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const [stateRes, entRes, fixRes, credRes, divRes, probRes, termRes] = await Promise.all([
            supabase.from('family_finance_state').select('*').eq('id', 'singleton').maybeSingle(),
            supabase.from('family_finance_entradas').select('*'),
            supabase.from('family_finance_fixos').select('*'),
            supabase.from('family_finance_creditos').select('*'),
            supabase.from('family_finance_dividas').select('*'),
            supabase.from('family_finance_problemas').select('*'),
            supabase.from('family_finance_termometro').select('*'),
        ]);

        const updates: Partial<FamilyFinanceState> = {};

        if (stateRes.data) {
            updates.currentMonth = stateRes.data.current_month;
        }

        if (!entRes.error && entRes.data && entRes.data.length > 0) {
            updates.entradas = entRes.data.map((e: any) => ({
                id: e.id, name: e.name, value: parseFloat(e.value), isFixed: e.is_fixed,
            }));
        }

        if (!fixRes.error && fixRes.data && fixRes.data.length > 0) {
            updates.fixoMensal = fixRes.data.map((f: any) => ({
                id: f.id, name: f.name, value: parseFloat(f.value), isFixed: f.is_fixed, paid: f.paid,
            }));
        }

        if (!credRes.error && credRes.data && credRes.data.length > 0) {
            updates.creditos = credRes.data.map((c: any) => ({
                id: c.id, name: c.name, value: parseFloat(c.value), type: c.type,
                congelado: c.congelado, progresso: c.progresso || '', isEvelise: c.is_evelise,
                paid: c.paid, startMonth: c.start_month,
            }));
        }

        if (!divRes.error && divRes.data && divRes.data.length > 0) {
            updates.dividasUser1 = divRes.data
                .filter((d: any) => d.owner === 'user1')
                .map((d: any) => ({ id: d.id, name: d.name, total: parseFloat(d.total), desc: d.descricao || '', paid: d.paid }));
            updates.dividasUser2 = divRes.data
                .filter((d: any) => d.owner === 'user2')
                .map((d: any) => ({ id: d.id, name: d.name, total: parseFloat(d.total), desc: d.descricao || '', paid: d.paid }));
        }

        if (!probRes.error && probRes.data && probRes.data.length > 0) {
            updates.problemas = probRes.data.map((p: any) => ({
                id: p.id, name: p.name, total: parseFloat(p.total), desc: p.descricao || '',
                encerraEm: p.encerra_em || '', status: p.status || '', paid: p.paid,
            }));
        }

        if (!termRes.error && termRes.data && termRes.data.length > 0) {
            const termometroFiles: Record<string, MesTermometro> = {};
            termRes.data.forEach((t: any) => {
                termometroFiles[t.mes_ano] = {
                    mesAno: t.mes_ano,
                    nome: t.nome,
                    dias: t.dias || [],
                    saldoInicial: parseFloat(t.saldo_inicial),
                };
            });
            updates.termometroFiles = termometroFiles;
        }

        set({ ...updates, isLoading: false });
    },

    getSaldoFinalMes: (mesAno: string) => {
        const term = get().termometroFiles[mesAno];
        if (!term) return 0;
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
            const lastMonthStr = state.currentMonth;
            const saldoHeranca = get().getSaldoFinalMes(lastMonthStr);

            set((s) => ({
                currentMonth: currentStr,
                entradas: s.entradas.filter(e => e.isFixed),
                fixoMensal: s.fixoMensal.filter(f => f.isFixed).map(f => ({ ...f, paid: false })),
                creditos: s.creditos.map(c => ({ ...c, paid: false })),
                problemas: s.problemas.map(p => ({ ...p, paid: false })),
                dividasUser1: s.dividasUser1.map(d => ({ ...d, paid: false })),
                dividasUser2: s.dividasUser2.map(d => ({ ...d, paid: false })),
                termometroFiles: {
                    ...s.termometroFiles,
                    [currentStr]: createEmptyMonth(currentStr, saldoHeranca, getMonthName(parseInt(currentStr.split('-')[0])))
                }
            }));

            if (isSupabaseConfigured()) {
                supabase.from('family_finance_state').upsert({ id: 'singleton', current_month: currentStr });
            }
        } else if (!state.termometroFiles[currentStr]) {
            const newMonth = createEmptyMonth(currentStr, 0, getMonthName(parseInt(currentStr.split('-')[0])));
            set((s) => ({
                termometroFiles: {
                    ...s.termometroFiles,
                    [currentStr]: newMonth,
                }
            }));

            if (isSupabaseConfigured()) {
                supabase.from('family_finance_termometro').upsert({
                    id: `term-${currentStr}`,
                    mes_ano: currentStr,
                    nome: newMonth.nome,
                    saldo_inicial: 0,
                    dias: newMonth.dias,
                });
            }
        }
    },

    updateTermometroDay: async (mesAno, dia, field, value) => {
        set((s) => {
            const monthFile = s.termometroFiles[mesAno];
            if (!monthFile) return s;
            const newDias = [...monthFile.dias];
            const dayObj = { ...newDias[dia - 1] };
            // @ts-ignore
            dayObj[field] = value;
            newDias[dia - 1] = dayObj;
            return {
                termometroFiles: { ...s.termometroFiles, [mesAno]: { ...monthFile, dias: newDias } }
            };
        });

        if (isSupabaseConfigured()) {
            const month = get().termometroFiles[mesAno];
            if (month) {
                await supabase.from('family_finance_termometro').upsert({
                    id: `term-${mesAno}`,
                    mes_ano: mesAno,
                    nome: month.nome,
                    saldo_inicial: month.saldoInicial,
                    dias: month.dias,
                });
            }
        }
    },

    // ── ENTRADAS ──
    addEntrada: async (item) => {
        const id = generateId();
        set((s) => ({ entradas: [...s.entradas, { ...item, id }] }));
        if (isSupabaseConfigured()) {
            await supabase.from('family_finance_entradas').insert({ id, name: item.name, value: item.value, is_fixed: item.isFixed });
        }
    },
    updateEntrada: async (id, item) => {
        set((s) => ({ entradas: s.entradas.map(e => e.id === id ? { ...e, ...item } : e) }));
        if (isSupabaseConfigured()) {
            const db: any = {};
            if (item.name !== undefined) db.name = item.name;
            if (item.value !== undefined) db.value = item.value;
            if (item.isFixed !== undefined) db.is_fixed = item.isFixed;
            if (Object.keys(db).length > 0) await supabase.from('family_finance_entradas').update(db).eq('id', id);
        }
    },
    removeEntrada: async (id) => {
        set((s) => ({ entradas: s.entradas.filter(e => e.id !== id) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_entradas').delete().eq('id', id);
    },

    // ── FIXO MENSAL ──
    addFixo: async (item) => {
        const id = generateId();
        set((s) => ({ fixoMensal: [...s.fixoMensal, { ...item, paid: false, id }] }));
        if (isSupabaseConfigured()) {
            await supabase.from('family_finance_fixos').insert({ id, name: item.name, value: item.value, is_fixed: item.isFixed, paid: false });
        }
    },
    updateFixo: async (id, item) => {
        set((s) => ({ fixoMensal: s.fixoMensal.map(f => f.id === id ? { ...f, ...item } : f) }));
        if (isSupabaseConfigured()) {
            const db: any = {};
            if (item.name !== undefined) db.name = item.name;
            if (item.value !== undefined) db.value = item.value;
            if (item.isFixed !== undefined) db.is_fixed = item.isFixed;
            if (item.paid !== undefined) db.paid = item.paid;
            if (Object.keys(db).length > 0) await supabase.from('family_finance_fixos').update(db).eq('id', id);
        }
    },
    removeFixo: async (id) => {
        set((s) => ({ fixoMensal: s.fixoMensal.filter(f => f.id !== id) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_fixos').delete().eq('id', id);
    },
    toggleFixoPaid: async (id) => {
        const item = get().fixoMensal.find(f => f.id === id);
        if (!item) return;
        const newPaid = !item.paid;
        set((s) => ({ fixoMensal: s.fixoMensal.map(f => f.id === id ? { ...f, paid: newPaid } : f) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_fixos').update({ paid: newPaid }).eq('id', id);
    },

    // ── CRÉDITOS / PARCELAMENTOS ──
    addCredito: async (item) => {
        const id = generateId();
        set((s) => ({ creditos: [...s.creditos, { ...item, paid: false, id }] }));
        if (isSupabaseConfigured()) {
            await supabase.from('family_finance_creditos').insert({
                id, name: item.name, value: item.value, type: item.type,
                congelado: item.congelado, progresso: item.progresso, is_evelise: item.isEvelise,
                paid: false, start_month: item.startMonth || null,
            });
        }
    },
    updateCredito: async (id, item) => {
        set((s) => ({ creditos: s.creditos.map(c => c.id === id ? { ...c, ...item } : c) }));
        if (isSupabaseConfigured()) {
            const db: any = {};
            if (item.name !== undefined) db.name = item.name;
            if (item.value !== undefined) db.value = item.value;
            if (item.type !== undefined) db.type = item.type;
            if (item.congelado !== undefined) db.congelado = item.congelado;
            if (item.progresso !== undefined) db.progresso = item.progresso;
            if (item.isEvelise !== undefined) db.is_evelise = item.isEvelise;
            if (item.paid !== undefined) db.paid = item.paid;
            if (item.startMonth !== undefined) db.start_month = item.startMonth;
            if (Object.keys(db).length > 0) await supabase.from('family_finance_creditos').update(db).eq('id', id);
        }
    },
    removeCredito: async (id) => {
        set((s) => ({ creditos: s.creditos.filter(c => c.id !== id) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_creditos').delete().eq('id', id);
    },
    toggleCongelado: async (id) => {
        const item = get().creditos.find(c => c.id === id);
        if (!item) return;
        const newVal = !item.congelado;
        set((s) => ({ creditos: s.creditos.map(c => c.id === id ? { ...c, congelado: newVal } : c) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_creditos').update({ congelado: newVal }).eq('id', id);
    },
    toggleCreditoPaid: async (id) => {
        const item = get().creditos.find(c => c.id === id);
        if (!item) return;
        const newPaid = !item.paid;
        set((s) => ({ creditos: s.creditos.map(c => c.id === id ? { ...c, paid: newPaid } : c) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_creditos').update({ paid: newPaid }).eq('id', id);
    },

    // ── DIVIDAS ANGELICA ──
    addDividaUser1: async (item) => {
        const id = generateId();
        set((s) => ({ dividasUser1: [...s.dividasUser1, { ...item, paid: false, id }] }));
        if (isSupabaseConfigured()) await upsertDivida(id, { ...item, paid: false }, 'user1');
    },
    updateDividaUser1: async (id, item) => {
        set((s) => ({ dividasUser1: s.dividasUser1.map(d => d.id === id ? { ...d, ...item } : d) }));
        if (isSupabaseConfigured()) {
            const db: any = {};
            if (item.name !== undefined) db.name = item.name;
            if (item.total !== undefined) db.total = item.total;
            if (item.desc !== undefined) db.descricao = item.desc;
            if (item.paid !== undefined) db.paid = item.paid;
            if (Object.keys(db).length > 0) await supabase.from('family_finance_dividas').update(db).eq('id', id);
        }
    },
    removeDividaUser1: async (id) => {
        set((s) => ({ dividasUser1: s.dividasUser1.filter(d => d.id !== id) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_dividas').delete().eq('id', id);
    },
    toggleDividaUser1Paid: async (id) => {
        const item = get().dividasUser1.find(d => d.id === id);
        if (!item) return;
        const newPaid = !item.paid;
        set((s) => ({ dividasUser1: s.dividasUser1.map(d => d.id === id ? { ...d, paid: newPaid } : d) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_dividas').update({ paid: newPaid }).eq('id', id);
    },

    // ── DIVIDAS ISIS ──
    addDividaUser2: async (item) => {
        const id = generateId();
        set((s) => ({ dividasUser2: [...s.dividasUser2, { ...item, paid: false, id }] }));
        if (isSupabaseConfigured()) await upsertDivida(id, { ...item, paid: false }, 'user2');
    },
    updateDividaUser2: async (id, item) => {
        set((s) => ({ dividasUser2: s.dividasUser2.map(d => d.id === id ? { ...d, ...item } : d) }));
        if (isSupabaseConfigured()) {
            const db: any = {};
            if (item.name !== undefined) db.name = item.name;
            if (item.total !== undefined) db.total = item.total;
            if (item.desc !== undefined) db.descricao = item.desc;
            if (item.paid !== undefined) db.paid = item.paid;
            if (Object.keys(db).length > 0) await supabase.from('family_finance_dividas').update(db).eq('id', id);
        }
    },
    removeDividaUser2: async (id) => {
        set((s) => ({ dividasUser2: s.dividasUser2.filter(d => d.id !== id) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_dividas').delete().eq('id', id);
    },
    toggleDividaUser2Paid: async (id) => {
        const item = get().dividasUser2.find(d => d.id === id);
        if (!item) return;
        const newPaid = !item.paid;
        set((s) => ({ dividasUser2: s.dividasUser2.map(d => d.id === id ? { ...d, paid: newPaid } : d) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_dividas').update({ paid: newPaid }).eq('id', id);
    },

    // ── PROBLEMAS ──
    addProblema: async (item) => {
        const id = generateId();
        set((s) => ({ problemas: [...s.problemas, { ...item, paid: false, id }] }));
        if (isSupabaseConfigured()) {
            await supabase.from('family_finance_problemas').insert({
                id, name: item.name, total: item.total, descricao: item.desc,
                encerra_em: item.encerraEm, status: item.status, paid: false,
            });
        }
    },
    updateProblema: async (id, item) => {
        set((s) => ({ problemas: s.problemas.map(p => p.id === id ? { ...p, ...item } : p) }));
        if (isSupabaseConfigured()) {
            const db: any = {};
            if (item.name !== undefined) db.name = item.name;
            if (item.total !== undefined) db.total = item.total;
            if (item.desc !== undefined) db.descricao = item.desc;
            if (item.encerraEm !== undefined) db.encerra_em = item.encerraEm;
            if (item.status !== undefined) db.status = item.status;
            if (item.paid !== undefined) db.paid = item.paid;
            if (Object.keys(db).length > 0) await supabase.from('family_finance_problemas').update(db).eq('id', id);
        }
    },
    removeProblema: async (id) => {
        set((s) => ({ problemas: s.problemas.filter(p => p.id !== id) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_problemas').delete().eq('id', id);
    },
    toggleProblemaPaid: async (id) => {
        const item = get().problemas.find(p => p.id === id);
        if (!item) return;
        const newPaid = !item.paid;
        set((s) => ({ problemas: s.problemas.map(p => p.id === id ? { ...p, paid: newPaid } : p) }));
        if (isSupabaseConfigured()) await supabase.from('family_finance_problemas').update({ paid: newPaid }).eq('id', id);
    },

    // ── REALTIME ──
    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};

        const tables = [
            'family_finance_state', 'family_finance_entradas', 'family_finance_fixos',
            'family_finance_creditos', 'family_finance_dividas', 'family_finance_problemas',
            'family_finance_termometro',
        ];

        const channels = tables.map((table) =>
            supabase
                .channel(`ff-${table}-changes`)
                .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
                    get().fetchAll();
                })
                .subscribe()
        );

        return () => {
            channels.forEach((ch) => supabase.removeChannel(ch));
        };
    },
}));
