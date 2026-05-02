// ============================================
// Document Database — IndexedDB Storage
// ============================================
// Stores document metadata and file binary data
// in IndexedDB for persistent local storage.
// Handles: save, get, delete, list, open files
// ============================================

const DB_NAME = 'family-docs-db';
const DB_VERSION = 1;
const STORE_META = 'doc_metadata';
const STORE_FILES = 'doc_files';

export interface DocMetadata {
    id: string;
    name: string;
    category: string;
    owner: string;
    fileSize: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
    tags: string[];
    hasFile: boolean;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_META)) {
                const metaStore = db.createObjectStore(STORE_META, { keyPath: 'id' });
                metaStore.createIndex('category', 'category', { unique: false });
                metaStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORE_FILES)) {
                db.createObjectStore(STORE_FILES, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Save a document (metadata + file data) to IndexedDB
 */
export async function saveDocument(
    meta: DocMetadata,
    fileData: ArrayBuffer | null
): Promise<void> {
    const db = await openDB();
    const tx = db.transaction([STORE_META, STORE_FILES], 'readwrite');

    const metaStore = tx.objectStore(STORE_META);
    metaStore.put(meta);

    if (fileData) {
        const fileStore = tx.objectStore(STORE_FILES);
        fileStore.put({ id: meta.id, data: fileData, type: meta.fileType, name: meta.fileName });
    }

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

/**
 * Get all document metadata
 */
export async function getAllDocuments(): Promise<DocMetadata[]> {
    const db = await openDB();
    const tx = db.transaction(STORE_META, 'readonly');
    const store = tx.objectStore(STORE_META);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            db.close();
            const docs = request.result as DocMetadata[];
            // Sort by uploadedAt descending
            docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            resolve(docs);
        };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}

/**
 * Get a single document's metadata
 */
export async function getDocument(id: string): Promise<DocMetadata | undefined> {
    const db = await openDB();
    const tx = db.transaction(STORE_META, 'readonly');
    const store = tx.objectStore(STORE_META);

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => { db.close(); resolve(request.result); };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}

/**
 * Get file data for a document
 */
export async function getFileData(id: string): Promise<{ data: ArrayBuffer; type: string; name: string } | null> {
    const db = await openDB();
    const tx = db.transaction(STORE_FILES, 'readonly');
    const store = tx.objectStore(STORE_FILES);

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
            db.close();
            resolve(request.result || null);
        };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}

/**
 * Delete a document (metadata + file data)
 */
export async function deleteDocumentFromDB(id: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction([STORE_META, STORE_FILES], 'readwrite');

    tx.objectStore(STORE_META).delete(id);
    tx.objectStore(STORE_FILES).delete(id);

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

/**
 * Open/view a file from the database
 * Creates a blob URL and opens it in a new tab or via Tauri opener
 */
export async function openDocumentFile(id: string): Promise<void> {
    const fileRecord = await getFileData(id);

    if (!fileRecord) {
        alert('Arquivo não encontrado no banco de dados. Ele pode ter sido removido.');
        return;
    }

    const blob = new Blob([fileRecord.data], { type: fileRecord.type || 'application/octet-stream' });
    const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;

    if (isTauri) {
        try {
            // Write blob to a temp file and open with OS
            const { writeFile, exists, mkdir } = await import('@tauri-apps/plugin-fs');
            const { appDataDir, join } = await import('@tauri-apps/api/path');
            const { openPath } = await import('@tauri-apps/plugin-opener');

            const appData = await appDataDir();
            const tempDir = await join(appData, 'temp_docs');

            const dirExists = await exists(tempDir);
            if (!dirExists) {
                await mkdir(tempDir, { recursive: true });
            }

            const tempPath = await join(tempDir, fileRecord.name);
            const arrayBuffer = fileRecord.data;
            await writeFile(tempPath, new Uint8Array(arrayBuffer));
            await openPath(tempPath);
        } catch (err) {
            console.error('Failed to open temp Tauri file:', err);
            // Fallback to blob URL
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
    } else {
        // Browser mode: open blob URL
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
}

/**
 * Download a file using OS Save Dialog
 */
export async function downloadDocumentFile(id: string): Promise<void> {
    const fileRecord = await getFileData(id);
    if (!fileRecord) {
        alert('Arquivo não encontrado no banco de dados.');
        return;
    }

    const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;

    if (isTauri) {
        try {
            const { save } = await import('@tauri-apps/plugin-dialog');
            const { writeFile } = await import('@tauri-apps/plugin-fs');

            const savePath = await save({
                defaultPath: fileRecord.name,
                title: 'Salvar Documento'
            });

            if (savePath) {
                await writeFile(savePath, new Uint8Array(fileRecord.data));
            }
        } catch (err) {
            console.error('Failed to save file in Tauri:', err);
            alert('Não foi possível salvar o arquivo. Permissão negada ou processo cancelado.');
        }
    } else {
        const blob = new Blob([fileRecord.data], { type: fileRecord.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileRecord.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
