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

    const handleSwitchWorkspace = (ws: Workspace) => {
        if (ws.id !== activeWorkspace.id) {
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

            {/* Workspaces */}
            <div className="workspace-section">
                <div className="workspace-label">Workspaces</div>
                {WORKSPACES.map((ws) => (
                    <div
                        key={ws.id}
                        className={`workspace-item ${activeWorkspace.id === ws.id ? 'active' : ''}`}
                        onClick={() => handleSwitchWorkspace(ws)}
                    >
                        <div className={`workspace-avatar ${ws.color}`}>{ws.avatar}</div>
                        <span className="workspace-name">{ws.displayName}</span>
                    </div>
                ))}
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

            {/* Footer - Chat + Ollama Status + Settings */}
            <div className="sidebar-footer">
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
