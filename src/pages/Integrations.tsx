import { Smartphone, Calendar, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function Integrations() {
    const { activeWorkspace } = useWorkspaceStore();
    const isFamilia = activeWorkspace.id === 'familia';

    return (
        <div className="main-content">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Integrações Inteligentes</h1>
                    <p className="page-subtitle">
                        Conecte a Assistente Ring a serviços externos para automatizar sua rotina.
                    </p>
                </div>

                {!isFamilia && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <AlertCircle size={20} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '14px', color: 'var(--color-warning)' }}>
                            <strong>Aviso:</strong> As integrações como WhatsApp e Google Calendar são preferencialmente configuradas na Visão Geral (Família) para abranger o núcleo familiar. Suas mensagens privadas só funcionarão se o serviço da IA puder separar via número de telefone.
                        </div>
                    </div>
                )}

                <div className="content-grid">
                    {/* WhatsApp */}
                    <div className="card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Smartphone size={20} style={{ color: 'var(--color-success)' }} />
                                </div>
                                <div>
                                    <h2 className="card-title" style={{ margin: 0 }}>WhatsApp Assistant (Em breve)</h2>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Powered by Baileys/Evolution API</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-tertiary)' }}>Offline</div>
                        </div>
                        <div style={{ padding: '0 0 16px 0', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            Permita que a IA escute mensagens de áudio e texto de um número configurado para adicionar contas e tarefas longe de casa.
                        </div>
                        <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: '1px dashed var(--color-border-default)' }}>
                            <div style={{ width: '120px', height: '120px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>[Placeholder QR Code]</span>
                            </div>
                            <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                <LinkIcon size={16} style={{ marginRight: '8px' }} />
                                Conectar Sessão
                            </button>
                        </div>
                    </div>

                    {/* Google Calendar */}
                    <div className="card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar size={20} style={{ color: 'var(--color-info)' }} />
                                </div>
                                <div>
                                    <h2 className="card-title" style={{ margin: 0 }}>Google Calendar (Em breve)</h2>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Sincronização OAuth2</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-tertiary)' }}>Desconectado</div>
                        </div>
                        <div style={{ padding: '0 0 16px 0', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            Traga os compromissos médicos e reuniões reais da sua agenda do Google para serem exibidos no painel da família, evitando conflitos.
                        </div>
                        <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: '1px dashed var(--color-border-default)' }}>
                            <Calendar size={48} style={{ color: 'var(--color-text-tertiary)' }} />
                            <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}>
                                <LinkIcon size={16} style={{ marginRight: '8px' }} />
                                Login com Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
