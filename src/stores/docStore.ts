import { create } from 'zustand';
import {
    saveDocument,
    getAllDocuments,
    deleteDocumentFromDB,
    openDocumentFile,
    formatBytes,
    getFileData,
    type DocMetadata,
} from '@/lib/docDatabase';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
    fetchDocuments: () => Promise<void>;
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
    downloadFile: (id: string) => Promise<void>;
    subscribeRealtime: () => () => void;
}

export const useDocStore = create<DocState>((set, get) => ({
    documents: [],
    categories: DOC_CATEGORIES,
    isLoading: false,

    loadDocuments: async () => {
        set({ isLoading: true });
        try {
            if (isSupabaseConfigured()) {
                await get().fetchDocuments();
            } else {
                const docs = await getAllDocuments();
                set({ documents: docs });
            }
        } catch (err) {
            console.error('Erro ao carregar documentos:', err);
            const docs = await getAllDocuments();
            set({ documents: docs });
        }
        set({ isLoading: false });
    },

    fetchDocuments: async () => {
        if (!isSupabaseConfigured()) return;

        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar documentos do Supabase:', error);
            return;
        }

        if (data && data.length > 0) {
            const docs: DocMetadata[] = data.map((d: any) => ({
                id: d.id,
                name: d.name,
                category: d.category,
                owner: d.owner,
                fileSize: d.file_size || 'N/A',
                fileName: d.file_name || '',
                fileType: d.file_type || '',
                uploadedAt: d.uploaded_at || '',
                tags: d.tags || [],
                hasFile: d.has_file || false,
            }));
            set({ documents: docs });

            for (const doc of docs) {
                try {
                    await saveDocument(doc, null);
                } catch { /* cache local best-effort */ }
            }
        }
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

            if (isSupabaseConfigured()) {
                let storagePath: string | null = null;

                if (file && fileData) {
                    const path = `${meta.id}/${fileName}`;
                    const { error: uploadErr } = await supabase.storage
                        .from('documents')
                        .upload(path, new Blob([fileData], { type: fileType }), {
                            contentType: fileType,
                            upsert: true,
                        });
                    if (uploadErr) {
                        console.error('Erro ao enviar arquivo ao Storage:', uploadErr);
                    } else {
                        storagePath = path;
                    }
                }

                const { error: insertErr } = await supabase.from('documents').insert({
                    id: meta.id,
                    name: meta.name,
                    category: meta.category,
                    owner: meta.owner,
                    file_size: meta.fileSize,
                    file_name: meta.fileName,
                    file_type: meta.fileType,
                    uploaded_at: meta.uploadedAt,
                    tags: meta.tags,
                    has_file: meta.hasFile,
                    storage_path: storagePath,
                });

                if (insertErr) {
                    console.error('Erro ao inserir documento no Supabase:', insertErr);
                }
            }

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

            if (isSupabaseConfigured()) {
                const { data: docRow } = await supabase
                    .from('documents')
                    .select('storage_path')
                    .eq('id', id)
                    .maybeSingle();

                if (docRow?.storage_path) {
                    await supabase.storage
                        .from('documents')
                        .remove([docRow.storage_path]);
                }

                await supabase.from('documents').delete().eq('id', id);
            }

            set((state) => ({
                documents: state.documents.filter((d) => d.id !== id),
            }));
        } catch (err) {
            console.error('Erro ao deletar documento:', err);
        }
    },

    openFile: async (id) => {
        try {
            const localFile = await getFileData(id);
            if (localFile) {
                await openDocumentFile(id);
                return;
            }

            if (isSupabaseConfigured()) {
                const { data: docRow } = await supabase
                    .from('documents')
                    .select('storage_path, file_type, file_name')
                    .eq('id', id)
                    .maybeSingle();

                if (docRow?.storage_path) {
                    const { data: fileBlob } = await supabase.storage
                        .from('documents')
                        .download(docRow.storage_path);

                    if (fileBlob) {
                        const url = URL.createObjectURL(fileBlob);
                        window.open(url, '_blank');
                        setTimeout(() => URL.revokeObjectURL(url), 60000);
                        return;
                    }
                }
            }

            alert('Arquivo não encontrado.');
        } catch (err) {
            console.error('Erro ao abrir arquivo:', err);
            alert('Erro ao abrir o arquivo.');
        }
    },

    downloadFile: async (id) => {
        try {
            const localFile = await getFileData(id);
            if (localFile) {
                const { downloadDocumentFile } = await import('@/lib/docDatabase');
                await downloadDocumentFile(id);
                return;
            }

            if (isSupabaseConfigured()) {
                const { data: docRow } = await supabase
                    .from('documents')
                    .select('storage_path, file_type, file_name')
                    .eq('id', id)
                    .maybeSingle();

                if (docRow?.storage_path) {
                    const { data: fileBlob } = await supabase.storage
                        .from('documents')
                        .download(docRow.storage_path);

                    if (fileBlob) {
                        const url = URL.createObjectURL(fileBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = docRow.file_name || 'download';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        return;
                    }
                }
            }

            alert('Arquivo não encontrado.');
        } catch (err) {
            console.error('Erro ao baixar arquivo:', err);
            alert('Erro ao baixar o arquivo.');
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
        if (!isSupabaseConfigured()) return () => {};

        const channel = supabase
            .channel('documents-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
                get().fetchDocuments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
