import { useEffect, useState } from 'react';
import { Bot, RefreshCw, Cpu, Wifi, Database, UserCircle, AlertTriangle, Key, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { getOpenAIApiKey, setOpenAIApiKey, isOpenAIConfigured, validateOpenAIKey, OPENAI_MODELS } from '@/lib/openaiClient';

export function SettingsPage() {
    const { activeWorkspace } = useWorkspaceStore();
    const {
        aiStatus,
        aiModel,
        customInstructions,
        checkAiStatus,
        setAiModel,
        setCustomInstruction,
    } = useChatStore();

    const [apiKeyInput, setApiKeyInput] = useState(getOpenAIApiKey());
    const [showKey, setShowKey] = useState(false);
    const [keyValidating, setKeyValidating] = useState(false);
    const [keyValid, setKeyValid] = useState<boolean | null>(null);
    const [instructionInput, setInstructionInput] = useState(customInstructions[activeWorkspace.id] || '');

    useEffect(() => {
        setInstructionInput(customInstructions[activeWorkspace.id] || '');
    }, [activeWorkspace.id, customInstructions]);

    const handleSaveInstruction = () => {
        setCustomInstruction(activeWorkspace.id, instructionInput);
    };

    useEffect(() => {
        checkAiStatus();
    }, []);

    const handleSaveApiKey = async () => {
        const key = apiKeyInput.trim();
        setKeyValidating(true);
        setKeyValid(null);

        if (!key) {
            setOpenAIApiKey('');
            setKeyValid(null);
            setKeyValidating(false);
            checkAiStatus();
            return;
        }

        const valid = await validateOpenAIKey(key);
        setKeyValid(valid);
        setKeyValidating(false);

        if (valid) {
            setOpenAIApiKey(key);
            checkAiStatus();
        }
    };

    const supabaseOk = isSupabaseConfigured();
    const openaiOk = isOpenAIConfigured();

    const maskedKey = apiKeyInput
        ? apiKeyInput.slice(0, 7) + '•'.repeat(Math.max(0, apiKeyInput.length - 11)) + apiKeyInput.slice(-4)
        : '';

    return (
        <div className="main-content">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Configurações</h1>
                    <p className="page-subtitle">Gerencie as configurações do Alenfinos Hub</p>
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
                                        {supabaseOk ? 'Conectado — dados sincronizados entre PCs' : 'Não configurado — dados locais'}
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

                        {/* OpenAI Status */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            background: openaiOk
                                ? 'rgba(34, 197, 94, 0.06)'
                                : 'rgba(239, 68, 68, 0.06)',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${openaiOk ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Bot size={18} style={{ color: openaiOk ? 'var(--color-success)' : 'var(--color-error)' }} />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>OpenAI (Ring IA)</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {openaiOk ? `Configurada · Modelo: ${aiModel}` : 'API Key não configurada'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div className={`status-dot ${openaiOk ? 'online' : 'offline'}`} />
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: openaiOk ? 'var(--color-success)' : 'var(--color-error)',
                                }}>
                                    {openaiOk ? 'Ativa' : 'Inativa'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* OpenAI API Key Config */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="stat-icon purple">
                                <Key size={20} />
                            </div>
                            <h2 className="card-title">OpenAI — API Key</h2>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                        }}>
                            Chave de API da OpenAI
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
                                <input
                                    className="input"
                                    type={showKey ? 'text' : 'password'}
                                    value={apiKeyInput}
                                    onChange={(e) => { setApiKeyInput(e.target.value); setKeyValid(null); }}
                                    placeholder="sk-proj-..."
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-tertiary)',
                                        padding: '4px',
                                    }}
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveApiKey}
                                disabled={keyValidating}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {keyValidating ? (
                                    <>
                                        <div style={{
                                            width: '14px',
                                            height: '14px',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                        Validando...
                                    </>
                                ) : 'Salvar'}
                            </button>
                        </div>

                        {/* Validation result */}
                        {keyValid !== null && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '8px',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: keyValid ? 'var(--color-success)' : 'var(--color-error)',
                            }}>
                                {keyValid ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {keyValid ? 'API Key válida e salva com sucesso!' : 'API Key inválida. Verifique e tente novamente.'}
                            </div>
                        )}

                        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '8px', lineHeight: 1.5 }}>
                            Obtenha sua chave em{' '}
                            <a
                                href="https://platform.openai.com/api-keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--color-accent-secondary)', textDecoration: 'underline' }}
                            >
                                platform.openai.com/api-keys
                            </a>
                            . Sua chave fica salva apenas localmente neste dispositivo.
                        </p>
                    </div>

                    {/* Model Selection */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                        }}>
                            Modelo de IA
                        </label>
                        <select
                            className="input"
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            style={{ cursor: 'pointer', maxWidth: '420px' }}
                        >
                            {OPENAI_MODELS.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Models Info */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="stat-icon blue">
                                <Cpu size={20} />
                            </div>
                            <h2 className="card-title">Modelos Disponíveis</h2>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                        {OPENAI_MODELS.map((model) => (
                            <div
                                key={model.id}
                                onClick={() => setAiModel(model.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 14px',
                                    background: aiModel === model.id
                                        ? 'rgba(139, 92, 246, 0.08)'
                                        : 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: aiModel === model.id
                                        ? '1px solid rgba(139, 92, 246, 0.25)'
                                        : '1px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: aiModel === model.id
                                            ? 'var(--color-accent-primary)'
                                            : 'var(--color-text-primary)',
                                        marginBottom: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        {model.name}
                                        {aiModel === model.id && (
                                            <span style={{
                                                fontSize: '10px',
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--color-accent-primary)',
                                                color: 'white',
                                                fontWeight: 700,
                                            }}>
                                                ATIVO
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {model.desc}
                                    </div>
                                </div>
                                <span className="badge blue">{model.price}</span>
                            </div>
                        ))}
                    </div>
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
                            Forneça regras, contexto e formato de resposta para a Ring agir ao conversar no perfil <strong>{activeWorkspace.displayName}</strong>. Funciona como as custom instructions de outras IAs.
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

                {/* About */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Sobre</h2>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        <p>
                            <strong style={{ color: 'var(--color-text-primary)' }}>Alenfinos Hub</strong> v0.3.0
                        </p>
                        <p>
                            Intranet familiar com assistente de IA.{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Tauri v2</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>React</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Supabase</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>OpenAI</span>
                        </p>
                        <p>Seus dados ficam sincronizados entre os PCs da família. 🏠</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
