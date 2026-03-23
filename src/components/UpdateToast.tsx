import { useUpdateStore, APP_VERSION } from '@/stores/updateStore';
import { ArrowUpCircle, Download, Loader2, CheckCircle, AlertTriangle, X } from 'lucide-react';

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UpdateToast() {
    const {
        phase,
        isDismissed,
        remoteVersion,
        changelog,
        downloadProgress,
        downloadedBytes,
        totalBytes,
        errorMessage,
        dismiss,
        downloadAndInstall,
        checkForUpdate,
    } = useUpdateStore();

    const isVisible = phase !== 'idle' && phase !== 'checking' && !isDismissed;
    if (!isVisible) return null;

    const isDownloading = phase === 'downloading';
    const isReady = phase === 'ready';
    const isError = phase === 'error';
    const isAvailable = phase === 'available';

    const handleAction = () => {
        if (isAvailable) downloadAndInstall();
        if (isError) checkForUpdate();
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 20,
                left: 290,
                zIndex: 150,
                maxWidth: 380,
                width: '100%',
                animation: 'slideUp 0.4s var(--transition-spring)',
            }}
        >
            <div
                style={{
                    background: 'var(--color-bg-elevated)',
                    border: `1px solid ${isError ? 'var(--color-danger)' : 'var(--color-border-accent)'}`,
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--radius-lg)',
                            background: isError ? 'var(--color-danger-muted, rgba(239,68,68,0.12))' :
                                isReady ? 'var(--color-success-muted, rgba(34,197,94,0.12))' :
                                'var(--color-info-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {isDownloading && <Download size={20} style={{ color: 'var(--color-info)' }} />}
                        {isAvailable && <ArrowUpCircle size={20} style={{ color: 'var(--color-info)' }} />}
                        {isReady && <CheckCircle size={20} style={{ color: 'var(--color-success, #22c55e)' }} />}
                        {isError && <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: 'var(--color-text-primary)',
                                lineHeight: 1.3,
                            }}
                        >
                            {isAvailable && `Nova versão ${remoteVersion} disponível!`}
                            {isDownloading && 'Baixando atualização...'}
                            {isReady && 'Atualização instalada!'}
                            {isError && 'Erro na atualização'}
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: 'var(--color-text-tertiary)',
                                marginTop: 2,
                            }}
                        >
                            {isAvailable && `Você está na v${APP_VERSION}`}
                            {isDownloading && totalBytes > 0 && `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}`}
                            {isReady && 'O app será reiniciado automaticamente.'}
                            {isError && errorMessage.slice(0, 120)}
                        </div>
                    </div>

                    {!isDownloading && (
                        <button
                            onClick={dismiss}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 4,
                                color: 'var(--color-text-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                flexShrink: 0,
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Progress bar */}
                {isDownloading && (
                    <div
                        style={{
                            width: '100%',
                            height: 6,
                            borderRadius: 3,
                            background: 'var(--color-bg-tertiary)',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${downloadProgress}%`,
                                borderRadius: 3,
                                background: 'var(--color-accent-primary)',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                )}

                {/* Changelog */}
                {isAvailable && changelog && (
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.5,
                            padding: '8px 10px',
                            background: 'var(--color-bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            maxHeight: 80,
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {changelog}
                    </div>
                )}

                {/* Action buttons */}
                {(isAvailable || isError) && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                            onClick={dismiss}
                            style={{
                                padding: '6px 14px',
                                fontSize: 12,
                                fontWeight: 500,
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border-default)',
                                background: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-secondary)',
                                cursor: 'pointer',
                            }}
                        >
                            Depois
                        </button>

                        <button
                            onClick={handleAction}
                            style={{
                                padding: '6px 14px',
                                fontSize: 12,
                                fontWeight: 600,
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: isError ? 'var(--color-danger)' : 'var(--color-accent-primary)',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            {isAvailable && (
                                <>
                                    <Download size={14} />
                                    Atualizar agora
                                </>
                            )}
                            {isError && (
                                <>
                                    <Loader2 size={14} />
                                    Tentar novamente
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
