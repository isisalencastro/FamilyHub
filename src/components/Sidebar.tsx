import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageCircle,
    CheckSquare,
    FolderKanban,
    Bot,
    Settings,
    Wallet,
    FileText,
} from 'lucide-react';
import { useWorkspaceStore, WORKSPACES } from '@/stores/workspaceStore';
import { useChatStore } from '@/stores/chatStore';
import type { Workspace } from '@/types';
import { useEffect } from 'react';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
    const { ollamaStatus, checkOllamaStatus, setActiveConversation } = useChatStore();

    const handleSwitchWorkspace = (wsId: string) => {
        if (wsId !== activeWorkspace.id) {
            const ws = WORKSPACES.find(w => w.id === wsId)!;
            setActiveWorkspace(ws);
            setActiveConversation(null);
            navigate('/');
        }
    };

    useEffect(() => {
        checkOllamaStatus();
        const interval = setInterval(checkOllamaStatus, 30000);
        return () => clearInterval(interval);
    }, [checkOllamaStatus]);

    const isFamilia = activeWorkspace.id === 'familia';

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', show: true },
        { path: '/finance', icon: Wallet, label: 'Finanças', show: true },
        { path: '/tasks', icon: CheckSquare, label: 'Tarefas', show: true },
        { path: '/projects', icon: FolderKanban, label: 'Projetos', show: true },
        { path: '/docs', icon: FileText, label: 'Documentos', show: isFamilia },
    ];

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <Bot size={20} color="white" />
                    </div>
                    <span className="sidebar-brand-name">Alenfinos</span>
                </div>
            </div>

            {/* Navigation Context */}
            <div className="workspace-label" style={{ marginTop: '16px', padding: '0 16px' }}>
                {isFamilia ? 'Acessos da Casa' : `Espaço de ${activeWorkspace.displayName}`}
            </div>

            {/* Navigation */}
            <nav className="nav-section">
                {navItems
                    .filter((item) => item.show)
                    .map((item) => (
                        <div
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </div>
                    ))}
            </nav>

            {/* Footer switcher and Chat */}
            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>

                <div className="workspace-label" style={{ padding: '8px 16px 4px', borderTop: '1px solid var(--color-border-default)', paddingTop: '16px' }}>
                    Alternar Perfil
                </div>

                <div
                    className={`nav-item ${activeWorkspace.id === 'familia' ? 'active' : ''}`}
                    onClick={() => handleSwitchWorkspace('familia')}
                >
                    <LayoutDashboard size={18} />
                    <span>Visão Geral</span>
                </div>

                <div
                    className={`nav-item ${activeWorkspace.id === 'isis' ? 'active' : ''}`}
                    onClick={() => handleSwitchWorkspace('isis')}
                >
                    <div className="workspace-avatar isis" style={{ width: 18, height: 18, fontSize: 10, margin: 0 }}>I</div>
                    <span>Perfil de Isis</span>
                </div>

                <div
                    className={`nav-item ${activeWorkspace.id === 'angelica' ? 'active' : ''}`}
                    onClick={() => handleSwitchWorkspace('angelica')}
                >
                    <div className="workspace-avatar angelica" style={{ width: 18, height: 18, fontSize: 10, margin: 0 }}>A</div>
                    <span>Perfil de Angélica</span>
                </div>

                <div style={{ height: '16px' }}></div>
                {/* Chat link */}
                <div
                    className={`nav-item ${location.pathname === '/chat' ? 'active' : ''}`}
                    onClick={() => navigate('/chat')}
                >
                    <MessageCircle size={18} />
                    <span>Chat com Ring</span>
                </div>

                <div className="ollama-status" style={{ marginTop: '8px' }}>
                    <div
                        className={`status-dot ${ollamaStatus === 'online' ? 'online' : 'offline'}`}
                    />
                    <span>
                        {ollamaStatus === 'online'
                            ? 'Ollama conectado'
                            : ollamaStatus === 'checking'
                                ? 'Verificando...'
                                : 'Ollama offline'}
                    </span>
                </div>

                <div
                    className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
                    style={{ marginTop: '8px' }}
                    onClick={() => navigate('/settings')}
                >
                    <Settings size={18} />
                    <span>Configurações</span>
                </div>
            </div>
        </aside>
    );
}
