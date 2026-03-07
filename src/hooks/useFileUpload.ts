// ============================================
// useFileUpload — Dual Mode (Browser + Tauri)
// ============================================
// Detects environment automatically:
// - Tauri: uses plugin-dialog + plugin-fs for native file access
// - Browser: uses <input type="file"> for file selection
// ============================================

import { useState, useRef, useCallback, createElement } from 'react';

export interface SelectedFile {
    path: string;
    name: string;
    size: string;
    /** Raw file object — only available in browser mode */
    browserFile?: File;
}

interface FileFilter {
    name: string;
    extensions: string[];
}

interface UseFileUploadReturn {
    selectedFile: SelectedFile | null;
    isUploading: boolean;
    selectFile: (filters?: FileFilter[]) => Promise<void>;
    clearFile: () => void;
    copyFileToAppData: (fileName: string) => Promise<string | undefined>;
    openFile: (filePath: string) => Promise<void>;
    /** Hidden input ref — only needed in browser mode */
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    /** Renders the hidden file input — only needed in browser mode */
    FileInput: () => React.ReactElement | null;
}

const isTauri = (): boolean => !!(window as any).__TAURI__;

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function useFileUpload(): UseFileUploadReturn {
    const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Accept string from filters
    const buildAcceptString = (filters?: FileFilter[]): string => {
        if (!filters) return '*';
        const allExts = filters.flatMap((f) => f.extensions);
        if (allExts.includes('*')) return '*';
        return allExts.map((ext) => `.${ext}`).join(',');
    };

    const selectFile = useCallback(async (filters?: FileFilter[]) => {
        if (isTauri()) {
            try {
                const { open } = await import('@tauri-apps/plugin-dialog');
                const { readFile } = await import('@tauri-apps/plugin-fs');

                const selected = await open({
                    multiple: false,
                    filters: filters || [
                        {
                            name: 'Documentos',
                            extensions: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'rtf', 'odt'],
                        },
                        {
                            name: 'Todos os arquivos',
                            extensions: ['*'],
                        },
                    ],
                });

                if (selected) {
                    const filePath = selected as string;
                    const fileName = filePath.split(/[\\/]/).pop() || 'arquivo';
                    let size = 'N/A';
                    try {
                        const fileData = await readFile(filePath);
                        size = formatBytes(fileData.length);
                    } catch { /* ignore */ }
                    setSelectedFile({ path: filePath, name: fileName, size });
                }
            } catch (err) {
                console.error('Erro ao selecionar arquivo (Tauri):', err);
            }
        } else {
            // Browser mode: use hidden input
            if (fileInputRef.current) {
                fileInputRef.current.accept = buildAcceptString(filters);
                fileInputRef.current.click();
            }
        }
    }, []);

    const handleBrowserFileChange = useCallback((e: Event) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        setSelectedFile({
            path: file.name,
            name: file.name,
            size: formatBytes(file.size),
            browserFile: file,
        });
        // Reset so the same file can be selected again
        input.value = '';
    }, []);

    const clearFile = useCallback(() => {
        setSelectedFile(null);
    }, []);

    const copyFileToAppData = useCallback(async (fileName: string): Promise<string | undefined> => {
        if (!selectedFile) return undefined;
        setIsUploading(true);

        try {
            if (isTauri()) {
                const { copyFile, mkdir, exists } = await import('@tauri-apps/plugin-fs');
                const { appDataDir } = await import('@tauri-apps/api/path');

                const appData = await appDataDir();
                const docsDir = `${appData}documents`;

                const dirExists = await exists(docsDir);
                if (!dirExists) {
                    await mkdir(docsDir, { recursive: true });
                }

                const uniqueName = `${Date.now()}_${fileName}`;
                const savedPath = `${docsDir}\\${uniqueName}`;
                await copyFile(selectedFile.path, savedPath);
                return savedPath;
            } else {
                // Browser mode: file is stored in memory via browserFile
                console.info('📁 Browser mode: arquivo selecionado em memória. Upload para cloud não implementado ainda.');
                return `browser://${selectedFile.name}`;
            }
        } catch (err) {
            console.error('Erro ao copiar arquivo:', err);
            return undefined;
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile]);

    const openFile = useCallback(async (filePath: string) => {
        if (!filePath) return;

        if (filePath.startsWith('browser://')) {
            console.info('Arquivo salvo no modo browser. Abrir não disponível.');
            return;
        }

        if (isTauri()) {
            try {
                const { openPath } = await import('@tauri-apps/plugin-opener');
                await openPath(filePath);
            } catch (err) {
                console.error('Erro ao abrir arquivo:', err);
            }
        } else {
            console.info('Abrir arquivo não disponível no browser.');
        }
    }, []);

    // Hidden file input component for browser mode — uses createElement to avoid JSX in .ts
    const FileInput = useCallback((): React.ReactElement | null => {
        if (isTauri()) return null;
        return createElement('input', {
            ref: fileInputRef,
            type: 'file',
            style: { display: 'none' },
            onChange: handleBrowserFileChange,
        });
    }, [handleBrowserFileChange]);

    return {
        selectedFile,
        isUploading,
        selectFile,
        clearFile,
        copyFileToAppData,
        openFile,
        fileInputRef,
        FileInput,
    };
}
