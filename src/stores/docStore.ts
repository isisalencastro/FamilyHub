import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { FamilyDocument, DocCategory } from '@/types';

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
    isLoading: boolean;
    fetchDocuments: () => Promise<void>;
    addDocument: (doc: Omit<FamilyDocument, 'id' | 'uploadedAt'>) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    getDocsByCategory: (category: DocCategory) => FamilyDocument[];
    searchDocs: (query: string) => FamilyDocument[];
    subscribeRealtime: () => () => void;
}

export const useDocStore = create<DocState>((set, get) => ({
    documents: [],
    categories: DOC_CATEGORIES,
    isLoading: false,

    fetchDocuments: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('uploaded_at', { ascending: false });

        if (!error && data) {
            set({
                documents: data.map((d) => ({
                    id: d.id,
                    name: d.name,
                    category: d.category as DocCategory,
                    owner: d.owner,
                    fileSize: d.file_size,
                    filePath: d.file_path,
                    uploadedAt: d.uploaded_at,
                    tags: d.tags || [],
                })),
            });
        }
        set({ isLoading: false });
    },

    addDocument: async (docData) => {
        if (!isSupabaseConfigured()) {
            const doc: FamilyDocument = {
                ...docData,
                id: Date.now().toString(),
                uploadedAt: new Date().toISOString().split('T')[0],
            };
            set((state) => ({ documents: [doc, ...state.documents] }));
            return;
        }

        const { data, error } = await supabase
            .from('documents')
            .insert({
                name: docData.name,
                category: docData.category,
                owner: docData.owner,
                file_size: docData.fileSize || null,
                file_path: docData.filePath || null,
                tags: docData.tags || [],
            })
            .select()
            .single();

        if (!error && data) {
            const doc: FamilyDocument = {
                id: data.id,
                name: data.name,
                category: data.category,
                owner: data.owner,
                fileSize: data.file_size,
                filePath: data.file_path,
                uploadedAt: data.uploaded_at,
                tags: data.tags || [],
            };
            set((state) => ({ documents: [doc, ...state.documents] }));
        }
    },

    deleteDocument: async (id) => {
        set((state) => ({
            documents: state.documents.filter((d) => d.id !== id),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('documents').delete().eq('id', id);
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

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => { };

        const channel = supabase
            .channel('documents-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'documents' },
                () => {
                    get().fetchDocuments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
