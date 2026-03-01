import { useEffect } from 'react';
import { Bot, RefreshCw, Download, Cpu } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export function SettingsPage() {
    const {
        ollamaStatus,
        ollamaModel,
        availableModels,
        checkOllamaStatus,
        loadModels,
        setOllamaModel,
    } = useChatStore();

    useEffect(() => {
        checkOllamaStatus();
        loadModels();
    }, []);

    return (
        <div className="main-content">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Gerencie as configurações do Ring AI</p>
                </div>

                {/* Ollama Section */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="stat-icon purple">
                                <Bot size={20} />
                            </div>
                            <h2 className="card-title">Ollama</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                className={`status-dot ${ollamaStatus === 'online' ? 'online' : 'offline'}`}
                            />
                            <span
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color:
                                        ollamaStatus === 'online'
                                            ? 'var(--color-success)'
                                            : 'var(--color-error)',
                                }}
                            >
                                {ollamaStatus === 'online' ? 'Conectado' : 'Desconectado'}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: 'var(--color-text-secondary)',
                                marginBottom: '8px',
                            }}
                        >
                            Modelo ativo
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="input"
                                value={ollamaModel}
                                onChange={(e) => setOllamaModel(e.target.value)}
                                style={{ cursor: 'pointer', maxWidth: '300px' }}
                            >
                                {availableModels.length > 0 ? (
                                    availableModels.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))
                                ) : (
                                    <option value={ollamaModel}>{ollamaModel}</option>
                                )}
                            </select>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    checkOllamaStatus();
                                    loadModels();
                                }}
                            >
                                <RefreshCw size={14} />
                                Atualizar
                            </button>
                        </div>
                    </div>

                    {ollamaStatus === 'offline' && (
                        <div
                            style={{
                                padding: '16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'var(--color-error)',
                                    marginBottom: '8px',
                                }}
                            >
                                Ollama não está rodando
                            </div>
                            <div
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--color-text-secondary)',
                                    lineHeight: 1.6,
                                }}
                            >
                                Para usar a IA da Ring, você precisa iniciar o Ollama:
                                <br />
                                <br />
                                <code
                                    style={{
                                        background: 'var(--color-bg-hover)',
                                        padding: '4px 8px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '12px',
                                    }}
                                >
                                    ollama serve
                                </code>
                                <br />
                                <br />
                                E baixar um modelo:
                                <br />
                                <br />
                                <code
                                    style={{
                                        background: 'var(--color-bg-hover)',
                                        padding: '4px 8px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '12px',
                                    }}
                                >
                                    ollama pull llama3.2
                                </code>
                            </div>
                        </div>
                    )}
                </div>

                {/* Models Info */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="stat-icon blue">
                                <Cpu size={20} />
                            </div>
                            <h2 className="card-title">Modelos Recomendados</h2>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                        {[
                            {
                                name: 'llama3.2',
                                desc: 'Llama 3.2 3B — Rápido, boa qualidade. Ideal para uso geral.',
                                size: '~2GB',
                            },
                            {
                                name: 'mistral',
                                desc: 'Mistral 7B — Excelente qualidade, mais lento em PCs modestos.',
                                size: '~4GB',
                            },
                            {
                                name: 'gemma2:2b',
                                desc: 'Gemma 2B — Ultra leve, ideal para PCs com pouca RAM.',
                                size: '~1.4GB',
                            },
                            {
                                name: 'llama3.1:8b',
                                desc: 'Llama 3.1 8B — Melhor qualidade, requer 8GB+ de RAM.',
                                size: '~4.7GB',
                            },
                        ].map((model) => (
                            <div
                                key={model.name}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 14px',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--color-text-primary)',
                                            marginBottom: '2px',
                                        }}
                                    >
                                        {model.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {model.desc}
                                    </div>
                                </div>
                                <span className="badge blue">{model.size}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Sobre</h2>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        <p>
                            <strong style={{ color: 'var(--color-text-primary)' }}>Ring AI</strong> v0.1.0
                        </p>
                        <p>
                            Assistente de IA pessoal e familiar desenvolvida com{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Tauri v2</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>React</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Ollama</span>
                        </p>
                        <p>Seus dados ficam 100% no seu dispositivo. 🔒</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
