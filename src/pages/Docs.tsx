import { useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Trash2,
    Tag,
    User,
    Calendar,
    HardDrive,
    FolderOpen,
    Upload,
    ExternalLink,
    File,
    Image,
    FileSpreadsheet,
} from 'lucide-react';
import { useDocStore } from '@/stores/docStore';
import type { DocCategory } from '@/types';
import { open } from '@tauri-apps/plugin-dialog';
import { copyFile, mkdir, exists, readFile } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';
import { openPath } from '@tauri-apps/plugin-opener';

const CATEGORY_COLORS: Record<DocCategory, string> = {
    identidade: '#8b5cf6',
    comprovantes: '#3b82f6',
    contratos: '#f59e0b',
    saude: '#22c55e',
    educacao: '#ec4899',
    outros: '#6b7280',
};

function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
        return <Image size={20} />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return <FileSpreadsheet size={20} />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
        return <FileText size={20} />;
    }
    return <File size={20} />;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function Docs() {
    const { documents, categories, addDocument, deleteDocument, searchDocs } = useDocStore();
    const [activeCategory, setActiveCategory] = useState<DocCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState<DocCategory>('outros');
    const [newOwner, setNewOwner] = useState('');
    const [selectedFile, setSelectedFile] = useState<{ path: string; name: string; size: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const filteredDocs = searchQuery
        ? searchDocs(searchQuery)
        : activeCategory === 'all'
            ? documents
            : documents.filter((d) => d.category === activeCategory);

    const handleSelectFile = async () => {
        try {
            const selected = await open({
                multiple: false,
                filters: [
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
                // Try to get file size
                try {
                    const fileData = await readFile(filePath);
                    const size = formatBytes(fileData.length);
                    setSelectedFile({ path: filePath, name: fileName, size });
                } catch {
                    setSelectedFile({ path: filePath, name: fileName, size: 'N/A' });
                }
                if (!newName.trim()) {
                    // Auto-fill name from filename (without extension)
                    const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
                    setNewName(nameWithoutExt);
                }
            }
        } catch (err) {
            console.error('Erro ao selecionar arquivo:', err);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setIsUploading(true);

        try {
            let savedPath: string | undefined;

            if (selectedFile) {
                // Create the docs directory in app data
                const appData = await appDataDir();
                const docsDir = `${appData}documents`;

                const dirExists = await exists(docsDir);
                if (!dirExists) {
                    await mkdir(docsDir, { recursive: true });
                }

                // Generate unique filename
                const ext = selectedFile.name.split('.').pop() || '';
                const uniqueName = `${Date.now()}_${selectedFile.name}`;
                savedPath = `${docsDir}\\${uniqueName}`;

                // Copy to app data
                await copyFile(selectedFile.path, savedPath);
            }

            addDocument({
                name: newName.trim(),
                category: newCategory,
                owner: newOwner.trim() || 'Família',
                fileSize: selectedFile?.size || 'N/A',
                filePath: savedPath,
                tags: [],
            });

            setNewName('');
            setNewOwner('');
            setSelectedFile(null);
            setShowNew(false);
        } catch (err) {
            console.error('Erro ao salvar documento:', err);
            // Still save the document entry even if file copy fails
            addDocument({
                name: newName.trim(),
                category: newCategory,
                owner: newOwner.trim() || 'Família',
                fileSize: selectedFile?.size || 'N/A',
                filePath: selectedFile?.path,
                tags: [],
            });
            setNewName('');
            setNewOwner('');
            setSelectedFile(null);
            setShowNew(false);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenFile = async (filePath?: string) => {
        if (!filePath) return;
        try {
            await openPath(filePath);
        } catch (err) {
            console.error('Erro ao abrir arquivo:', err);
        }
    };

    const getCategoryCount = (cat: DocCategory) =>
        documents.filter((d) => d.category === cat).length;

    return (
        <div className="main-content">
            <div className="page-container">
                {/* Header */}
                <div
                    className="page-header"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                    <div>
                        <h1 className="page-title">Documentos</h1>
                        <p className="page-subtitle">
                            {documents.length} documento{documents.length !== 1 ? 's' : ''} da família
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowNew(true)}>
                        <Plus size={16} />
                        Novo Documento
                    </button>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-tertiary)',
                        }}
                    />
                    <input
                        className="input"
                        placeholder="Buscar documentos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>

                {/* Category Chips */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveCategory('all')}
                        style={{ fontSize: '13px', padding: '8px 14px' }}
                    >
                        Todos ({documents.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            className={`btn ${activeCategory === cat.value ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveCategory(cat.value)}
                            style={{ fontSize: '13px', padding: '8px 14px' }}
                        >
                            {cat.icon} {cat.label} ({getCategoryCount(cat.value)})
                        </button>
                    ))}
                </div>

                {/* New Doc Form */}
                {showNew && (
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div className="modal-title">Novo Documento</div>

                        {/* File Upload Area */}
                        <div
                            onClick={handleSelectFile}
                            style={{
                                border: `2px dashed ${selectedFile ? 'var(--color-accent-primary)' : 'var(--color-border-default)'}`,
                                borderRadius: 'var(--radius-lg)',
                                padding: selectedFile ? '16px' : '32px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                background: selectedFile
                                    ? 'rgba(139, 92, 246, 0.05)'
                                    : 'var(--color-bg-tertiary)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!selectedFile) {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent-primary)';
                                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(139, 92, 246, 0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!selectedFile) {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-default)';
                                    (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-tertiary)';
                                }
                            }}
                        >
                            {selectedFile ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--color-accent-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--color-accent-primary)',
                                        flexShrink: 0,
                                    }}>
                                        {getFileIcon(selectedFile.name)}
                                    </div>
                                    <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--color-text-primary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {selectedFile.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                                            {selectedFile.size} · Clique para trocar
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                        style={{ padding: '4px', color: 'var(--color-text-tertiary)', flexShrink: 0 }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload
                                        size={32}
                                        style={{
                                            color: 'var(--color-text-tertiary)',
                                            marginBottom: '12px',
                                        }}
                                    />
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '4px',
                                    }}>
                                        Clique para selecionar um arquivo
                                    </p>
                                    <p style={{
                                        fontSize: '12px',
                                        color: 'var(--color-text-tertiary)',
                                    }}>
                                        PDF, imagens, documentos do Office e outros formatos
                                    </p>
                                </>
                            )}
                        </div>

                        <input
                            className="input"
                            placeholder="Nome do documento..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            autoFocus
                            style={{ marginBottom: '12px' }}
                        />
                        <select
                            className="input"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as DocCategory)}
                            style={{ marginBottom: '12px' }}
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                        <input
                            className="input"
                            placeholder="Responsável (ex: Isis, Angélica, Família)..."
                            value={newOwner}
                            onChange={(e) => setNewOwner(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowNew(false);
                                    setSelectedFile(null);
                                    setNewName('');
                                    setNewOwner('');
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={isUploading}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {isUploading ? (
                                    <>
                                        <div style={{
                                            width: '14px',
                                            height: '14px',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={14} />
                                        {selectedFile ? 'Fazer Upload' : 'Adicionar'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Documents Grid */}
                <div className="docs-grid">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="doc-card">
                            <div className="doc-card-header">
                                <div
                                    className="doc-icon"
                                    style={{
                                        background: `${CATEGORY_COLORS[doc.category]}20`,
                                        color: CATEGORY_COLORS[doc.category],
                                        cursor: doc.filePath ? 'pointer' : 'default',
                                    }}
                                    onClick={() => doc.filePath && handleOpenFile(doc.filePath)}
                                    title={doc.filePath ? 'Clique para abrir o arquivo' : undefined}
                                >
                                    {doc.filePath ? getFileIcon(doc.filePath) : <FileText size={20} />}
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {doc.filePath && (
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => handleOpenFile(doc.filePath)}
                                            style={{ color: 'var(--color-text-tertiary)', padding: '4px' }}
                                            title="Abrir arquivo"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => deleteDocument(doc.id)}
                                        style={{ color: 'var(--color-text-tertiary)', padding: '4px' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="doc-name">{doc.name}</div>
                            {doc.filePath && (
                                <div style={{
                                    fontSize: '11px',
                                    color: 'var(--color-accent-secondary)',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}>
                                    <Upload size={10} />
                                    Arquivo anexado
                                </div>
                            )}
                            <div className="doc-meta">
                                <span className="doc-meta-item">
                                    <User size={12} /> {doc.owner}
                                </span>
                                <span className="doc-meta-item">
                                    <Calendar size={12} /> {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                                </span>
                                {doc.fileSize && (
                                    <span className="doc-meta-item">
                                        <HardDrive size={12} /> {doc.fileSize}
                                    </span>
                                )}
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <span
                                    className="badge"
                                    style={{
                                        background: `${CATEGORY_COLORS[doc.category]}20`,
                                        color: CATEGORY_COLORS[doc.category],
                                    }}
                                >
                                    {categories.find((c) => c.value === doc.category)?.icon}{' '}
                                    {categories.find((c) => c.value === doc.category)?.label}
                                </span>
                            </div>
                            {doc.tags && doc.tags.length > 0 && (
                                <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {doc.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            style={{
                                                fontSize: '11px',
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--color-bg-hover)',
                                                color: 'var(--color-text-tertiary)',
                                            }}
                                        >
                                            <Tag size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredDocs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-tertiary)' }}>
                        <FolderOpen size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                            {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento ainda'}
                        </p>
                        <p style={{ fontSize: '14px' }}>
                            {searchQuery ? 'Tente uma busca diferente' : 'Adicione documentos da família para manter tudo organizado'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
