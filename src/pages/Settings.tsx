import { useEffect, useState } from 'react';
import { Bot, RefreshCw, Cpu, Wifi, Server, Database, UserCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function SettingsPage() {
    const { activeWorkspace } = useWorkspaceStore();
    const {
        ollamaStatus,
        ollamaModel,
        ollamaHost,
        availableModels,
        customInstructions,
        checkOllamaStatus,
        loadModels,
        setOllamaModel,
        setOllamaHost,
        setCustomInstruction,
    } = useChatStore();

    const [hostInput, setHostInput] = useState(ollamaHost);
    const [instructionInput, setInstructionInput] = useState(customInstructions[activeWorkspace.id] || '');

    useEffect(() => {
        setInstructionInput(customInstructions[activeWorkspace.id] || '');
    }, [activeWorkspace.id, customInstructions]);

    const handleSaveInstruction = () => {
        setCustomInstruction(activeWorkspace.id, instructionInput);
    };

    useEffect(() => {
        checkOllamaStatus();
        loadModels();
    }, []);

    const handleHostChange = () => {
        setOllamaHost(hostInput.trim());
        setTimeout(() => {
            checkOllamaStatus();
            loadModels();
        }, 200);
    };

    const supabaseOk = isSupabaseConfigured();

    return (
        <div className="main-content">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Gerencie as configurações do Alenfinos</p>
                </div>

                {/* Connection Status */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="stat-icon cyan">
                                <Wifi size={20} />
                            </div>
                            <h2 className="card-title">Status da Conexão</h2>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        {/* Supabase Status */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            background: supabaseOk
                                ? 'rgba(34, 197, 94, 0.06)'
                                : 'rgba(239, 68, 68, 0.06)',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${supabaseOk ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Database size={18} style={{ color: supabaseOk ? 'var(--color-success)' : 'var(--color-error)' }} />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Supabase (Intranet)</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {supabaseOk ? 'Conectado — dados sincronizados entre PCs' : 'Não configurado — dados em memória'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div className={`status-dot ${supabaseOk ? 'online' : 'offline'}`} />
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: supabaseOk ? 'var(--color-success)' : 'var(--color-error)',
                                }}>
                                    {supabaseOk ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {/* Ollama Status */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            background: ollamaStatus === 'online'
                                ? 'rgba(34, 197, 94, 0.06)'
                                : 'rgba(239, 68, 68, 0.06)',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${ollamaStatus === 'online' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Bot size={18} style={{ color: ollamaStatus === 'online' ? 'var(--color-success)' : 'var(--color-error)' }} />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Ollama (Ring IA)</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {ollamaStatus === 'online' ? `Conectado em ${ollamaHost}` : 'Desconectado'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div className={`status-dot ${ollamaStatus === 'online' ? 'online' : 'offline'}`} />
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: ollamaStatus === 'online' ? 'var(--color-success)' : 'var(--color-error)',
                                }}>
                                    {ollamaStatus === 'online' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {!supabaseOk && (
                        <div style={{
                            marginTop: '12px',
                            padding: '14px',
                            background: 'rgba(245, 158, 11, 0.08)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                        }}>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Para ativar a intranet, crie um arquivo <code style={{
                                    background: 'var(--color-bg-hover)',
                                    padding: '2px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '12px',
                                }}>.env</code> na raiz do projeto com:
                                <br /><br />
                                <code style={{
                                    display: 'block',
                                    background: 'var(--color-bg-tertiary)',
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '12px',
                                    lineHeight: 1.8,
                                }}>
                                    VITE_SUPABASE_URL=https://seu-projeto.supabase.co<br />
                                    VITE_SUPABASE_ANON_KEY=sua-anon-key
                                </code>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ollama Config */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="stat-icon purple">
                                <Server size={20} />
                            </div>
                            <h2 className="card-title">Servidor Ollama</h2>
                        </div>
                    </div>

                    {/* Host */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                        }}>
                            Endereço do Ollama
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                className="input"
                                value={hostInput}
                                onChange={(e) => setHostInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleHostChange()}
                                placeholder="localhost:11434"
                                style={{ maxWidth: '300px' }}
                            />
                            <button className="btn btn-secondary" onClick={handleHostChange}>
                                Conectar
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                            Se o Ollama roda no PC da Isis, use o IP dela. Ex: <code style={{
                                background: 'var(--color-bg-hover)',
                                padding: '1px 4px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '11px',
                            }}>192.168.1.100:11434</code>
                        </p>
                    </div>

                    {/* Model */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                        }}>
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
                                        <option key={m} value={m}>{m}</option>
                                    ))
                                ) : (
                                    <option value={ollamaModel}>{ollamaModel}</option>
                                )}
                            </select>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { checkOllamaStatus(); loadModels(); }}
                            >
                                <RefreshCw size={14} /> Atualizar
                            </button>
                        </div>
                    </div>

                    {ollamaStatus === 'offline' && (
                        <div style={{
                            padding: '14px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-error)', marginBottom: '8px' }}>
                                Ollama não está rodando
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Para usar a Ring, inicie o Ollama:
                                <br /><br />
                                <code style={{
                                    background: 'var(--color-bg-hover)',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '12px',
                                }}>ollama serve</code>
                                <br /><br />
                                E baixe um modelo:
                                <br /><br />
                                <code style={{
                                    background: 'var(--color-bg-hover)',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '12px',
                                }}>ollama pull llama3.2</code>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Instructions */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                                <UserCircle size={20} />
                            </div>
                            <h2 className="card-title">Instruções do Perfil ({activeWorkspace.displayName})</h2>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                            Forneça regras, contexto e formato de resposta para a Ring agir ao conversar no perfil <strong>{activeWorkspace.displayName}</strong>. Funciona como as custom instructions/projetos de outras IAs.
                        </p>
                        <textarea
                            className="input"
                            value={instructionInput}
                            onChange={(e) => setInstructionInput(e.target.value)}
                            placeholder="Ex: Você é um assistente focado em produtividade. Responda em marcadores curtos e objetivos. Me chame de chefa..."
                            style={{ minHeight: '120px', resize: 'vertical', width: '100%', marginBottom: '12px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={handleSaveInstruction}>
                                Salvar Instruções
                            </button>
                        </div>
                    </div>
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
                            { name: 'llama3.2', desc: 'Llama 3.2 3B — Rápido, boa qualidade. Ideal para uso geral.', size: '~2GB' },
                            { name: 'mistral', desc: 'Mistral 7B — Excelente qualidade, mais lento em PCs modestos.', size: '~4GB' },
                            { name: 'gemma2:2b', desc: 'Gemma 2B — Ultra leve, ideal para PCs com pouca RAM.', size: '~1.4GB' },
                            { name: 'llama3.1:8b', desc: 'Llama 3.1 8B — Melhor qualidade, requer 8GB+ de RAM.', size: '~4.7GB' },
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
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
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
                            <strong style={{ color: 'var(--color-text-primary)' }}>Alenfinos</strong> v0.2.0
                        </p>
                        <p>
                            Intranet familiar com assistente de IA.{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Tauri v2</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>React</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Supabase</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Ollama</span>
                        </p>
                        <p>Seus dados ficam sincronizados entre os PCs da família. 🏠</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
