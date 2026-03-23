import { create } from 'zustand';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const APP_VERSION = '0.4.0';

type UpdatePhase = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';

interface UpdateState {
    phase: UpdatePhase;
    remoteVersion: string;
    changelog: string;
    downloadProgress: number;
    totalBytes: number;
    downloadedBytes: number;
    errorMessage: string;
    isDismissed: boolean;

    pendingUpdate: Update | null;

    checkForUpdate: () => Promise<void>;
    downloadAndInstall: () => Promise<void>;
    dismiss: () => void;
    subscribeRealtime: () => () => void;
}

export const useUpdateStore = create<UpdateState>((set, get) => ({
    phase: 'idle',
    remoteVersion: '',
    changelog: '',
    downloadProgress: 0,
    totalBytes: 0,
    downloadedBytes: 0,
    errorMessage: '',
    isDismissed: false,
    pendingUpdate: null,

    checkForUpdate: async () => {
        try {
            set({ phase: 'checking' });

            const update = await check();

            if (update) {
                set({
                    phase: 'available',
                    remoteVersion: update.version,
                    changelog: update.body || '',
                    pendingUpdate: update,
                    isDismissed: false,
                    downloadProgress: 0,
                    downloadedBytes: 0,
                    totalBytes: 0,
                    errorMessage: '',
                });
            } else {
                set({ phase: 'idle', pendingUpdate: null });
            }
        } catch (e: any) {
            console.error('Erro ao verificar atualização:', e);
            set({ phase: 'idle', errorMessage: String(e) });
        }
    },

    downloadAndInstall: async () => {
        const { pendingUpdate } = get();
        if (!pendingUpdate) return;

        try {
            set({ phase: 'downloading', downloadProgress: 0, downloadedBytes: 0 });

            let totalLen = 0;
            let downloaded = 0;

            await pendingUpdate.downloadAndInstall((event) => {
                switch (event.event) {
                    case 'Started':
                        totalLen = event.data.contentLength ?? 0;
                        set({ totalBytes: totalLen });
                        break;
                    case 'Progress': {
                        downloaded += event.data.chunkLength;
                        const pct = totalLen > 0 ? Math.round((downloaded / totalLen) * 100) : 0;
                        set({ downloadedBytes: downloaded, downloadProgress: pct });
                        break;
                    }
                    case 'Finished':
                        set({ phase: 'ready', downloadProgress: 100 });
                        break;
                }
            });

            // Tauri restarts automatically after install on Windows (NSIS passive mode)
            // If we get here, set ready state
            set({ phase: 'ready', downloadProgress: 100 });
        } catch (e: any) {
            console.error('Erro ao baixar/instalar atualização:', e);
            set({ phase: 'error', errorMessage: String(e) });
        }
    },

    dismiss: () => {
        set({ isDismissed: true });
    },

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};

        const channel = supabase
            .channel('app-version-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'app_version' }, () => {
                get().checkForUpdate();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
