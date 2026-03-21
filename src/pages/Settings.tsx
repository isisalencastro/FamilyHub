import { useEffect, useState } from 'react';
import { Wifi, Database } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function SettingsPage() {
    const { activeWorkspace } = useWorkspaceStore();

    const supabaseOk = isSupabaseConfigured();

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
                            Intranet familiar.{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Tauri v2</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>React</span> +{' '}
                            <span style={{ color: 'var(--color-accent-secondary)' }}>Supabase</span>
                        </p>
                        <p>Seus dados ficam sincronizados entre os PCs da família. 🏠</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
