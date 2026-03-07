import { create } from 'zustand';
import {
    saveDocument,
    getAllDocuments,
    deleteDocumentFromDB,
    openDocumentFile,
    formatBytes,
    type DocMetadata,
} from '@/lib/docDatabase';
import type { DocCategory } from '@/types';

const DOC_CATEGORIES: { value: DocCategory; label: string; icon: string }[] = [
    { value: 'identidade', label: 'Identidade', icon: '🪪' },
    { value: 'comprovantes', label: 'Comprovantes', icon: '📋' },
    { value: 'contratos', label: 'Contratos', icon: '📝' },
    { value: 'saude', label: 'Saúde', icon: '🏥' },
    { value: 'educacao', label: 'Educação', icon: '🎓' },
    { value: 'outros', label: 'Outros', icon: '📁' },
];

interface DocState {
    documents: DocMetadata[];
    categories: typeof DOC_CATEGORIES;
    isLoading: boolean;
    loadDocuments: () => Promise<void>;
    addDocument: (doc: {
        name: string;
        category: DocCategory;
        owner: string;
        tags: string[];
        file: File | null;
    }) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    openFile: (id: string) => Promise<void>;
    getDocsByCategory: (category: DocCategory) => DocMetadata[];
    searchDocs: (query: string) => DocMetadata[];
}

export const useDocStore = create<DocState>((set, get) => ({
    documents: [],
    categories: DOC_CATEGORIES,
    isLoading: false,

    loadDocuments: async () => {
        set({ isLoading: true });
        try {
            const docs = await getAllDocuments();
            set({ documents: docs });
        } catch (err) {
            console.error('Erro ao carregar documentos:', err);
        }
        set({ isLoading: false });
    },

    addDocument: async ({ name, category, owner, tags, file }) => {
        set({ isLoading: true });
        try {
            let fileData: ArrayBuffer | null = null;
            let fileName = '';
            let fileType = '';
            let fileSize = 'N/A';

            if (file) {
                fileData = await file.arrayBuffer();
                fileName = file.name;
                fileType = file.type || 'application/octet-stream';
                fileSize = formatBytes(file.size);
            }

            const meta: DocMetadata = {
                id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name,
                category,
                owner,
                fileSize,
                fileName,
                fileType,
                uploadedAt: new Date().toISOString().split('T')[0],
                tags,
                hasFile: !!file,
            };

            await saveDocument(meta, fileData);
            set((state) => ({ documents: [meta, ...state.documents] }));
        } catch (err) {
            console.error('Erro ao salvar documento:', err);
            alert('Erro ao salvar o documento. Tente novamente.');
        }
        set({ isLoading: false });
    },

    deleteDocument: async (id) => {
        try {
            await deleteDocumentFromDB(id);
            set((state) => ({
                documents: state.documents.filter((d) => d.id !== id),
            }));
        } catch (err) {
            console.error('Erro ao deletar documento:', err);
        }
    },

    openFile: async (id) => {
        try {
            await openDocumentFile(id);
        } catch (err) {
            console.error('Erro ao abrir arquivo:', err);
            alert('Erro ao abrir o arquivo.');
        }
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
