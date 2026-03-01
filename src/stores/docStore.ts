import { create } from 'zustand';
import type { FamilyDocument, DocCategory } from '@/types';

const DEMO_DOCS: FamilyDocument[] = [
    {
        id: '1',
        name: 'RG - Isis',
        category: 'identidade',
        owner: 'Isis',
        fileSize: '1.2 MB',
        uploadedAt: '2026-01-15',
        tags: ['documento pessoal'],
    },
    {
        id: '2',
        name: 'RG - Angélica',
        category: 'identidade',
        owner: 'Angélica',
        fileSize: '980 KB',
        uploadedAt: '2026-01-15',
        tags: ['documento pessoal'],
    },
    {
        id: '3',
        name: 'CPF - Isis',
        category: 'identidade',
        owner: 'Isis',
        fileSize: '450 KB',
        uploadedAt: '2026-01-15',
        tags: ['documento pessoal'],
    },
    {
        id: '4',
        name: 'Comprovante de Residência - Fev 2026',
        category: 'comprovantes',
        owner: 'Família',
        fileSize: '2.1 MB',
        uploadedAt: '2026-02-10',
        tags: ['endereço', 'conta de luz'],
    },
    {
        id: '5',
        name: 'Contrato de Aluguel 2026',
        category: 'contratos',
        owner: 'Família',
        fileSize: '3.5 MB',
        uploadedAt: '2026-01-05',
        tags: ['moradia', 'aluguel'],
    },
    {
        id: '6',
        name: 'Cartão de Vacinação - Isis',
        category: 'saude',
        owner: 'Isis',
        fileSize: '1.8 MB',
        uploadedAt: '2025-12-20',
        tags: ['vacinação'],
    },
    {
        id: '7',
        name: 'Diploma Ensino Médio - Isis',
        category: 'educacao',
        owner: 'Isis',
        fileSize: '2.3 MB',
        uploadedAt: '2025-11-10',
        tags: ['educação', 'diploma'],
    },
    {
        id: '8',
        name: 'Apólice de Seguro Auto',
        category: 'outros',
        owner: 'Família',
        fileSize: '1.5 MB',
        uploadedAt: '2026-02-01',
        tags: ['seguro', 'carro'],
    },
];

const DOC_CATEGORIES: { value: DocCategory; label: string; icon: string }[] = [
    { value: 'identidade', label: 'Identidade', icon: '🪪' },
    { value: 'comprovantes', label: 'Comprovantes', icon: '📋' },
    { value: 'contratos', label: 'Contratos', icon: '📝' },
    { value: 'saude', label: 'Saúde', icon: '🏥' },
    { value: 'educacao', label: 'Educação', icon: '🎓' },
    { value: 'outros', label: 'Outros', icon: '📁' },
];

interface DocState {
    documents: FamilyDocument[];
    categories: typeof DOC_CATEGORIES;
    addDocument: (doc: Omit<FamilyDocument, 'id' | 'uploadedAt'>) => void;
    deleteDocument: (id: string) => void;
    getDocsByCategory: (category: DocCategory) => FamilyDocument[];
    searchDocs: (query: string) => FamilyDocument[];
}

export const useDocStore = create<DocState>((set, get) => ({
    documents: DEMO_DOCS,
    categories: DOC_CATEGORIES,

    addDocument: (docData) => {
        const doc: FamilyDocument = {
            ...docData,
            id: Date.now().toString(),
            uploadedAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ documents: [...state.documents, doc] }));
    },

    deleteDocument: (id) => {
        set((state) => ({
            documents: state.documents.filter((d) => d.id !== id),
        }));
    },

    getDocsByCategory: (category) => {
        return get().documents.filter((d) => d.category === category);
    },

    searchDocs: (query) => {
        const q = query.toLowerCase();
        return get().documents.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                d.owner.toLowerCase().includes(q) ||
                d.tags?.some((t) => t.toLowerCase().includes(q))
        );
    },
}));
