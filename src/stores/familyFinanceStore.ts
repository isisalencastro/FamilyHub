import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RendaItem { id: string; name: string; value: number; }
export interface FixoItem { id: string; name: string; value: number; paid: boolean; }
export interface ParcelamentoItem { id: string; name: string; value: number; type: string; }
export interface DividaItem { id: string; name: string; total: number; desc: string; }
export interface LembreteItem { id: string; name: string; total: number; desc: string; }

export interface FamilyFinanceState {
    renda: { salarios: RendaItem[]; vales: RendaItem[] };
    fixoMensal: FixoItem[];
    parcelamentos: ParcelamentoItem[];
    dividasAngelica: DividaItem[];
    dividasIsis: DividaItem[];
    problemas: LembreteItem[];

    // Actions
    addRenda: (type: 'salarios' | 'vales', item: Omit<RendaItem, 'id'>) => void;
    removeRenda: (type: 'salarios' | 'vales', id: string) => void;

    addFixo: (item: Omit<FixoItem, 'id' | 'paid'>) => void;
    removeFixo: (id: string) => void;
    toggleFixoPaid: (id: string) => void;

    addParcelamento: (item: Omit<ParcelamentoItem, 'id'>) => void;
    removeParcelamento: (id: string) => void;

    addDividaAngelica: (item: Omit<DividaItem, 'id'>) => void;
    removeDividaAngelica: (id: string) => void;

    addDividaIsis: (item: Omit<DividaItem, 'id'>) => void;
    removeDividaIsis: (id: string) => void;

    addProblema: (item: Omit<LembreteItem, 'id'>) => void;
    removeProblema: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useFamilyFinanceStore = create<FamilyFinanceState>()(
    persist(
        (set) => ({
            renda: {
                salarios: [
                    { id: '1', name: 'Angélica', value: 2000 },
                    { id: '2', name: 'Isis', value: 1750 }
                ],
                vales: [
                    { id: '3', name: 'Isis', value: 538 },
                    { id: '4', name: 'Angélica', value: 390 }
                ]
            },
            fixoMensal: [
                { id: 'f1', name: 'Alimentação', value: 1000, paid: false },
                { id: 'f2', name: 'Aluguel', value: 650, paid: false },
                { id: 'f3', name: 'Crédito + Parcelamentos', value: 568.20, paid: false },
                { id: 'f4', name: 'Terapia Angélica', value: 400, paid: false },
                { id: 'f5', name: 'Faculdade Isis', value: 305.09, paid: false },
                { id: 'f6', name: 'Terapia Isis', value: 300, paid: false },
                { id: 'f7', name: 'Luz', value: 300, paid: false },
                { id: 'f8', name: 'Rações', value: 150, paid: false },
                { id: 'f9', name: 'Água', value: 100, paid: false },
                { id: 'f10', name: 'Internet', value: 100, paid: false },
                { id: 'f11', name: 'Dentista Isis', value: 90, paid: false },
            ],
            parcelamentos: [
                { id: 'p1', name: 'Emp. Nubank', value: 208.12, type: 'Parcelamento 3/7' },
                { id: 'p2', name: 'Óculos Isis', value: 160, type: 'Parcelamento EVELISE 2/6' },
                { id: 'p3', name: 'TV', value: 150, type: 'Parcelamento EVELISE 0/4' },
                { id: 'p4', name: 'Disney+', value: 66, type: 'Assinatura' },
                { id: 'p5', name: 'Cooktop', value: 65.07, type: 'Parcelamento EVELISE 3/6' },
                { id: 'p6', name: 'Claro Flex', value: 40, type: 'Assinatura' },
                { id: 'p7', name: 'Cort. Grama', value: 38.32, type: 'Parcelamento 2/6' },
                { id: 'p8', name: 'Plano TIM', value: 36.99, type: 'Assinatura' },
                { id: 'p9', name: 'Canva', value: 35, type: 'Assinatura' },
                { id: 'p10', name: 'Max', value: 29.90, type: 'Assinatura' },
                { id: 'p11', name: 'Spotify', value: 27.90, type: 'Assinatura' },
                { id: 'p12', name: 'Netflix', value: 20.90, type: 'Assinatura' },
                { id: 'p13', name: 'Escola Breno', value: 19.90, type: 'Parcelamento 5/12' },
            ],
            dividasAngelica: [
                { id: 'da1', name: 'Banrisul', total: 1507, desc: '---' },
                { id: 'da2', name: 'WillBank', total: 1410, desc: '24x 58,70' },
                { id: 'da3', name: 'Alcydes Maia', total: 1400, desc: '2x 700,00' },
                { id: 'da4', name: 'Nubank', total: 662, desc: '12x 53,20' },
                { id: 'da5', name: 'Mei', total: 600, desc: '---' },
                { id: 'da6', name: 'Uninter', total: 350, desc: '---' },
            ],
            dividasIsis: [
                { id: 'di1', name: 'Emp. BB', total: 3817.47, desc: '' },
                { id: 'di2', name: 'Crédito BB', total: 5045.61, desc: '' },
                { id: 'di3', name: 'Emp. BB 2', total: 296.54, desc: '' },
            ],
            problemas: [
                { id: 'prob1', name: 'Bulla Isis', total: 600, desc: 'Descontado 140/mês até AGO/2026' },
                { id: 'prob2', name: 'Mentore Bank Isis', total: 1046, desc: 'Descontado mês 03 MAR/2026' },
                { id: 'prob3', name: 'Mentore Bank Angélica', total: 240, desc: 'Descontado mês 03 MAR/2026' },
                { id: 'prob4', name: 'Crédito Nubank', total: 401, desc: 'Fatura mês 03 MAR/2026' },
                { id: 'prob5', name: 'Crédito Inter', total: 858.83, desc: 'Fatura mês 03 MAR/2026' },
            ],

            addRenda: (type, item) => set((state) => ({
                renda: { ...state.renda, [type]: [...state.renda[type], { ...item, id: generateId() }] }
            })),
            removeRenda: (type, id) => set((state) => ({
                renda: { ...state.renda, [type]: state.renda[type].filter(i => i.id !== id) }
            })),

            addFixo: (item) => set((state) => ({
                fixoMensal: [...state.fixoMensal, { ...item, paid: false, id: generateId() }]
            })),
            removeFixo: (id) => set((state) => ({
                fixoMensal: state.fixoMensal.filter(i => i.id !== id)
            })),
            toggleFixoPaid: (id) => set((state) => ({
                fixoMensal: state.fixoMensal.map(i => i.id === id ? { ...i, paid: !i.paid } : i)
            })),

            addParcelamento: (item) => set((state) => ({
                parcelamentos: [...state.parcelamentos, { ...item, id: generateId() }]
            })),
            removeParcelamento: (id) => set((state) => ({
                parcelamentos: state.parcelamentos.filter(i => i.id !== id)
            })),

            addDividaAngelica: (item) => set((state) => ({
                dividasAngelica: [...state.dividasAngelica, { ...item, id: generateId() }]
            })),
            removeDividaAngelica: (id) => set((state) => ({
                dividasAngelica: state.dividasAngelica.filter(i => i.id !== id)
            })),

            addDividaIsis: (item) => set((state) => ({
                dividasIsis: [...state.dividasIsis, { ...item, id: generateId() }]
            })),
            removeDividaIsis: (id) => set((state) => ({
                dividasIsis: state.dividasIsis.filter(i => i.id !== id)
            })),

            addProblema: (item) => set((state) => ({
                problemas: [...state.problemas, { ...item, id: generateId() }]
            })),
            removeProblema: (id) => set((state) => ({
                problemas: state.problemas.filter(i => i.id !== id)
            })),
        }),
        {
            name: 'family-finance-storage',
        }
    )
);
