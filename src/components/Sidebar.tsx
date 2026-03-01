import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageCircle,
    CheckSquare,
    FolderKanban,
    Bot,
    Settings,
} from 'lucide-react';
import { useWorkspaceStore, WORKSPACES } from '@/stores/workspaceStore';
import { useChatStore } from '@/stores/chatStore';
import { useEffect } from 'react';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
    const { ollamaStatus, checkOllamaStatus } = useChatStore();

    useEffect(() => {
        checkOllamaStatus();
        const interval = setInterval(checkOllamaStatus, 30000);
        return () => clearInterval(interval);
    }, [checkOllamaStatus]);

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/chat', icon: MessageCircle, label: 'Chat com Ring' },
        { path: '/tasks', icon: CheckSquare, label: 'Tarefas' },
        { path: '/projects', icon: FolderKanban, label: 'Projetos' },
    ];

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <Bot size={20} color="white" />
                    </div>
                    <span className="sidebar-brand-name">Ring AI</span>
                </div>
            </div>

            {/* Workspaces */}
            <div className="workspace-section">
                <div className="workspace-label">Workspaces</div>
                {WORKSPACES.map((ws) => (
                    <div
                        key={ws.id}
                        className={`workspace-item ${activeWorkspace.id === ws.id ? 'active' : ''}`}
                        onClick={() => setActiveWorkspace(ws)}
                    >
                        <div className={`workspace-avatar ${ws.color}`}>{ws.avatar}</div>
                        <span className="workspace-name">{ws.displayName}</span>
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <nav className="nav-section">
                {navItems.map((item) => (
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

            {/* Footer - Ollama Status */}
            <div className="sidebar-footer">
                <div className="ollama-status">
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
                    className="nav-item"
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
